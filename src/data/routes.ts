import { siteConfig } from '../config/site.ts';
import { servicePages } from './servicePages.ts';
import { caseStudies } from './caseStudies.ts';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  breadcrumbs: BreadcrumbItem[];
  pageType: 'home' | 'service' | 'about' | 'case-studies' | 'case-study-detail' | 'blog' | 'blog-detail' | 'areas' | 'contact' | 'privacy' | 'admin' | 'not-found';
}

export const staticRoutes: Record<string, RouteMeta> = {
  '/': {
    path: '/',
    title: 'Insight Marketing Kenya | Digital Marketing, SEO & Web Design',
    description:
      'Get found, attract customers, and grow your business. Insight Marketing Kenya delivers SEO, Google Ads, Meta Ads, and high-converting web development across Kenya.',
    h1: 'Get found. Attract customers. Grow your business.',
    breadcrumbs: [{ label: 'Home', href: '/' }],
    pageType: 'home',
  },
  '/about/': {
    path: '/about/',
    title: 'About Insight Marketing Kenya | Digital Growth Partner',
    description:
      'Learn how Insight Marketing Kenya helps SMEs and established businesses combine SEO, paid advertising, and conversion-focused web development for steady growth.',
    h1: 'A practical digital growth partner for businesses across Kenya',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
    ],
    pageType: 'about',
  },
  '/case-studies/': {
    path: '/case-studies/',
    title: 'Case Studies & Project Showcase | Insight Marketing Kenya',
    description:
      'Explore website design, e-commerce, and SEO projects delivered by Insight Marketing Kenya for businesses and organisations across Kenya.',
    h1: 'Real websites and search foundations built for Kenyan organisations',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Case Studies', href: '/case-studies/' },
    ],
    pageType: 'case-studies',
  },
  '/blog/': {
    path: '/blog/',
    title: 'Insights & Digital Marketing Guides Kenya | Insight Marketing',
    description:
      'Practical guides on SEO, website conversion, Google Ads, and digital growth written in plain English for Kenyan business owners and marketing teams.',
    h1: 'Practical digital growth insights for Kenyan businesses',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Insights', href: '/blog/' },
    ],
    pageType: 'blog',
  },
  '/areas-we-serve/': {
    path: '/areas-we-serve/',
    title: 'Areas We Serve Across Kenya | Insight Marketing Kenya',
    description:
      'Insight Marketing Kenya supports businesses across Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, and nationwide with SEO, paid ads, and web development.',
    h1: 'Serving ambitious businesses across Nairobi and Kenya',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Areas We Serve', href: '/areas-we-serve/' },
    ],
    pageType: 'areas',
  },
  '/contact/': {
    path: '/contact/',
    title: 'Contact Insight Marketing Kenya | Get a Free Growth Review',
    description:
      'Request a Free Growth Review or speak with Insight Marketing Kenya via phone, WhatsApp, or email about SEO, Google Ads, Meta Ads, or web development.',
    h1: 'Request a Free Growth Review for your business',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Contact', href: '/contact/' },
    ],
    pageType: 'contact',
  },
  '/privacy-policy/': {
    path: '/privacy-policy/',
    title: 'Privacy Policy | Insight Marketing Kenya',
    description:
      'Read how Insight Marketing Kenya collects, uses, and safeguards enquiry information submitted through our website.',
    h1: 'Privacy Policy',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
    ],
    pageType: 'privacy',
  },
  '/admin/': {
    path: '/admin/',
    title: 'Editorial CMS Admin | Insight Marketing Kenya',
    description: 'Protected editorial content management dashboard for Insight Marketing Kenya.',
    h1: 'Editorial Content Management',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin/' },
    ],
    pageType: 'admin',
  },
};

export function normalizePathname(rawPath: string): string {
  const pathOnly = rawPath.split('?')[0].split('#')[0] || '/';
  if (pathOnly === '/') return '/';
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function resolveRouteMeta(rawPath: string): RouteMeta {
  const pathname = normalizePathname(rawPath);

  if (staticRoutes[pathname]) {
    return staticRoutes[pathname];
  }

  const service = servicePages[pathname];
  if (service) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    if (service.categoryHubHref !== pathname) {
      breadcrumbs.push({ label: service.categoryHubLabel, href: service.categoryHubHref });
    }
    breadcrumbs.push({ label: service.h1.split(':')[0], href: pathname });

    return {
      path: pathname,
      title: service.metaTitle,
      description: service.metaDescription,
      h1: service.h1,
      breadcrumbs,
      pageType: 'service',
    };
  }

  if (pathname.startsWith('/case-studies/') && pathname !== '/case-studies/') {
    const slug = pathname.replace(/^\/case-studies\//, '').replace(/\/$/, '');
    const study = caseStudies.find((c) => c.slug === slug);
    if (study) {
      return {
        path: pathname,
        title: study.metaTitle,
        description: study.metaDescription,
        h1: study.title,
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: 'Case Studies', href: '/case-studies/' },
          { label: study.title, href: pathname },
        ],
        pageType: 'case-study-detail',
      };
    }
  }

  if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
    const slug = pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
    return {
      path: pathname,
      title: `${slug.replace(/-/g, ' ')} | Insights | ${siteConfig.shortName}`,
      description:
        'Digital marketing, SEO, and website conversion guide from Insight Marketing Kenya.',
      h1: slug.replace(/-/g, ' '),
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Insights', href: '/blog/' },
        { label: 'Article', href: pathname },
      ],
      pageType: 'blog-detail',
    };
  }

  return {
    path: pathname,
    title: `Page Not Found | ${siteConfig.brandName}`,
    description: 'The requested page could not be found on Insight Marketing Kenya.',
    h1: 'Page not found',
    breadcrumbs: [{ label: 'Home', href: '/' }],
    pageType: 'not-found',
  };
}

export function getAllStaticSitemapPaths(): string[] {
  return [
    ...Object.keys(staticRoutes).filter((p) => p !== '/admin/'),
    ...Object.keys(servicePages),
    ...caseStudies.map((study) => `/case-studies/${study.slug}/`),
  ];
}
