import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '../data/routes';
import { Link } from '../lib/router';

export function Breadcrumbs({
  items,
  dark = false,
}: {
  items: BreadcrumbItem[];
  dark?: boolean;
}) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.href + idx} className="flex items-center gap-2">
              {idx > 0 && (
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 ${dark ? 'text-white/40' : 'text-[#666D77]'}`}
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className={dark ? 'text-white/90' : 'text-[#141619]'}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`transition-colors hover:underline ${
                    dark ? 'text-white/65 hover:text-white' : 'text-[#4B515A] hover:text-[#141619]'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
