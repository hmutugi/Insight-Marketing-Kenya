export interface ServiceDeliverable {
  title: string;
  businessOutcome: string;
  technicalDetail: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface PricingFactorTier {
  name: string;
  suitedFor: string;
  pricePlaceholder: string;
  scopeHighlights: string[];
}

export interface ServiceComparisonRow {
  topic: string;
  primaryColumn: string;
  secondaryColumn: string;
}

export interface ServicePageData {
  slug: string;
  category: 'SEO' | 'Paid Advertising' | 'Web Development';
  categoryHubHref: string;
  categoryHubLabel: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  introLead: string;
  businessOutcomeLabel: string;
  businessBenefitHeading: string;
  businessBenefitBody: string[];
  commonProblemsHeading: string;
  commonProblems: { problem: string; impact: string }[];
  comparisonSection?: {
    heading: string;
    intro: string;
    primaryHeader: string;
    secondaryHeader: string;
    rows: ServiceComparisonRow[];
  };
  deliverablesHeading: string;
  deliverables: ServiceDeliverable[];
  technicalDepthHeading?: string;
  technicalDepthPoints?: { topic: string; explanation: string }[];
  howItConnectsHeading: string;
  howItConnectsBody: string;
  processSteps: { step: string; title: string; detail: string }[];
  pricingTiers?: PricingFactorTier[];
  pricingNote?: string;
  localCoverageNote?: string;
  verifiedCaseStudySlug?: string;
  relatedArticleCategories?: string[];
  faqs: ServiceFaq[];
  relatedLinks: { label: string; href: string; note: string }[];
  visualKey: 'seoArchitecture' | 'webCraft' | 'paidAnalytics' | 'heroStudio';
}
