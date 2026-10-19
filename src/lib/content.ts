/**
 * Read-only content repository over the JSON files in src/data.
 * Pages and components must go through these helpers instead of importing JSON directly,
 * so the storage format (or a future API) can change in one place.
 */
import categoriesJson from '../data/categories.json';
import categoryDisplayJson from '../data/category-display.json';
import faqsJson from '../data/faqs.json';
import navigationJson from '../data/navigation.json';
import siteConfigJson from '../data/site-config.json';
import type { ArticleBodies, Block, Category, Faq, Navigation, SiteConfig } from '../types/faq';

export const categories = categoriesJson as Category[];
export const faqs = faqsJson as Faq[];
export const navigation = navigationJson as Navigation;
export const siteConfig = siteConfigJson as SiteConfig;

const categoryById = new Map(categories.map((c) => [c.id, c]));
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const faqBySlug = new Map(faqs.map((f) => [f.slug, f]));
const faqById = new Map(faqs.map((f) => [f.id, f]));

const byOrder = (a: Category, b: Category) => a.order - b.order || a.name.localeCompare(b.name);

export const topLevelCategories = categories.filter((c) => !c.parentId).sort(byOrder);

/**
 * Short display names for compact UI (e.g. product tiles), keyed by category slug.
 * Kept separate from categories.json so content re-imports do not overwrite them.
 */
const categoryDisplay = categoryDisplayJson as Record<string, { shortName?: string }>;
export function getShortName(category: Category) {
  return categoryDisplay[category.slug]?.shortName ?? category.name;
}

export function getCategoryById(id: string) {
  return categoryById.get(id);
}
export function getCategoryBySlug(slug: string) {
  return categoryBySlug.get(slug.replace(/^\/+|\/+$/g, ''));
}
export function getFaqBySlug(slug: string) {
  return faqBySlug.get(slug);
}
export function getFaqById(id: string) {
  return faqById.get(id);
}

export function getSubcategories(categoryId: string) {
  return categories.filter((c) => c.parentId === categoryId).sort(byOrder);
}

/** Ancestors from the top-level product down to (and including) the category. */
export function getCategoryTrail(categoryId: string): Category[] {
  const trail: Category[] = [];
  let cur = categoryById.get(categoryId);
  while (cur) {
    trail.unshift(cur);
    cur = cur.parentId ? categoryById.get(cur.parentId) : undefined;
  }
  return trail;
}

export function getTopCategory(categoryId: string) {
  return getCategoryTrail(categoryId)[0];
}

/** Ids of the category and all its descendants. */
function descendantIds(categoryId: string): Set<string> {
  const ids = new Set([categoryId]);
  for (const sub of getSubcategories(categoryId)) descendantIds(sub.id).forEach((id) => ids.add(id));
  return ids;
}

/** FAQs in a category, including its sub-categories. */
export function getFaqsInCategory(categoryId: string): Faq[] {
  const ids = descendantIds(categoryId);
  return faqs.filter((f) => ids.has(f.categoryId));
}


export function categoryPath(category: Pick<Category, 'slug'>) {
  return `/kb/${category.slug}`;
}
export function faqPath(faq: Pick<Faq, 'slug'>) {
  return `/knowledgebase/${faq.slug}`;
}

export function getRecentlyUpdated(limit: number) {
  // Some source articles carry future "modified" dates (e.g. 2032); they are not "recent".
  const today = new Date().toISOString().slice(0, 10);
  return [...faqs]
    .filter((f) => f.updatedAt && f.updatedAt <= today)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, limit);
}

/** Most viewed according to the view counters published on the source site. */
export function getMostViewed(limit: number, within?: Faq[]) {
  return [...(within ?? faqs)]
    .filter((f) => f.views != null)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
}

/**
 * Related questions: the source's curated "Related Articles" first,
 * then other questions from the same category to fill up to `limit`.
 */
export function getRelated(faq: Faq, limit = 6): { items: Faq[]; curated: boolean } {
  const curated = faq.relatedFaqIds.map((id) => faqById.get(id)).filter((f): f is Faq => Boolean(f));
  if (curated.length >= limit) return { items: curated.slice(0, limit), curated: true };
  const seen = new Set([faq.id, ...curated.map((f) => f.id)]);
  const siblings = getMostViewed(limit, faqs.filter((f) => f.categoryId === faq.categoryId && !seen.has(f.id)));
  return { items: [...curated, ...siblings].slice(0, limit), curated: curated.length > 0 };
}

/* --------------------------------------------------------------- article bodies */

// One lazily-loaded chunk per top-level product keeps the initial bundle small.
const bodyLoaders = import.meta.glob<ArticleBodies>('../data/articles/*.json', { import: 'default' });
const bodyCache = new Map<string, Promise<ArticleBodies>>();

export async function loadArticleBody(faq: Faq): Promise<Block[]> {
  const top = getTopCategory(faq.categoryId);
  const key = `../data/articles/${top?.id}.json`;
  const loader = bodyLoaders[key];
  if (!loader) throw new Error(`No content file for category "${top?.id}"`);
  if (!bodyCache.has(key)) {
    const p = loader();
    p.catch(() => bodyCache.delete(key)); // allow retry after a failed load
    bodyCache.set(key, p);
  }
  const bodies = await bodyCache.get(key)!;
  const body = bodies[faq.id];
  if (!body) throw new Error(`Article body missing for "${faq.id}"`);
  return body;
}
