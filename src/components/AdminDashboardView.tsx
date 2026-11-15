import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Lock,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  ArticleUpsertInput,
  CmsAdminUser,
  CmsArticle,
  CmsCategory,
  CmsMediaAsset,
  CmsTag,
  PublicationStatus,
} from '../lib/cms';
import {
  estimateReadingTime,
  extractTableOfContentsAndInjectIds,
  formatDisplayDate,
  slugify,
} from '../lib/cms';
import { siteConfig } from '../config/site';
import { Link } from '../lib/router';

type AdminTab = 'articles' | 'editor' | 'taxonomy' | 'media' | 'setup';

interface AdminStatusResponse {
  configured: boolean;
  missingVars: string[];
  storageBucket: string;
  user: CmsAdminUser | null;
}

const SERVICE_OPTIONS = [
  { label: 'Auto-match based on article topic', value: '' },
  { label: 'SEO Services Kenya (/seo-services-kenya/)', value: '/seo-services-kenya/' },
  { label: 'Local SEO Kenya (/local-seo-kenya/)', value: '/local-seo-kenya/' },
  { label: 'Technical SEO (/technical-seo/)', value: '/technical-seo/' },
  { label: 'On-Page SEO (/on-page-seo/)', value: '/on-page-seo/' },
  { label: 'Ecommerce SEO Kenya (/ecommerce-seo-kenya/)', value: '/ecommerce-seo-kenya/' },
  { label: 'AI Search, AEO & GEO (/ai-search-aeo-geo-kenya/)', value: '/ai-search-aeo-geo-kenya/' },
  { label: 'Google Ads Management (/google-ads-management-kenya/)', value: '/google-ads-management-kenya/' },
  { label: 'Meta Ads Management (/meta-ads-management-kenya/)', value: '/meta-ads-management-kenya/' },
  { label: 'Website Design & Dev (/web-design-kenya/)', value: '/web-design-kenya/' },
  { label: 'Website Maintenance (/website-maintenance-kenya/)', value: '/website-maintenance-kenya/' },
];

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function emptyEditorForm(authorName = 'Insight Marketing Editorial'): ArticleUpsertInput & { id?: string; updatedAt?: string } {
  return {
    title: '',
    slug: '',
    excerpt: '',
    contentHtml: '<p></p>',
    featuredImageUrl: '',
    featuredImageAlt: '',
    categoryId: null,
    tagIds: [],
    authorName,
    authorRole: 'Digital Growth Strategist',
    authorBio: 'Helping Kenyan businesses grow through SEO, Google and Meta advertising, and high-converting websites.',
    authorAvatarUrl: '',
    status: 'draft',
    isFeatured: false,
    publishedAt: '',
    seoTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImageUrl: '',
    ogDescription: '',
    relatedServiceSlug: '',
  };
}

export function AdminDashboardView() {
  const [bootLoading, setBootLoading] = useState(true);
  const [statusInfo, setStatusInfo] = useState<AdminStatusResponse | null>(null);
  const [user, setUser] = useState<CmsAdminUser | null>(null);
  const authTokenRef = useRef<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Workspace state
  const [activeTab, setActiveTab] = useState<AdminTab>('articles');
  const [posts, setPosts] = useState<CmsArticle[]>([]);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [tags, setTags] = useState<CmsTag[]>([]);
  const [mediaAssets, setMediaAssets] = useState<CmsMediaAsset[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Article filter state
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

  // Editor state
  const [editorForm, setEditorForm] = useState(() => emptyEditorForm());
  const [slugLockedManually, setSlugLockedManually] = useState(false);
  const [inlineTagInput, setInlineTagInput] = useState('');
  const [savingArticle, setSavingArticle] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'featured' | 'og' | 'avatar' | 'content' | null>(null);

  // Taxonomy state
  const [catForm, setCatForm] = useState({ id: '', name: '', slug: '', description: '' });
  const [newTagName, setNewTagName] = useState('');

  // Media upload state
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [editingAltValue, setEditingAltValue] = useState('');
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  const adminFetch = useCallback(
    async (input: string, init?: RequestInit, tokenOverride?: string | null) => {
      const token = tokenOverride !== undefined ? tokenOverride : authTokenRef.current;
      const headers = new Headers(init?.headers || undefined);
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const res = await fetch(input, { ...init, headers });
      if (res.status === 401) {
        authTokenRef.current = null;
        setUser(null);
      }
      return res;
    },
    []
  );

  const loadWorkspaceData = useCallback(
    async (tokenOverride?: string | null) => {
      setDataLoading(true);
      try {
        const [pRes, cRes, tRes, mRes] = await Promise.all([
          adminFetch('/api/admin/posts', undefined, tokenOverride),
          adminFetch('/api/admin/categories', undefined, tokenOverride),
          adminFetch('/api/admin/tags', undefined, tokenOverride),
          adminFetch('/api/admin/media', undefined, tokenOverride),
        ]);
        const [pJson, cJson, tJson, mJson] = await Promise.all([
          pRes.json(),
          cRes.json(),
          tRes.json(),
          mRes.json(),
        ]);
        if (pJson.ok) setPosts(pJson.posts || []);
        if (cJson.ok) setCategories(cJson.categories || []);
        if (tJson.ok) setTags(tJson.tags || []);
        if (mJson.ok) setMediaAssets(mJson.media || []);
      } catch {
        setFeedback({ type: 'error', text: 'Failed to load CMS data from Supabase.' });
      } finally {
        setDataLoading(false);
      }
    },
    [adminFetch]
  );

  const checkStatus = useCallback(async () => {
    setBootLoading(true);
    try {
      const res = await adminFetch('/api/admin/status');
      const data = (await res.json()) as AdminStatusResponse;
      setStatusInfo(data);
      setUser(data.user);
      if (data.configured && data.user) {
        await loadWorkspaceData();
      }
    } catch {
      setStatusInfo({
        configured: false,
        missingVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
        storageBucket: 'blog-media',
        user: null,
      });
    } finally {
      setBootLoading(false);
    }
  }, [adminFetch, loadWorkspaceData]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || 'Unable to sign in.');
        return;
      }
      if (!data.user) {
        setLoginError('Sign-in succeeded but administrator profile could not be loaded.');
        return;
      }
      const nextToken = typeof data.accessToken === 'string' ? data.accessToken : null;
      authTokenRef.current = nextToken;
      setUser(data.user);
      setLoginPassword('');
      await loadWorkspaceData(nextToken);
    } catch {
      setLoginError('Network error signing in.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await adminFetch('/api/admin/auth/logout', { method: 'POST' });
    authTokenRef.current = null;
    setUser(null);
    setPosts([]);
    setActiveTab('articles');
  };

  const startNewArticle = () => {
    setEditorForm(emptyEditorForm(user?.fullName || 'Insight Marketing Editorial'));
    setSlugLockedManually(false);
    setFeedback(null);
    setActiveTab('editor');
  };

  const startEditArticle = (post: CmsArticle) => {
    setEditorForm({
      id: post.id,
      updatedAt: post.updatedAt,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentHtml: post.contentHtml,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      categoryId: post.categoryId || null,
      tagIds: post.tags.map((t) => t.id),
      authorName: post.authorName,
      authorRole: post.authorRole,
      authorBio: post.authorBio,
      authorAvatarUrl: post.authorAvatarUrl,
      status: post.status,
      isFeatured: post.isFeatured,
      publishedAt: toDatetimeLocalValue(post.publishedAt),
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: post.canonicalUrl,
      ogImageUrl: post.ogImageUrl,
      ogDescription: post.ogDescription,
      relatedServiceSlug: post.relatedServiceSlug,
    });
    setSlugLockedManually(true);
    setFeedback(null);
    setActiveTab('editor');
  };

  const handleTitleChange = (val: string) => {
    setEditorForm((prev) => ({
      ...prev,
      title: val,
      slug: !slugLockedManually ? slugify(val) : prev.slug,
    }));
  };

  const handleSaveArticle = async (overrideStatus?: PublicationStatus) => {
    setFeedback(null);
    setSavingArticle(true);
    const targetStatus = overrideStatus || editorForm.status;

    try {
      const payload: ArticleUpsertInput = {
        ...editorForm,
        status: targetStatus,
        publishedAt: editorForm.publishedAt
          ? new Date(editorForm.publishedAt).toISOString()
          : targetStatus === 'published'
            ? new Date().toISOString()
            : null,
      };

      const isEdit = Boolean(editorForm.id);
      const endpoint = isEdit ? `/api/admin/posts/${editorForm.id}` : '/api/admin/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: 'error', text: data.error || 'Could not save article.' });
        return;
      }

      const saved = data.post as CmsArticle;
      await loadWorkspaceData();
      startEditArticle(saved);
      setFeedback({
        type: 'ok',
        text:
          targetStatus === 'published'
            ? `Article "${saved.title}" is published.`
            : targetStatus === 'scheduled'
              ? `Article "${saved.title}" scheduled for ${formatDisplayDate(saved.publishedAt)}.`
              : `Draft "${saved.title}" saved.`,
      });
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save article.' });
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete article.' });
        return;
      }
      setConfirmDeletePostId(null);
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Article deleted.' });
    } catch {
      setFeedback({ type: 'error', text: 'Failed to delete article.' });
    }
  };

  const handleAddInlineTag = async () => {
    const clean = inlineTagInput.trim();
    if (clean.length < 2) return;
    try {
      const res = await adminFetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (data.ok && data.tag) {
        setTags((prev) =>
          prev.some((t) => t.id === data.tag.id) ? prev : [...prev, data.tag]
        );
        setEditorForm((prev) => ({
          ...prev,
          tagIds: prev.tagIds.includes(data.tag.id) ? prev.tagIds : [...prev.tagIds, data.tag.id],
        }));
        setInlineTagInput('');
      } else {
        setFeedback({ type: 'error', text: data.error || 'Could not create tag.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Could not create tag.' });
    }
  };

  const handleMediaFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    applyTarget?: 'featured' | 'og'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setFeedback(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
      });

      const res = await adminFetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64Data,
          altText:
            uploadAltText.trim() ||
            editorForm.featuredImageAlt.trim() ||
            file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: 'error', text: data.error || 'Upload failed.' });
        return;
      }

      const uploaded = data.asset as CmsMediaAsset;
      setMediaAssets((prev) => [uploaded, ...prev]);
      setUploadAltText('');

      if (applyTarget === 'featured') {
        setEditorForm((prev) => ({
          ...prev,
          featuredImageUrl: uploaded.publicUrl,
          featuredImageAlt: prev.featuredImageAlt || uploaded.altText,
        }));
      } else if (applyTarget === 'og') {
        setEditorForm((prev) => ({
          ...prev,
          ogImageUrl: uploaded.publicUrl,
        }));
      }

      setFeedback({ type: 'ok', text: `Uploaded "${uploaded.fileName}" to Supabase Storage.` });
    } catch {
      setFeedback({ type: 'error', text: 'Image upload failed.' });
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const isUpdate = Boolean(catForm.id);
    const url = isUpdate ? `/api/admin/categories/${catForm.id}` : '/api/admin/categories';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await adminFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: catForm.name,
        slug: catForm.slug || slugify(catForm.name),
        description: catForm.description,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setFeedback({ type: 'error', text: data.error || 'Could not save category.' });
      return;
    }
    setCatForm({ id: '', name: '', slug: '', description: '' });
    await loadWorkspaceData();
    setFeedback({ type: 'ok', text: isUpdate ? 'Category updated.' : 'Category created.' });
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) {
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Category deleted.' });
    }
  };

  const handleCreateTag = async (e: FormEvent) => {
    e.preventDefault();
    if (newTagName.trim().length < 2) return;
    const res = await adminFetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setNewTagName('');
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Tag added.' });
    } else {
      setFeedback({ type: 'error', text: data.error || 'Could not create tag.' });
    }
  };

  const handleDeleteTag = async (id: string) => {
    const res = await adminFetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) {
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Tag deleted.' });
    }
  };

  const handleUpdateMediaAlt = async (id: string) => {
    const res = await adminFetch(`/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText: editingAltValue }),
    });
    const data = await res.json();
    if (data.ok) {
      setEditingAltId(null);
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Image alt text updated.' });
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const res = await adminFetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) {
      await loadWorkspaceData();
      setFeedback({ type: 'ok', text: 'Media asset removed from Storage.' });
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const q = articleSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [posts, statusFilter, articleSearch]);

  const insertHtmlSnippet = (snippet: string) => {
    setEditorForm((prev) => ({
      ...prev,
      contentHtml: `${prev.contentHtml ? `${prev.contentHtml}\n` : ''}${snippet}`,
    }));
  };

  if (bootLoading) {
    return (
      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#E2DFD7] bg-white p-10 text-center text-sm text-[#4B515A]">
          Verifying editorial session…
        </div>
      </section>
    );
  }

  // Case 1: Supabase server environment variables not yet configured
  if (!statusInfo?.configured) {
    return (
      <section className="bg-[#F7F6F2] py-14 sm:py-20">
        <div className="mx-auto max-w-[880px] px-4 sm:px-6">
          <div className="rounded-xl border border-[#E2DFD7] bg-white p-8 sm:p-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F62A5]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Supabase Blog CMS Setup</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-[#141619] sm:text-3xl">
              Configure Supabase to activate the Editorial CMS
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
              The protected administrator dashboard at <span className="font-mono">/admin/</span>{' '}
              connects server-side to your Supabase PostgreSQL database, Supabase Storage, and
              Supabase Auth. No service role keys are ever placed in frontend code.
            </p>

            <div className="mt-6 rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-5">
              <div className="text-xs font-semibold text-[#141619]">
                Missing server environment variables:
              </div>
              <ul className="mt-2.5 space-y-1 font-mono text-xs text-[#B91C1C]">
                {(statusInfo?.missingVars || []).map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#4B515A]">
              <div>
                <h2 className="font-display text-base font-bold text-[#141619]">
                  1. Apply database schema &amp; Row Level Security policies
                </h2>
                <p className="mt-1">
                  Run <span className="font-mono text-xs text-[#141619]">supabase/schema.sql</span>{' '}
                  in your Supabase SQL Editor to create <span className="font-mono text-xs">cms_posts</span>,{' '}
                  <span className="font-mono text-xs">cms_categories</span>,{' '}
                  <span className="font-mono text-xs">cms_tags</span>,{' '}
                  <span className="font-mono text-xs">cms_media</span>,{' '}
                  <span className="font-mono text-xs">cms_admins</span>, RLS rules, and the{' '}
                  <span className="font-mono text-xs">blog-media</span> Storage bucket.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#141619]">
                  2. Create an administrator in Supabase Auth
                </h2>
                <p className="mt-1">
                  Create a user under <strong>Authentication &rarr; Users</strong> in Supabase and
                  add their email to{' '}
                  <span className="font-mono text-xs text-[#141619]">SUPABASE_ADMIN_EMAILS</span> or
                  insert their UID into{' '}
                  <span className="font-mono text-xs text-[#141619]">public.cms_admins</span>.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#141619]">
                  3. Set server-side secrets and restart
                </h2>
                <p className="mt-1">
                  See <span className="font-mono text-xs text-[#141619]">SUPABASE_SETUP.md</span>{' '}
                  for the full step-by-step configuration guide and optional starter seed script (
                  <span className="font-mono text-xs text-[#141619]">supabase/seed.sql</span>).
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#E2DFD7] pt-6">
              <button
                type="button"
                onClick={checkStatus}
                className="rounded-lg bg-[#141619] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2A2E34]"
              >
                Re-check server configuration
              </button>
              <Link
                href="/blog/"
                className="rounded-lg border border-[#D6D2C9] bg-white px-5 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#F7F6F2]"
              >
                View public Insights page
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Case 2: Configured, awaiting authorised administrator sign-in
  if (!user) {
    return (
      <section className="bg-[#F7F6F2] py-16 sm:py-24">
        <div className="mx-auto max-w-[460px] px-4">
          <div className="rounded-xl border border-[#E2DFD7] bg-white p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F62A5]">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>Protected Editorial Console</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-[#141619]">
              Administrator Sign In
            </h1>
            <p className="mt-2 text-sm text-[#4B515A]">
              Sign in with your authorised Supabase administrator credentials to manage Insight
              Marketing Kenya articles, categories, tags, and media.
            </p>

            {loginError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-lg border border-[#DC2626]/30 bg-[#FEF2F2] p-3 text-xs text-[#991B1B]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-[#141619]"
                >
                  Administrator Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@insightmarketing.co.ke"
                  className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2.5 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#141619]"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your Supabase password"
                  className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2.5 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full rounded-lg bg-[#141619] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2E34] disabled:opacity-60"
              >
                {loginSubmitting ? 'Verifying credentials…' : 'Sign in to CMS Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Authenticated Workspace
  const previewToc = extractTableOfContentsAndInjectIds(editorForm.contentHtml || '');

  return (
    <div className="min-h-[82vh] bg-[#F7F6F2]">
      {/* Dashboard Top Bar */}
      <div className="border-b border-[#E2DFD7] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-display font-bold text-[#141619]">Editorial CMS</span>
            <span aria-hidden="true" className="text-[#9CA3AF]">
              /
            </span>
            <span className="text-[#4B515A] capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#4B515A] sm:inline">
              {user.fullName} ({user.email})
            </span>
            <Link
              href="/blog/"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
            >
              <span>Public Blog</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#141619] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2A2E34]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Sidebar Navigation (240px–280px equivalent) */}
        <aside className="lg:col-span-3 xl:col-span-2">
          <nav aria-label="CMS sections" className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'bg-[#141619] text-white'
                  : 'text-[#4B515A] hover:bg-white hover:text-[#141619]'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Articles</span>
            </button>
            <button
              type="button"
              onClick={startNewArticle}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[#141619] text-white'
                  : 'text-[#4B515A] hover:bg-white hover:text-[#141619]'
              }`}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{editorForm.id ? 'Article Editor' : 'New Article'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('taxonomy')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === 'taxonomy'
                  ? 'bg-[#141619] text-white'
                  : 'text-[#4B515A] hover:bg-white hover:text-[#141619]'
              }`}
            >
              <FolderOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Categories &amp; Tags</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === 'media'
                  ? 'bg-[#141619] text-white'
                  : 'text-[#4B515A] hover:bg-white hover:text-[#141619]'
              }`}
            >
              <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Media Library</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === 'setup'
                  ? 'bg-[#141619] text-white'
                  : 'text-[#4B515A] hover:bg-white hover:text-[#141619]'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Security &amp; Schema</span>
            </button>
          </nav>
        </aside>

        {/* Main Workspace Panel */}
        <div className="lg:col-span-9 xl:col-span-10">
          {feedback && (
            <div
              role="status"
              className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                feedback.type === 'ok'
                  ? 'border-[#16A34A]/30 bg-[#F0FDF4] text-[#166534]'
                  : 'border-[#DC2626]/30 bg-[#FEF2F2] text-[#991B1B]'
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* TAB 1: ARTICLES LIST */}
          {activeTab === 'articles' && (
            <div className="rounded-xl border border-[#E2DFD7] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DFD7] p-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#141619]">
                    Blog Articles
                  </h1>
                  <p className="mt-1 text-xs text-[#666D77]">
                    Create, schedule, preview, and publish Insights articles stored in Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNewArticle}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F5B700] px-4 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#DFA600]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>New Article</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DFD7] bg-[#FAF9F6] px-6 py-3.5">
                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#EFEDE7] p-1">
                  {(['all', 'published', 'scheduled', 'draft'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        statusFilter === st
                          ? 'bg-white text-[#141619] shadow-sm'
                          : 'text-[#4B515A] hover:text-[#141619]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666D77]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Filter by title or slug…"
                    className="w-full rounded-lg border border-[#D6D2C9] bg-white py-1.5 pl-9 pr-3 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                  />
                </div>
              </div>

              {dataLoading ? (
                <div className="p-8 text-center text-sm text-[#666D77]">Loading articles…</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-medium text-[#141619]">
                    No articles found in this view.
                  </p>
                  <button
                    type="button"
                    onClick={startNewArticle}
                    className="mt-4 rounded-lg bg-[#141619] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Create first article
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2DFD7] text-xs text-[#666D77]">
                        <th className="px-6 py-3 font-semibold">Title &amp; Slug</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Publish Date</th>
                        <th className="px-4 py-3 font-semibold">Modified</th>
                        <th className="px-6 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DFD7]">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-[#FAF9F6]">
                          <td className="px-6 py-3.5">
                            <div className="font-semibold text-[#141619]">
                              {post.title}
                              {post.isFeatured && (
                                <span className="ml-2 text-xs font-normal text-[#0F62A5]">
                                  · Featured
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-[#666D77]">
                              /blog/{post.slug}/
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#4B515A]">{post.category}</td>
                          <td className="px-4 py-3.5 text-xs font-semibold">
                            {post.status === 'published' && (
                              <span className="text-[#16A34A]">Published</span>
                            )}
                            {post.status === 'scheduled' && (
                              <span className="text-[#D97706]">Scheduled</span>
                            )}
                            {post.status === 'draft' && (
                              <span className="text-[#666D77]">Draft</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#4B515A]">
                            {formatDisplayDate(post.publishedAt) || '—'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#666D77]">
                            {formatDisplayDate(post.updatedAt)}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditArticle(post)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#D6D2C9] bg-white px-2.5 py-1 text-xs font-medium text-[#141619] hover:bg-[#F7F6F2]"
                              >
                                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Edit</span>
                              </button>
                              {post.status === 'published' && (
                                <Link
                                  href={`/blog/${post.slug}/`}
                                  className="inline-flex items-center gap-1 rounded-md border border-[#D6D2C9] bg-white px-2.5 py-1 text-xs font-medium text-[#0F62A5] hover:bg-[#F7F6F2]"
                                >
                                  <span>View</span>
                                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </Link>
                              )}
                              {confirmDeletePostId === post.id ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteArticle(post.id)}
                                    className="rounded-md bg-[#DC2626] px-2.5 py-1 text-xs font-semibold text-white"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeletePostId(null)}
                                    className="rounded-md border border-[#D6D2C9] px-2 py-1 text-xs text-[#4B515A]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePostId(post.id)}
                                  aria-label={`Delete ${post.title}`}
                                  className="rounded-md border border-[#D6D2C9] bg-white p-1.5 text-[#DC2626] hover:bg-[#FEF2F2]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARTICLE EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2DFD7] bg-white px-6 py-4">
                <div>
                  <h1 className="font-display text-xl font-bold text-[#141619]">
                    {editorForm.id ? 'Edit Article' : 'Create New Article'}
                  </h1>
                  <p className="font-mono text-xs tabular-nums text-[#666D77]">
                    Estimated reading time: {estimateReadingTime(editorForm.contentHtml)} min
                    {editorForm.updatedAt ? ` · Last modified ${formatDisplayDate(editorForm.updatedAt)}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingArticle}
                    onClick={() => handleSaveArticle('draft')}
                    className="rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2] disabled:opacity-60"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={savingArticle}
                    onClick={() => handleSaveArticle('scheduled')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#FFFBEB] px-3.5 py-2 text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7] disabled:opacity-60"
                  >
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Schedule</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingArticle}
                    onClick={() => handleSaveArticle('published')}
                    className="rounded-lg bg-[#F5B700] px-4 py-2 text-xs font-semibold text-[#141619] hover:bg-[#DFA600] disabled:opacity-60"
                  >
                    {savingArticle ? 'Saving…' : 'Publish Article'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* Main Editorial Fields */}
                <div className="space-y-6 xl:col-span-8">
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-5">
                    <div>
                      <label htmlFor="ed-title" className="block text-xs font-semibold text-[#141619]">
                        Article Title (H1)
                      </label>
                      <input
                        id="ed-title"
                        type="text"
                        value={editorForm.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Technical SEO Checklist for Kenyan Businesses"
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2.5 text-base font-medium text-[#141619] focus:border-[#141619] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="ed-slug" className="block text-xs font-semibold text-[#141619]">
                          URL Slug
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSlugLockedManually(false);
                            setEditorForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
                          }}
                          className="text-xs font-medium text-[#0F62A5] hover:underline"
                        >
                          Generate from title
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3">
                        <span className="font-mono text-xs text-[#666D77]">/blog/</span>
                        <input
                          id="ed-slug"
                          type="text"
                          value={editorForm.slug}
                          onChange={(e) => {
                            setSlugLockedManually(true);
                            setEditorForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                          className="w-full bg-transparent px-1 py-2 font-mono text-xs text-[#141619] focus:outline-none"
                        />
                        <span className="font-mono text-xs text-[#666D77]">/</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ed-excerpt" className="block text-xs font-semibold text-[#141619]">
                        Excerpt / Summary
                      </label>
                      <textarea
                        id="ed-excerpt"
                        rows={2}
                        value={editorForm.excerpt}
                        onChange={(e) => setEditorForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief 1–2 sentence plain-English summary shown on the Insights index and Featured cards."
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="ed-content" className="block text-xs font-semibold text-[#141619]">
                          Main Content (Semantic HTML — H2/H3 headings auto-populate Table of Contents)
                        </label>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<h2>Section Heading</h2>')}
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#141619] hover:bg-[#EFEDE7]"
                          >
                            + H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<h3>Subheading</h3>')}
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#141619] hover:bg-[#EFEDE7]"
                          >
                            + H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<p>Paragraph text here.</p>')}
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#141619] hover:bg-[#EFEDE7]"
                          >
                            + P
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertHtmlSnippet('<ul>\n  <li>Key point one</li>\n  <li>Key point two</li>\n</ul>')
                            }
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#141619] hover:bg-[#EFEDE7]"
                          >
                            + List
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertHtmlSnippet('<a href="/seo-services-kenya/">Explore SEO Services in Kenya</a>')
                            }
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#141619] hover:bg-[#EFEDE7]"
                          >
                            + Internal Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget('content')}
                            className="rounded border border-[#D6D2C9] bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#0F62A5] hover:bg-[#EFEDE7]"
                          >
                            + Image
                          </button>
                        </div>
                      </div>
                      <textarea
                        id="ed-content"
                        rows={16}
                        value={editorForm.contentHtml}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, contentHtml: e.target.value }))
                        }
                        className="mt-2 w-full rounded-lg border border-[#D6D2C9] p-3.5 font-mono text-xs leading-relaxed text-[#141619] focus:border-[#141619] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SEO & Open Graph Settings */}
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-5">
                    <div>
                      <h2 className="font-display text-lg font-bold text-[#141619]">
                        SEO, Canonical &amp; Open Graph Metadata
                      </h2>
                      <p className="mt-1 text-xs text-[#666D77]">
                        Tailor how this article appears in Google Search results and social share previews.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <div className="flex justify-between text-xs">
                          <label htmlFor="ed-seo-title" className="font-semibold text-[#141619]">
                            SEO Title
                          </label>
                          <span className="font-mono tabular-nums text-[#666D77]">
                            {(editorForm.seoTitle || editorForm.title).length} / 60 chars
                          </span>
                        </div>
                        <input
                          id="ed-seo-title"
                          type="text"
                          value={editorForm.seoTitle}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                          }
                          placeholder={editorForm.title || 'SEO page title'}
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex justify-between text-xs">
                          <label htmlFor="ed-meta-desc" className="font-semibold text-[#141619]">
                            Meta Description
                          </label>
                          <span className="font-mono tabular-nums text-[#666D77]">
                            {(editorForm.metaDescription || editorForm.excerpt).length} / 160 chars
                          </span>
                        </div>
                        <textarea
                          id="ed-meta-desc"
                          rows={2}
                          value={editorForm.metaDescription}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, metaDescription: e.target.value }))
                          }
                          placeholder={editorForm.excerpt || 'Compelling 120–160 character summary for search results.'}
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="ed-canonical" className="block text-xs font-semibold text-[#141619]">
                          Canonical URL
                        </label>
                        <input
                          id="ed-canonical"
                          type="url"
                          value={editorForm.canonicalUrl}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, canonicalUrl: e.target.value }))
                          }
                          placeholder={`${siteConfig.domain}/blog/${editorForm.slug || 'article-slug'}/`}
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 font-mono text-xs text-[#141619] focus:border-[#141619] focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="ed-og-img" className="block text-xs font-semibold text-[#141619]">
                            Open Graph Image URL
                          </label>
                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget('og')}
                            className="text-xs font-medium text-[#0F62A5] hover:underline"
                          >
                            Pick from library
                          </button>
                        </div>
                        <input
                          id="ed-og-img"
                          type="text"
                          value={editorForm.ogImageUrl}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, ogImageUrl: e.target.value }))
                          }
                          placeholder="Defaults to featured image"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 text-xs text-[#141619] focus:border-[#141619] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="ed-service" className="block text-xs font-semibold text-[#141619]">
                          Recommended Service Link
                        </label>
                        <select
                          id="ed-service"
                          value={editorForm.relatedServiceSlug}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, relatedServiceSlug: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-xs text-[#141619] focus:border-[#141619] focus:outline-none"
                        >
                          {SERVICE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="ed-og-desc" className="block text-xs font-semibold text-[#141619]">
                          Open Graph Social Description
                        </label>
                        <input
                          id="ed-og-desc"
                          type="text"
                          value={editorForm.ogDescription}
                          onChange={(e) =>
                            setEditorForm((prev) => ({ ...prev, ogDescription: e.target.value }))
                          }
                          placeholder="Optional social share description (defaults to meta description)"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3.5 py-2 text-sm text-[#141619] focus:border-[#141619] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Google Search Snippet Preview */}
                    <div className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-4">
                      <div className="text-[11px] font-semibold text-[#666D77]">
                        Search Result Snippet Preview
                      </div>
                      <div className="mt-2 font-mono text-xs text-[#166534]">
                        {editorForm.canonicalUrl ||
                          `${siteConfig.domain}/blog/${editorForm.slug || 'article-slug'}/`}
                      </div>
                      <div className="mt-1 text-base font-semibold text-[#0F62A5]">
                        {editorForm.seoTitle || editorForm.title || 'Article Title | Insight Marketing'}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-[#4B515A]">
                        {editorForm.metaDescription ||
                          editorForm.excerpt ||
                          'Your meta description will appear here.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Publishing, Featured Image, Taxonomy & Author */}
                <div className="space-y-6 xl:col-span-4">
                  {/* Publication & Scheduling */}
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-4">
                    <h2 className="font-display text-base font-bold text-[#141619]">
                      Publishing &amp; Scheduling
                    </h2>

                    <div>
                      <label htmlFor="ed-status" className="block text-xs font-semibold text-[#141619]">
                        Publication Status
                      </label>
                      <select
                        id="ed-status"
                        value={editorForm.status}
                        onChange={(e) =>
                          setEditorForm((prev) => ({
                            ...prev,
                            status: e.target.value as PublicationStatus,
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-sm text-[#141619]"
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ed-pubdate" className="block text-xs font-semibold text-[#141619]">
                        Publication Date &amp; Time
                      </label>
                      <input
                        id="ed-pubdate"
                        type="datetime-local"
                        value={editorForm.publishedAt || ''}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, publishedAt: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 font-mono text-xs text-[#141619]"
                      />
                      <p className="mt-1 text-[11px] text-[#666D77]">
                        Required for Scheduled posts. Public visitors only see Scheduled posts once
                        this time is reached.
                      </p>
                    </div>

                    <label className="flex items-center gap-2.5 pt-1 text-sm text-[#141619]">
                      <input
                        type="checkbox"
                        checked={editorForm.isFeatured}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[#D6D2C9]"
                      />
                      <span>Feature prominently on /blog/</span>
                    </label>
                  </div>

                  {/* Category & Tags */}
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-4">
                    <h2 className="font-display text-base font-bold text-[#141619]">
                      Category &amp; Tags
                    </h2>

                    <div>
                      <label htmlFor="ed-cat" className="block text-xs font-semibold text-[#141619]">
                        Category
                      </label>
                      <select
                        id="ed-cat"
                        value={editorForm.categoryId || ''}
                        onChange={(e) =>
                          setEditorForm((prev) => ({
                            ...prev,
                            categoryId: e.target.value || null,
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-sm text-[#141619]"
                      >
                        <option value="">Uncategorised</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#141619]">Tags</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((tag) => {
                          const selected = editorForm.tagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() =>
                                setEditorForm((prev) => ({
                                  ...prev,
                                  tagIds: selected
                                    ? prev.tagIds.filter((id) => id !== tag.id)
                                    : [...prev.tagIds, tag.id],
                                }))
                              }
                              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                selected
                                  ? 'border-[#141619] bg-[#141619] text-white'
                                  : 'border-[#D6D2C9] bg-[#FAF9F6] text-[#4B515A] hover:text-[#141619]'
                              }`}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={inlineTagInput}
                          onChange={(e) => setInlineTagInput(e.target.value)}
                          placeholder="Add new tag…"
                          className="w-full rounded-lg border border-[#D6D2C9] px-3 py-1.5 text-xs text-[#141619]"
                        />
                        <button
                          type="button"
                          onClick={handleAddInlineTag}
                          className="shrink-0 rounded-lg border border-[#D6D2C9] bg-white px-3 py-1.5 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Featured Image & Alt Text */}
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-base font-bold text-[#141619]">
                        Featured Image
                      </h2>
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget('featured')}
                        className="text-xs font-semibold text-[#0F62A5] hover:underline"
                      >
                        Choose from Media Library
                      </button>
                    </div>

                    {editorForm.featuredImageUrl && (
                      <img
                        src={editorForm.featuredImageUrl}
                        alt={editorForm.featuredImageAlt || 'Featured preview'}
                        className="aspect-[16/10] w-full rounded-lg border border-[#E2DFD7] object-cover"
                      />
                    )}

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#D6D2C9] bg-[#FAF9F6] px-4 py-3 text-xs font-semibold text-[#141619] hover:bg-[#EFEDE7]">
                      <Upload className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                      <span>{uploadingMedia ? 'Uploading…' : 'Upload image to Supabase Storage'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingMedia}
                        onChange={(e) => handleMediaFileUpload(e, 'featured')}
                        className="sr-only"
                      />
                    </label>

                    <div>
                      <label htmlFor="ed-img-url" className="block text-xs font-semibold text-[#141619]">
                        Image URL
                      </label>
                      <input
                        id="ed-img-url"
                        type="text"
                        value={editorForm.featuredImageUrl}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, featuredImageUrl: e.target.value }))
                        }
                        placeholder="https://… or /assets/…"
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-xs text-[#141619]"
                      />
                    </div>

                    <div>
                      <label htmlFor="ed-img-alt" className="block text-xs font-semibold text-[#141619]">
                        Descriptive Image Alt Text
                      </label>
                      <input
                        id="ed-img-alt"
                        type="text"
                        value={editorForm.featuredImageAlt}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, featuredImageAlt: e.target.value }))
                        }
                        placeholder="Describe what the image depicts for accessibility and SEO"
                        className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-xs text-[#141619]"
                      />
                    </div>
                  </div>

                  {/* Author Information */}
                  <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-3.5">
                    <h2 className="font-display text-base font-bold text-[#141619]">
                      Author Information
                    </h2>
                    <div>
                      <label htmlFor="ed-author-name" className="block text-xs font-semibold text-[#141619]">
                        Author Name
                      </label>
                      <input
                        id="ed-author-name"
                        type="text"
                        value={editorForm.authorName}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, authorName: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-sm text-[#141619]"
                      />
                    </div>
                    <div>
                      <label htmlFor="ed-author-role" className="block text-xs font-semibold text-[#141619]">
                        Author Role / Title
                      </label>
                      <input
                        id="ed-author-role"
                        type="text"
                        value={editorForm.authorRole}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, authorRole: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-sm text-[#141619]"
                      />
                    </div>
                    <div>
                      <label htmlFor="ed-author-bio" className="block text-xs font-semibold text-[#141619]">
                        Author Bio
                      </label>
                      <textarea
                        id="ed-author-bio"
                        rows={2}
                        value={editorForm.authorBio}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, authorBio: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-xs text-[#141619]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="ed-author-avatar" className="block text-xs font-semibold text-[#141619]">
                          Author Avatar URL
                        </label>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget('avatar')}
                          className="text-xs font-medium text-[#0F62A5] hover:underline"
                        >
                          Pick
                        </button>
                      </div>
                      <input
                        id="ed-author-avatar"
                        type="text"
                        value={editorForm.authorAvatarUrl}
                        onChange={(e) =>
                          setEditorForm((prev) => ({ ...prev, authorAvatarUrl: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-xs text-[#141619]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & TAGS */}
          {activeTab === 'taxonomy' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 lg:col-span-7">
                <h1 className="font-display text-xl font-bold text-[#141619]">Blog Categories</h1>
                <form onSubmit={handleSaveCategory} className="mt-5 grid grid-cols-1 gap-3 rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-4 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Category name"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.id ? prev.slug : slugify(e.target.value),
                      }))
                    }
                    className="rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-sm text-[#141619]"
                  />
                  <input
                    type="text"
                    placeholder="category-slug"
                    value={catForm.slug}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    className="rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 font-mono text-xs text-[#141619]"
                  />
                  <input
                    type="text"
                    placeholder="Short category description"
                    value={catForm.description}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-sm text-[#141619] sm:col-span-2"
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#141619] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A2E34]"
                    >
                      {catForm.id ? 'Update Category' : 'Add Category'}
                    </button>
                    {catForm.id && (
                      <button
                        type="button"
                        onClick={() => setCatForm({ id: '', name: '', slug: '', description: '' })}
                        className="rounded-lg border border-[#D6D2C9] bg-white px-3 py-2 text-xs text-[#4B515A]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="mt-6 divide-y divide-[#E2DFD7] border-t border-[#E2DFD7]">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between gap-4 py-3.5">
                      <div>
                        <div className="font-semibold text-[#141619]">{cat.name}</div>
                        <div className="font-mono text-xs text-[#666D77]">{cat.slug}</div>
                        {cat.description && (
                          <p className="mt-1 text-xs text-[#4B515A]">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCatForm({
                              id: cat.id,
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description,
                            })
                          }
                          className="rounded border border-[#D6D2C9] px-2.5 py-1 text-xs font-medium text-[#141619]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="rounded border border-[#D6D2C9] px-2.5 py-1 text-xs font-medium text-[#DC2626]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 lg:col-span-5">
                <h2 className="font-display text-xl font-bold text-[#141619]">Article Tags</h2>
                <form onSubmit={handleCreateTag} className="mt-5 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name…"
                    className="w-full rounded-lg border border-[#D6D2C9] px-3 py-2 text-sm text-[#141619]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-[#141619] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Add Tag
                  </button>
                </form>

                <div className="mt-6 divide-y divide-[#E2DFD7] border-t border-[#E2DFD7]">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#141619]">
                          <Tag className="h-3.5 w-3.5 text-[#0F62A5]" aria-hidden="true" />
                          {tag.name}
                        </span>
                        <span className="ml-2 font-mono text-xs text-[#666D77]">{tag.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-xs font-medium text-[#DC2626] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA LIBRARY (SUPABASE STORAGE) */}
          {activeTab === 'media' && (
            <div className="rounded-xl border border-[#E2DFD7] bg-white p-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DFD7] pb-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-[#141619]">
                    Media Library (Supabase Storage)
                  </h1>
                  <p className="mt-1 text-xs text-[#666D77]">
                    Upload featured and Open Graph images directly to bucket{' '}
                    <span className="font-mono text-[#141619]">{statusInfo.storageBucket}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="Alt text for uploaded image…"
                    className="w-60 rounded-lg border border-[#D6D2C9] px-3 py-2 text-xs text-[#141619]"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#F5B700] px-4 py-2 text-xs font-semibold text-[#141619] hover:bg-[#DFA600]">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>{uploadingMedia ? 'Uploading…' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMedia}
                      onChange={(e) => handleMediaFileUpload(e)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {mediaAssets.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#666D77]">
                  No uploaded media assets yet. Upload an image above to use across articles and Open
                  Graph cards.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6]"
                    >
                      <img
                        src={asset.publicUrl}
                        alt={asset.altText || asset.fileName}
                        className="aspect-[16/10] w-full border-b border-[#E2DFD7] bg-white object-cover"
                      />
                      <div className="p-4 text-xs space-y-2">
                        <div className="truncate font-semibold text-[#141619]">{asset.fileName}</div>
                        <div className="font-mono tabular-nums text-[#666D77]">
                          {Math.round(asset.sizeBytes / 1024)} KB · {asset.mimeType}
                        </div>

                        {editingAltId === asset.id ? (
                          <div className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              value={editingAltValue}
                              onChange={(e) => setEditingAltValue(e.target.value)}
                              className="w-full rounded border border-[#D6D2C9] bg-white px-2 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateMediaAlt(asset.id)}
                              className="rounded bg-[#141619] px-2.5 py-1 text-xs font-semibold text-white"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2 pt-1">
                            <span className="text-[#4B515A]">
                              Alt: {asset.altText || 'Missing alt text'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAltId(asset.id);
                                setEditingAltValue(asset.altText);
                              }}
                              className="shrink-0 font-medium text-[#0F62A5] hover:underline"
                            >
                              Edit alt
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#E2DFD7] px-4 py-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(asset.publicUrl);
                            setCopiedUrlId(asset.id);
                            setTimeout(() => setCopiedUrlId(null), 1800);
                          }}
                          className="inline-flex items-center gap-1 font-semibold text-[#141619]"
                        >
                          {copiedUrlId === asset.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(asset.id)}
                          className="font-medium text-[#DC2626] hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & SCHEMA REFERENCE */}
          {activeTab === 'setup' && (
            <div className="rounded-xl border border-[#E2DFD7] bg-white p-6 space-y-4">
              <h1 className="font-display text-xl font-bold text-[#141619]">
                Supabase Architecture &amp; Security Verification
              </h1>
              <ul className="space-y-2.5 text-sm text-[#4B515A]">
                <li>
                  <strong className="text-[#141619]">Independent Module:</strong> CMS logic is
                  isolated inside <span className="font-mono text-xs">src/cms/</span> with zero
                  WordPress dependencies.
                </li>
                <li>
                  <strong className="text-[#141619]">Server-Side Key Isolation:</strong>{' '}
                  <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span> runs strictly
                  on the Node/Express backend and never enters Vite client bundles.
                </li>
                <li>
                  <strong className="text-[#141619]">Row Level Security (RLS):</strong>{' '}
                  <span className="font-mono text-xs">supabase/schema.sql</span> enforces RLS across{' '}
                  <span className="font-mono text-xs">cms_posts</span>,{' '}
                  <span className="font-mono text-xs">cms_categories</span>,{' '}
                  <span className="font-mono text-xs">cms_tags</span>,{' '}
                  <span className="font-mono text-xs">cms_media</span>,{' '}
                  <span className="font-mono text-xs">cms_admins</span>, and Storage bucket{' '}
                  <span className="font-mono text-xs">{statusInfo.storageBucket}</span>.
                </li>
                <li>
                  <strong className="text-[#141619]">SEO &amp; Privacy Isolation:</strong>{' '}
                  <span className="font-mono text-xs">/admin/</span> emits{' '}
                  <span className="font-mono text-xs">noindex, nofollow</span>, is excluded from{' '}
                  <span className="font-mono text-xs">/sitemap.xml</span>, and is disallowed in{' '}
                  <span className="font-mono text-xs">/robots.txt</span>.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#E2DFD7] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4">
              <h2 className="font-display text-lg font-bold text-[#141619]">
                Select Image from Media Library
              </h2>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                aria-label="Close media picker"
              >
                <X className="h-5 w-5 text-[#4B515A]" aria-hidden="true" />
              </button>
            </div>

            {mediaAssets.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#4B515A]">
                No images uploaded yet. Upload an image directly in the Featured Image panel or
                Media Library tab.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      if (mediaPickerTarget === 'featured') {
                        setEditorForm((prev) => ({
                          ...prev,
                          featuredImageUrl: asset.publicUrl,
                          featuredImageAlt: prev.featuredImageAlt || asset.altText,
                        }));
                      } else if (mediaPickerTarget === 'og') {
                        setEditorForm((prev) => ({ ...prev, ogImageUrl: asset.publicUrl }));
                      } else if (mediaPickerTarget === 'avatar') {
                        setEditorForm((prev) => ({ ...prev, authorAvatarUrl: asset.publicUrl }));
                      } else if (mediaPickerTarget === 'content') {
                        insertHtmlSnippet(
                          `<figure>\n  <img src="${asset.publicUrl}" alt="${asset.altText || asset.fileName}" />\n</figure>`
                        );
                      }
                      setMediaPickerTarget(null);
                    }}
                    className="overflow-hidden rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] text-left transition-colors hover:border-[#141619]"
                  >
                    <img
                      src={asset.publicUrl}
                      alt={asset.altText || asset.fileName}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="p-2.5 text-xs">
                      <div className="truncate font-medium text-[#141619]">{asset.fileName}</div>
                      <div className="truncate text-[#666D77]">{asset.altText}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Article Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#E2DFD7] bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E2DFD7] bg-[#F7F6F2] px-6 py-4">
              <div className="text-xs font-semibold text-[#0F62A5]">
                Pre-Publish Article Preview ({editorForm.status})
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#D6D2C9] bg-white px-3 py-1.5 text-xs font-semibold text-[#141619]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Close Preview</span>
              </button>
            </div>

            <div className="p-6 sm:p-10">
              <div className="text-xs text-[#666D77]">
                {categories.find((c) => c.id === editorForm.categoryId)?.name || 'Digital Insights'} ·{' '}
                {estimateReadingTime(editorForm.contentHtml)} min read
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-[#141619]">
                {editorForm.title || 'Untitled Article'}
              </h1>
              <p className="mt-3 text-base text-[#4B515A]">{editorForm.excerpt}</p>
              <p className="mt-3 text-xs text-[#666D77]">
                By {editorForm.authorName}
                {editorForm.authorRole ? ` · ${editorForm.authorRole}` : ''}
              </p>

              {editorForm.featuredImageUrl && (
                <img
                  src={editorForm.featuredImageUrl}
                  alt={editorForm.featuredImageAlt || editorForm.title}
                  className="mt-6 aspect-[16/9] w-full rounded-xl border border-[#E2DFD7] object-cover"
                />
              )}

              {previewToc.headings.length > 0 && (
                <div className="mt-6 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-4">
                  <div className="text-xs font-bold text-[#141619]">Table of Contents Preview</div>
                  <ul className="mt-2 space-y-1 text-xs text-[#4B515A]">
                    {previewToc.headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
                        {h.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className="mt-8 space-y-4 text-base leading-relaxed text-[#2C3036] [&_a]:text-[#0F62A5] [&_a]:underline [&_h2]:mt-7 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#141619] [&_h3]:mt-5 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#141619] [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: previewToc.htmlWithIds }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
