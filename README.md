# miniOrange Knowledge Base

A redesigned, responsive FAQ portal for miniOrange products — search, browse by product and
topic, read answers, and contact support. Built with React 19, TypeScript, React Router 7 and
MUI 9; content is static JSON imported from `faq.miniorange.in`.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run lint
```

## Routes

| URL | Page |
|---|---|
| `/` | Home: search with suggestions, featured products, all products, most viewed, recently updated |
| `/categories` | Removed — redirects to `/` (the homepage lists every product) |
| `/kb/<product>[/<topic>]` | Category: topic sidebar (pills on mobile), filter, sort, pagination (`?q= ?sort= ?page=`) |
| `/knowledgebase/<slug>` | Question & answer, side panel (details, feedback, contact support), related questions |
| `/search?q=` | Results with highlights, result count, product filter (`?product=`), pagination |
| `/support[?article=<slug>]` | Support form (source fields) and other help channels |
| `/?s=<term>` | Legacy WordPress search URL → redirected to `/search` |

Category and article URLs match the original site, so existing links keep working.
The app is a single-page app: configure the host to serve `index.html` for unknown paths
(e.g. Netlify `/* /index.html 200`, Nginx `try_files $uri /index.html`).

## Content

- **Representative sample:** all 82 categories, and up to **10 questions per category**
  (most viewed) — 548 questions with full answers. Raise `MAX_PER_CATEGORY` in
  `scripts/import-faq.mjs` and run `npm run import:faq` to import more.
- Images are hot-linked from the source site.
- See `docs/content-model.md` and `docs/audit.md`.

## Not connected (by design, clearly labelled in the UI)

- **Support form** — no public API exists; submitting opens a pre-filled email to
  info@xecurify.com. Set `support.endpoint` in `src/data/site-config.json` to POST instead.
- **"Was this helpful?"** — saved in the browser only. Set `feedback.endpoint` to send votes.
- **Views / popularity** — snapshot from the source at import time, not live analytics.

## Contributing

Read [`AGENTS.md`](AGENTS.md) before any change. Design tokens and component patterns are in
[`docs/design-system.md`](docs/design-system.md).
