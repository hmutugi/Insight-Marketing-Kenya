import { siteConfig } from '../config/site';
import { RouteMeta } from '../data/routes';
import { ServicePageData } from '../data/servicePages';
import { CmsArticle } from './cms';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveAbsoluteUrl(rawUrl: string, cleanBase: string): string {
  if (!rawUrl) return `${cleanBase}${siteConfig.logo.src}`;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `${cleanBase}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
}

export interface HeadMetadata {
  title: string;
  description: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  noindex: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLdGraph: Record<string, unknown>[];
}

export function buildHeadMetadata(params: {
  meta: RouteMeta;
  baseUrl: string;
  service?: ServicePageData;
  article?: CmsArticle | null;
}): HeadMetadata {
  const { meta, baseUrl, service, article } = params;
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const defaultCanonical = `${cleanBase}${meta.path === '/' ? '/' : meta.path}`;

  const canonicalUrl = article?.canonicalUrl?.trim()
    ? article.canonicalUrl.trim()
    : defaultCanonical;

  const title = article
    ? article.seoTitle?.trim() || `${article.title} | ${siteConfig.shortName}`
    : meta.title;
  const description = article
    ? article.metaDescription?.trim() || article.excerpt
    : meta.description;
  const ogDescription = article
    ? article.ogDescription?.trim() || description
    : description;
  const ogImage = article
    ? resolveAbsoluteUrl(article.ogImageUrl || article.featuredImageUrl, cleanBase)
    : `${cleanBase}${siteConfig.logo.src}`;
  const ogType: 'website' | 'article' = article ? 'article' : 'website';
  const noindex = meta.pageType === 'admin' || meta.pageType === 'not-found';

  const organizationNode: Record<string, unknown> = {
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.domain}/#organization`,
    name: siteConfig.brandName,
    url: siteConfig.domain,
    logo: `${cleanBase}${siteConfig.logo.src}`,
    telephone: siteConfig.contact.phoneDisplay,
    email: siteConfig.contact.email,
    areaServed: [
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'City', name: 'Nairobi' },
    ],
    description: siteConfig.description,
  };

  const breadcrumbs = article
    ? [
        { label: 'Home', href: '/' },
        { label: 'Insights', href: '/blog/' },
        { label: article.title, href: `/blog/${article.slug}/` },
      ]
    : meta.breadcrumbs;

  const breadcrumbNode: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.label,
      item: `${cleanBase}${crumb.href}`,
    })),
  };

  const webPageNode: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: 'en-KE',
    isPartOf: { '@id': `${siteConfig.domain}/#website` },
    breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
  };

  const graph: Record<string, unknown>[] = [
    organizationNode,
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.domain}/#website`,
      url: siteConfig.domain,
      name: siteConfig.brandName,
      publisher: { '@id': `${siteConfig.domain}/#organization` },
    },
    breadcrumbNode,
    webPageNode,
  ];

  if (service) {
    graph.push({
      '@type': 'Service',
      name: service.h1,
      description: service.metaDescription,
      serviceType: service.category,
      provider: { '@id': `${siteConfig.domain}/#organization` },
      areaServed: service.slug.includes('nairobi')
        ? { '@type': 'City', name: 'Nairobi' }
        : { '@type': 'Country', name: 'Kenya' },
      url: canonicalUrl,
    });

    if (service.faqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }
  }

  if (article) {
    const articleImage = resolveAbsoluteUrl(
      article.featuredImageUrl || article.ogImageUrl,
      cleanBase
    );
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      headline: article.title,
      description,
      image: [articleImage],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      articleSection: article.category,
      keywords: article.tags.map((t) => t.name).join(', '),
      author: {
        '@type': article.authorName ? 'Person' : 'Organization',
        name: article.authorName || siteConfig.brandName,
        ...(article.authorRole ? { jobTitle: article.authorRole } : {}),
      },
      publisher: { '@id': `${siteConfig.domain}/#organization` },
      mainEntityOfPage: { '@id': `${canonicalUrl}#webpage` },
    });
  }

  return {
    title,
    description,
    ogDescription,
    ogImage,
    canonicalUrl,
    ogType,
    noindex,
    publishedTime: article?.publishedAt,
    modifiedTime: article?.updatedAt,
    jsonLdGraph: graph,
  };
}

export function renderHeadHtml(head: HeadMetadata, _baseUrl: string): string {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': head.jsonLdGraph,
  }).replace(/</g, '\\u003c');

  const lines = [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}" />`,
    head.noindex
      ? `<meta name="robots" content="noindex, nofollow" />`
      : `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${escapeHtml(head.canonicalUrl)}" />`,
    `<meta property="og:type" content="${head.ogType}" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteConfig.seoDefaults.siteName)}" />`,
    `<meta property="og:locale" content="${siteConfig.seoDefaults.locale}" />`,
    `<meta property="og:title" content="${escapeHtml(head.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(head.ogDescription)}" />`,
    `<meta property="og:url" content="${escapeHtml(head.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(head.ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(head.ogDescription)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(head.ogImage)}" />`,
  ];

  if (head.ogType === 'article' && head.publishedTime) {
    lines.push(`<meta property="article:published_time" content="${escapeHtml(head.publishedTime)}" />`);
  }
  if (head.ogType === 'article' && head.modifiedTime) {
    lines.push(`<meta property="article:modified_time" content="${escapeHtml(head.modifiedTime)}" />`);
  }

  lines.push(`<script type="application/ld+json">${jsonLd}</script>`);
  return lines.join('\n    ');
}
