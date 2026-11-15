import {
  createSupabaseAdminClient,
  getSupabaseConfigStatus,
  isSupabaseConfigured,
  sanitizeSupabaseErrorMessage,
} from './supabaseClient.ts';
import type {
  ArticleUpsertInput,
  CmsAdminUser,
  CmsArticle,
  CmsCategory,
  CmsMediaAsset,
  CmsTag,
  PaginatedPostsResult,
  PublicationStatus,
} from './types.ts';
import {
  estimateReadingTime,
  sanitizeArticleHtml,
  slugify,
  stripHtmlTags,
} from './utils.ts';

interface RawCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface RawTagRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface RawMediaRow {
  id: string;
  bucket: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  created_at: string;
}

interface RawPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  author_name: string | null;
  author_role: string | null;
  author_bio: string | null;
  author_avatar_url: string | null;
  status: PublicationStatus;
  is_featured: boolean;
  published_at: string | null;
  modified_at: string;
  created_at: string;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  og_description: string | null;
  related_service_slug: string | null;
  reading_time_minutes: number | null;
  category?: RawCategoryRow | RawCategoryRow[] | null;
  post_tags?: Array<{ tag: RawTagRow | RawTagRow[] | null }> | null;
}

function mapCategoryRow(row: RawCategoryRow): CmsCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTagRow(row: RawTagRow): CmsTag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

function mapMediaRow(row: RawMediaRow): CmsMediaAsset {
  return {
    id: row.id,
    bucket: row.bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes) || 0,
    altText: row.alt_text || '',
    createdAt: row.created_at,
  };
}

function mapPostRow(row: RawPostRow, forPublicView = false): CmsArticle {
  const categoryObj = Array.isArray(row.category) ? row.category[0] : row.category;
  const tags: CmsTag[] = [];

  if (Array.isArray(row.post_tags)) {
    for (const joinRow of row.post_tags) {
      const tagObj = Array.isArray(joinRow.tag) ? joinRow.tag[0] : joinRow.tag;
      if (tagObj) {
        tags.push(mapTagRow(tagObj));
      }
    }
  }

  const contentHtml = row.content_html || '';
  const publishedAt = row.published_at || row.created_at;
  const effectiveStatus: PublicationStatus =
    forPublicView &&
    row.status === 'scheduled' &&
    row.published_at &&
    new Date(row.published_at).getTime() <= Date.now()
      ? 'published'
      : row.status;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || stripHtmlTags(contentHtml).slice(0, 200),
    contentHtml,
    publishedAt,
    updatedAt: row.modified_at || row.created_at,
    createdAt: row.created_at,
    category: categoryObj?.name || 'Digital Insights',
    categoryId: row.category_id,
    categorySlug: categoryObj?.slug || null,
    tags,
    authorName: row.author_name || 'Insight Marketing Editorial',
    authorRole: row.author_role || 'Digital Growth Team',
    authorBio: row.author_bio || '',
    authorAvatarUrl: row.author_avatar_url || '',
    readingTimeMinutes: row.reading_time_minutes || estimateReadingTime(contentHtml),
    featuredImageUrl: row.featured_image_url || '',
    featuredImageAlt: row.featured_image_alt || row.title,
    seoTitle: row.seo_title || '',
    metaDescription: row.meta_description || '',
    canonicalUrl: row.canonical_url || '',
    ogImageUrl: row.og_image_url || row.featured_image_url || '',
    ogDescription: row.og_description || row.meta_description || row.excerpt || '',
    relatedServiceSlug: row.related_service_slug || '',
    status: effectiveStatus,
    isFeatured: Boolean(row.is_featured),
  };
}

const POST_SELECT_QUERY = `
  id,
  title,
  slug,
  excerpt,
  content_html,
  featured_image_url,
  featured_image_alt,
  category_id,
  author_name,
  author_role,
  author_bio,
  author_avatar_url,
  status,
  is_featured,
  published_at,
  modified_at,
  created_at,
  seo_title,
  meta_description,
  canonical_url,
  og_image_url,
  og_description,
  related_service_slug,
  reading_time_minutes,
  category:cms_categories (
    id, name, slug, description, created_at, updated_at
  ),
  post_tags:cms_post_tags (
    tag:cms_tags (
      id, name, slug, created_at
    )
  )
`;

export async function listPublishedPosts(options?: {
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedPostsResult> {
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize || 9));

  if (!isSupabaseConfigured()) {
    return {
      posts: [],
      featuredPosts: [],
      categories: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const nowIso = new Date().toISOString();

    const [{ data: categoriesData }, { data: postRows, error }] = await Promise.all([
      supabase.from('cms_categories').select('*').order('name', { ascending: true }),
      supabase
        .from('cms_posts')
        .select(POST_SELECT_QUERY)
        .or(
          `and(status.eq.published,or(published_at.is.null,published_at.lte.${nowIso})),and(status.eq.scheduled,published_at.lte.${nowIso})`
        )
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false }),
    ]);

    if (error) {
      console.error('Supabase listPublishedPosts failed:', sanitizeSupabaseErrorMessage(error.message));
      return {
        posts: [],
        featuredPosts: [],
        categories: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1,
      };
    }

    const categories = ((categoriesData || []) as RawCategoryRow[]).map(mapCategoryRow);
    const allPublished = ((postRows || []) as unknown as RawPostRow[]).map((r) =>
      mapPostRow(r, true)
    );
    const featuredPosts = allPublished.filter((p) => p.isFeatured);

    let filtered = allPublished;
    if (options?.categorySlug && options.categorySlug !== 'all') {
      const target = options.categorySlug.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.categorySlug || '').toLowerCase() === target ||
          p.category.toLowerCase() === target
      );
    }

    if (options?.search?.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.name.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      posts: filtered.slice(start, start + pageSize),
      featuredPosts,
      categories,
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  } catch (err) {
    console.error(
      'Supabase listPublishedPosts error:',
      sanitizeSupabaseErrorMessage((err as Error)?.message)
    );
    return {
      posts: [],
      featuredPosts: [],
      categories: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<{ post: CmsArticle; relatedPosts: CmsArticle[] } | null> {
  if (!isSupabaseConfigured()) return null;

  const cleanSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!cleanSlug) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('cms_posts')
      .select(POST_SELECT_QUERY)
      .eq('slug', cleanSlug)
      .or(
        `and(status.eq.published,or(published_at.is.null,published_at.lte.${nowIso})),and(status.eq.scheduled,published_at.lte.${nowIso})`
      )
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const post = mapPostRow(data as unknown as RawPostRow, true);
    const allResult = await listPublishedPosts({ pageSize: 24 });
    const otherPosts = allResult.posts.filter((p) => p.slug !== post.slug);

    // Prefer same category or shared tag first
    const scored = otherPosts
      .map((candidate) => {
        let score = 0;
        if (candidate.category === post.category) score += 3;
        const postTagIds = new Set(post.tags.map((t) => t.id));
        for (const tag of candidate.tags) {
          if (postTagIds.has(tag.id)) score += 2;
        }
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.candidate);

    return {
      post,
      relatedPosts: scored.slice(0, 3),
    };
  } catch (err) {
    console.error(
      'Supabase getPublishedPostBySlug error:',
      sanitizeSupabaseErrorMessage((err as Error)?.message)
    );
    return null;
  }
}

export async function listPublicCategories(): Promise<CmsCategory[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('cms_categories')
      .select('*')
      .order('name', { ascending: true });
    return ((data || []) as RawCategoryRow[]).map(mapCategoryRow);
  } catch {
    return [];
  }
}

// =============================================================================
// Admin Repository Operations (Called Only Behind requireAdminAuth)
// =============================================================================

export async function listAllPostsAdmin(filters?: {
  status?: string;
  search?: string;
}): Promise<CmsArticle[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_posts')
    .select(POST_SELECT_QUERY)
    .order('modified_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch articles: ${sanitizeSupabaseErrorMessage(error.message)}`);
  }

  let items = ((data || []) as unknown as RawPostRow[]).map((r) => mapPostRow(r, false));

  if (filters?.status && filters.status !== 'all') {
    items = items.filter((p) => p.status === filters.status);
  }

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return items;
}

export async function getPostByIdAdmin(id: string): Promise<CmsArticle | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_posts')
    .select(POST_SELECT_QUERY)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch article: ${sanitizeSupabaseErrorMessage(error.message)}`);
  }
  return data ? mapPostRow(data as unknown as RawPostRow, false) : null;
}

async function resolveTagIds(inputIds: string[], inputNames?: string[]): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const resolved = new Set(inputIds.filter(Boolean));

  if (inputNames && inputNames.length > 0) {
    for (const rawName of inputNames) {
      const cleanName = rawName.trim();
      if (!cleanName) continue;
      const tagSlug = slugify(cleanName);
      if (!tagSlug) continue;

      const { data: existing } = await supabase
        .from('cms_tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();

      if (existing?.id) {
        resolved.add(existing.id);
      } else {
        const { data: created } = await supabase
          .from('cms_tags')
          .insert({ name: cleanName, slug: tagSlug })
          .select('id')
          .single();
        if (created?.id) {
          resolved.add(created.id);
        }
      }
    }
  }

  return Array.from(resolved);
}

async function syncPostTags(postId: string, tagIds: string[]): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from('cms_post_tags').delete().eq('post_id', postId);
  if (tagIds.length > 0) {
    await supabase
      .from('cms_post_tags')
      .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
  }
}

export async function createPostAdmin(
  input: ArticleUpsertInput,
  adminUser: CmsAdminUser
): Promise<CmsArticle> {
  const supabase = createSupabaseAdminClient();
  const cleanTitle = input.title.trim();
  if (cleanTitle.length < 3) {
    throw new Error('Article title must be at least 3 characters.');
  }

  const cleanSlug = slugify(input.slug || cleanTitle);
  if (!cleanSlug) {
    throw new Error('A valid URL slug is required.');
  }

  const sanitizedHtml = sanitizeArticleHtml(input.contentHtml || '');
  const readingTime = estimateReadingTime(sanitizedHtml);

  let publishedAt = input.publishedAt ? new Date(input.publishedAt).toISOString() : null;
  if (input.status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }
  if (input.status === 'scheduled' && !publishedAt) {
    throw new Error('Please choose a future publication date and time for scheduled articles.');
  }

  const { data: inserted, error } = await supabase
    .from('cms_posts')
    .insert({
      title: cleanTitle,
      slug: cleanSlug,
      excerpt: input.excerpt.trim() || stripHtmlTags(sanitizedHtml).slice(0, 200),
      content_html: sanitizedHtml,
      featured_image_url: input.featuredImageUrl.trim(),
      featured_image_alt: input.featuredImageAlt.trim() || cleanTitle,
      category_id: input.categoryId || null,
      author_name: input.authorName.trim() || adminUser.fullName,
      author_role: input.authorRole.trim() || 'Digital Growth Team',
      author_bio: input.authorBio.trim(),
      author_avatar_url: input.authorAvatarUrl.trim(),
      status: input.status,
      is_featured: Boolean(input.isFeatured),
      published_at: publishedAt,
      seo_title: input.seoTitle.trim(),
      meta_description: input.metaDescription.trim(),
      canonical_url: input.canonicalUrl.trim(),
      og_image_url: input.ogImageUrl.trim(),
      og_description: input.ogDescription.trim(),
      related_service_slug: input.relatedServiceSlug.trim(),
      reading_time_minutes: readingTime,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    if (error?.message?.includes('duplicate key')) {
      throw new Error(`An article with slug "${cleanSlug}" already exists.`);
    }
    throw new Error(error?.message || 'Unable to create article.');
  }

  const finalTagIds = await resolveTagIds(input.tagIds || [], input.tagNames);
  await syncPostTags(inserted.id, finalTagIds);

  const saved = await getPostByIdAdmin(inserted.id);
  if (!saved) throw new Error('Article created but could not be reloaded.');
  return saved;
}

export async function updatePostAdmin(
  id: string,
  input: ArticleUpsertInput,
  adminUser: CmsAdminUser
): Promise<CmsArticle> {
  const supabase = createSupabaseAdminClient();
  const cleanTitle = input.title.trim();
  if (cleanTitle.length < 3) {
    throw new Error('Article title must be at least 3 characters.');
  }

  const cleanSlug = slugify(input.slug || cleanTitle);
  if (!cleanSlug) {
    throw new Error('A valid URL slug is required.');
  }

  const sanitizedHtml = sanitizeArticleHtml(input.contentHtml || '');
  const readingTime = estimateReadingTime(sanitizedHtml);

  let publishedAt = input.publishedAt ? new Date(input.publishedAt).toISOString() : null;
  if (input.status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }
  if (input.status === 'scheduled' && !publishedAt) {
    throw new Error('Please choose a future publication date and time for scheduled articles.');
  }

  const { error } = await supabase
    .from('cms_posts')
    .update({
      title: cleanTitle,
      slug: cleanSlug,
      excerpt: input.excerpt.trim() || stripHtmlTags(sanitizedHtml).slice(0, 200),
      content_html: sanitizedHtml,
      featured_image_url: input.featuredImageUrl.trim(),
      featured_image_alt: input.featuredImageAlt.trim() || cleanTitle,
      category_id: input.categoryId || null,
      author_name: input.authorName.trim() || adminUser.fullName,
      author_role: input.authorRole.trim() || 'Digital Growth Team',
      author_bio: input.authorBio.trim(),
      author_avatar_url: input.authorAvatarUrl.trim(),
      status: input.status,
      is_featured: Boolean(input.isFeatured),
      published_at: publishedAt,
      seo_title: input.seoTitle.trim(),
      meta_description: input.metaDescription.trim(),
      canonical_url: input.canonicalUrl.trim(),
      og_image_url: input.ogImageUrl.trim(),
      og_description: input.ogDescription.trim(),
      related_service_slug: input.relatedServiceSlug.trim(),
      reading_time_minutes: readingTime,
      updated_by: adminUser.id,
    })
    .eq('id', id);

  if (error) {
    if (error.message.includes('duplicate key')) {
      throw new Error(`Another article already uses slug "${cleanSlug}".`);
    }
    throw new Error(error.message);
  }

  const finalTagIds = await resolveTagIds(input.tagIds || [], input.tagNames);
  await syncPostTags(id, finalTagIds);

  const updated = await getPostByIdAdmin(id);
  if (!updated) throw new Error('Article not found after update.');
  return updated;
}

export async function deletePostAdmin(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('cms_posts').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`);
  }
}

export async function listCategoriesAdmin(): Promise<CmsCategory[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data || []) as RawCategoryRow[]).map(mapCategoryRow);
}

export async function createCategoryAdmin(input: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<CmsCategory> {
  const supabase = createSupabaseAdminClient();
  const name = input.name.trim();
  if (name.length < 2) throw new Error('Category name is required.');
  const slug = slugify(input.slug || name);
  const { data, error } = await supabase
    .from('cms_categories')
    .insert({ name, slug, description: (input.description || '').trim() })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Unable to create category.');
  return mapCategoryRow(data as RawCategoryRow);
}

export async function updateCategoryAdmin(
  id: string,
  input: { name: string; slug?: string; description?: string }
): Promise<CmsCategory> {
  const supabase = createSupabaseAdminClient();
  const name = input.name.trim();
  if (name.length < 2) throw new Error('Category name is required.');
  const slug = slugify(input.slug || name);
  const { data, error } = await supabase
    .from('cms_categories')
    .update({ name, slug, description: (input.description || '').trim() })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Unable to update category.');
  return mapCategoryRow(data as RawCategoryRow);
}

export async function deleteCategoryAdmin(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('cms_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listTagsAdmin(): Promise<CmsTag[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_tags')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data || []) as RawTagRow[]).map(mapTagRow);
}

export async function createTagAdmin(input: { name: string; slug?: string }): Promise<CmsTag> {
  const supabase = createSupabaseAdminClient();
  const name = input.name.trim();
  if (name.length < 2) throw new Error('Tag name is required.');
  const slug = slugify(input.slug || name);
  const { data, error } = await supabase
    .from('cms_tags')
    .insert({ name, slug })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Unable to create tag.');
  return mapTagRow(data as RawTagRow);
}

export async function deleteTagAdmin(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('cms_tags').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listMediaAdmin(): Promise<CmsMediaAsset[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_media')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data || []) as RawMediaRow[]).map(mapMediaRow);
}

export async function uploadMediaAdmin(params: {
  base64Data: string;
  fileName: string;
  mimeType: string;
  altText: string;
  adminUser: CmsAdminUser;
}): Promise<CmsMediaAsset> {
  const { storageBucket } = getSupabaseConfigStatus();
  const supabase = createSupabaseAdminClient();

  const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ]);
  if (!allowedMimeTypes.has(params.mimeType)) {
    throw new Error('Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.');
  }

  const cleanBase64 = params.base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Image size must be between 1 byte and 5 MB.');
  }

  const ext = params.fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const safeBase = slugify(params.fileName.replace(/\.[^.]+$/, '')) || 'article-image';
  const dateFolder = new Date().toISOString().slice(0, 7);
  const storagePath = `articles/${dateFolder}/${Date.now()}-${safeBase}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(storagePath, buffer, {
      contentType: params.mimeType,
      upsert: false,
      cacheControl: '31536000',
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  const { data: inserted, error: dbError } = await supabase
    .from('cms_media')
    .insert({
      bucket: storageBucket,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: params.fileName,
      mime_type: params.mimeType,
      size_bytes: buffer.byteLength,
      alt_text: params.altText.trim() || safeBase.replace(/-/g, ' '),
      uploaded_by: params.adminUser.id,
    })
    .select('*')
    .single();

  if (dbError || !inserted) {
    await supabase.storage.from(storageBucket).remove([storagePath]);
    throw new Error(dbError?.message || 'Failed to record media asset.');
  }

  return mapMediaRow(inserted as RawMediaRow);
}

export async function updateMediaAltAdmin(id: string, altText: string): Promise<CmsMediaAsset> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_media')
    .update({ alt_text: altText.trim() })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to update media alt text.');
  return mapMediaRow(data as RawMediaRow);
}

export async function deleteMediaAdmin(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error: fetchError } = await supabase
    .from('cms_media')
    .select('bucket, storage_path')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (row?.storage_path) {
    await supabase.storage.from(row.bucket || 'blog-media').remove([row.storage_path]);
  }
  const { error: deleteError } = await supabase.from('cms_media').delete().eq('id', id);
  if (deleteError) throw new Error(deleteError.message);
}
