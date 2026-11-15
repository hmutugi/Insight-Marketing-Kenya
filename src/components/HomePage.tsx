import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Check,
} from 'lucide-react';
import { siteConfig } from '../config/site';
import { caseStudies } from '../data/caseStudies';
import { CmsArticle } from '../lib/cms';
import { Link } from '../lib/router';
import { MediaFrame } from './MediaFrame';
import { GrowthReviewForm } from './GrowthReviewForm';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

type HeroLayerKey = 'seo' | 'ads' | 'web';

const HERO_LAYERS: {
  key: HeroLayerKey;
  index: string;
  label: string;
  headline: string;
  summary: string;
  signals: string[];
  outcome: string;
}[] = [
  {
    key: 'seo',
    index: '01',
    label: 'SEO, AEO & AI Search',
    headline: 'Be found on Google Search and AI recommendations',
    summary:
      'Strong foundation SEO and content clusters help you rank on Google while giving Google AI Overviews, ChatGPT, Gemini, Claude, and Voice Search clear answers to cite.',
    signals: [
      'Google Search & content clusters',
      'Google AI Overviews & Voice',
      'ChatGPT, Gemini & Claude signals',
    ],
    outcome: 'Lasting organic discovery across traditional search and AI answers',
  },
  {
    key: 'ads',
    index: '02',
    label: 'Paid Advertising',
    headline: 'Capture ready-to-buy demand on Google & Meta',
    summary:
      'Structured Google Search and Facebook/Instagram campaigns target real buyer intent and direct prospects straight to tailored pages or WhatsApp.',
    signals: ['Commercial keyword filtering', 'Facebook & Instagram lead flows', 'Conversion tracking setup'],
    outcome: 'Immediate visibility paired with disciplined spend control',
  },
  {
    key: 'web',
    index: '03',
    label: 'Website Design & Development',
    headline: 'Turn visitors into phone calls and enquiries',
    summary:
      'A fast, credible website explains what you sell in plain language and makes contacting your team effortless on mobile and desktop.',
    signals: ['Plain-English offer clarity', 'Mobile-first layout & speed', 'Form, Call & WhatsApp actions'],
    outcome: 'More visitors becoming genuine sales conversations',
  },
];

const CHALLENGES = [
  {
    problem: 'Customers cannot find your business on Google',
    explanation:
      'Prospects search for your exact products or services every day, yet competitors show up ahead of you because key pages are missing or poorly structured.',
    solution:
      'We build clear service pages and fix technical search barriers so Google connects local and national buyers directly to you.',
    href: '/seo-services-kenya/',
    actionLabel: 'See SEO Services',
  },
  {
    problem: 'Advertising campaigns generate clicks but few enquiries',
    explanation:
      'Broad keyword settings or boosted social posts attract curiosity clicks from outside your target buyer group without tracking real enquiries.',
    solution:
      'We tighten Google and Meta campaign targeting, filter wasteful clicks, and align every ad with a clear conversion page or WhatsApp flow.',
    href: '/paid-advertising-kenya/',
    actionLabel: 'See Paid Advertising',
  },
  {
    problem: 'Your website looks outdated or fails to convert',
    explanation:
      'Slow templates, cluttered navigation, and vague headlines undermine buyer trust within seconds—especially on mobile networks in Kenya.',
    solution:
      'We design and develop fast, credible websites that explain your value clearly and guide visitors to enquire.',
    href: '/web-design-kenya/',
    actionLabel: 'See Web Design',
  },
  {
    problem: 'Heavy reliance on social media alone for visibility',
    explanation:
      'Social feeds move fast and algorithm changes can drop reach overnight. Without a strong search-ready website, you rent attention instead of owning it.',
    solution:
      'We pair social demand with an owned website and search presence that keeps working consistently.',
    href: '/local-seo-kenya/',
    actionLabel: 'Build Lasting Visibility',
  },
  {
    problem: 'Your website gets traffic but not enough business',
    explanation:
      'Visitors arrive and read, then leave because the next step feels unclear, forms are buried, or key buyer questions go unanswered.',
    solution:
      'We restructure calls to action, clarify pricing and scope factors, and surface direct contact, call, and WhatsApp options cleanly.',
    href: '/on-page-seo/',
    actionLabel: 'Improve Page Conversion',
  },
];

const WHY_INSIGHT = [
  {
    title: '01. Practical business-focused strategies',
    detail:
      'Every recommendation starts with your commercial objectives—qualified enquiries, quote requests, or online orders—never vanity metrics.',
  },
  {
    title: '02. SEO-conscious website development',
    detail:
      'Search structure, page speed, clean URLs, and mobile usability are engineered into your site from the start rather than patched on later.',
  },
  {
    title: '03. Clear communication',
    detail:
      'We explain what we are doing and why it matters in plain Kenyan business English instead of hiding behind technical acronyms.',
  },
  {
    title: '04. Transparent reporting',
    detail:
      'You see honest progress across Search Console visibility, ad spend, and real enquiries—without inflated claims or invented figures.',
  },
  {
    title: '05. Founder-led attention & accountability',
    detail:
      'Your account is not handed off to anonymous juniors. You work directly with an accountable specialist invested in your growth.',
  },
  {
    title: '06. Aligned with your budget & stage',
    detail:
      'Whether you need a focused website rebuild, targeted Google Ads, or phased SEO, we recommend what fits your current stage and budget.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    name: 'Discover',
    summary: 'Understand the business and objectives.',
    detail:
      'We review your current website, services, target Kenyan customer segments, and where enquiries currently stall.',
  },
  {
    step: '02',
    name: 'Plan',
    summary: 'Research the market and identify opportunities.',
    detail:
      'We map real search demand, competitor positioning, ad intent gaps, and website conversion fixes into a clear roadmap.',
  },
  {
    step: '03',
    name: 'Execute',
    summary: 'Implement the strategy and campaigns.',
    detail:
      'We build or refine your website pages, launch structured Google and Meta campaigns, and set up reliable enquiry tracking.',
  },
  {
    step: '04',
    name: 'Improve',
    summary: 'Monitor results and make ongoing improvements.',
    detail:
      'We review search performance, ad lead quality, and visitor behaviour monthly to sharpen returns steadily.',
  },
];

export function HomePage({ posts }: { posts: CmsArticle[] }) {
  const [activeLayer, setActiveLayer] = useState<HeroLayerKey>('seo');
  const currentLayer = HERO_LAYERS.find((l) => l.key === activeLayer) || HERO_LAYERS[0];
  const featuredProjects = caseStudies.slice(0, 4);
  const recentPosts = posts.slice(0, 3);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2]">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy Column */}
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Digital Marketing &amp; Web Development · Kenya
              </p>

              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#141619] sm:text-5xl lg:text-[3.4rem]">
                Get found. Attract customers. Grow your business.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4B515A] sm:text-lg">
                Insight Marketing helps Kenyan businesses grow through SEO, Google and Meta
                advertising, and high-performing websites. We bring strategy, technology and
                marketing together to turn online visibility into real business opportunities.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact/"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#F5B700] px-6 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#DFA600]"
                >
                  <span>Get a Free Growth Review</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <a
                  href="#services"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#D6D2C9] bg-white px-5 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#EFEDE7]"
                >
                  <span>Explore Our Services</span>
                </a>
              </div>
            </div>

            {/* Right Interactive CSS Architectural System Visual */}
            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-[#D6D2C9] bg-white">
                {/* Browser Frame Header */}
                <div className="flex items-center justify-between border-b border-[#E2DFD7] bg-[#FAF9F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#4B515A]">
                    <Globe className="h-3.5 w-3.5 text-[#0F62A5]" aria-hidden="true" />
                    <span className="font-mono">insightmarketing.co.ke</span>
                  </div>
                  <span className="text-xs font-medium text-[#666D77]">
                    Connected Growth System
                  </span>
                </div>

                {/* Interactive 3-Pillar Switcher */}
                <div className="border-b border-[#E2DFD7] bg-[#F7F6F2] p-2">
                  <div
                    role="tablist"
                    aria-label="Connected digital growth capabilities"
                    className="grid grid-cols-1 gap-1.5 sm:grid-cols-3"
                  >
                    {HERO_LAYERS.map((layer) => {
                      const isSelected = layer.key === activeLayer;
                      const Icon =
                        layer.key === 'seo'
                          ? Search
                          : layer.key === 'ads'
                          ? Megaphone
                          : Globe;
                      return (
                        <button
                          key={layer.key}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setActiveLayer(layer.key)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#141619] text-white'
                              : 'bg-white text-[#4B515A] hover:text-[#141619]'
                          }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? 'text-[#F5B700]' : 'text-[#0F62A5]'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">{layer.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Capability Architecture Preview */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between text-xs font-medium text-[#666D77]">
                    <span>Layer {currentLayer.index}</span>
                    <span>{currentLayer.label}</span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold text-[#141619]">
                    {currentLayer.headline}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">
                    {currentLayer.summary}
                  </p>

                  {/* Structural Mockup Cards */}
                  <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {currentLayer.signals.map((sig) => (
                      <div
                        key={sig}
                        className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] px-3 py-2.5 text-xs font-medium text-[#141619]"
                      >
                        {sig}
                      </div>
                    ))}
                  </div>

                  {/* Conversion Flow Footer */}
                  <div className="mt-6 flex flex-col justify-between gap-3 rounded-lg border border-[#E2DFD7] bg-[#141619] px-4 py-3.5 text-white sm:flex-row sm:items-center">
                    <div>
                      <div className="text-[11px] font-medium text-[#F5B700]">
                        Commercial Outcome
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        {currentLayer.outcome}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-white/75">
                      <span>Form</span>
                      <span aria-hidden="true">·</span>
                      <span>Call</span>
                      <span aria-hidden="true">·</span>
                      <span>WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Trust & Verified Project Strip */}
          <div className="mt-12 border-t border-[#E2DFD7] pt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-xs font-semibold tracking-wide text-[#4B515A]">
                Recent Websites &amp; Search Projects Built for Kenyan &amp; Regional Organisations
              </p>
              <Link
                href="/case-studies/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141619] hover:text-[#0F62A5]"
              >
                <span>View all projects</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {caseStudies.map((project) => (
                <Link
                  key={project.slug}
                  href={`/case-studies/${project.slug}/`}
                  className="group rounded-lg border border-[#E2DFD7] bg-white px-4 py-3 transition-colors hover:border-[#141619]/40"
                >
                  <div className="font-display text-sm font-bold text-[#141619] group-hover:text-[#0F62A5]">
                    {project.projectName}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-[#666D77]">{project.industry}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Business Challenges Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
              Why Businesses Reach Out
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
              Common digital roadblocks holding Kenyan businesses back
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#4B515A]">
              Most companies do not lack effort—their website, search visibility, and advertising
              are simply disconnected. Here is how we fix each bottleneck.
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#E2DFD7] border-y border-[#E2DFD7]">
            {CHALLENGES.map((item, idx) => (
              <div
                key={item.problem}
                className="grid grid-cols-1 gap-6 py-7 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-5">
                  <div className="text-xs font-mono text-[#666D77]">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#141619]">
                    {item.problem}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4B515A]">
                    {item.explanation}
                  </p>
                </div>

                <div className="lg:col-span-5">
                  <div className="text-xs font-semibold text-[#0F62A5]">How we address it</div>
                  <p className="mt-1 text-sm leading-relaxed text-[#141619]">{item.solution}</p>
                </div>

                <div className="lg:col-span-2 lg:text-right">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Services Section (3 Prominent Service Cards) */}
      <section id="services" className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 border-b border-[#E2DFD7] pb-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Core Services</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
                Three integrated pillars built to win customers online
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#4B515A]">
              Engage one pillar on its own or combine all three for a complete customer acquisition
              engine across Kenya.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Card 1: SEO */}
            <article className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-white p-8 transition-colors hover:border-[#141619]/35">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-[#666D77]">01</span>
                  <Search className="h-5 w-5 text-[#0F62A5]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#141619]">
                  SEO, AEO &amp; AI Search Visibility
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                  Appear when Kenyan buyers search Google, ask voice assistants, or read instant AI
                  summaries—combining solid foundation SEO and content clusters with Answer and
                  Generative Engine Optimisation (AEO &amp; GEO).
                </p>
                <ul className="mt-5 space-y-2 border-t border-[#E2DFD7] pt-5 text-xs text-[#4B515A]">
                  <li>
                    <Link
                      href="/ai-search-aeo-geo-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      AI Search, AEO &amp; GEO (ChatGPT, Gemini &amp; AI Overviews)
                    </Link>
                  </li>
                  <li>
                    <Link href="/local-seo-kenya/" className="hover:text-[#141619] hover:underline">
                      Local SEO &amp; Google Maps visibility
                    </Link>
                  </li>
                  <li>
                    <Link href="/technical-seo/" className="hover:text-[#141619] hover:underline">
                      Technical SEO, Content Clusters &amp; Voice readiness
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-7 border-t border-[#E2DFD7] pt-5">
                <Link
                  href="/seo-services-kenya/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                >
                  <span>Explore SEO Services</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>

            {/* Card 2: Google & Meta Ads */}
            <article className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-white p-8 transition-colors hover:border-[#141619]/35">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-[#666D77]">02</span>
                  <Megaphone className="h-5 w-5 text-[#0F62A5]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#141619]">
                  Google and Meta Ads
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                  Reach high-intent buyers on Google Search and targeted Kenyan audiences on Facebook
                  and Instagram—with disciplined budget control, clear creative, and tracking tied
                  to real enquiries.
                </p>
                <ul className="mt-5 space-y-2 border-t border-[#E2DFD7] pt-5 text-xs text-[#4B515A]">
                  <li>
                    <Link
                      href="/google-ads-management-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      Google Ads Search &amp; intent targeting
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/meta-ads-management-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      Meta Ads (Facebook &amp; Instagram leads)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/paid-advertising-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      Landing page &amp; WhatsApp conversion tracking
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-7 border-t border-[#E2DFD7] pt-5">
                <Link
                  href="/paid-advertising-kenya/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                >
                  <span>Explore Paid Advertising</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>

            {/* Card 3: Website Design & Development */}
            <article className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-white p-8 transition-colors hover:border-[#141619]/35">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-[#666D77]">03</span>
                  <Globe className="h-5 w-5 text-[#0F62A5]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#141619]">
                  Website Design and Development
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                  Establish immediate credibility with a professionally built, mobile-fast website
                  that explains your offer clearly, ranks cleanly in search, and turns visitors into
                  enquiries and sales.
                </p>
                <ul className="mt-5 space-y-2 border-t border-[#E2DFD7] pt-5 text-xs text-[#4B515A]">
                  <li>
                    <Link href="/web-design-kenya/" className="hover:text-[#141619] hover:underline">
                      Custom business &amp; e-commerce websites
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/website-maintenance-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      Website Maintenance &amp; Speed Optimisation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/website-design-cost-kenya/"
                      className="hover:text-[#141619] hover:underline"
                    >
                      Website Design Cost Guide in Kenya
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-7 border-t border-[#E2DFD7] pt-5">
                <Link
                  href="/web-design-kenya/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                >
                  <span>Explore Web Design</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>

          {/* Search Evolution Strip: Foundation SEO + AEO / GEO */}
          <div className="mt-10 rounded-xl border border-[#E2DFD7] bg-white p-7 sm:p-9">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E2DFD7] pb-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                  Modern Search Visibility · SEO, AEO &amp; GEO
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141619]">
                  How foundation Google SEO powers AI search and recommendation engines
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">
                  Customers no longer only click blue links—they also read instant summaries and ask
                  AI assistants for recommendations. AEO and GEO work best on top of solid
                  foundation SEO, organised content clusters, and verified business credibility.
                </p>
              </div>
              <Link
                href="/ai-search-aeo-geo-kenya/"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
              >
                <span>Explore AI Search, AEO &amp; GEO</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-5">
                <div className="text-xs font-semibold text-[#0F62A5]">Google Search</div>
                <h4 className="mt-1.5 font-display text-base font-bold text-[#141619]">
                  Rank with SEO &amp; content clusters
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">
                  Connect clear service pages with supporting buyer guides so Google sees genuine
                  depth across your core offerings.
                </p>
              </div>

              <div className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-5">
                <div className="text-xs font-semibold text-[#0F62A5]">Google AI Overviews</div>
                <h4 className="mt-1.5 font-display text-base font-bold text-[#141619]">
                  Appear in instant summaries
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">
                  Provide concise, direct answers backed by clean headings and structured data so
                  search summaries reference your site.
                </p>
              </div>

              <div className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-5">
                <div className="text-xs font-semibold text-[#0F62A5]">
                  ChatGPT, Gemini &amp; Claude
                </div>
                <h4 className="mt-1.5 font-display text-base font-bold text-[#141619]">
                  Get cited in generative AI answers
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">
                  Align plain-English service positioning, crawlable pages, and trusted external
                  citations so AI assistants recommend you accurately.
                </p>
              </div>

              <div className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-5">
                <div className="text-xs font-semibold text-[#0F62A5]">Voice Search</div>
                <h4 className="mt-1.5 font-display text-base font-bold text-[#141619]">
                  Optimise for spoken answers
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#4B515A]">
                  Structure natural question-and-answer sections matching how Kenyan buyers speak
                  questions into mobile devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Case Studies Showcase (Verified Projects & Screenshots) */}
      <section className="border-t border-[#E2DFD7] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E2DFD7] pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Case Studies</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619]">
                Selected websites and search projects
              </h2>
            </div>
            <Link
              href="/case-studies/"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
            >
              <span>View all case studies</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <article
                key={project.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] transition-colors hover:border-[#141619]/35"
              >
                <div>
                  <Link href={`/case-studies/${project.slug}/`} className="block overflow-hidden">
                    <img
                      src={project.imageSrc}
                      alt={project.imageAlt}
                      loading="lazy"
                      className="aspect-[16/11] w-full border-b border-[#E2DFD7] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </Link>

                  <div className="p-7">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#666D77]">
                      <span>{project.industry}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.mainService}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.year}</span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold text-[#141619]">
                      <Link
                        href={`/case-studies/${project.slug}/`}
                        className="hover:text-[#0F62A5]"
                      >
                        {project.projectName} ({project.domain})
                      </Link>
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">
                      {project.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E2DFD7] px-7 py-4">
                  <Link
                    href={`/case-studies/${project.slug}/`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                  >
                    <span>View case study</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#4B515A] hover:text-[#141619]"
                  >
                    <span>Live site</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Insight Marketing */}
      <section className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                Why Insight Marketing
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619]">
                Accountable digital growth without agency fluff
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#4B515A]">
                We build long-term partnerships with Kenyan business owners and marketing teams who
                value plain answers, technical care, and measurable commercial priorities.
              </p>
              <div className="mt-6">
                <Link
                  href="/about/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] underline decoration-[#F5B700] decoration-2 underline-offset-4 hover:text-[#0F62A5]"
                >
                  <span>About Insight Marketing Kenya</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-8">
              {WHY_INSIGHT.map((point) => (
                <div
                  key={point.title}
                  className="rounded-xl border border-[#E2DFD7] bg-white p-6"
                >
                  <div className="flex items-start gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#0F62A5]" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-base font-bold text-[#141619]">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">{point.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. How We Work (4-Step Process) */}
      <section className="border-t border-[#E2DFD7] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">How We Work</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619]">
              A straightforward four-step process
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-6"
              >
                <div className="font-mono text-xs font-semibold text-[#0F62A5]">{item.step}</div>
                <h3 className="mt-3 font-display text-xl font-bold text-[#141619]">{item.name}</h3>
                <p className="mt-1.5 text-sm font-medium text-[#141619]">{item.summary}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Insights Section (Blog with Featured Images) */}
      <section className="border-t border-[#E2DFD7] bg-[#F7F6F2] py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E2DFD7] pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Insights</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141619]">
                Latest guides on search, websites, and online growth
              </h2>
            </div>
            <Link
              href="/blog/"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
            >
              <span>Browse all articles</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="mt-10 rounded-xl border border-[#E2DFD7] bg-white p-8 text-center">
              <p className="text-base font-medium text-[#141619]">
                New digital growth guides are published here from our editorial CMS.
              </p>
              <p className="mt-2 text-sm text-[#4B515A]">
                Visit the Insights page or explore our core SEO, advertising, and web design
                services.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#E2DFD7] bg-white"
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
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      </div>
                      <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-[#141619]">
                        <Link href={`/blog/${post.slug}/`} className="hover:text-[#0F62A5]">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#4B515A]">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#E2DFD7] px-6 py-4">
                    <Link
                      href={`/blog/${post.slug}/`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9. Final CTA & Direct Enquiry */}
      <section className="border-t border-[#E2DFD7] bg-[#141619] py-16 text-[#F7F6F2] sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-wide text-[#F5B700]">
                Start the Conversation
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to grow your business online?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                Let’s identify what’s holding your digital presence back and where the biggest
                opportunities lie.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact/"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-[#F5B700] px-6 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#DFA600]"
                >
                  <span>Talk to Insight Marketing</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-8 space-y-3 border-t border-white/15 pt-7">
                <a
                  href={siteConfig.contact.phoneHref}
                  className="flex items-center gap-3 text-sm font-semibold text-white hover:text-[#F5B700]"
                >
                  <Phone className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                  <span>Call {siteConfig.contact.phoneDisplay}</span>
                </a>
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm font-semibold text-white hover:text-[#F5B700]"
                >
                  <MessageSquare className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <GrowthReviewForm compact />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
