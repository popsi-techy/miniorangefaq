# Content model

All content is static JSON in `src/data/`, typed in `src/types/faq.ts`, and read only through
`src/lib/content.ts`. JSON files are **read-only at runtime**; nothing writes to them from the app.

| File | Contents |
|---|---|
| `categories.json` | All 82 categories (25 products + 57 topics) |
| `faqs.json` | FAQ index: metadata + excerpt for every imported question (loaded on start) |
| `articles/<product-id>.json` | `{ [faqId]: Block[] }` article bodies, one file per product, **lazy-loaded** |
| `category-display.json` | Hand-maintained display overrides keyed by category slug, e.g. `{"saml-single-sign-on": {"shortName": "WordPress"}}` (not touched by the importer) |
| `navigation.json` | Header menus, header CTA, footer columns, legal and social links |
| `site-config.json` | Site name/copy, contact details, support/feedback endpoints, page size |

## Category

```jsonc
{
  "id": "idp--admin",          // stable; path with "/" → "--"
  "slug": "idp/admin",         // URL: /kb/idp/admin (same as the source site)
  "name": "Admin",
  "parentId": "idp",           // null for products
  "order": 0,                  // source order within parent
  "featured": false,           // primary product tile on the homepage
  "logo": null,                // product logo URL from the source homepage
  "description": null,         // the source has none; shown when provided
  "sourceUrl": "https://faq.miniorange.in/kb/idp/admin/",
  "sourceQuestionCount": 30    // questions listed on the source page (for reference)
}
```

Question counts shown in the UI are computed from `faqs.json` (category + descendants).

## FAQ

```jsonc
{
  "id": "how-to-generate-on-premise-license",
  "slug": "how-to-generate-on-premise-license",   // URL: /knowledgebase/<slug>
  "title": "How to generate On-premise License?",
  "categoryId": "licensing",                       // most specific category
  "excerpt": "Login to admin account in On-Premise IdP. Go to Settings…",
  "tags": [],                                      // optional; searched when present
  "relatedFaqIds": ["steps-to-update-the-license-on-the-onpremise-idp"],
  "updatedAt": "2025-01-08",
  "publishedAt": "2020-05-29",
  "views": 3652,                                    // source view counter at import
  "helpful": { "yes": 7, "no": 1 },                 // source votes at import
  "sourceUrl": "https://faq.miniorange.in/knowledgebase/how-to-generate-on-premise-license/"
}
```

A question belongs to exactly one category; parents aggregate their topics, so content is never
duplicated across categories.

## Article body (`Block[]`)

Rendered by `ArticleContent` without any raw HTML, so imported content cannot inject script.

```ts
type Inline = { t: 'text'; v: string; marks?: ('bold'|'italic'|'underline'|'code')[] }
            | { t: 'link'; href: string; children: Inline[] }
            | { t: 'br' };
type Block  = { type: 'heading'; level: 2|3|4; content: Inline[] }
            | { type: 'paragraph'; content: Inline[] }
            | { type: 'list'; ordered: boolean; start?: number; items: Block[][] }
            | { type: 'image'; src; alt; width?; height?; caption? }
            | { type: 'table'; rows: { header: boolean; content: Inline[] }[][] }
            | { type: 'code'; code: string; language?: string }
            | { type: 'video'; provider: 'youtube'|'vimeo'; videoId; title } | { type: 'video'; provider: 'file'; src; title }
            | { type: 'note'; blocks: Block[] }
            | { type: 'divider' };
```

Links: `/knowledgebase/<slug>` and `/kb/<path>` route in-app. If a linked article is not in the
imported set, the renderer sends it to the source site instead. Images are hot-linked from
`faq.miniorange.in/wp-content/uploads/…` (not copied into the repo).

## Importing / updating content

```bash
npm run import:faq            # uses .cache/kb for pages already fetched
npm run import:faq -- --refresh
```

`scripts/import-faq.mjs`:

1. Crawls the homepage product list and every `/kb/` page (products → topics).
2. Reads `manual_kb-sitemap*.xml`.
3. Assigns each listed question to its deepest category and keeps the
   `MAX_PER_CATEGORY` (= 10) most-viewed per category — raise this constant to import more.
4. Fetches each article, converts the HTML body to `Block[]`, collects related articles,
   views, helpful votes and modified date.
5. Writes `categories.json`, `faqs.json`, `articles/*.json` and `docs/import-report.json`
   (counts, failures, skipped pages, mismatches).

Re-running fully regenerates those files; hand edits to them will be overwritten. To add or
edit content by hand, edit the JSON directly (keep ids stable) and do not re-run the import,
or move the hand-maintained content to a separate file.

## Mutable data (not stored in JSON)

| Interaction | Behaviour now | To make it real |
|---|---|---|
| Support form | Validates, then opens a pre-filled email to info@xecurify.com (stated in the UI) | Set `support.endpoint` to a POST URL accepting `{email, number, requestType, query, website}` |
| Article feedback | Saved in `localStorage` only (stated in the UI) | Set `feedback.endpoint` to a POST URL accepting `{faqId, helpful}` |
| Views / popularity | Static snapshot from the source | Needs an analytics API |
