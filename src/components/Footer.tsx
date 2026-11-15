import { Phone, Mail, MessageSquare, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/site';
import { Link } from '../lib/router';

export function Footer() {
  const year = new Date().getFullYear();
  const activeSocials = siteConfig.socialLinks.filter((s) => s.enabled);

  return (
    <footer className="border-t border-[#26292E] bg-[#141619] text-[#F7F6F2]">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Company Overview & Contact */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src={siteConfig.logo.src}
                alt={siteConfig.logo.alt}
                width={38}
                height={38}
                className="h-9 w-9 rounded-lg bg-white p-1 object-contain"
              />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                {siteConfig.brandName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              {siteConfig.coreMessage} Digital marketing, search engine optimisation, paid
              advertising, and custom web development for Kenyan businesses.
            </p>
            <p className="mt-3 text-xs text-white/60">{siteConfig.contact.serviceCoverage}</p>

            <div className="mt-6 flex flex-col gap-2.5 text-sm">
              <a
                href={siteConfig.contact.phoneHref}
                className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#F5B700]"
              >
                <Phone className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                <span>{siteConfig.contact.phoneDisplay}</span>
              </a>
              <a
                href={siteConfig.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#F5B700]"
              >
                <MessageSquare className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                <span>WhatsApp: {siteConfig.contact.phoneDisplay}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
              </a>
              <a
                href={siteConfig.contact.emailHref}
                className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#F5B700]"
              >
                <Mail className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                <span>{siteConfig.contact.email}</span>
              </a>
            </div>

            {activeSocials.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-white/75">
                {activeSocials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#F5B700]"
                  >
                    <span>{social.label}</span>
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Main Services & Paid Advertising */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-sm font-semibold text-white">Main Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/seo-services-kenya/" className="hover:text-white">
                  SEO Services Kenya
                </Link>
              </li>
              <li>
                <Link href="/paid-advertising-kenya/" className="hover:text-white">
                  Paid Advertising Kenya
                </Link>
              </li>
              <li>
                <Link href="/web-design-kenya/" className="hover:text-white">
                  Web Design &amp; Dev
                </Link>
              </li>
            </ul>

            <h2 className="mt-7 font-display text-sm font-semibold text-white">Paid Advertising</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/google-ads-management-kenya/" className="hover:text-white">
                  Google Ads Management
                </Link>
              </li>
              <li>
                <Link href="/meta-ads-management-kenya/" className="hover:text-white">
                  Meta Ads Management
                </Link>
              </li>
            </ul>
          </div>

          {/* SEO Services */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold text-white">SEO Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/local-seo-kenya/" className="hover:text-white">
                  Local SEO Kenya
                </Link>
              </li>
              <li>
                <Link href="/technical-seo/" className="hover:text-white">
                  Technical SEO
                </Link>
              </li>
              <li>
                <Link href="/on-page-seo/" className="hover:text-white">
                  On-Page SEO
                </Link>
              </li>
              <li>
                <Link href="/off-page-seo-link-building/" className="hover:text-white">
                  Off-Page SEO &amp; Link Building
                </Link>
              </li>
              <li>
                <Link href="/ecommerce-seo-kenya/" className="hover:text-white">
                  Ecommerce SEO Kenya
                </Link>
              </li>
              <li>
                <Link href="/seo-consulting-kenya/" className="hover:text-white">
                  SEO Consulting Kenya
                </Link>
              </li>
              <li>
                <Link href="/seo-services-nairobi/" className="hover:text-white">
                  SEO Services Nairobi
                </Link>
              </li>
              <li>
                <Link href="/ai-search-aeo-geo-kenya/" className="hover:text-white">
                  AI Search, AEO &amp; GEO
                </Link>
              </li>
            </ul>
          </div>

          {/* Website Services & Useful Resources */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold text-white">Website Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/web-design-kenya/" className="hover:text-white">
                  Website Design Kenya
                </Link>
              </li>
              <li>
                <Link href="/website-maintenance-kenya/" className="hover:text-white">
                  Website Maintenance Kenya
                </Link>
              </li>
              <li>
                <Link href="/website-design-cost-kenya/" className="hover:text-white">
                  Website Design Cost Kenya
                </Link>
              </li>
            </ul>

            <h2 className="mt-7 font-display text-sm font-semibold text-white">Useful Resources</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/seo-prices-kenya/" className="hover:text-white">
                  SEO Prices in Kenya
                </Link>
              </li>
              <li>
                <Link href="/case-studies/" className="hover:text-white">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/blog/" className="hover:text-white">
                  Insights &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/areas-we-serve/" className="hover:text-white">
                  Areas We Serve
                </Link>
              </li>
              <li>
                <Link href="/about/" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact/" className="hover:text-white">
                  Free Growth Review
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy-policy/" className="hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <a href="/sitemap.xml" className="hover:text-white">
              XML Sitemap
            </a>
            <span aria-hidden="true">·</span>
            <Link href="/admin/" className="hover:text-white">
              Editorial Admin
            </Link>
            <span aria-hidden="true">·</span>
            <span>{siteConfig.contact.workingHours}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
