import { useEffect } from 'react';
import { HeadMetadata } from '../lib/seo';

export function SeoHead({ head }: { head: HeadMetadata }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = head.title;

    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('name=')) {
          const nameVal = selector.match(/name="([^"]+)"/)?.[1];
          if (nameVal) el.setAttribute('name', nameVal);
        } else if (selector.includes('property=')) {
          const propVal = selector.match(/property="([^"]+)"/)?.[1];
          if (propVal) el.setAttribute('property', propVal);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', 'content', head.description);
    updateMeta('meta[name="robots"]', 'content', head.noindex ? 'noindex, nofollow' : 'index, follow');
    updateMeta('meta[property="og:title"]', 'content', head.title);
    updateMeta('meta[property="og:description"]', 'content', head.ogDescription);
    updateMeta('meta[property="og:url"]', 'content', head.canonicalUrl);
    updateMeta('meta[property="og:type"]', 'content', head.ogType);
    updateMeta('meta[property="og:image"]', 'content', head.ogImage);
    updateMeta('meta[name="twitter:title"]', 'content', head.title);
    updateMeta('meta[name="twitter:description"]', 'content', head.ogDescription);
    updateMeta('meta[name="twitter:image"]', 'content', head.ogImage);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', head.canonicalUrl);
  }, [head]);

  return null;
}
