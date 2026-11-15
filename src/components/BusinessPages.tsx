import { ArrowRight, ArrowUpRight, Phone, Mail, MessageSquare, MapPin } from 'lucide-react';
import { siteConfig } from '../config/site';
import { siteMedia } from '../lib/media';
import { caseStudies, CaseStudyRecord } from '../data/caseStudies';
import { BreadcrumbItem } from '../data/routes';
import { Link } from '../lib/router';
import { Breadcrumbs } from './Breadcrumbs';
import { MediaFrame } from './MediaFrame';
import { GrowthReviewForm } from './GrowthReviewForm';
export { BlogListView, BlogDetailView } from './BlogViews';

export function AboutPageView({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">
                About Insight Marketing Kenya
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl lg:text-5xl">
                A practical digital growth partner for businesses across Kenya
              </h1>
              <p className="mt-5 text-base leading-relaxed text-[#4B515A] sm:text-lg">
                Insight Marketing Kenya works with founders, SMEs, retailers, and established
                organisations that want digital marketing grounded in real commercial results—not
                vanity metrics or confusing jargon.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#4B515A]">
                Too often, businesses hire one supplier for a website, another for social ads, and
                nobody owns how everything converts into enquiries. We bring Search Engine
                Optimisation, Google Ads, Meta Ads, and high-performing web development together into
                one coherent system.
              </p>
            </div>
            <div className="lg:col-span-5">
              <MediaFrame
                src={siteMedia.webCraft.src}
                alt={siteMedia.webCraft.alt}
                aspectClass="aspect-[4/3] lg:aspect-auto lg:h-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-[#141619] sm:text-3xl">
            Principles that guide our work
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7">
              <h3 className="font-display text-lg font-bold text-[#141619]">
                01. Clarity Before Complexity
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                We explain every recommendation in straightforward business English before touching
                technical implementation.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7">
              <h3 className="font-display text-lg font-bold text-[#141619]">
                02. Honest Expectations
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                We never promise overnight #1 Google rankings or fabricate statistics. We commit to
                disciplined execution and transparent measurement.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7">
              <h3 className="font-display text-lg font-bold text-[#141619]">
                03. You Own Your Assets
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">
                Your domain, website code, Google Ads account, Meta Business Manager, and analytics
                stay registered cleanly in your company name.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/contact/"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-[#F5B700] px-6 py-3 text-sm font-semibold text-[#141619] hover:bg-[#DFA600]"
            >
              <span>Get a Free Growth Review</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/case-studies/"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-[#D6D2C9] px-5 py-3 text-sm font-semibold text-[#141619] hover:bg-[#F7F6F2]"
            >
              <span>Explore Case Studies</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CaseStudiesListView({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Case Studies</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
            How we structure websites, search, and ads for real commercial outcomes
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B515A]">
            Below are our project methodology case foundations. Where client-specific outcome
            figures are awaiting sign-off, editable placeholders are clearly marked rather than
            estimated or invented.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <article
                key={study.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#FAF9F6]"
              >
                <div>
                  <Link href={`/case-studies/${study.slug}/`} className="block overflow-hidden">
                    <img
                      src={study.imageSrc}
                      alt={study.imageAlt}
                      loading="lazy"
                      className="aspect-[16/11] w-full border-b border-[#E2DFD7] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="p-7">
                    <div className="text-xs text-[#666D77]">
                      {study.industry} · {study.mainService} · {study.year}
                    </div>
                    <h2 className="mt-3 font-display text-xl font-bold text-[#141619]">
                      <Link href={`/case-studies/${study.slug}/`} className="hover:text-[#0F62A5]">
                        {study.projectName} ({study.domain})
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#4B515A]">{study.summary}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#E2DFD7] px-7 py-4">
                  <Link
                    href={`/case-studies/${study.slug}/`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                  >
                    <span>View case study</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={study.liveUrl}
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
    </div>
  );
}

export function CaseStudyDetailView({
  study,
  breadcrumbs,
}: {
  study: CaseStudyRecord;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="text-xs font-medium text-[#4B515A]">
                {study.industry} · {study.mainService} · {study.year}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
                {study.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B515A]">
                {study.summary}
              </p>
              <div className="mt-6">
                <a
                  href={study.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D6D2C9] bg-white px-4 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#EFEDE7]"
                >
                  <span>Visit {study.domain}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <MediaFrame
                src={study.imageSrc}
                alt={study.imageAlt}
                aspectClass="aspect-[16/11]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-7">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#141619]">The Challenge</h2>
                <p className="mt-3 text-base leading-relaxed text-[#4B515A]">
                  {study.challenge}
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-[#141619]">Our Approach</h2>
                <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#4B515A]">
                  {study.approach.map((step, i) => (
                    <li key={i} className="rounded-lg border border-[#E2DFD7] bg-[#FAF9F6] p-4">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-[#141619]">
                  Key Deliverables
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-[#4B515A]">
                  {study.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-6">
                <h2 className="font-display text-lg font-bold text-[#141619]">
                  Outcome &amp; Verification Slots
                </h2>
                <p className="mt-1.5 text-xs text-[#666D77]">
                  Strictly verified metrics only—placeholders remain clearly labelled until approved.
                </p>
                <div className="mt-5 space-y-4">
                  {study.outcomeNotes.map((note) => (
                    <div
                      key={note.label}
                      className="rounded-lg border border-[#E2DFD7] bg-white p-4"
                    >
                      <div className="text-xs font-semibold text-[#4B515A]">{note.label}</div>
                      <div className="mt-1 text-sm font-medium text-[#141619]">{note.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <GrowthReviewForm compact />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AreasWeServeView({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const regions = [
    {
      name: 'Nairobi Metropolitan',
      towns: 'Westlands, Kilimani, Upper Hill, CBD, Karen, Industrial Area, Ruiru, Thika & Kitengela',
      note: 'Dedicated remote & scheduled consultation support for businesses competing in Kenya’s capital.',
      href: '/seo-services-nairobi/',
    },
    {
      name: 'Coast Region',
      towns: 'Mombasa, Nyali, Diani, Malindi & Kilifi',
      note: 'Search, hospitality, logistics, and service-business lead generation across coastal hubs.',
      href: '/local-seo-kenya/',
    },
    {
      name: 'Rift Valley & Western Kenya',
      towns: 'Nakuru, Eldoret, Kisumu, Naivasha & Kericho',
      note: 'Helping regional clinics, wholesalers, agribusinesses, and schools capture local demand.',
      href: '/seo-services-kenya/',
    },
    {
      name: 'Central & Mount Kenya',
      towns: 'Kiambu, Nyeri, Meru, Nanyuki & Embu',
      note: 'Practical websites and search visibility built for growing regional enterprises.',
      href: '/web-design-kenya/',
    },
  ];

  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Areas We Serve</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
            Serving ambitious businesses across Nairobi and Kenya
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B515A]">
            We support businesses nationwide through structured online collaboration, local search
            research tailored to each county, and responsive phone or WhatsApp communication.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {regions.map((region) => (
              <div
                key={region.name}
                className="flex flex-col justify-between rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F62A5]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Service Coverage</span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold text-[#141619]">
                    {region.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#141619]">{region.towns}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">{region.note}</p>
                </div>
                <div className="mt-6 border-t border-[#E2DFD7] pt-4">
                  <Link
                    href={region.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#141619] hover:text-[#0F62A5]"
                  >
                    <span>View relevant services</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ContactPageView({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs font-semibold tracking-wide text-[#0F62A5]">Contact Us</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
            Request a Free Growth Review for your business
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B515A]">
            Whether you need stronger Google rankings, tighter Google or Meta ad performance, or a
            faster website that turns clicks into enquiries, get in touch using the channel that
            suits you best.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] p-7">
                <h2 className="font-display text-xl font-bold text-[#141619]">Direct Channels</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">
                  {siteConfig.contact.serviceCoverage}. {siteConfig.contact.workingHours}.
                </p>

                <div className="mt-6 space-y-4">
                  <a
                    href={siteConfig.contact.phoneHref}
                    className="flex items-center gap-3 rounded-lg border border-[#E2DFD7] bg-white px-4 py-3.5 text-sm font-semibold text-[#141619] hover:border-[#141619]/35"
                  >
                    <Phone className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                    <span>Call {siteConfig.contact.phoneDisplay}</span>
                  </a>

                  <a
                    href={siteConfig.contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-[#E2DFD7] bg-white px-4 py-3.5 text-sm font-semibold text-[#141619] hover:border-[#141619]/35"
                  >
                    <MessageSquare className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                    <span>Message on WhatsApp</span>
                  </a>

                  <a
                    href={siteConfig.contact.emailHref}
                    className="flex items-center gap-3 rounded-lg border border-[#E2DFD7] bg-white px-4 py-3.5 text-sm font-semibold text-[#141619] hover:border-[#141619]/35"
                  >
                    <Mail className="h-4 w-4 text-[#0F62A5]" aria-hidden="true" />
                    <span>{siteConfig.contact.email}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <GrowthReviewForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PrivacyPolicyView({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <div>
      <section className="border-b border-[#E2DFD7] bg-[#F7F6F2] py-12 sm:py-16">
        <div className="mx-auto max-w-[820px] px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#141619] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[#4B515A]">
            Last updated: 2026 · {siteConfig.legalName} ({siteConfig.domain})
          </p>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[820px] space-y-6 px-4 text-base leading-relaxed text-[#4B515A] sm:px-6">
          <div>
            <h2 className="font-display text-xl font-bold text-[#141619]">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              When you submit a Growth Review or contact enquiry on this website, we collect the
              details you provide—such as your name, business name, email address, phone or
              WhatsApp number, website URL, and enquiry notes.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#141619]">
              2. How We Use Your Information
            </h2>
            <p className="mt-2">
              We use submitted information strictly to review your request, prepare relevant digital
              marketing or web development recommendations, and communicate with you regarding your
              enquiry. We do not sell or rent client contact details to third parties.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#141619]">
              3. Data Protection &amp; Retention
            </h2>
            <p className="mt-2">
              We handle personal and business enquiry data in line with applicable Kenyan data
              protection standards, retaining records only as long as necessary to respond to your
              enquiry or manage an active client engagement.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#141619]">
              4. Your Rights &amp; Contact
            </h2>
            <p className="mt-2">
              You may request access to, correction of, or deletion of your enquiry details at any
              time by emailing{' '}
              <a
                href={siteConfig.contact.emailHref}
                className="font-semibold text-[#141619] underline"
              >
                {siteConfig.contact.email}
              </a>{' '}
              or calling {siteConfig.contact.phoneDisplay}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function NotFoundView() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold text-[#0F62A5]">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#141619] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-base text-[#4B515A]">
        The page you requested may have moved or does not exist. Explore our core services or return
        to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[#F5B700] px-5 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#DFA600]"
        >
          Go to Homepage
        </Link>
        <Link
          href="/seo-services-kenya/"
          className="rounded-lg border border-[#D6D2C9] bg-white px-5 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#F7F6F2]"
        >
          SEO Services Kenya
        </Link>
        <Link
          href="/contact/"
          className="rounded-lg border border-[#D6D2C9] bg-white px-5 py-2.5 text-sm font-semibold text-[#141619] hover:bg-[#F7F6F2]"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}
