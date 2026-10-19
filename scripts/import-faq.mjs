#!/usr/bin/env node
/**
 * Imports the miniOrange knowledge base from the reference site into the
 * repository JSON files under src/data.
 *
 *   node scripts/import-faq.mjs            # use cached HTML where available
 *   node scripts/import-faq.mjs --refresh  # re-download every page
 *
 * Imports a representative sample: the MAX_PER_CATEGORY most viewed questions
 * of every category (raise the constant to import more).
 *
 * Output (all regenerated on each run):
 *   src/data/categories.json            category tree (products + sub-categories)
 *   src/data/faqs.json                  FAQ index (metadata, excerpt, relations)
 *   src/data/articles/<product>.json    structured article bodies, one file per product
 *   docs/import-report.json             counts, warnings and unreachable pages
 *
 * Raw HTML is cached in .cache/kb (git-ignored) so the converter can be
 * iterated on without re-fetching the site.
 */
import { parse } from 'node-html-parser';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ORIGIN = 'https://faq.miniorange.in';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const CACHE = path.join(ROOT, '.cache', 'kb');
const DATA = path.join(ROOT, 'src', 'data');
const REFRESH = process.argv.includes('--refresh');
const CONCURRENCY = 2;
/** Representative sample size: most-viewed questions kept per category. */
const MAX_PER_CATEGORY = 10;
const UA = 'Mozilla/5.0 (miniOrange FAQ portal content import)';

const report = { generatedAt: new Date().toISOString(), warnings: [], failed: [] };

// ---------------------------------------------------------------- fetching

async function get(url) {
  const key = createHash('sha1').update(url).digest('hex');
  const file = path.join(CACHE, `${key}.html`);
  if (!REFRESH && existsSync(file)) return readFile(file, 'utf8');
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      await writeFile(file, html);
      return html;
    } catch (err) {
      if (attempt === 4) {
        report.failed.push({ url, error: String(err) });
        return null;
      }
      await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
        done++;
        if (done % 100 === 0) console.log(`  ${done}/${items.length}`);
      }
    }),
  );
  return out;
}

const text = (el) => decode(el?.text ?? '').replace(/\s+/g, ' ').trim();
function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
const kbPath = (href) => {
  const m = href?.match(/\/kb\/([^?#]+?)\/?(?:[?#].*)?$/);
  return m ? m[1] : null;
};
const articleSlug = (href) => {
  const m = href?.match(/\/knowledgebase\/([^/?#]+)\/?/);
  return m ? m[1] : null;
};
const absolute = (src) => {
  if (!src) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (src.startsWith('/')) return ORIGIN + src;
  return src;
};
const parseCount = (s) => {
  const n = parseInt(String(s ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
};
function isoDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------- category crawl

async function crawlCategories() {
  const home = parse(await get(`${ORIGIN}/`));
  const cards = home.querySelectorAll('#mo-faq-products-list a[href*="/kb/"]');
  const categories = new Map(); // path -> category
  const listings = new Map(); // path -> [{slug, title, views, date, likes}]
  let order = 0;

  const featuredList = home.querySelector('#mo-faq-products-list ul');
  cards.forEach((a) => {
    const p = kbPath(a.getAttribute('href'));
    if (!p || categories.has(p)) return;
    const logo = a.querySelector('img')?.getAttribute('src') ?? null;
    categories.set(p, {
      id: p.replace(/\//g, '--'),
      slug: p,
      name: text(a.querySelector('.mo-faq-pcard__name') ?? a),
      parentId: null,
      order: order++,
      featured: featuredList?.querySelector(`a[href="${a.getAttribute('href')}"]`) != null,
      logo: logo ? absolute(logo) : null,
      sourceUrl: `${ORIGIN}/kb/${p}/`,
    });
  });

  const queue = [...categories.keys()];
  while (queue.length) {
    const batch = queue.splice(0, queue.length);
    await pool(batch, async (p) => {
      const html = await get(`${ORIGIN}/kb/${p}/`);
      if (!html) return;
      const doc = parse(html);
      const wrap = doc.querySelector('.container.content-wrapper');
      const parent = categories.get(p);
      let subOrder = 0;
      wrap?.querySelectorAll('.knowledgebase-body').forEach((box) => {
        const h = box.querySelector('h5 a');
        const sp = kbPath(h?.getAttribute('href'));
        if (!sp || categories.has(sp)) return;
        categories.set(sp, {
          id: sp.replace(/\//g, '--'),
          slug: sp,
          name: text(h),
          parentId: parent.id,
          order: subOrder++,
          featured: false,
          logo: null,
          sourceUrl: `${ORIGIN}/kb/${sp}/`,
          listedCount: parseCount(box.querySelector('a.kblnk')?.text),
        });
        queue.push(sp);
      });
      listings.set(
        p,
        (wrap?.querySelectorAll('.kb-box-single') ?? []).map((b) => {
          const a = b.querySelector('h4 a');
          const spans = b.querySelectorAll('p span').map(text);
          return {
            slug: articleSlug(a?.getAttribute('href')),
            title: text(a),
            views: parseCount(spans[0]),
            date: isoDate(spans[1]),
            likes: parseCount(spans[2]),
          };
        }),
      );
    });
  }
  return { categories, listings };
}

// ------------------------------------------------------ HTML -> blocks

const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'figure', 'ul', 'ol', 'table', 'pre', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'iframe', 'dl', 'header', 'footer', 'center',
  'details', 'video', 'main', 'aside', 'nav', 'form',
]);
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'button', 'input', 'select', 'textarea', 'form']);

function createConverter(ctx) {
  function convertChildren(node) {
    const blocks = [];
    let inlines = [];
    const flush = () => {
      const cleaned = trimInlines(inlines);
      if (cleaned.length) blocks.push({ type: 'paragraph', content: cleaned });
      inlines = [];
    };
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        inlines.push(...inlineText(child.rawText));
        continue;
      }
      if (child.nodeType !== 1) continue;
      const tag = child.rawTagName?.toLowerCase();
      if (!tag || SKIP_TAGS.has(tag)) continue;
      if (tag === 'img') {
        flush();
        const img = image(child);
        if (img) blocks.push(img);
        continue;
      }
      if (BLOCK_TAGS.has(tag)) {
        flush();
        blocks.push(...convertBlock(child, tag));
        continue;
      }
      // inline element: may still contain images or block children (bad HTML)
      if (child.querySelector('img, iframe, table, ul, ol, pre, p, div, h1, h2, h3, h4, h5, h6')) {
        const parts = convertChildren(child);
        // re-merge leading paragraph content with current inline run
        for (const b of parts) {
          if (b.type === 'paragraph') {
            inlines.push(...applyMarks(b.content, marksFor(tag)));
          } else {
            flush();
            blocks.push(b);
          }
        }
        continue;
      }
      inlines.push(...convertInline(child));
    }
    flush();
    return blocks;
  }

  function convertBlock(el, tag) {
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const content = trimInlines(el.childNodes.flatMap(inlineNode)).map(stripBold);
        if (!content.length) return [];
        // Article titles own the h1; source h2-h6 map onto h2-h4.
        const level = Math.min(4, Math.max(2, Number(tag[1])));
        return [{ type: 'heading', level, content }];
      }
      case 'ul':
      case 'ol': {
        const items = el.childNodes
          .filter((c) => c.nodeType === 1 && c.rawTagName?.toLowerCase() === 'li')
          .map((li) => convertChildren(li))
          .filter((b) => b.length);
        if (!items.length) return [];
        const block = { type: 'list', ordered: tag === 'ol', items };
        const start = parseInt(el.getAttribute('start') ?? '', 10);
        if (block.ordered && start > 1) block.start = start;
        return [block];
      }
      case 'table':
        return table(el);
      case 'pre': {
        const code = decode(el.text).replace(/\r\n/g, '\n').replace(/^\n+|\s+$/g, '');
        return code ? [{ type: 'code', code }] : [];
      }
      case 'blockquote': {
        const blocks = convertChildren(el);
        return blocks.length ? [{ type: 'note', blocks }] : [];
      }
      case 'hr':
        return [{ type: 'divider' }];
      case 'iframe':
      case 'video':
        return video(el);
      case 'dl':
        return el.childNodes
          .filter((c) => c.nodeType === 1)
          .flatMap((c) => convertChildren(c));
      case 'details': {
        const summary = el.querySelector('summary');
        const out = [];
        if (summary) out.push({ type: 'heading', level: 3, content: trimInlines(summary.childNodes.flatMap(inlineNode)) });
        summary?.remove();
        return out.concat(convertChildren(el));
      }
      default: {
        // generic container (div/section/figure/p)
        const cls = el.getAttribute('class') ?? '';
        if (/\bwp-block-code\b/.test(cls)) return convertBlock(el.querySelector('pre') ?? el, 'pre');
        const blocks = convertChildren(el);
        if (tag === 'figure') {
          const caption = text(el.querySelector('figcaption'));
          const img = blocks.find((b) => b.type === 'image');
          if (img && caption) {
            img.caption = caption;
            return blocks.filter((b) => !(b.type === 'paragraph' && plain(b.content) === caption));
          }
        }
        return blocks;
      }
    }
  }

  function table(el) {
    const rows = el.querySelectorAll('tr').map((tr) =>
      tr.childNodes
        .filter((c) => c.nodeType === 1 && /^(td|th)$/i.test(c.rawTagName))
        .map((cell) => ({
          header: cell.rawTagName.toLowerCase() === 'th' || cell.parentNode?.parentNode?.rawTagName?.toLowerCase() === 'thead',
          content: trimInlines(cell.childNodes.flatMap(inlineNode)),
        })),
    ).filter((r) => r.length);
    if (!rows.length) return [];
    // A one-column table is really a list of paragraphs
    if (rows.every((r) => r.length === 1)) {
      return rows.map((r) => ({ type: 'paragraph', content: r[0].content })).filter((p) => p.content.length);
    }
    return [{ type: 'table', rows }];
  }

  function video(el) {
    const src = absolute(el.getAttribute('src') ?? el.querySelector('source')?.getAttribute('src') ?? '');
    const yt = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
    if (yt) return [{ type: 'video', provider: 'youtube', videoId: yt[1], title: el.getAttribute('title') ?? 'Video' }];
    const vimeo = src.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (vimeo) return [{ type: 'video', provider: 'vimeo', videoId: vimeo[1], title: el.getAttribute('title') ?? 'Video' }];
    if (src && /\.(mp4|webm)(\?|$)/.test(src)) return [{ type: 'video', provider: 'file', src, title: 'Video' }];
    if (src) {
      ctx.warn(`unsupported embed ${src}`);
      return [{ type: 'paragraph', content: [{ t: 'link', href: src, children: [{ t: 'text', v: 'Open embedded content' }] }] }];
    }
    return [];
  }

  function image(el) {
    const src = el.getAttribute('data-src') ?? el.getAttribute('data-lazy-src') ?? el.getAttribute('src');
    if (!src || src.startsWith('data:')) return null;
    const block = { type: 'image', src: absolute(src), alt: decode(el.getAttribute('alt') ?? '').trim() };
    const w = parseInt(el.getAttribute('width') ?? '', 10);
    const h = parseInt(el.getAttribute('height') ?? '', 10);
    if (w > 0) block.width = w;
    if (h > 0) block.height = h;
    return block;
  }

  function inlineNode(node) {
    if (node.nodeType === 3) return inlineText(node.rawText);
    if (node.nodeType !== 1) return [];
    return convertInline(node);
  }

  function convertInline(el) {
    const tag = el.rawTagName?.toLowerCase();
    if (!tag || SKIP_TAGS.has(tag)) return [];
    if (tag === 'br') return [{ t: 'br' }];
    if (tag === 'img') return []; // images handled at block level
    const cls = el.getAttribute('class') ?? '';
    if (tag === 'i' && /\b(fa|glyphicon|dashicons)\b/.test(cls) && !el.text.trim()) return [];
    if (tag === 'code' || tag === 'kbd' || tag === 'samp') {
      const v = decode(el.text);
      return v ? [{ t: 'text', v, marks: ['code'] }] : [];
    }
    const children = el.childNodes.flatMap(inlineNode);
    if (tag === 'a') {
      const href = link(el.getAttribute('href'));
      if (!href || !children.length) return children;
      return [{ t: 'link', href, children }];
    }
    return applyMarks(children, marksFor(tag, el));
  }

  function link(href) {
    if (!href) return null;
    href = decode(href.trim());
    if (href.startsWith('#') || href.startsWith('javascript:')) return null;
    if (/^mailto:|^tel:/i.test(href)) return href;
    const abs = absolute(href);
    if (abs.startsWith(ORIGIN)) {
      const slug = articleSlug(abs);
      if (slug) {
        ctx.links.add(slug);
        return `/knowledgebase/${slug}`;
      }
      const cat = kbPath(abs);
      if (cat) return `/kb/${cat}`;
      if (abs.replace(/\/$/, '') === ORIGIN) return '/';
    }
    return /^https?:\/\//.test(abs) ? abs : null;
  }

  return { convertChildren };
}

function marksFor(tag, el) {
  const marks = [];
  if (tag === 'b' || tag === 'strong') marks.push('bold');
  if (tag === 'em' || (tag === 'i' && !/\bfa\b/.test(el?.getAttribute?.('class') ?? ''))) marks.push('italic');
  if (tag === 'u') marks.push('underline');
  if (tag === 'span' && /font-weight:\s*(bold|[6-9]00)/.test(el?.getAttribute?.('style') ?? '')) marks.push('bold');
  return marks;
}
function applyMarks(inlines, marks) {
  if (!marks.length) return inlines;
  return inlines.map((n) => {
    if (n.t === 'text') return { ...n, marks: [...new Set([...(n.marks ?? []), ...marks])] };
    if (n.t === 'link') return { ...n, children: applyMarks(n.children, marks) };
    return n;
  });
}
function stripBold(n) {
  if (n.t === 'text' && n.marks) {
    const marks = n.marks.filter((m) => m !== 'bold');
    const out = { t: 'text', v: n.v };
    if (marks.length) out.marks = marks;
    return out;
  }
  if (n.t === 'link') return { ...n, children: n.children.map(stripBold) };
  return n;
}
function inlineText(raw) {
  const v = decode(raw).replace(/[\s ]+/g, ' ');
  return v ? [{ t: 'text', v }] : [];
}
/** Merge adjacent text nodes with identical marks; trim edges and stray breaks. */
function trimInlines(list) {
  const merged = [];
  for (const n of list) {
    const prev = merged[merged.length - 1];
    if (n.t === 'text' && prev?.t === 'text' && String(prev.marks ?? '') === String(n.marks ?? '')) {
      prev.v = (prev.v + n.v).replace(/ {2,}/g, ' ');
    } else if (n.t === 'link') {
      const children = trimInlines(n.children.map((c) => ({ ...c })));
      if (children.length) merged.push({ ...n, children });
    } else if (n.t === 'text' && n.v.trim() === '' && n.marks) {
      merged.push({ t: 'text', v: ' ' });
    } else {
      merged.push({ ...n });
    }
  }
  while (merged.length && (merged[0].t === 'br' || (merged[0].t === 'text' && !merged[0].v.trim()))) merged.shift();
  while (merged.length && (merged.at(-1).t === 'br' || (merged.at(-1).t === 'text' && !merged.at(-1).v.trim()))) merged.pop();
  if (merged[0]?.t === 'text') merged[0].v = merged[0].v.trimStart();
  if (merged.at(-1)?.t === 'text') merged.at(-1).v = merged.at(-1).v.trimEnd();
  // collapse runs of <br>
  return merged.filter((n, i) => !(n.t === 'br' && merged[i - 1]?.t === 'br'));
}
function plain(inlines) {
  return inlines.map((n) => (n.t === 'text' ? n.v : n.t === 'link' ? plain(n.children) : ' ')).join('').replace(/\s+/g, ' ').trim();
}
function blocksText(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.content) out.push(plain(b.content));
    if (b.items) b.items.forEach((i) => out.push(blocksText(i)));
    if (b.blocks) out.push(blocksText(b.blocks));
    if (b.rows) b.rows.forEach((r) => r.forEach((c) => out.push(plain(c.content))));
    if (b.code) out.push(b.code);
  }
  return out.join(' ').replace(/\s+/g, ' ').trim();
}
function excerptOf(blocks, title) {
  let s = blocksText(blocks);
  if (s.startsWith(title)) s = s.slice(title.length).trim();
  if (s.length <= 200) return s;
  const cut = s.slice(0, 200);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}

// ---------------------------------------------------------- article pass

async function importArticle(slug, ctxBase) {
  const url = `${ORIGIN}/knowledgebase/${slug}/`;
  const html = await get(url);
  if (!html) return null;
  const doc = parse(html);
  const wrap = doc.querySelector('.container.content-wrapper');
  const title = text(wrap?.querySelector('.kb-single h2, h1, h2'));
  const crumbs = (wrap?.previousElementSibling?.querySelectorAll('a') ?? [])
    .map((a) => kbPath(a.getAttribute('href')))
    .filter(Boolean);
  const metaSpans = (wrap?.querySelectorAll('.kb-single p span') ?? []).map(text);
  const body = wrap?.querySelector('.entry-content');
  const warnings = [];
  const ctx = { links: new Set(), warn: (w) => warnings.push(w) };
  const blocks = body ? createConverter(ctx).convertChildren(body) : [];
  if (!blocks.length) warnings.push('empty body');
  const related = (wrap?.querySelectorAll('.manual_related_articles a') ?? [])
    .map((a) => articleSlug(a.getAttribute('href')))
    .filter(Boolean);
  const modified = doc.querySelector('meta[property="article:modified_time"]')?.getAttribute('content');
  const yes = parseCount(wrap?.querySelector('.manual_doc_count')?.text);
  const no = parseCount(wrap?.querySelector('.manual_doc_unlike_count')?.text);
  warnings.forEach((w) => ctxBase.report.warnings.push({ slug, warning: w }));
  return {
    slug,
    title,
    crumbs,
    blocks,
    related,
    views: parseCount(metaSpans[0]),
    updatedAt: isoDate(modified) ?? isoDate(metaSpans[1]),
    helpful: { yes: yes ?? 0, no: no ?? 0 },
  };
}

// ---------------------------------------------------------------- main

async function main() {
  await mkdir(CACHE, { recursive: true });
  console.log('Crawling categories…');
  const { categories, listings } = await crawlCategories();
  console.log(`  ${categories.size} categories`);

  console.log('Reading sitemaps…');
  const sitemapSlugs = new Map();
  for (const sm of ['manual_kb-sitemap.xml', 'manual_kb-sitemap2.xml', 'manual_kb-sitemap3.xml']) {
    const xml = await get(`${ORIGIN}/${sm}`);
    if (!xml) continue;
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)) {
      const slug = articleSlug(m[1]);
      if (slug) sitemapSlugs.set(slug, isoDate(m[2]));
    }
  }
  const listedSlugs = new Set([...listings.values()].flat().map((a) => a.slug).filter(Boolean));
  console.log(`  ${sitemapSlugs.size} in sitemap, ${listedSlugs.size} listed in categories`);

  // Deepest category that lists an article (parent pages also list sub-category articles)
  const listedIn = new Map();
  const listingMeta = new Map();
  for (const [p, items] of listings) {
    for (const a of items) {
      if (!a.slug) continue;
      const cur = listedIn.get(a.slug);
      if (!cur || p.split('/').length > cur.split('/').length) listedIn.set(a.slug, p);
      if (!listingMeta.has(a.slug)) listingMeta.set(a.slug, a);
    }
  }

  // Sample: keep the MAX_PER_CATEGORY most viewed questions of each category.
  const perCategory = new Map();
  for (const [slug, p] of listedIn) {
    if (!perCategory.has(p)) perCategory.set(p, []);
    perCategory.get(p).push(listingMeta.get(slug));
  }
  const selected = [];
  const sourceCounts = new Map();
  for (const [p, items] of perCategory) {
    sourceCounts.set(p, items.length);
    items.sort((a, b) => (b.views ?? 0) - (a.views ?? 0) || a.title.localeCompare(b.title));
    selected.push(...items.slice(0, MAX_PER_CATEGORY).map((a) => a.slug));
  }
  const notListed = [...sitemapSlugs.keys()].filter((s) => !listedSlugs.has(s));
  console.log(`Importing ${selected.length} articles (max ${MAX_PER_CATEGORY} per category)…`);
  const articles = (await pool(selected, (slug) => importArticle(slug, { report }))).filter(Boolean);

  const faqs = [];
  const bodies = new Map(); // top-level category id -> { faqId: blocks }
  for (const a of articles) {
    if (!a.title) {
      report.warnings.push({ slug: a.slug, warning: 'no title, skipped' });
      continue;
    }
    let catPath = listedIn.get(a.slug) ?? [...a.crumbs].reverse().find((p) => categories.has(p));
    if (!catPath) {
      // Breadcrumb names a category that is not linked from the homepage tree
      const unknown = a.crumbs.at(-1);
      if (unknown) {
        const parentPath = unknown.split('/').slice(0, -1).join('/');
        categories.set(unknown, {
          id: unknown.replace(/\//g, '--'),
          slug: unknown,
          name: unknown.split('/').at(-1).replace(/-/g, ' '),
          parentId: categories.get(parentPath)?.id ?? null,
          order: 999,
          featured: false,
          logo: null,
          sourceUrl: `${ORIGIN}/kb/${unknown}/`,
          discoveredFrom: 'article breadcrumb',
        });
        report.warnings.push({ slug: a.slug, warning: `category ${unknown} only reachable via breadcrumb` });
        catPath = unknown;
      } else {
        catPath = 'general';
        report.warnings.push({ slug: a.slug, warning: 'no category; assigned to general' });
      }
    }
    const cat = categories.get(catPath);
    const top = cat.parentId ? [...categories.values()].find((c) => c.id === cat.parentId) : cat;
    const listed = listingMeta.get(a.slug);
    faqs.push({
      id: a.slug,
      slug: a.slug,
      title: a.title,
      categoryId: cat.id,
      excerpt: excerptOf(a.blocks, a.title),
      relatedFaqIds: [...new Set(a.related)].filter((s) => s !== a.slug),
      updatedAt: a.updatedAt ?? sitemapSlugs.get(a.slug) ?? null,
      publishedAt: listed?.date ?? null,
      views: a.views ?? listed?.views ?? null,
      helpful: a.helpful,
      sourceUrl: `${ORIGIN}/knowledgebase/${a.slug}/`,
    });
    if (!bodies.has(top.id)) bodies.set(top.id, {});
    bodies.get(top.id)[a.slug] = a.blocks;
  }

  const known = new Set(faqs.map((f) => f.id));
  for (const f of faqs) {
    const missing = f.relatedFaqIds.filter((id) => !known.has(id));
    if (missing.length) report.warnings.push({ slug: f.id, warning: `related not imported: ${missing.join(', ')}` });
    f.relatedFaqIds = f.relatedFaqIds.filter((id) => known.has(id));
  }
  faqs.sort((a, b) => a.title.localeCompare(b.title));

  const catList = [...categories.values()]
    .sort((a, b) => (a.parentId ?? '').localeCompare(b.parentId ?? '') || a.order - b.order)
    .map(({ listedCount, ...c }) => {
      return { ...c, description: null, sourceQuestionCount: sourceCounts.get(c.slug) ?? listedCount ?? 0 };
    });

  await rm(path.join(DATA, 'articles'), { recursive: true, force: true });
  await mkdir(path.join(DATA, 'articles'), { recursive: true });
  await writeFile(path.join(DATA, 'categories.json'), JSON.stringify(catList, null, 2) + '\n');
  await writeFile(path.join(DATA, 'faqs.json'), JSON.stringify(faqs, null, 1) + '\n');
  for (const [id, map] of bodies) {
    await writeFile(path.join(DATA, 'articles', `${id}.json`), JSON.stringify(map) + '\n');
  }

  Object.assign(report, {
    categories: catList.length,
    topLevelCategories: catList.filter((c) => !c.parentId).length,
    faqs: faqs.length,
    sitemapUrls: sitemapSlugs.size,
    listedInCategories: listedSlugs.size,
    maxPerCategory: MAX_PER_CATEGORY,
    sourceArticlesInCategories: listedSlugs.size,
    notInSitemap: [...listedSlugs].filter((s) => !sitemapSlugs.has(s)),
    notListedInAnyCategory: notListed,
  });
  await mkdir(path.join(ROOT, 'docs'), { recursive: true });
  await writeFile(path.join(ROOT, 'docs', 'import-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Done: ${catList.length} categories, ${faqs.length} FAQs, ${report.warnings.length} warnings, ${report.failed.length} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
