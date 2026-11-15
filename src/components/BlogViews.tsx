import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  List,
  MessageSquare,
  Search,
  Share2,
  User,
} from 'lucide-react';
import {
  CmsArticle,
  extractTableOfContentsAndInjectIds,
  formatDisplayDate,
  recommendRelatedServices,
} from '../lib/cms';
import { BreadcrumbItem } from '../data/routes';
import { siteConfig } from '../config/site';
import { Link } from '../lib/router';
import { Breadcrumbs } from './Breadcrumbs';
import { MediaFrame } from './MediaFrame';
import { GrowthReviewForm } from './GrowthReviewForm';

const POSTS_PER_PAGE = 6;

export function BlogListView({
  posts,
  breadcrumbs,
}: {
  posts: CmsArticle[];
  breadcrumbs: BreadcrumbItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    return ['All', ...unique];
  }, [posts]);

  const featuredPosts = useMemo(() => {
    const flagged = posts.filter((p) => p.isFeatured);
    return flagged.length > 0 ? flagged.slice(0, 2) : posts.slice(0, 1);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.name.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = useMemo(() => {
    const start = (safePage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, safePage]);

  const showFeaturedSection =
    selectedCategory === 'All' && !searchTerm.trim() && safePage === 1 && featuredPosts.length > 0;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header & Filter Controls */}
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
            Insights &amp; Practical Guides
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
            Digital growth insights for Kenyan businesses
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B515A]">
            Plain-English guides on Search Engine Optimisation, Google and Meta advertising, AI
            search readiness, and conversion-focused web development.
          </p>

          {/* Interactive Category Filter & Search */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap items-center gap-1 rounded-lg bg-[#EFEDE7] p-1"
              role="tablist"
              aria-label="Filter articles by category"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white text-[#141619] shadow-sm'
                      : 'text-[#4B515A] hover:text-[#141619]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666D77]"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                type="search"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search articles, topics, or tags…"
                className="w-full rounded-lg border border-[#D6D2C9] bg-white py-2 pl-10 pr-3.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {showFeaturedSection && (
        <section className="border-b border-[#E2DFD7] bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Featured Guides</p>
            <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {featuredPosts.map((featured) => (
                <article
                  key={featured.id}
                  className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] sm:grid-cols-12"
                >
                  <Link href={`/blog/${featured.slug}/`} className="block sm:col-span-5">
                    <MediaFrame
                      src={featured.featuredImageUrl}
                      alt={featured.featuredImageAlt}
                      aspectClass="aspect-[4/3] sm:aspect-auto sm:h-full"
                      className="rounded-none border-0 border-b border-[#E2DFD7] sm:border-b-0 sm:border-r"
                      priority
                    />
                  </Link>
                  <div className="flex flex-col justify-between p-6 sm:col-span-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#666D77]">
                        <span className="font-medium text-[#0F62A5]">Featured</span>
                        <span aria-hidden="true">·</span>
                        <span>{featured.category}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={featured.publishedAt}>
                          {formatDisplayDate(featured.publishedAt)}
                        </time>
                      </div>
                      <h2 className="mt-2.5 font-display text-xl font-bold leading-snug text-[#141619]">
                        <Link href={`/blog/${featured.slug}/`} className="hover:text-[#0F62A5]">
                          {featured.title}
                        </Link>
                      </h2>
                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#4B515A]">
                        {featured.excerpt}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[#E2DFD7] pt-4 text-xs text-[#666D77]">
                      <span>{featured.readingTimeMinutes} min read</span>
                      <Link
                        href={`/blog/${featured.slug}/`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                      >
                        <span>Read guide</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles Grid & Pagination */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4">
            <h2 className="font-display text-xl font-bold text-[#141619]">
              {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
            </h2>
            <p className="font-mono text-xs tabular-nums text-[#666D77]">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="mt-8 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-10 text-center">
              <BookOpen className="mx-auto h-7 w-7 text-[#0F62A5]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold text-[#141619]">
                Insights articles are being prepared
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#4B515A]">
                Published articles stored in our Supabase editorial database will appear here
                automatically. In the meantime, explore our services or request a Free Growth
                Review.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/seo-services-kenya/"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#141619] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2A2E34]"
                >
                  <span>Explore SEO Services</span>
                </Link>
                <Link
                  href="/contact/"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F5B700] px-5 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#DFA600]"
                >
                  <span>Get a Free Growth Review</span>
                </Link>
              </div>
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="mt-8 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-8 text-center">
              <p className="text-base font-medium text-[#141619]">
                No articles matched your filter or search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="mt-4 rounded-lg bg-[#141619] px-4 py-2 text-xs font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6]"
                  >
                    <div>
                      <Link href={`/blog/${post.slug}/`} className="block">
                        <MediaFrame
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt}
                          aspectClass="aspect-[16/10]"
                          className="rounded-none border-0 border-b border-[#E2DFD7]"
                        />
                      </Link>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#666D77]">
                          <span>{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={post.publishedAt}>
                            {formatDisplayDate(post.publishedAt)}
                          </time>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold leading-snug text-[#141619]">
                          <Link href={`/blog/${post.slug}/`} className="hover:text-[#0F62A5]">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                          {post.excerpt}
                        </p>
                        {post.tags && post.tags.length > 0 && (
                          <p className="mt-3 text-xs text-[#666D77]">
                            {post.tags.map((t) => t.name).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E2DFD7] px-6 py-4">
                      <span className="text-xs text-[#666D77]">{post.authorName}</span>
                      <Link
                        href={`/blog/${post.slug}/`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                      >
                        <span>Read article</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav
                  aria-label="Article pagination"
                  className="mt-12 flex items-center justify-between border-t border-[#E2DFD7] pt-6"
                >
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-lg border border-[#D6D2C9] bg-white px-4 py-2 text-xs font-semibold text-[#141619] transition-colors hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-current={pageNum === safePage ? 'page' : undefined}
                        className={`h-8 min-w-[32px] rounded-md px-2 font-semibold transition-colors ${
                          pageNum === safePage
                            ? 'bg-[#141619] text-white'
                            : 'text-[#4B515A] hover:bg-[#F7F6F2]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-lg border border-[#D6D2C9] bg-white px-4 py-2 text-xs font-semibold text-[#141619] transition-colors hover:bg-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function BlogDetailView({
  article,
  relatedPosts,
  breadcrumbs,
}: {
  article: CmsArticle | null;
  relatedPosts: CmsArticle[];
  breadcrumbs: BreadcrumbItem[];
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!article) {
    return (
      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-[#141619]">Article not found</h1>
        <p className="mt-3 text-base text-[#4B515A]">
          The requested insight could not be located or has not been published yet.
        </p>
        <Link
          href="/blog/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#141619] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Insights
        </Link>
      </section>
    );
  }

  const { headings, htmlWithIds } = extractTableOfContentsAndInjectIds(article.contentHtml);
  const recommendedServices = recommendRelatedServices(article);

  const shareUrl =
    article.canonicalUrl?.trim() || `${siteConfig.domain}/blog/${article.slug}/`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(article.title);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      });
    }
  };

  return (
    <article>
      {/* Semantic Article Header */}
      <header className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Breadcrumbs items={breadcrumbs} />
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#666D77]">
              <span className="font-semibold text-[#0F62A5]">{article.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={article.publishedAt}>
                  {formatDisplayDate(article.publishedAt)}
                </time>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {article.readingTimeMinutes} min read
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-[#141619] sm:text-4xl lg:text-[2.6rem]">
              {article.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#4B515A] sm:text-lg">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E2DFD7] pt-5 text-sm text-[#4B515A]">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-[#141619]">{article.authorName}</strong>
                  {article.authorRole ? ` · ${article.authorRole}` : ''}
                </span>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="text-xs text-[#666D77]">
                  Topics: {article.tags.map((tag) => tag.name).join(' · ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content + Sidebar Table of Contents */}
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Article Body */}
            <div className="lg:col-span-8">
              <div className="mb-8">
                <MediaFrame
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt}
                  aspectClass="aspect-[16/9]"
                  priority
                />
              </div>

              {/* Mobile Table of Contents */}
              {headings.length > 0 && (
                <nav
                  aria-label="Article table of contents"
                  className="mb-8 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-5 lg:hidden"
                >
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[#141619]">
                    <List className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                    <span>In this guide</span>
                  </div>
                  <ol className="mt-3 space-y-2 text-sm text-[#4B515A]">
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pl-4 text-xs' : ''}>
                        <a href={`#${h.id}`} className="hover:text-[#0F62A5] hover:underline">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div
                className="space-y-5 text-base leading-relaxed text-[#2C3036] [&_a]:font-semibold [&_a]:text-[#0F62A5] [&_a]:underline [&_blockquote]:rounded-lg [&_blockquote]:border [&_blockquote]:border-[#E2DFD7] [&_blockquote]:bg-[#FAF9F6] [&_blockquote]:p-4 [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#141619] [&_h3]:mt-7 [&_h3]:scroll-mt-24 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#141619] [&_img]:rounded-xl [&_img]:border [&_img]:border-[#E2DFD7] [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: htmlWithIds }}
              />

              {/* Article Sharing */}
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-[#E2DFD7] py-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#141619]">
                  <Share2 className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                  <span>Share this article</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                        <span>Link copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#0F62A5]" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-[#D6D2C9] bg-white px-3.5 py-2 text-xs font-semibold text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    X / Twitter
                  </a>
                </div>
              </div>

              {/* Author Information Box */}
              <div className="mt-10 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {article.authorAvatarUrl ? (
                    <img
                      src={article.authorAvatarUrl}
                      alt={article.authorName}
                      className="h-14 w-14 shrink-0 rounded-full border border-[#E2DFD7] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E2DFD7] bg-white font-display text-sm font-bold text-[#141619]">
                      {article.authorName
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[#0F62A5]">Written by</p>
                    <h2 className="font-display text-lg font-bold text-[#141619]">
                      {article.authorName}
                      {article.authorRole ? (
                        <span className="ml-2 text-sm font-normal text-[#4B515A]">
                          · {article.authorRole}
                        </span>
                      ) : null}
                    </h2>
                    {article.authorBio && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#4B515A]">
                        {article.authorBio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Service Recommendations */}
              <div className="mt-12">
                <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                  Recommended Services
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#141619]">
                  How Insight Marketing Kenya helps you apply this
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {recommendedServices.map((svc) => (
                    <Link
                      key={svc.href}
                      href={svc.href}
                      className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-5 transition-colors hover:border-[#141619]/35"
                    >
                      <div>
                        <div className="font-display text-base font-bold text-[#141619]">
                          {svc.label}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">{svc.note}</p>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0F62A5]">
                        <span>Explore service</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="mt-14 border-t border-[#E2DFD7] pt-10">
                  <h2 className="font-display text-2xl font-bold text-[#141619]">
                    Related Articles
                  </h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.slice(0, 3).map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/blog/${rel.slug}/`}
                        className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-5 transition-colors hover:border-[#141619]/35"
                      >
                        <div>
                          <div className="text-xs text-[#666D77]">
                            {rel.category} · {rel.readingTimeMinutes} min read
                          </div>
                          <div className="mt-2 font-display text-base font-bold text-[#141619]">
                            {rel.title}
                          </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0F62A5]">
                          <span>Read article</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Editorial Sidebar: Desktop TOC + Lead Review */}
            <aside className="space-y-8 lg:col-span-4">
              {headings.length > 0 && (
                <nav
                  aria-label="Table of contents"
                  className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-6 lg:sticky lg:top-24"
                >
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-[#141619]">
                    <List className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                    <span>Table of Contents</span>
                  </div>
                  <ol className="mt-4 space-y-2.5 text-sm text-[#4B515A]">
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pl-4 text-xs' : 'font-medium'}>
                        <a
                          href={`#${h.id}`}
                          className="block leading-snug transition-colors hover:text-[#0F62A5]"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="rounded-xl border border-[#E2DFD7] bg-[#141619] p-6 text-[#F7F6F2]">
                <p className="text-xs font-semibold text-[#F5B700]">Free Growth Review</p>
                <h2 className="mt-2 font-display text-xl font-bold text-white">
                  Want help applying this to your website?
                </h2>
                <p className="mt-2.5 text-xs leading-relaxed text-white/75">
                  Speak directly with Insight Marketing Kenya for an actionable review of your search
                  visibility, ads, and conversion paths.
                </p>
                <div className="mt-5">
                  <GrowthReviewForm compact />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
