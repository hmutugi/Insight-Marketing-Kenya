import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/site';
import { Link, useRouter } from '../lib/router';

export function Header() {
  const { pathname } = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const servicesNav = siteConfig.navigation.find((item) => Boolean(item.children));
  const isServicesActive = Boolean(
    servicesNav?.children?.some((child) => child.href === pathname) ||
      pathname.includes('seo') ||
      pathname.includes('ads') ||
      pathname.includes('web-design') ||
      pathname.includes('website-')
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2DFD7] bg-[#F7F6F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[#141619] transition-opacity hover:opacity-85"
          aria-label="Insight Marketing Kenya Home"
        >
          <img
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-md object-contain"
          />
          <span className="font-display text-base font-bold tracking-tight text-[#141619] sm:text-[17px]">
            {siteConfig.shortName}
          </span>
        </Link>

        {/* Zone 2: Clean single-line text navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 lg:flex"
        >
          {siteConfig.navigation.map((item) => {
            if (item.children) {
              return (
                <div
                  key={item.label}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    onClick={() => setServicesOpen((prev) => !prev)}
                    className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap py-2 text-sm font-medium transition-colors ${
                      isServicesActive
                        ? 'text-[#141619] underline decoration-[#F5B700] decoration-2 underline-offset-8'
                        : 'text-[#4B515A] hover:text-[#141619]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        servicesOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {servicesOpen && (
                    <div
                      role="menu"
                      aria-label="Services submenu"
                      className="absolute left-0 top-full w-80 rounded-xl border border-[#E2DFD7] bg-white p-2 shadow-lg"
                    >
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          role="menuitem"
                          onClick={() => setServicesOpen(false)}
                          className={`block rounded-lg px-3.5 py-2.5 transition-colors ${
                            pathname === sub.href
                              ? 'bg-[#EFEDE7] text-[#141619]'
                              : 'hover:bg-[#F7F6F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm font-semibold text-[#141619]">
                            <span>{sub.label}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-[#666D77]" aria-hidden="true" />
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-[#4B515A]">
                            {sub.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#141619] underline decoration-[#F5B700] decoration-2 underline-offset-8'
                    : 'text-[#4B515A] hover:text-[#141619] hover:underline hover:decoration-[#E2DFD7] hover:underline-offset-8'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={siteConfig.primaryCta.href}
            className="hidden shrink-0 whitespace-nowrap rounded-lg bg-[#F5B700] px-4 py-2.5 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#DFA600] sm:inline-flex"
          >
            {siteConfig.primaryCta.label}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2DFD7] bg-white text-[#141619] transition-colors hover:bg-[#EFEDE7] lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-[#E2DFD7] bg-white px-4 py-5 lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#141619] hover:bg-[#F7F6F2]"
            >
              Home
            </Link>

            <div className="py-1">
              <div className="px-3 py-2 text-xs font-semibold tracking-wide text-[#666D77]">
                Services
              </div>
              <div className="flex flex-col gap-1 pl-2">
                {servicesNav?.children?.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-[#141619] hover:bg-[#F7F6F2]"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/case-studies/"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#141619] hover:bg-[#F7F6F2]"
            >
              Case Studies
            </Link>
            <Link
              href="/blog/"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#141619] hover:bg-[#F7F6F2]"
            >
              Insights
            </Link>
            <Link
              href="/about/"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#141619] hover:bg-[#F7F6F2]"
            >
              About
            </Link>
            <Link
              href="/contact/"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#141619] hover:bg-[#F7F6F2]"
            >
              Contact
            </Link>

            <div className="mt-3 flex flex-col gap-2.5 border-t border-[#E2DFD7] pt-4">
              <Link
                href={siteConfig.primaryCta.href}
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#F5B700] px-4 py-3 text-sm font-semibold text-[#141619] hover:bg-[#DFA600]"
              >
                {siteConfig.primaryCta.label}
              </Link>
              <a
                href={siteConfig.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[#D6D2C9] bg-white px-4 py-3 text-sm font-semibold text-[#141619] hover:bg-[#F7F6F2]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
