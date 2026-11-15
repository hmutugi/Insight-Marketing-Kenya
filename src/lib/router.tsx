import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CmsArticle } from './cms';
import { normalizePathname } from '../data/routes';

export interface AppInitialData {
  posts: CmsArticle[];
  activeArticle?: CmsArticle | null;
}

interface RouterContextValue {
  pathname: string;
  search: string;
  navigate: (to: string) => void;
  posts: CmsArticle[];
  setPosts: React.Dispatch<React.SetStateAction<CmsArticle[]>>;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function extractSearch(rawUrl: string): string {
  const qIndex = rawUrl.indexOf('?');
  if (qIndex === -1) return '';
  const hashIndex = rawUrl.indexOf('#', qIndex);
  return hashIndex === -1 ? rawUrl.slice(qIndex) : rawUrl.slice(qIndex, hashIndex);
}

export function RouterProvider({
  initialPath,
  initialData,
  children,
}: {
  initialPath: string;
  initialData: AppInitialData;
  children: React.ReactNode;
}) {
  const [pathname, setPathname] = useState<string>(() => normalizePathname(initialPath));
  const [search, setSearch] = useState<string>(() => {
    if (typeof window !== 'undefined') return window.location.search || extractSearch(initialPath);
    return extractSearch(initialPath);
  });
  const [posts, setPosts] = useState<CmsArticle[]>(initialData.posts || []);

  useEffect(() => {
    const onPopState = () => {
      setPathname(normalizePathname(window.location.pathname));
      setSearch(window.location.search || '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const targetPath = normalizePathname(to);
    const targetSearch = extractSearch(to);
    const targetUrl = `${targetPath}${targetSearch}`;
    if (typeof window !== 'undefined') {
      const currentUrl = `${normalizePathname(window.location.pathname)}${window.location.search}`;
      if (currentUrl !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    setPathname(targetPath);
    setSearch(targetSearch);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, search, navigate, posts, setPosts }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside RouterProvider');
  }
  return ctx;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function Link({ href, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented || isExternal) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
