import type { CmsArticle, ServiceRecommendation, TableOfContentsHeading } from './types.ts';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeArticleHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function estimateReadingTime(html: string): number {
  const words = stripHtmlTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function extractTableOfContentsAndInjectIds(html: string): {
  headings: TableOfContentsHeading[];
  htmlWithIds: string;
} {
  const headings: TableOfContentsHeading[] = [];
  const usedIds = new Map<string, number>();

  const htmlWithIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr: string, attrs: string, innerHtml: string) => {
      const level = Number(levelStr) as 2 | 3;
      const text = stripHtmlTags(innerHtml);
      if (!text) return `<h${level}${attrs}>${innerHtml}</h${level}>`;

      const baseSlug = slugify(text) || `section-${headings.length + 1}`;
      const count = usedIds.get(baseSlug) || 0;
      usedIds.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

      headings.push({ id, text, level });

      const cleanAttrs = attrs.replace(/\sid\s*=\s*("[^"]*"|'[^']*')/gi, '');
      return `<h${level}${cleanAttrs} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { headings, htmlWithIds };
}

const SERVICE_CATALOG: Record<string, ServiceRecommendation> = {
  '/seo-services-kenya/': {
    label: 'SEO Services in Kenya',
    href: '/seo-services-kenya/',
    note: 'Complete organic search strategy, technical health, and lead generation.',
  },
  '/local-seo-kenya/': {
    label: 'Local SEO Kenya',
    href: '/local-seo-kenya/',
    note: 'Google Business Profile and Google Maps visibility for Kenyan towns.',
  },
  '/technical-seo/': {
    label: 'Technical SEO Services',
    href: '/technical-seo/',
    note: 'Fix website speed, crawlability, Core Web Vitals, and structured data.',
  },
  '/on-page-seo/': {
    label: 'On-Page SEO Services',
    href: '/on-page-seo/',
    note: 'Turn thin pages into clear, search-aligned commercial landing pages.',
  },
  '/ecommerce-seo-kenya/': {
    label: 'Ecommerce SEO Kenya',
    href: '/ecommerce-seo-kenya/',
    note: 'Structure WooCommerce and Shopify categories to capture buyer searches.',
  },
  '/ai-search-aeo-geo-kenya/': {
    label: 'AI Search, AEO & GEO',
    href: '/ai-search-aeo-geo-kenya/',
    note: 'Earn visibility across Google AI Overviews, ChatGPT, Gemini, Claude & Voice.',
  },
  '/google-ads-management-kenya/': {
    label: 'Google Ads Management',
    href: '/google-ads-management-kenya/',
    note: 'Capture ready-to-buy search intent across Kenya with disciplined spend.',
  },
  '/meta-ads-management-kenya/': {
    label: 'Meta Ads Management',
    href: '/meta-ads-management-kenya/',
    note: 'Generate qualified leads from Facebook and Instagram campaigns.',
  },
  '/web-design-kenya/': {
    label: 'Website Design & Development',
    href: '/web-design-kenya/',
    note: 'Fast, conversion-focused Kenyan business and e-commerce websites.',
  },
  '/website-maintenance-kenya/': {
    label: 'Website Maintenance & Care',
    href: '/website-maintenance-kenya/',
    note: 'Ongoing updates, backups, security hardening, and speed checks.',
  },
};

export function recommendRelatedServices(article: CmsArticle): ServiceRecommendation[] {
  const results: ServiceRecommendation[] = [];
  const pushUnique = (href: string) => {
    const svc = SERVICE_CATALOG[href];
    if (svc && !results.some((item) => item.href === svc.href)) {
      results.push(svc);
    }
  };

  if (article.relatedServiceSlug && SERVICE_CATALOG[article.relatedServiceSlug]) {
    pushUnique(article.relatedServiceSlug);
  }

  const haystack = `${article.category} ${article.title} ${article.tags.map((t) => t.name).join(' ')}`.toLowerCase();

  if (haystack.includes('aeo') || haystack.includes('geo') || haystack.includes('ai ') || haystack.includes('chatgpt')) {
    pushUnique('/ai-search-aeo-geo-kenya/');
    pushUnique('/seo-services-kenya/');
  }
  if (haystack.includes('local') || haystack.includes('maps') || haystack.includes('nairobi')) {
    pushUnique('/local-seo-kenya/');
  }
  if (haystack.includes('technical') || haystack.includes('speed') || haystack.includes('vitals')) {
    pushUnique('/technical-seo/');
  }
  if (haystack.includes('ecommerce') || haystack.includes('woocommerce') || haystack.includes('shopify')) {
    pushUnique('/ecommerce-seo-kenya/');
  }
  if (haystack.includes('google ads') || haystack.includes('paid') || haystack.includes('ppc')) {
    pushUnique('/google-ads-management-kenya/');
    pushUnique('/meta-ads-management-kenya/');
  }
  if (haystack.includes('web') || haystack.includes('conversion') || haystack.includes('design')) {
    pushUnique('/web-design-kenya/');
    pushUnique('/website-maintenance-kenya/');
  }
  if (haystack.includes('seo')) {
    pushUnique('/seo-services-kenya/');
    pushUnique('/on-page-seo/');
  }

  // Always fill up to 3 sensible recommendations
  pushUnique('/seo-services-kenya/');
  pushUnique('/web-design-kenya/');
  pushUnique('/google-ads-management-kenya/');

  return results.slice(0, 3);
}
