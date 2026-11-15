import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { siteConfig } from './config/site';
import { AppInitialData } from './lib/router';
import './index.css';

declare global {
  interface Window {
    __INITIAL_DATA__?: AppInitialData;
  }
}

const rootElement = document.getElementById('root')!;
const initialPath = window.location.pathname || '/';
const initialData: AppInitialData = window.__INITIAL_DATA__ || { posts: [] };
const baseUrl = window.location.origin || siteConfig.domain;

const element = (
  <StrictMode>
    <App initialPath={initialPath} initialData={initialData} baseUrl={baseUrl} />
  </StrictMode>
);

if (rootElement.innerHTML.trim().length > 0 && !rootElement.innerHTML.includes('<!--ssr-outlet-->')) {
  hydrateRoot(rootElement, element);
} else {
  createRoot(rootElement).render(element);
}
