/** Content model for the knowledge base. Mirrors src/data/*.json (see docs/content-model.md). */

export interface Category {
  /** Stable id, derived from the URL path with "/" replaced by "--". */
  id: string;
  /** URL path below /kb/, e.g. "idp" or "idp/admin". Matches the live site. */
  slug: string;
  name: string;
  /** null for top-level products. */
  parentId: string | null;
  /** Display order within its parent, as on the source site. */
  order: number;
  /** Shown first on the homepage (the source's primary product tiles). */
  featured: boolean;
  /** Product logo shown on the source homepage, if any. */
  logo: string | null;
  /** The source has no category descriptions; kept for future content. */
  description: string | null;
  sourceUrl: string;
  /** Questions listed on the source category page at import time (reference only). */
  sourceQuestionCount?: number;
  discoveredFrom?: string;
}

export interface Faq {
  id: string;
  slug: string;
  title: string;
  /** The most specific category the article belongs to. */
  categoryId: string;
  excerpt: string;
  tags?: string[];
  relatedFaqIds: string[];
  /** ISO date (YYYY-MM-DD). */
  updatedAt: string | null;
  publishedAt: string | null;
  views: number | null;
  /** "Was this helpful?" totals as shown on the source site at import time. */
  helpful: { yes: number; no: number };
  sourceUrl: string;
}

/* ------------------------------------------------------------------ article body */

export type Mark = 'bold' | 'italic' | 'underline' | 'code';

export type Inline =
  | { t: 'text'; v: string; marks?: Mark[] }
  | { t: 'link'; href: string; children: Inline[] }
  | { t: 'br' };

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; content: Inline[] }
  | { type: 'paragraph'; content: Inline[] }
  | { type: 'list'; ordered: boolean; start?: number; items: Block[][] }
  | { type: 'image'; src: string; alt: string; width?: number; height?: number; caption?: string }
  | { type: 'table'; rows: { header: boolean; content: Inline[] }[][] }
  | { type: 'code'; code: string; language?: string }
  | { type: 'video'; provider: 'youtube' | 'vimeo'; videoId: string; title: string }
  | { type: 'video'; provider: 'file'; src: string; title: string }
  | { type: 'note'; blocks: Block[] }
  | { type: 'divider' };

/** One file per top-level product: { [faqId]: Block[] }. */
export type ArticleBodies = Record<string, Block[]>;

/* ------------------------------------------------------------------ site config */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export interface Navigation {
  /** Global-header dropdown menus. Empty `links` render a "coming soon" placeholder. */
  header: NavGroup[];
  footer: NavGroup[];
  legal: NavLink[];
  social: { label: string; href: string; icon: 'linkedin' | 'youtube' | 'x' | 'facebook' }[];
}

export interface SiteConfig {
  siteName: string;
  productName: string;
  tagline: string;
  description: string;
  sourceOrigin: string;
  copyright: string;
  homeUrl: string;
  contact: {
    email: string;
    contactPageUrl: string;
    forumUrl: string;
    documentationUrl: string;
    phones: { label: string; number: string }[];
  };
  support: {
    /** POST endpoint for the support form. null = no backend; the form opens an email draft instead. */
    endpoint: string | null;
    requestTypes: { value: string; label: string }[];
  };
  feedback: {
    /** POST endpoint for article feedback. null = recorded in this browser only. */
    endpoint: string | null;
  };
  article: {
    /** Questions whose page shows related questions in a right-hand sidebar instead of below the answer. */
    relatedSidebarSlugs: string[];
  };
  listing: { pageSize: number };
}
