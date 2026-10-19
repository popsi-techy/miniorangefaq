/**
 * Client-side search over the FAQ index (titles, excerpts, tags and category names).
 * Case- and accent-insensitive; ranks title matches first. No network access.
 */
import type { Faq } from '../types/faq';
import { categories, faqs, getCategoryTrail } from './content';

const STOP_WORDS = new Set(
  'a an and are as at be by can do does for from how i if in is it me my of on or the this to we what when where which why will with you your'.split(' '),
);

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.+#]+/g, ' ')
    .replace(/(^|\s)\.+|\.+(\s|$)/g, ' ')
    .trim();
}

export function tokenize(query: string) {
  const all = normalize(query).split(' ').filter(Boolean);
  const significant = all.filter((t) => !STOP_WORDS.has(t));
  return { all, terms: significant.length ? significant : all };
}

interface IndexedFaq {
  faq: Faq;
  title: string;
  excerpt: string;
  tags: string;
  category: string;
}

let index: IndexedFaq[] | null = null;
function getIndex() {
  index ??= faqs.map((faq) => ({
    faq,
    title: ` ${normalize(faq.title)} `,
    excerpt: ` ${normalize(faq.excerpt)} `,
    tags: ` ${normalize((faq.tags ?? []).join(' '))} `,
    category: ` ${normalize(getCategoryTrail(faq.categoryId).map((c) => c.name).join(' '))} `,
  }));
  return index;
}

export interface SearchResult {
  faq: Faq;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  terms: string[];
  /** True when no result matched every term and partial matches are returned instead. */
  partial: boolean;
}

function termScore(doc: IndexedFaq, term: string, isLast: boolean) {
  const word = ` ${term} `;
  const prefix = ` ${term}`;
  // Exact word beats prefix ("sso" vs "ssologin"); prefix only counts for the last term (typing).
  const has = (field: string, w: number) =>
    field.includes(word) ? w : isLast && field.includes(prefix) ? w * 0.7 : field.includes(term) && term.length > 3 ? w * 0.4 : 0;
  return has(doc.title, 10) + has(doc.tags, 5) + has(doc.category, 4) + has(doc.excerpt, 3);
}

export function searchFaqs(query: string, limit = Infinity, categoryIds?: Set<string>): SearchResponse {
  const { terms } = tokenize(query);
  if (!terms.length) return { results: [], terms, partial: false };
  const phrase = normalize(query);
  const scored: { faq: Faq; score: number; matched: number }[] = [];
  for (const doc of getIndex()) {
    if (categoryIds && !categoryIds.has(doc.faq.categoryId)) continue;
    let score = 0;
    let matched = 0;
    terms.forEach((t, i) => {
      const s = termScore(doc, t, i === terms.length - 1);
      if (s > 0) matched++;
      score += s;
    });
    if (!matched) continue;
    if (phrase.length > 2 && doc.title.includes(phrase)) score += 40;
    if (doc.title.trimStart().startsWith(phrase)) score += 10;
    scored.push({ faq: doc.faq, score, matched });
  }
  const full = scored.filter((s) => s.matched === terms.length);
  const pool = full.length ? full : scored.filter((s) => terms.length > 1 && s.matched >= Math.ceil(terms.length / 2));
  pool.sort((a, b) => b.score - a.score || (b.faq.views ?? 0) - (a.faq.views ?? 0));
  return {
    results: pool.slice(0, limit).map(({ faq, score }) => ({ faq, score })),
    terms,
    partial: !full.length && pool.length > 0,
  };
}

/** Categories whose name matches the query — used for autocomplete. */
export function searchCategories(query: string, limit = 3) {
  const { terms } = tokenize(query);
  if (!terms.length) return [];
  return categories
    .filter((c) => {
      const name = ` ${normalize(c.name)} `;
      return terms.every((t) => name.includes(` ${t}`));
    })
    .slice(0, limit);
}

/** Splits text into segments flagged as matching any term, for highlighting. */
export function highlight(text: string, terms: string[]): { text: string; match: boolean }[] {
  const usable = terms.filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!usable.length) return [{ text, match: false }];
  const re = new RegExp(`(${usable.sort((a, b) => b.length - a.length).join('|')})`, 'gi');
  // With a capturing group, split() puts matches at odd indexes.
  return text
    .split(re)
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((s) => s.text);
}
