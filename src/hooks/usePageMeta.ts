import { useEffect } from 'react';
import { siteConfig } from '../lib/content';

interface PageMeta {
  /** Page-specific title; the site name is appended. */
  title?: string;
  description?: string;
  /** Path for the canonical URL, e.g. "/kb/idp". */
  path?: string;
  noIndex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Sets document title, description, canonical and Open Graph tags for the current page. */
export function usePageMeta({ title, description, path, noIndex }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteConfig.siteName}` : `${siteConfig.siteName} – ${siteConfig.tagline}`;
    const desc = description ?? siteConfig.description;
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:site_name', siteConfig.siteName);
    setMeta('name', 'robots', noIndex ? 'noindex' : 'index, follow');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${path ?? window.location.pathname}`;
  }, [title, description, path, noIndex]);
}
