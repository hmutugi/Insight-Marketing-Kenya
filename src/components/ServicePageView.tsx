import { useState } from 'react';
import { ArrowRight, ChevronDown, MessageSquare, Check, Phone, BookOpen } from 'lucide-react';
import { ServicePageData } from '../data/servicePages';
import { BreadcrumbItem } from '../data/routes';
import { caseStudies } from '../data/caseStudies';
import { CmsArticle } from '../lib/cms';
import { siteMedia } from '../lib/media';
import { siteConfig } from '../config/site';
import { Link } from '../lib/router';
import { Breadcrumbs } from './Breadcrumbs';
import { MediaFrame } from './MediaFrame';
import { GrowthReviewForm } from './GrowthReviewForm';

export function ServicePageView({
  page,
  breadcrumbs,
  posts = [],
}: {
  page: ServicePageData;
  breadcrumbs: BreadcrumbItem[];
  posts?: CmsArticle[];
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const media = siteMedia[page.visualKey];

  const verifiedStudy = page.verifiedCaseStudySlug
    ? caseStudies.find((study) => study.slug === page.verifiedCaseStudySlug)
    : undefined;

  const relatedArticles = (() => {
    if (!posts || posts.length === 0) return [];
    const wanted = (page.relatedArticleCategories || []).map((c) => c.toLowerCase());
    const catLower = page.category.toLowerCase();
    const matched = posts.filter((post) => {
      const postCat = post.category.toLowerCase();
      const tagMatches = post.tags.some(
        (tag) =>
          wanted.some((w) => tag.name.toLowerCase().includes(w)) ||
          tag.name.toLowerCase().includes(catLower)
      );
      const catMatches =
        wanted.some((w) => postCat.includes(w) || w.includes(postCat)) || postCat.includes(catLower);
      return catMatches || tagMatches;
    });
    const pool = matched.length > 0 ? matched : posts;
    return pool.slice(0, 3);
  })();

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2]">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Breadcrumbs items={breadcrumbs} />

          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                {page.category} · {page.businessOutcomeLabel}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-tight text-[#141619] sm:text-4xl lg:text-[2.75rem]">
                {page.h1}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#4B515A] sm:text-lg">
                {page.introLead}
              </p>

              {page.localCoverageNote && (
                <p className="mt-5 rounded-lg border border-[#E2DFD7] bg-white px-4 py-3 text-sm leading-relaxed text-[#4B515A]">
                  {page.localCoverageNote}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact/"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#F5B700] px-6 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#DFA600]"
                >
                  <span>Get a Free Growth Review</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-[#D6D2C9] bg-white px-5 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#EFEDE7]"
                >
                  <MessageSquare className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <MediaFrame
                src={media.src}
                alt={media.alt}
                aspectClass="aspect-[4/3] lg:aspect-auto lg:h-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clear Business Benefit Explanation (Plain English Before Technical Depth) */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Business Outcome
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
                {page.businessBenefitHeading}
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-8">
              {page.businessBenefitBody.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-[#4B515A]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Common Problems Customers Face */}
      {page.commonProblems && page.commonProblems.length > 0 && (
        <section className="border-t border-[#E2DFD7] bg-[#FAF9F6] py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Challenges We Solve
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
                {page.commonProblemsHeading}
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {page.commonProblems.map((item, idx) => (
                <div
                  key={item.problem}
                  className="rounded-xl border border-[#E2DFD7] bg-white p-6"
                >
                  <div className="font-mono text-xs font-medium text-[#0F62A5]">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-[#141619]">
                    {item.problem}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">{item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Optional Comparison Table (e.g., Organic Search vs Paid Advertising) */}
      {page.comparisonSection && (
        <section className="border-t border-[#E2DFD7] bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Channel Comparison
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
                {page.comparisonSection.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#4B515A]">
                {page.comparisonSection.intro}
              </p>
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-[#E2DFD7]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2DFD7] bg-[#F7F6F2]">
                    <th className="px-6 py-4 font-display font-bold text-[#141619]">Factor</th>
                    <th className="px-6 py-4 font-display font-bold text-[#141619]">
                      {page.comparisonSection.primaryHeader}
                    </th>
                    <th className="px-6 py-4 font-display font-bold text-[#141619]">
                      {page.comparisonSection.secondaryHeader}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DFD7] bg-white">
                  {page.comparisonSection.rows.map((row) => (
                    <tr key={row.topic}>
                      <td className="px-6 py-4 font-semibold text-[#141619]">{row.topic}</td>
                      <td className="px-6 py-4 leading-relaxed text-[#4B515A]">
                        {row.primaryColumn}
                      </td>
                      <td className="px-6 py-4 leading-relaxed text-[#4B515A]">
                        {row.secondaryColumn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. Service Breakdown & Deliverables */}
      <section className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
              Service Breakdown
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
              {page.deliverablesHeading}
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {page.deliverables.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#E2DFD7] bg-white p-7"
              >
                <h3 className="font-display text-lg font-bold text-[#141619]">{item.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#141619]">
                  {item.businessOutcome}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">
                  {item.technicalDetail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Technical Depth Section (Deeper Down the Page) */}
      {page.technicalDepthHeading &&
        page.technicalDepthPoints &&
        page.technicalDepthPoints.length > 0 && (
          <section className="border-t border-[#E2DFD7] bg-white py-14 sm:py-20">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                  Technical Execution
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
                  {page.technicalDepthHeading}
                </h2>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {page.technicalDepthPoints.map((point) => (
                  <div
                    key={point.topic}
                    className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-6"
                  >
                    <h3 className="font-display text-base font-bold text-[#141619]">
                      {point.topic}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">
                      {point.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* 7. Optional Transparent Pricing Factor Tiers */}
      {page.pricingTiers && page.pricingTiers.length > 0 && (
        <section className="border-t border-[#E2DFD7] bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Engagement Options
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619] sm:text-3xl">
                Typical Scope Tiers &amp; Pricing Structure
              </h2>
              {page.pricingNote && (
                <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">{page.pricingNote}</p>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {page.pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#141619]">{tier.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">{tier.suitedFor}</p>
                    <div className="mt-5 rounded-lg border border-[#E2DFD7] bg-white px-3.5 py-2.5 font-mono text-xs text-[#141619]">
                      {tier.pricePlaceholder}
                    </div>
                    <ul className="mt-6 space-y-3 text-sm text-[#4B515A]">
                      {tier.scopeHighlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#0F62A5]"
                            aria-hidden="true"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 border-t border-[#E2DFD7] pt-5">
                    <Link
                      href="/contact/"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-[#141619] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2E34]"
                    >
                      Request tailored quote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Our Approach & Step-by-Step Process */}
      <section className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Our Approach</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619]">
                {page.howItConnectsHeading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#4B515A]">
                {page.howItConnectsBody}
              </p>
            </div>

            <div className="lg:col-span-7">
              <h3 className="font-display text-lg font-bold text-[#141619]">
                How we work step by step
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {page.processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-xl border border-[#E2DFD7] bg-white p-5"
                  >
                    <div className="font-mono text-xs font-medium text-[#0F62A5]">{step.step}</div>
                    <h4 className="mt-2 font-display text-base font-bold text-[#141619]">
                      {step.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#4B515A]">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Related Verified Case Study & Related Insights */}
      {(verifiedStudy || relatedArticles.length > 0) && (
        <section className="border-t border-[#E2DFD7] bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {verifiedStudy && (
                <div className={relatedArticles.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'}>
                  <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                    Verified Project Work
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619]">
                    Related Kenyan Case Study
                  </h2>
                  <div className="mt-6 overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6]">
                    <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E2DFD7] bg-white">
                      <img
                        src={verifiedStudy.imageSrc}
                        alt={verifiedStudy.imageAlt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-medium text-[#4B515A]">
                        {verifiedStudy.industry} · {verifiedStudy.mainService}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-bold text-[#141619]">
                        {verifiedStudy.projectName}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">
                        {verifiedStudy.summary}
                      </p>
                      <Link
                        href={`/case-studies/${verifiedStudy.slug}/`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F62A5] hover:underline"
                      >
                        <span>Read project case study</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className={verifiedStudy ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                    Plain-English Guides
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619]">
                    Related Insights &amp; Reading
                  </h2>
                  <div className="mt-6 space-y-4">
                    {relatedArticles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/blog/${article.slug}/`}
                        className="flex flex-col gap-4 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-5 transition-colors hover:border-[#141619]/35 sm:flex-row sm:items-center"
                      >
                        <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-[#E2DFD7] bg-white sm:w-36">
                          <img
                            src={article.featuredImageUrl}
                            alt={article.featuredImageAlt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-[#0F62A5]">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {article.category} · {article.readingTimeMinutes} min read
                            </span>
                          </p>
                          <h3 className="mt-1.5 font-display text-base font-bold text-[#141619]">
                            {article.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4B515A]">
                            {article.excerpt}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 10. Frequently Asked Questions */}
      {page.faqs.length > 0 && (
        <section className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">FAQs</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619]">
                  Common Questions
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                  Straight answers on timelines, deliverables, and how this fits your business in
                  Kenya.
                </p>
              </div>
              <div className="space-y-3 lg:col-span-8">
                {page.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-xl border border-[#E2DFD7] bg-white"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                      >
                        <span className="font-display text-base font-semibold text-[#141619]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#4B515A] transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#E2DFD7] px-6 py-4 text-sm leading-relaxed text-[#4B515A]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 11. Internal Links to Specialist & Related Services */}
      {page.relatedLinks.length > 0 && (
        <section className="border-t border-[#E2DFD7] bg-white py-14">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold text-[#141619]">
              Related Services &amp; Specialist Pages
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-5 transition-colors hover:border-[#141619]/35"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-[#141619]">
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-[#666D77]" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">{link.note}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. Bottom Conversion CTA */}
      <section className="border-t border-[#E2DFD7] bg-[#141619] py-16 text-[#F7F6F2]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-wide text-[#F5B700]">
                Free Growth Review
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
                Let’s review your current setup
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">
                Request a Free Growth Review for {page.category.toLowerCase()} and receive a
                practical assessment tailored to your business goals in Kenya.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={siteConfig.contact.phoneHref}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  <Phone className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                  <span>{siteConfig.contact.phoneDisplay}</span>
                </a>
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  <MessageSquare className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <GrowthReviewForm defaultService={page.category} compact />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
