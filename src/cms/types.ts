export type PublicationStatus = 'draft' | 'scheduled' | 'published';

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CmsTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CmsMediaAsset {
  id: string;
  bucket: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  createdAt: string;
}

export interface CmsAdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'editor';
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  updatedAt: string;
  createdAt?: string;
  category: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  tags: CmsTag[];
  authorName: string;
  authorRole: string;
  authorBio: string;
  authorAvatarUrl: string;
  readingTimeMinutes: number;
  featuredImageUrl: string;
  featuredImageAlt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  ogDescription: string;
  relatedServiceSlug: string;
  status: PublicationStatus;
  isFeatured: boolean;
}

export interface ArticleUpsertInput {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categoryId: string | null;
  tagIds: string[];
  tagNames?: string[];
  authorName: string;
  authorRole: string;
  authorBio: string;
  authorAvatarUrl: string;
  status: PublicationStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  ogDescription: string;
  relatedServiceSlug: string;
}

export interface PaginatedPostsResult {
  posts: CmsArticle[];
  featuredPosts: CmsArticle[];
  categories: CmsCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupabaseConfigStatus {
  configured: boolean;
  missingVars: string[];
  storageBucket: string;
}

export interface TableOfContentsHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ServiceRecommendation {
  label: string;
  href: string;
  note: string;
}
