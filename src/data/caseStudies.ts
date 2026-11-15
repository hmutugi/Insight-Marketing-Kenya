export interface CaseStudyRecord {
  slug: string;
  projectName: string;
  title: string;
  domain: string;
  liveUrl: string;
  year: string;
  industry: string;
  mainService: string;
  servicesUsed: string[];
  imageSrc: string;
  imageAlt: string;
  region: string;
  summary: string;
  challenge: string;
  approach: string[];
  deliverables: string[];
  /**
   * Editable placeholder slots: replace with verified Google Analytics /
   * Search Console / client-approved figures when ready to publish.
   */
  outcomeNotes: {
    label: string;
    value: string;
    isPlaceholder: boolean;
  }[];
  metaTitle: string;
  metaDescription: string;
}

export const caseStudies: CaseStudyRecord[] = [
  {
    slug: 'sairaj-ecommerce-redesign-and-seo',
    projectName: 'SaiRaj',
    title: 'E-Commerce Redesign & Search Structure for SaiRaj',
    domain: 'SaiRaj.com',
    liveUrl: 'https://www.sairaj.com/',
    year: '2025',
    industry: 'Retail & E-Commerce',
    mainService: 'E-Commerce Redesign & SEO',
    servicesUsed: ['Website Design & Development', 'Ecommerce SEO', 'Technical SEO'],
    imageSrc: '/assets/projects/sr.png',
    imageAlt: 'Laptop showcase of the SaiRaj e-commerce website redesign by Insight Marketing Kenya',
    region: 'Kenya & Regional Retail',
    summary:
      'Modernising an established retail storefront with cleaner category navigation, mobile-friendly product discovery, and search-ready page foundations.',
    challenge:
      'Shoppers needed a clearer way to browse product categories across mobile and desktop while search engines required cleaner page hierarchy and structured product metadata.',
    approach: [
      'Reorganised storefront navigation so high-priority product categories are reachable within two taps on mobile.',
      'Aligned category titles, headings, and internal links around real customer product searches.',
      'Improved layout consistency and visual trust across product and enquiry touchpoints.',
    ],
    deliverables: [
      'E-commerce storefront UX and layout redesign',
      'Category and product page SEO foundations',
      'Mobile-responsive navigation and enquiry pathways',
    ],
    outcomeNotes: [
      {
        label: 'Verified Search & Traffic Impact',
        value: '[Editable Placeholder: Add client-approved organic search or order figures]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2025',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'SaiRaj.com',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'SaiRaj E-Commerce Redesign & SEO Case Study | Insight Marketing Kenya',
    metaDescription:
      'How Insight Marketing Kenya approached the e-commerce redesign and search foundations for SaiRaj.com.',
  },
  {
    slug: 'mara-enkaji-business-website-design',
    projectName: 'Mara Enkaji',
    title: 'Hospitality & Safari Website Design for Mara Enkaji',
    domain: 'MaraEnkaji.com',
    liveUrl: 'https://maraenkaji.com/',
    year: '2025',
    industry: 'Hospitality & Safari Tourism',
    mainService: 'Business Website Design',
    servicesUsed: ['Website Design & Development', 'On-Page SEO', 'Conversion UX'],
    imageSrc: '/assets/projects/mara-enkaji.png',
    imageAlt: 'Laptop showcase of the Mara Enkaji hospitality website designed by Insight Marketing Kenya',
    region: 'Maasai Mara & Nairobi',
    summary:
      'Crafting an editorial hospitality web presence designed to showcase safari experiences clearly and guide prospective guests toward direct reservation enquiries.',
    challenge:
      'Travellers researching safari stays compare multiple lodges online and need immediate confidence in accommodation details, location context, and direct booking contact.',
    approach: [
      'Designed an uncluttered, imagery-led layout highlighting the setting, stay experience, and reservation pathway.',
      'Structured clear navigation across rooms, gallery, and direct booking enquiries.',
      'Built lightweight, responsive templates for international and local mobile visitors.',
    ],
    deliverables: [
      'Custom hospitality website design and build',
      'Reservation enquiry pathway and clear service pages',
      'On-page SEO headings and metadata structure',
    ],
    outcomeNotes: [
      {
        label: 'Verified Booking Enquiry Impact',
        value: '[Editable Placeholder: Add client-approved reservation or traffic data]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2025',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'MaraEnkaji.com',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'Mara Enkaji Hospitality Website Design Case Study | Insight Marketing Kenya',
    metaDescription:
      'Explore the business website design built for Mara Enkaji by Insight Marketing Kenya to support direct hospitality enquiries.',
  },
  {
    slug: 'dokisi-supermarket-retail-web-presence',
    projectName: 'Dokisi Supermarket',
    title: 'Retail Web Presence & Local Discovery for Dokisi Supermarket',
    domain: 'DokisiSupermarket.co.ke',
    liveUrl: 'https://dokisisupermarket.co.ke/',
    year: '2023',
    industry: 'Retail & Supermarket',
    mainService: 'Retail Web Presence',
    servicesUsed: ['Website Design & Development', 'Local SEO', 'Ecommerce Foundations'],
    imageSrc: '/assets/projects/doc-supermarket.png',
    imageAlt: 'Laptop showcase of the Dokisi Supermarket website built by Insight Marketing Kenya',
    region: 'Kenya Local Retail',
    summary:
      'Establishing a clear, approachable retail web presence helping nearby residents, families, and students browse departments and order conveniently.',
    challenge:
      'Local retail customers frequently search online to check store departments, product availability, and how to reach the supermarket before visiting or ordering.',
    approach: [
      'Structured clear retail departments (groceries, fresh juice, household essentials) for effortless browsing.',
      'Highlighted local location context and convenient ordering actions right on the first screen.',
      'Aligned local business details to strengthen nearby search discovery.',
    ],
    deliverables: [
      'Retail & online grocery web presence',
      'Department structure and shopping navigation',
      'Local search alignment and contact clarity',
    ],
    outcomeNotes: [
      {
        label: 'Verified Store Enquiry / Order Data',
        value: '[Editable Placeholder: Add verified customer enquiry or local search metrics]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2023',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'DokisiSupermarket.co.ke',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'Dokisi Supermarket Web Presence Case Study | Insight Marketing Kenya',
    metaDescription:
      'See how Insight Marketing Kenya built a clear retail web presence for DokisiSupermarket.co.ke.',
  },
  {
    slug: 'arise-and-awake-kenya-ngo-website',
    projectName: 'Arise & Awake Kenya',
    title: 'Organisational Website & Impact Showcase for Arise & Awake Kenya',
    domain: 'AriseAndAwake.org',
    liveUrl: 'https://ariseandawake.org/',
    year: '2026',
    industry: 'Non-Profit & Community Impact',
    mainService: 'NGO Website Design',
    servicesUsed: ['Website Design & Development', 'Information Architecture', 'On-Page SEO'],
    imageSrc: '/assets/projects/arise.png',
    imageAlt: 'Laptop showcase of the Arise and Awake Kenya website built by Insight Marketing Kenya',
    region: 'Nationwide Kenya',
    summary:
      'Giving a nationwide community organisation a structured digital home to communicate programmes, impact, and partnership opportunities clearly.',
    challenge:
      'Supporters, partners, and community members needed clear visibility into ongoing programmes, impact updates, and straightforward ways to get involved.',
    approach: [
      'Created dedicated sections for About, Programmes, Impact, Gallery, and Insights.',
      'Organised messaging so first-time visitors immediately grasp the organisation’s mission and reach.',
      'Built an accessible content layout ready for ongoing updates and blog publishing.',
    ],
    deliverables: [
      'Custom organisational website architecture',
      'Programmes and impact storytelling layout',
      'Blog publishing and partner contact integration',
    ],
    outcomeNotes: [
      {
        label: 'Verified Reach & Engagement',
        value: '[Editable Placeholder: Add verified site engagement or partner enquiry notes]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2026',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'AriseAndAwake.org',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'Arise & Awake Kenya NGO Website Case Study | Insight Marketing Kenya',
    metaDescription:
      'How Insight Marketing Kenya designed an organisational web platform for AriseAndAwake.org.',
  },
  {
    slug: 'twende-stories-content-driven-travel-blog',
    projectName: 'Twende Stories',
    title: 'Content-Driven Publishing Platform for Twende Stories',
    domain: 'TwendeStories.com',
    liveUrl: 'https://twendestories.com/',
    year: '2026',
    industry: 'Travel & Digital Publishing',
    mainService: 'Content Platform & SEO',
    servicesUsed: ['Website Design & Development', 'On-Page SEO', 'Editorial Architecture'],
    imageSrc: '/assets/projects/twende-storpes.png',
    imageAlt: 'Laptop showcase of the Twende Stories travel blog platform by Insight Marketing Kenya',
    region: 'Kenya & Global Readership',
    summary:
      'Building a clean, readable editorial platform engineered for long-form travel storytelling, featured articles, and organic search discovery.',
    challenge:
      'Content-led publications depend on fast reading experiences, clear article hierarchy, and structured categories so readers and search engines discover stories easily.',
    approach: [
      'Designed an editorial layout prioritising readable typography, featured articles, and clean visual pacing.',
      'Structured category archives and article templates with search-friendly headings and internal links.',
      'Optimised mobile reading comfort and media framing across articles.',
    ],
    deliverables: [
      'Editorial blog design and custom article layout',
      'Search-friendly content taxonomy and archive structure',
      'Fast-loading mobile reading experience',
    ],
    outcomeNotes: [
      {
        label: 'Verified Readership Metrics',
        value: '[Editable Placeholder: Add verified organic readership or Search Console data]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2026',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'TwendeStories.com',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'Twende Stories Publishing Platform Case Study | Insight Marketing Kenya',
    metaDescription:
      'Explore the content-driven travel platform designed for TwendeStories.com by Insight Marketing Kenya.',
  },
  {
    slug: 'chinmaya-mission-kenya-web-platform',
    projectName: 'Chinmaya Mission Kenya',
    title: 'Community & Event Website for Chinmaya Mission Kenya',
    domain: 'ChinmayaKenya.org',
    liveUrl: 'https://chinmayakenya.org/',
    year: '2026',
    industry: 'Community & Religious Organisation',
    mainService: 'Organisational Web Design',
    servicesUsed: ['Website Design & Development', 'Website Maintenance', 'Local Visibility'],
    imageSrc: '/assets/projects/chinmaya.png',
    imageAlt: 'Laptop showcase of the Chinmaya Mission Kenya website designed by Insight Marketing Kenya',
    region: 'Kenya',
    summary:
      'Providing a clear, welcoming digital hub for community members and visitors to find centres, schedules, programmes, and contact details.',
    challenge:
      'Community organisations need reliable, easy-to-update websites where members across age groups can quickly confirm event schedules and contact details.',
    approach: [
      'Simplified top-level navigation around community activities, centres, and contact information.',
      'Built clean mobile-accessible layouts suitable for rapid schedule updates.',
      'Ensured clear typography and high legibility across devices.',
    ],
    deliverables: [
      'Responsive organisational website',
      'Accessible information structure and event visibility',
      'Reliable content update workflow',
    ],
    outcomeNotes: [
      {
        label: 'Verified Community Reach',
        value: '[Editable Placeholder: Add verified visitor or member enquiry notes]',
        isPlaceholder: true,
      },
      {
        label: 'Project Year',
        value: '2026',
        isPlaceholder: false,
      },
      {
        label: 'Live Website',
        value: 'ChinmayaKenya.org',
        isPlaceholder: false,
      },
    ],
    metaTitle: 'Chinmaya Mission Kenya Website Case Study | Insight Marketing Kenya',
    metaDescription:
      'See how Insight Marketing Kenya designed a clear community website for ChinmayaKenya.org.',
  },
];
