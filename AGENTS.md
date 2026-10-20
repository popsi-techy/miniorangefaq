# AGENTS.md — miniOrange Knowledge Base

Mandatory instructions for every change to this repository, by people or AI agents.
They apply to every UI change, new page, component and feature. `CLAUDE.md` imports this
file; do not create a competing instruction file.

## Project at a glance

- React 19 + TypeScript + Vite, React Router 7 (data router), MUI 9, `@mui/icons-material`.
- Content lives in JSON under `src/data/` and is read **only** through `src/lib/content.ts`.
- Design tokens: `src/theme/tokens.ts` (single source). MUI theme: `src/theme/theme.ts`
  (light + dark colour schemes). Semantic tokens are published as CSS variables that switch
  with the theme (`var(--text)`, `var(--surface-subtle)` …); use them via `cssVar.*`.
- Brand logo: `src/assets/brand/logo-primary.svg` → `MiniOrangeLogo`. Never recolour the orange O / leaf;
  only the wordmark follows the `logoText` token. Use `<Logo />` rather than the SVG directly.
- Visual direction: minimal, monochrome, Linear-like; Poppins; orange only as a sparse accent.
  See the decision table in `docs/design-system.md`.
- Docs: `docs/design-system.md` (tokens, components, patterns), `docs/content-model.md`
  (JSON schema, import), `docs/audit.md` (reference-site audit and inventory).

```
src/
  app/          App.tsx, routes.tsx (URL map)
  components/
    common/     AppLink, PageContainer, PageHeader, SectionHeading, MetaItem,
                FilterPill, SortSelect, EmptyState, LoadingState, ErrorState, ListPagination
    layout/     AppShell, Header (global-header placeholder), Footer, Logo, MiniOrangeLogo, Breadcrumbs, ThemeToggle
    search/     SearchInput (autocomplete), HighlightedText
    faq/        CategoryCard, CategoryList, QuestionRow, QuestionList,
                ArticleContent (block renderer), RelatedQuestions
    home/       HeroBackdrop (corner glow + diagonal wavy lines)
    feedback/   ArticleFeedback
    support/    SupportForm, SupportCallout
  hooks/        usePageMeta, useUrlParams
  lib/          content.ts, search.ts, format.ts, pagination.ts, supportValidation.ts
  pages/        one file per route
  theme/        tokens.ts, theme.ts, ThemeRoot.tsx, a11y.ts
  types/        faq.ts (content model types)
  data/         categories.json, faqs.json, articles/*.json, navigation.json, site-config.json
scripts/        import-faq.mjs (content import from faq.miniorange.in)
```

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Re-import content | `npm run import:faq` (add `-- --refresh` to bypass the cache) |

There is no automated test suite yet. Until one exists, verify changes in the browser (Rule 12).

---

## Rule 0 — Ask, don't assume

Do not assume design or product decisions (typefaces, colours, layout direction, copy, what to
add or remove, new features). List the open choices and ask the product owner before
implementing. Only decisions recorded in `docs/design-system.md › Decisions` or stated in the
request may be treated as settled.

## Header is out of scope

`Header` is a placeholder for the miniOrange global header (logo · Products ▾ · Resources ▾ ·
light/dark switch · Contact Support). Keep it identical on every page
(sticky; no page-specific content, search or active states) and do not redesign it. Page-level
navigation and search belong in page content (`PageHeader`, sidebars).

## Rule 1 — Design system first

Before creating a component or page, read `src/theme/tokens.ts`, `src/theme/theme.ts`,
the components in `src/components/` and `docs/design-system.md`.
Reuse what exists. If a needed component does not exist, create a **reusable, documented**
component in the right `components/` folder — never a one-off inside a page.

## Rule 2 — Single source of truth

- Colours, typography, spacing, radii, shadows, icon sizes, layout widths and motion come
  from `tokens.ts` (in JS) or the CSS variables it publishes (in CSS / `sx` strings).
- Components use **semantic** colours only (`cssVar.text`, `cssVar.surfaceSubtle`, `cssVar.accent` …)
  so they work in both themes. Palette values (`color.*`, `var(--color-*)`) are reserved for the
  theme and for the always-dark footer.
- Hex values, `rgb()`, font sizes, font families, radii and shadows must not appear anywhere
  except `src/theme/`. Check with:
  `rg -n "#[0-9A-Fa-f]{3,6}\b|rgba?\(|fontFamily|boxShadow: '" src --glob '!src/theme/**' --glob '!src/data/**'`
- Spacing uses the MUI spacing scale (`p: 2` = 16px). Do not use raw pixel spacing.
- Need a new value? Add it to `tokens.ts` with a comment explaining its purpose, wire it into
  the theme if relevant, and document it in `docs/design-system.md`.
- Content and configuration (copy, links, contact details, feature flags, endpoints) belong in
  `src/data/*.json`, not in components.

## Rule 3 — Consistent MUI implementation

- Use MUI components and **only** `@mui/icons-material` icons (import per icon:
  `import SearchRounded from '@mui/icons-material/SearchRounded'`).
- Prefer the Rounded / Outlined icon families already in use.
- Do not add shadcn/ui, Lucide, Font Awesome, Heroicons, emoji icons, Tailwind, another
  component library, paid MUI X packages, or a second theme.
- MUI 9 API: use `slotProps` (not `InputProps`/`inputProps`), `Grid` with `size={{…}}`,
  and layout props inside `sx` (Stack no longer accepts `alignItems=` etc. as props).
- Internal links: MUI `Link`/`Button` with `href` are routed through `AppLink`
  automatically (client-side for `/paths`, new tab for external URLs). Use `component={RouterLink}`
  only when you need `to`/`state`.

## Rule 4 — Reuse before creating

Before adding any of these, use the existing one:

| Need | Use |
|---|---|
| Page width / gutters | `PageContainer` |
| Page header (centred breadcrumbs, H1, subtitle, search) | `PageHeader` + `Breadcrumbs` (not on Home) |
| Question feedback | `ArticleFeedback`, directly under the answer |
| Section title with "View all" or a trailing control (sort) | `SectionHeading` |
| Search field | `SearchInput` (`size="hero" \| "compact"`) |
| Sort a list | `SortSelect` |
| Facet filter / mobile topic nav | `FilterPill` |
| Light/dark switch | `ThemeToggle` |
| List of questions | `QuestionList` / `QuestionRow` (props for category, date, views, highlight — no excerpts) |
| List of categories | `CategoryList` (`variant="grid" \| "nav"`); featured product tile: `CategoryCard` |
| Article body | `ArticleContent` (structured blocks — never `dangerouslySetInnerHTML`) |
| Metadata (icon + text) | `MetaItem` |
| Hover arrow on a linked list item | `HoverArrow` + `hoverArrowRevealSx` |
| Empty / loading / error | `EmptyState`, `LoadingState`, `ErrorState` |
| Paging | `ListPagination` + `readPage()` |
| Filters / sort / page in URL | `useUrlParams()` |
| Title, description, canonical | `usePageMeta()` |
| Support entry point | `SupportCallout`; full form: `SupportForm` |
| Screen-reader-only text | `visuallyHidden` from `theme/a11y.ts` |

Extend shared components through typed props/variants. Do not copy a component to tweak it.

## Rule 5 — UX before decoration

Every element must serve a user task (find, read, navigate, get help). Search stays above the
fold on the homepage. No illustrations, large hero images, or extra cards that compete with
question titles. Gradients are allowed **only** in the homepage hero
(`HeroBackdrop`, `hero*` tokens) and the inner-page header (`PageHeader`, `pageGlow`) — nowhere else. Cards are used only for the featured product tiles. Keep copy short:
no explanatory sentences where a label suffices. Do not show question/product/topic counts;
only search and filter result counts are allowed.

## Rule 6 — No inconsistent one-off styling

New pages inherit the existing visual language: Poppins and the same type scale (`hero`,
`h1`–`h6`, `lead`, `body1`, `body2`, `meta`, `overline`), control heights (36px; 44px on touch;
48px hero search — handled by the theme), radii (4/6/8/pill), `divider` borders, and the
interaction rules: hover = **cards lift (`shadowLift`), list items get the subtle grey background + `HoverArrow`**, **never orange text or orange hover**; orange only for
primary buttons, focus ring, small active/selected indicators, search highlights and the logo.
Do not choose new colours, font families, font sizes, spacing scales, shadows or icon styles.

## Rule 7 — Accessibility is mandatory (WCAG 2.2 AA)

- Semantic landmarks and one `h1` per page; headings in order.
- Every control is keyboard-operable with the global visible focus ring (do not remove outlines).
- Accessible names on icon-only buttons (`aria-label`); decorative icons `aria-hidden`.
- Contrast: text ≥ 4.5:1 (large ≥ 3:1), UI components/graphics ≥ 3:1, in **both** themes. Text is
  never orange. See `docs/design-system.md › Contrast` for measured pairs and known gaps.
- Never convey state by colour alone (selected chips invert to black; errors have text + icon).
- No decorative animation anywhere (hero included); only short UI transitions (hover, menus).
- Status changes are announced (`aria-live`) — result counts, form outcomes, loading.
- Targets: 36px controls with a mouse, ≥ 44×44px under `(pointer: coarse)` (theme applies this;
  custom controls must do the same). Motion respects `prefers-reduced-motion` (global CSS).
- Images in articles need meaningful `alt` when the source provides it.

## Rule 8 — Responsive behaviour is mandatory

Every component must work at 375px, 768px, 1280px and 1536px, in light and dark. No horizontal page scroll
(wide tables/code scroll inside their own container), no clipped text, no tiny targets.
Note: in MUI `sx`, `width: 1` means **100%** — use `'1px'` for pixel values. Grid tracks that
contain scrolling rows must be `minmax(0, 1fr)`, not `1fr`.

## Rule 9 — Functional completeness and honesty

- Every visible control does something real. Handle loading, empty, error, disabled,
  success and validation states.
- **Never present simulated functionality as real.** This is a static site:
  - `site-config.json › support.endpoint` is `null` → the support form opens a pre-filled
    email and says so. Set a real endpoint to enable POST submission.
  - `feedback.endpoint` is `null` → votes are stored in this browser only and the UI says so.
  - Never write user data to JSON files; they are read-only at runtime.
- Do not invent categories, counts, article content, "trending" data or analytics.

## Rule 10 — Maintainable code

- Data access only via `lib/content.ts`; search logic only in `lib/search.ts`.
- Pages compose components; business logic lives in `lib/` or hooks; content in `data/`.
- Typed props, clear names, small components, no unused code, no unnecessary dependencies,
  no unrelated refactors. The React Compiler is active — avoid manual `useMemo`/`useCallback`
  unless profiling shows a need, and avoid `setState` inside effects (lint will warn).
- Keep stable URLs: `/kb/<path>`, `/knowledgebase/<slug>`, `/search?q=`, `/support` (`/categories` redirects to `/`).

## Rule 11 — Required pre-implementation checks

1. Inspect the affected page(s) and shared components.
2. Identify the tokens and component patterns to reuse (tables above).
3. Confirm the intended user flow (which journey A–E does it affect?).
4. Decide whether an existing component can be extended instead of adding one.
5. Implement the smallest consistent solution.

## Rule 12 — Required post-implementation checks

1. `npm run typecheck`, `npm run lint`, `npm run build` — all must pass with no warnings you introduced.
2. Run the app and verify the affected routes and interactions (journeys A–E below).
3. Check 375px / 768px / 1280px widths in light **and** dark, and that
   `document.documentElement.scrollWidth` does not exceed the viewport.
4. Tab through the change: focus visible, order logical, Escape closes overlays. Check contrast.
5. Search for duplicate components and hardcoded values (Rule 2 command).
6. Fix inconsistencies you introduced; update `docs/design-system.md` (and this file) whenever
   a reusable pattern, token or rule changes.

Do not mark work complete while build errors or broken core interactions remain.

### Core journeys to re-test

- **A Search:** Home → type (suggestions) → Enter → results → open → "Back to results" restores query/page.
- **B Browse:** Home → product card or product list → topic (sidebar / pills) → sort → open → Back restores the list.
- **C Discover:** Home → Most viewed / Recently updated → article → related questions.
- **D Support:** Article → "Contact support" / "No" feedback → `/support?article=…` pre-filled → validation.
- **E Direct entry:** open `/kb/idp/admin` and `/knowledgebase/<slug>` directly; unknown slugs show the 404 with suggestions.
