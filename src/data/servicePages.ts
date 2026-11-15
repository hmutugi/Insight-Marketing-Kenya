export type {
  ServiceDeliverable,
  ServiceFaq,
  PricingFactorTier,
  ServiceComparisonRow,
  ServicePageData,
} from './services/types.ts';

import type { ServicePageData } from './services/types.ts';
import { seoCorePages } from './services/seoCorePages.ts';
import { seoSpecialistPages } from './services/seoSpecialistPages.ts';
import { paidAndWebPages } from './services/paidAndWebPages.ts';

export const servicePages: Record<string, ServicePageData> = {
  ...seoCorePages,
  ...seoSpecialistPages,
  ...paidAndWebPages,
};
