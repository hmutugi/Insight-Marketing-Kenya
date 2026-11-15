import { useEffect } from 'react';
import { siteConfig } from './config/site';
import { caseStudies } from './data/caseStudies';
import { normalizePathname, resolveRouteMeta } from './data/routes';
import { servicePages } from './data/servicePages';
import { CmsArticle } from './lib/cms';
import { AppInitialData, RouterProvider, useRouter } from './lib/router';
import { buildHeadMetadata } from './lib/seo';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { HomePage } from './components/HomePage';
import { ServicePageView } from './components/ServicePageView';
import { AdminDashboardView } from './components/AdminDashboardView';
import {
  AboutPageView,
  AreasWeServeView,
  BlogDetailView,
  BlogListView,
  CaseStudiesListView,
  CaseStudyDetailView,
  ContactPageView,
  PrivacyPolicyView,
  NotFoundView,
} from './components/BusinessPages';

function AppShell({
  baseUrl,
  activeArticle,
}: {
  baseUrl: string;
  activeArticle?: CmsArticle | null;
}) {
  const { pathname, posts, setPosts } = useRouter();
  const normalized = normalizePathname(pathname);
  const meta = resolveRouteMeta(normalized);
  const service = servicePages[normalized];

  useEffect(() => {
    if (posts.length > 0 || meta.pageType === 'admin') return;
    fetch('/api/blog?pageSize=50')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { posts?: CmsArticle[] } | null) => {
        if (data?.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      })
      .catch(() => {
        // Server-side Supabase state already hydrated when configured
      });
  }, [posts.length, setPosts, meta.pageType]);

  let currentArticle: CmsArticle | null = null;
  if (meta.pageType === 'blog-detail') {
    const slug = normalized.replace(/^\/blog\//, '').replace(/\/$/, '');
    currentArticle =
      posts.find((p) => p.slug === slug) ||
      (activeArticle && activeArticle.slug === slug ? activeArticle : null);
  }

  const head = buildHeadMetadata({
    meta,
    baseUrl,
    service,
    article: currentArticle,
  });

  const renderMain = () => {
    if (meta.pageType === 'home') {
      return <HomePage posts={posts} />;
    }
    if (meta.pageType === 'service' && service) {
      return <ServicePageView page={service} breadcrumbs={meta.breadcrumbs} posts={posts} />;
    }
    if (meta.pageType === 'about') {
      return <AboutPageView breadcrumbs={meta.breadcrumbs} />;
    }
    if (meta.pageType === 'case-studies') {
      return <CaseStudiesListView breadcrumbs={meta.breadcrumbs} />;
    }
    if (meta.pageType === 'case-study-detail') {
      const slug = normalized.replace(/^\/case-studies\//, '').replace(/\/$/, '');
      const study = caseStudies.find((c) => c.slug === slug);
      if (study) {
        return <CaseStudyDetailView study={study} breadcrumbs={meta.breadcrumbs} />;
      }
      return <NotFoundView />;
    }
    if (meta.pageType === 'blog') {
      return <BlogListView posts={posts} breadcrumbs={meta.breadcrumbs} />;
    }
    if (meta.pageType === 'blog-detail') {
      const slug = normalized.replace(/^\/blog\//, '').replace(/\/$/, '');
      const related = posts.filter((p) => p.slug !== slug);
      return (
        <BlogDetailView
          article={currentArticle}
          relatedPosts={related}
          breadcrumbs={
            currentArticle
              ? [
                  { label: 'Home', href: '/' },
                  { label: 'Insights', href: '/blog/' },
                  { label: currentArticle.title, href: normalized },
                ]
              : meta.breadcrumbs
          }
        />
      );
    }
    if (meta.pageType === 'areas') {
      return <AreasWeServeView breadcrumbs={meta.breadcrumbs} />;
    }
    if (meta.pageType === 'contact') {
      return <ContactPageView breadcrumbs={meta.breadcrumbs} />;
    }
    if (meta.pageType === 'admin') {
      return <AdminDashboardView />;
    }
    if (meta.pageType === 'privacy') {
      return <PrivacyPolicyView breadcrumbs={meta.breadcrumbs} />;
    }
    return <NotFoundView />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F6F2] text-[#141619]">
      <SeoHead head={head} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#141619] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {renderMain()}
      </main>
      <Footer />
    </div>
  );
}

export default function App({
  initialPath = '/',
  initialData = { posts: [] },
  baseUrl = siteConfig.domain,
}: {
  initialPath?: string;
  initialData?: AppInitialData;
  baseUrl?: string;
}) {
  return (
    <RouterProvider initialPath={initialPath} initialData={initialData}>
      <AppShell baseUrl={baseUrl} activeArticle={initialData.activeArticle} />
    </RouterProvider>
  );
}
