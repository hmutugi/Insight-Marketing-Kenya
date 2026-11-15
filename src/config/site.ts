export interface NavSubItem {
  label: string;
  href: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavSubItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  enabled: boolean;
}

export const siteConfig = {
  brandName: 'Insight Marketing Kenya',
  shortName: 'Insight Marketing',
  legalName: 'Insight Marketing Kenya',
  domain: 'https://insightmarketing.co.ke',
  coreMessage: 'Get found. Attract customers. Grow your business.',
  description:
    'Insight Marketing Kenya helps Kenyan businesses improve online visibility, attract prospective customers, and turn website visitors into enquiries and sales through SEO, Google Ads, Meta Ads, and custom web development.',

  logo: {
    src: '/assets/insight-marketing-logo.png',
    alt: 'Insight Marketing Kenya logo',
    width: 160,
    height: 160,
  },

  contact: {
    /** Verified from https://insightmarketing.co.ke */
    phoneDisplay: '+254 720 465 974',
    phoneHref: 'tel:+254720465974',
    whatsappNumber: '254720465974',
    whatsappHref:
      'https://wa.me/254720465974?text=Hello%2C%20I%20found%20Insight%20Marketing%20Kenya%20online%20and%20would%20like%20to%20request%20a%20Free%20Growth%20Review.',
    /** Editable placeholder — update if a dedicated inbox is preferred */
    email: 'info@insightmarketing.co.ke',
    emailHref: 'mailto:info@insightmarketing.co.ke',
    serviceCoverage: 'Serving businesses across Nairobi and Kenya',
    /** Leave null unless a physical office address is verified and published */
    officeAddress: null as string | null,
    workingHours: 'Monday – Friday, 8:30 AM – 5:30 PM EAT',
  },

  /**
   * Editable social links: verified icon slots exist on insightmarketing.co.ke for
   * LinkedIn and Instagram. Replace placeholder URLs with exact profile URLs when confirmed.
   */
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com', enabled: true },
    { label: 'Instagram', href: 'https://www.instagram.com', enabled: true },
    { label: 'Facebook', href: 'https://www.facebook.com', enabled: false },
  ] as SocialLink[],

  navigation: [
    { label: 'Home', href: '/' },
    {
      label: 'Services',
      href: '/seo-services-kenya/',
      children: [
        {
          label: 'SEO Services',
          href: '/seo-services-kenya/',
          description: 'Help customers find your business first on Google.',
        },
        {
          label: 'AI Search, AEO & GEO',
          href: '/ai-search-aeo-geo-kenya/',
          description: 'Visibility in Google AI Overviews, ChatGPT, Gemini & Voice.',
        },
        {
          label: 'Google Ads Management',
          href: '/google-ads-management-kenya/',
          description: 'Capture ready-to-buy searches across Kenya immediately.',
        },
        {
          label: 'Meta Ads Management',
          href: '/meta-ads-management-kenya/',
          description: 'Reach targeted buyers on Facebook and Instagram.',
        },
        {
          label: 'Website Design & Development',
          href: '/web-design-kenya/',
          description: 'Fast, credible websites built to convert enquiries.',
        },
        {
          label: 'Website Maintenance',
          href: '/website-maintenance-kenya/',
          description: 'Keep your website secure, updated, and loading fast.',
        },
      ],
    },
    { label: 'Case Studies', href: '/case-studies/' },
    { label: 'Insights', href: '/blog/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ] as NavItem[],

  primaryCta: {
    label: 'Get a Free Growth Review',
    href: '/contact/',
  },

  servicesOverview: [
    {
      id: 'seo',
      index: '01',
      title: 'Search Engine Optimisation',
      shortTitle: 'SEO Services',
      href: '/seo-services-kenya/',
      businessBenefit:
        'Be visible when Kenyan buyers search Google for the products and services you already sell.',
      summary:
        'We fix technical roadblocks, clarify what each page offers, and strengthen your local and national search authority so qualified prospects find you without paying for every single click.',
    },
    {
      id: 'google-ads',
      index: '02',
      title: 'Google Ads Management',
      shortTitle: 'Google Ads',
      href: '/google-ads-management-kenya/',
      businessBenefit:
        'Put your offer in front of high-intent buyers the moment they search, with strict budget control.',
      summary:
        'Structured search campaigns, clear keyword intent filtering, and conversion tracking focused on phone calls, WhatsApp leads, and quote requests rather than wasted clicks.',
    },
    {
      id: 'meta-ads',
      index: '03',
      title: 'Meta Ads Management',
      shortTitle: 'Meta Ads',
      href: '/meta-ads-management-kenya/',
      businessBenefit:
        'Generate steady demand and enquiries from decision-makers and shoppers on Facebook and Instagram.',
      summary:
        'Clear creative angles, audience segmentation suited to Kenyan buying habits, and landing experiences that move prospects cleanly to WhatsApp or your enquiry form.',
    },
    {
      id: 'web-design',
      index: '04',
      title: 'Website Design & Development',
      shortTitle: 'Web Design',
      href: '/web-design-kenya/',
      businessBenefit:
        'Give prospective customers a fast, trustworthy website that explains your value clearly and turns visits into enquiries.',
      summary:
        'Custom, mobile-first business and e-commerce websites engineered with clean code, clear messaging, WhatsApp and form conversion paths, and search-ready structure from day one.',
    },
    {
      id: 'web-maintenance',
      index: '05',
      title: 'Website Maintenance & Optimisation',
      shortTitle: 'Maintenance',
      href: '/website-maintenance-kenya/',
      businessBenefit:
        'Protect your online reputation with reliable uptime, security updates, backups, and ongoing conversion improvements.',
      summary:
        'Proactive technical care, Core Web Vitals tuning, content updates, and regular backups so your site keeps performing as your business grows.',
    },
  ],

  seoDefaults: {
    siteName: 'Insight Marketing Kenya',
    titleSeparator: '|',
    defaultTitle: 'Insight Marketing Kenya | Digital Marketing, SEO & Web Design in Kenya',
    defaultDescription:
      'Get found, attract customers, and grow your business. Insight Marketing Kenya delivers SEO, Google Ads, Meta Ads, and conversion-focused web development for Kenyan businesses.',
    locale: 'en_KE',
  },

  cms: {
    provider: 'supabase' as const,
  },
};
