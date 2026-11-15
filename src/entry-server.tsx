import { renderToString } from 'react-dom/server';
import App from './App';
import { normalizePathname, resolveRouteMeta } from './data/routes';
import { servicePages } from './data/servicePages';
import { CmsArticle } from './lib/cms';
import { AppInitialData } from './lib/router';
import { buildHeadMetadata, renderHeadHtml } from './lib/seo';

export interface SsrRenderResult {
  appHtml: string;
  headHtml: string;
  statusCode: number;
}

export function render(
  url: string,
  baseUrl: string,
  initialData: AppInitialData
): SsrRenderResult {
  const normalized = normalizePathname(url);
  const meta = resolveRouteMeta(normalized);
  const service = servicePages[normalized];

  let activeArticle: CmsArticle | null = initialData.activeArticle || null;
  if (meta.pageType === 'blog-detail' && !activeArticle) {
    const slug = normalized.replace(/^\/blog\//, '').replace(/\/$/, '');
    activeArticle = initialData.posts.find((p) => p.slug === slug) || null;
  }

  let statusCode = 200;
  if (meta.pageType === 'not-found') {
    statusCode = 404;
  } else if (meta.pageType === 'blog-detail' && !activeArticle) {
    statusCode = 404;
  }

  const head = buildHeadMetadata({
    meta,
    baseUrl,
    service,
    article: activeArticle,
  });

  const appHtml = renderToString(
    <App
      initialPath={url}
      initialData={{ posts: initialData.posts, activeArticle }}
      baseUrl={baseUrl}
    />
  );

  const headHtml = renderHeadHtml(head, baseUrl);
  return { appHtml, headHtml, statusCode };
}
