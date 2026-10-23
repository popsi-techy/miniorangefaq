# Design system

Minimal, monochrome, compact — orange is a sparse accent. Light and dark themes (light default,
header toggle). Single source: `src/theme/tokens.ts` → MUI theme (`src/theme/theme.ts`) and CSS
custom properties published by `src/theme/ThemeRoot.tsx`. Update this page whenever a token,
variant or shared component changes.

## Decisions (agreed with the product owner, Oct 2026)

| Topic | Decision |
|---|---|
| Typeface | Poppins (Google Fonts, weights 400/500/600) |
| Themes | Light + dark, defaults to light until the user toggles (stored in `localStorage["mui-mode"]`) |
| Orange use | Primary buttons, focus ring, selected filter pills, small active indicators (sidebar bar, header underline), search highlights, logo. **Never** text colour or hover colour |
| Density | 16px UI text, 17px article body, 36px controls (44px on touch devices) |
| Lists | No excerpts. Dates and view counts kept. Page subtitles kept |
| Counts | No question/product/topic counts anywhere (cards, lists, sidebar, pills, headers, pagination). Only search/filter result counts ("32 results") are shown |
| Header | Placeholder for the miniOrange global header (out of scope), modelled on miniorange.com: logo · Products ▾ · Resources ▾ · light/dark switch · Contact Support (primary button). Sticky and identical on every page — no search, no active states. Menu items pending from the product owner (`navigation.json › header`; empty menus show "Links coming soon") |
| Page headers | Every page except Home uses the centred `PageHeader` ("mini hero"): breadcrumbs or back link → H1 → subtitle/meta → controls → the same search as the homepage (hero size, 600px, with Search button), all centred. Full-width background: soft orange wash from the top centre (`pageGlow`) over a grey-to-white fade, full-width divider below — deliberately different from the homepage hero (no lines, no corner glows). Search page breadcrumb is Home / Search, and the page shows its large search in place of the default one. On scroll, that search pins under the global header and the field shortens from 48px to 44px (with inset around the Search button) |
| Footer | Unchanged dark footer with the source site's link columns |
| Homepage hero | Compact (64px top/bottom on desktop), full-width backdrop: faint orange glow in the top-left and bottom-right corners + faint top glow, and static bundles of diagonal wavy lines in those two (diagonally opposite) corners (md+), fading toward the centre. Divider line below. No cards, no animation. Gradients are allowed only here and in the page header |
| Input borders | Kept light (`border`, ~1.2:1) by product-owner decision (Oct 2026); fields are identified by labels, placeholders and icons. Do not change without asking |
| Logo | Official file `src/assets/brand/logo-primary.svg`, rendered by `MiniOrangeLogo` (inline SVG). Wordmark grey #5F6062 on light, white on dark and in the footer (`logoText` token); orange O + leaf unchanged. Header shows the logo only. Favicon = the O + leaf mark |

## Colour

### Palette (fixed, from the brief)

`color.*` in tokens.ts / `--color-*` CSS variables: primary #EB5424, primaryHover #D9471B,
primaryPressed #C83C16, textPrimary #232323, textSecondary #666666, textDarkPrimary #FFFFFF,
textDarkSecondary #B3B3B3, backgroundPrimary #FFFFFF, backgroundBlack #171717,
backgroundGrey #F5F5F5, strokeInactive #E5E4F4, strokeActive #D0D1DC, strokeDarkInactive #454545,
strokeDarkActive #5C5C5C, shadow #D0D1DC. Components never use these directly.

### Semantic roles (`cssVar.*` / `var(--…)`) — switch with the theme

| Role | Light | Dark | Use |
|---|---|---|---|
| `surface` | #FFFFFF | #171717 | Page background |
| `surfaceSubtle` | #F5F5F5 | white 4% | Hover rows, code blocks, compact search field |
| `surfaceSelected` | text 7% (neutral ~#EDEDED) | white 8% | Active nav item, focused option, current page |
| `surfaceInverse` / `textInverse` | #171717 / #FFF | #FFF / #171717 | Pressed feedback buttons, tooltips |
| `surfaceHeader` | white 85% | #171717 80% | Translucent sticky header (with blur) |
| `text` | #232323 | #FFFFFF | Body, titles, links |
| `textMuted` | #666666 | #B3B3B3 | Meta, subtitles, inactive nav |
| `icon` | #666666 | #B3B3B3 | UI icons |
| `border` | text 10% (neutral ~#E9E9E9) | #454545 | Dividers, cards, inputs |
| `borderStrong` | text 20% (neutral ~#D3D3D3) | #5C5C5C | Hover borders |
| `accent` (+Hover/Pressed) | #EB5424 | #EB5424 | Primary buttons, indicators, focus ring |
| `accentSoft` | orange 14% | orange 24% | Search-term highlight |
| `danger` | #C83C16 | #EB5424 | Error border/text (always with icon + message) |
| `logoText` | #5F6062 | #FFFFFF | Logo wordmark only |
| `pageGlow` | orange 7% | orange 8% | Inner-page header wash only |
| `heroGlow` / `heroGlowSoft` / `heroLine` | orange 10% / 4% / 30% | orange 10% / 3.5% / 38% | Homepage hero decoration only |
| `shadowPopover`, `shadowCard` | soft shadow + 1px ring | ring only / none | Menus, autocomplete; cards |

Alpha variants (e.g. "white 4%", "text 10%") are palette colours with transparency — no new hues. In light mode all greys (hover, selected, borders) are neutral; the palette's cool-tinted strokes (#E5E4F4, #D0D1DC) are not used by components.

### Contrast (measured)

| Pair | Ratio |
|---|---:|
| text on surface — light / dark | 15.7 / 17.9 |
| textMuted on surface — light / dark | 5.7 / 8.6 |
| focus ring #EB5424 on white / on #171717 | 3.6 / 5.0 (≥ 3:1 for UI) |
| **white on #EB5424 (primary button label)** | **3.6 — below 4.5:1** |
| **border (text 10%) on white (input outline)** | **~1.2 — below 3:1** |

Known gaps from the palette, awaiting a brand decision: (1) primary button labels — switch
`accent` to `color.primaryPressed` (5.1:1) or darken; (2) input outlines — **accepted as-is** by the product owner (see Decisions).

## Typography (Poppins)

Poppins has a large x-height, so the UI runs a step smaller than with most fonts. Hierarchy comes
from **clear size jumps** between small text (12–15px) and headings (18px+), **weight discipline**
and **muted colour** for secondary information — not from making everything bigger or bolder.

| Variant | Size | Weight | Line height | Use |
|---|---|---|---|---|
| `hero` | 30 → 40px, −0.03em | 600 | 1.15 | Homepage heading only |
| `h1` | 22 → 30px, −0.03em | 600 | 1.15 | Page title (one per page) |
| `h2` | 18px, −0.015em | 600 | 1.35 | Section headings (Products, Most viewed, Related questions) |
| `h3` | 15px | 600 | 1.35 | Sub-headings (sidebar "Topics") |
| `h4` | 14px | 600 | 1.35 | Small headings (callouts, "Was this helpful?", product cards) |
| `h5` | 15px | 500 | 1.45 | Question / card titles — the only 500s in a list |
| `h6` | 13px | 600 | 1.35 | Footer column headings |
| `body1` | 14px | 400 | 1.6 | UI text, sidebar items, inputs |
| `body2` | 13px | 400 | 1.6 | Secondary text, breadcrumbs, helper text |
| `lead` | 14 → 15px, muted | 400 | 1.6 | Page intro |
| `meta` | 12px, muted, tabular | 400 | 1.5 | Dates, views, category line |
| `overline` | 12px, 0.06em | 500 | 1.35 | Small labels |
| Article body | 15px | 400 | 1.75 | `ArticleContent`; h2 22px, h3 18px, h4 15px |

Weight rules: 400 for running text, sidebar and footer; 500 only for question/card titles and the
active sidebar item; 600 only for real headings. Never bold whole rows.

Spacing rhythm (8px grid): section → section 96px (homepage), heading → content 16px, list rows
14px vertical padding (≈72px with the category line), sidebar items 36px, breadcrumb → title 12px.

## Scales

- **Spacing**: MUI 8px scale (`0.5` = 4px). Sections 56–80px apart; rows 10px vertical padding.
- **Radius**: `sm` 4 (inline code, highlight), `md` 6 (buttons, inputs, rows), `lg` 8 (cards, popovers, images), `pill` 999.
- **Icon size**: xs 14 (meta), sm 16 (buttons, inputs, rows), md 18 (header), lg 20, xl 32 (empty states), product 40 (featured product marks).
- **Layout**: page 1120px, reading 680px, sidebar 232px, article aside 288px (`asideWidth`), header 56px.
- **Controls**: 36px (pointer), 44px under `(pointer: coarse)`, hero search 48px.
- **Motion**: 120ms `cubic-bezier(0.2,0,0,1)`, disabled under reduced motion.

## Interaction rules

- Hover rule: **cards lift, list items change colour.** Bordered cards (product tiles) rise 2px with the light `shadowLift` (no colour change, no resting shadow). Everything not in a card — question rows, category lists, product headings, sidebar items — gets the `surfaceSubtle` grey background **and** a small → `HoverArrow` that slides in on the right (also on keyboard focus). Filter pills get the grey background only. Text never turns orange.
- Links: text colour; underline appears on hover (UI) or is always present in article bodies (muted underline).
- Active/selected: `surfaceSelected` + a 2px orange indicator (sidebar). Selected filter pills use the primary orange fill with light text. The header has no active states.
- Focus: 2px orange outline, 2px offset, on every interactive element (`styles/global.css`).
- Inputs: labels above the field (no floating labels); focus = stronger border + soft ring.

## Shared components

| Component | Purpose / key props |
|---|---|
| `PageContainer` | Page frame (1120px) and gutters |
| `PageHeader` | centred page header: `breadcrumbs`, `title`/`titleId`, `subtitle` (text or meta row), `children` (controls), `search` (default true); divider below; `flush` removes the bottom margin so content can meet the divider |
| `SectionHeading` | section title + optional `action={{ label, href }}` link or `trailing` control (e.g. `SortSelect` on category pages) |
| `Breadcrumbs` | `items: {label, to?}[]`, "/" separators; Home is implicit |
| `SearchInput` | `size: 'hero' \| 'compact'`; suggestions (popular when empty; categories + questions + "See all") |
| `SortSelect` | compact sort dropdown (`options` map, `disabledLabel`) |
| `FilterPill` | facet / mobile-topic pill; `to` (link) or `onClick` (toggle); selected = primary orange fill |
| `QuestionList` / `QuestionRow` | title (+ `showCategory`), `showDate`, `showViews` right-aligned; hover arrow |
| `CategoryCard` | featured product tile: centred 52px logo plate, 40px mark, semibold short name (`getShortName`, `category-display.json`); 6 per row on desktop, 3 on tablet, 2 on mobile |
| `CategoryList` | `variant: 'grid' \| 'nav'`; names only; `currentId` gets the orange indicator |
| `ArticleContent` | renders `Block[]` (no raw HTML) |
| `RelatedQuestions`, `ArticleFeedback`, `SupportCallout`, `SupportForm` | related list, feedback bar under the answer (bordered, `surfaceSubtle`), support entry, support form |
| `MetaItem` | icon + meta text |
| `HoverArrow` + `hoverArrowRevealSx` | → arrow revealed on hover/focus for linked list items; put it last in the item and spread the sx into the item |
| `ThemeToggle` | segmented sun/moon switch (header) |
| `EmptyState` / `LoadingState` / `ErrorState` | standard states |
| `ListPagination` | centred “Load more” control (no counts); list grows in place, `?page=` still tracks depth for Back |

## Patterns

- **Sidebar navigation** (category pages, md+): "All questions" plus any product topics. A product with no topics still shows "All questions". Sits at the page container's left margin and is sticky (no divider line); active item = grey background + orange bar; simple "Topics" heading (h3 style, normal text colour). The page header is `flush` here. Mobile shows the same as a scrolling pill row.
- **Category page layout**: the body uses the full page container width — topics rail (232px) at the left content margin, a 48px column gap, then the question list: a `SectionHeading` naming the current topic ("All questions" or the topic name; the page header title always stays the product name) with `SortSelect` on the right — the page-header search is the only search on the page — followed by the questions and support callout filling the remaining width to the right margin. Question rows are ~64px (`py: 1.25`).
- **Article with related sidebar** (trial, per question): slugs listed in `site-config.json › article.relatedSidebarSlugs` show the answer at reading width (680px) with `RelatedQuestions variant="sidebar"` in a 288px sticky right column (48–64px gap; compact `QuestionRow size="compact"`, `SectionHeading size="small"`). The column is capped to the viewport height and scrolls on its own if needed; below md it stacks under the answer. All other questions keep related questions below the answer.
- **Question pages**: the same centred `PageHeader` as other pages (category breadcrumbs, product name as H1, search). Above the question, "Back to all questions" returns to that product. The question is the article title (24→28px), with views, date and likes under it, then the answer at reading width. "Was this helpful?" is a bordered bar under the answer, then related questions.
- **List state in the URL** (`useUrlParams`): filter, sort, facet, page — Back restores lists.
- **Return context**: list rows pass `linkState` so Back from the browser restores the list.
- **Page metadata**: every page calls `usePageMeta`.
