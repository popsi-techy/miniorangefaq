/**
 * miniOrange design tokens — the single source of truth for visual values.
 *
 * Three layers:
 *  1. `color`   — the brand palette (fixed hex values from the brief). Never used directly in components.
 *  2. `scheme`  — semantic roles per colour scheme (light / dark), mapped onto the palette.
 *                 Published as CSS variables (`var(--surface)`, `var(--text)` …) that switch with the theme.
 *  3. Scales    — type, spacing, radius, icon size, layout, motion.
 *
 * Components use `cssVar.*` (or `var(--…)` in CSS). Never hardcode a colour, size or radius.
 * If a value is missing, add it here, document it in docs/design-system.md, and update AGENTS.md.
 */

/* ---------------------------------------------------------------- 1. Palette */

export const color = {
  primary: '#EB5424',
  primaryHover: '#D9471B',
  primaryPressed: '#C83C16',
  textPrimary: '#232323',
  textSecondary: '#666666',
  textDarkPrimary: '#FFFFFF',
  textDarkSecondary: '#B3B3B3',
  backgroundPrimary: '#FFFFFF',
  backgroundBlack: '#171717',
  backgroundGrey: '#F5F5F5',
  iconPrimary: '#EB5424',
  iconSecondary: '#666666',
  iconInverse: '#FFFFFF',
  strokeInactive: '#E5E4F4',
  strokeActive: '#D0D1DC',
  strokeDarkInactive: '#454545',
  strokeDarkActive: '#5C5C5C',
  shadow: '#D0D1DC',
  /** Wordmark grey of the official logo (src/assets/brand/logo-primary.svg). Logo only. */
  logoWordmark: '#5F6062',
} as const;

/** Appends an alpha channel to a #RRGGBB palette colour (no new hues are introduced). */
const a = (hex: string, alpha: number) => `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

/* ------------------------------------------------------- 2. Semantic roles */

export interface SchemeRoles {
  /** Page background */
  surface: string;
  /** Quiet fills: hover rows, code blocks, input backgrounds on hover */
  surfaceSubtle: string;
  /** Selected list item, pressed row */
  surfaceSelected: string;
  /** Inverted surface: selected chips/pages, tooltips */
  surfaceInverse: string;
  /** Header background (translucent for the blur effect) */
  surfaceHeader: string;
  text: string;
  textMuted: string;
  textInverse: string;
  icon: string;
  border: string;
  borderStrong: string;
  /** Brand accent: primary buttons, focus ring, active indicators, logo */
  accent: string;
  accentHover: string;
  accentPressed: string;
  /** Faint accent fill for search-term highlights */
  accentSoft: string;
  onAccent: string;
  focusRing: string;
  /** Error state: text/border; always paired with an icon and message */
  danger: string;
  shadowPopover: string;
  shadowCard: string;
  /** Hover lift for clickable cards (list items use surfaceSubtle instead) */
  shadowLift: string;
  /** Logo wordmark colour (grey on light, white on dark) */
  logoText: string;
  /** Homepage hero only (decorative): side glow, top glow, contour lines */
  heroGlow: string;
  heroGlowSoft: string;
  heroLine: string;
  /** Inner-page header wash (decorative) */
  pageGlow: string;
}

export const scheme: Record<'light' | 'dark', SchemeRoles> = {
  light: {
    surface: color.backgroundPrimary,
    surfaceSubtle: color.backgroundGrey,
    surfaceSelected: a(color.textPrimary, 0.07), // neutral grey (~#EDEDED on white), darker than surfaceSubtle
    surfaceInverse: color.backgroundBlack,
    surfaceHeader: a(color.backgroundPrimary, 0.85),
    text: color.textPrimary,
    textMuted: color.textSecondary,
    textInverse: color.textDarkPrimary,
    icon: color.iconSecondary,
    // Neutral greys (text colour at low alpha) instead of the palette's cool-tinted strokes
    border: a(color.textPrimary, 0.1), // ~#E9E9E9 on white
    borderStrong: a(color.textPrimary, 0.2), // ~#D3D3D3 on white
    accent: color.primary,
    accentHover: color.primaryHover,
    accentPressed: color.primaryPressed,
    accentSoft: a(color.primary, 0.14),
    onAccent: color.textDarkPrimary,
    focusRing: color.primary,
    danger: color.primaryPressed,
    shadowPopover: `0 12px 32px -12px ${a(color.textPrimary, 0.18)}, 0 0 0 1px ${a(color.textPrimary, 0.1)}`,
    shadowCard: `0 1px 2px ${a(color.textPrimary, 0.04)}`,
    shadowLift: `0 6px 16px -8px ${a(color.textPrimary, 0.1)}, 0 1px 3px ${a(color.textPrimary, 0.03)}`,
    logoText: color.logoWordmark,
    heroGlow: a(color.primary, 0.1),
    heroGlowSoft: a(color.primary, 0.04),
    heroLine: a(color.primary, 0.3),
    pageGlow: a(color.primary, 0.07),
  },
  dark: {
    surface: color.backgroundBlack,
    surfaceSubtle: a(color.textDarkPrimary, 0.04),
    surfaceSelected: a(color.textDarkPrimary, 0.08),
    surfaceInverse: color.textDarkPrimary,
    surfaceHeader: a(color.backgroundBlack, 0.8),
    text: color.textDarkPrimary,
    textMuted: color.textDarkSecondary,
    textInverse: color.backgroundBlack,
    icon: color.textDarkSecondary,
    border: color.strokeDarkInactive,
    borderStrong: color.strokeDarkActive,
    accent: color.primary,
    accentHover: color.primaryHover,
    accentPressed: color.primaryPressed,
    accentSoft: a(color.primary, 0.24),
    onAccent: color.textDarkPrimary,
    focusRing: color.primary,
    danger: color.primary,
    shadowPopover: `0 12px 32px -12px ${a(color.backgroundBlack, 0.9)}, 0 0 0 1px ${color.strokeDarkInactive}`,
    shadowCard: 'none',
    shadowLift: `0 8px 20px -10px ${a(color.backgroundBlack, 0.7)}`,
    logoText: color.textDarkPrimary,
    heroGlow: a(color.primary, 0.1),
    heroGlowSoft: a(color.primary, 0.035),
    heroLine: a(color.primary, 0.38),
    pageGlow: a(color.primary, 0.08),
  },
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** `cssVar.text` → 'var(--text)'. Use these in `sx` so colours follow the active scheme. */
export const cssVar = Object.fromEntries(
  Object.keys(scheme.light).map((k) => [k, `var(--${kebab(k)})`]),
) as Record<keyof SchemeRoles, string>;

/* ------------------------------------------------------------------ 3. Scales */

export const font = {
  family: '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  familyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  weightRegular: 400,
  weightMedium: 500,
  weightSemibold: 600,
} as const;

/**
 * Type scale. Only these sizes may be used.
 * Poppins has a large x-height, so the UI runs a step smaller than with most fonts;
 * hierarchy comes from clear jumps between small text (12–15) and headings (18+).
 */
export const fontSize = {
  xs: '0.75rem', // 12 — meta (dates, views, category line), overline
  sm: '0.8125rem', // 13 — breadcrumbs, helper text, small buttons, footer links
  md: '0.875rem', // 14 — UI body, sidebar items, inputs, buttons
  lg: '0.9375rem', // 15 — question & card titles, article body, lead
  xl: '1.125rem', // 18 — section headings
  '2xl': '1.375rem', // 22 — page title (mobile), article h2
  '3xl': '1.875rem', // 30 — page title (desktop), hero (mobile)
  '4xl': '2.5rem', // 40 — homepage hero (desktop)
} as const;

export const letterSpacing = {
  tight: '-0.03em', // hero, page titles
  snug: '-0.015em', // section headings
  normal: '0',
  wide: '0.06em', // overline
} as const;

/** Icon sizes in px. */
export const iconSize = {
  xs: 14, // inline with meta text
  sm: 16, // inline with UI text, breadcrumbs, buttons
  md: 18, // default UI icons (header, inputs)
  lg: 20, // callout icons
  xl: 32, // empty and error states
  product: 40, // featured product marks inside the 52px plate
} as const;

export const lineHeight = {
  tight: 1.15, // display: hero, page titles
  snug: 1.35, // headings
  title: 1.45, // question / card titles (often wrap to two lines)
  body: 1.6, // UI text
  article: 1.75, // long-form answers
} as const;

/** MUI `theme.spacing(n)` = n * 8px (use 0.5 steps for 4px). */
export const spacingUnit = 8;

export const radius = {
  sm: 4, // chips, kbd, inline code, highlights
  md: 6, // buttons, inputs, list rows
  lg: 8, // cards, panels, popovers, images
  pill: 999, // filter pills
} as const;

export const layout = {
  pageMaxWidth: 1120,
  /** Reading width for article bodies (~70 characters at 15px). */
  readingMaxWidth: 680,
  sidebarWidth: 232,
  /** Right-hand column beside an article (related questions); wider than the nav sidebar for two-line titles. */
  asideWidth: 288,
  headerHeight: 56,
  /** Default control height on pointer devices. */
  controlHeight: 36,
  /** Homepage search. */
  controlHeightLarge: 48,
  /** Minimum control height on touch devices (WCAG 2.5.5 target size). */
  touchTarget: 44,
} as const;

export const motion = {
  duration: '120ms',
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/** CSS custom properties: palette + scales on :root, semantic roles per scheme (see ThemeRoot). */
export const rootCssVariables: Record<string, string> = {
  '--color-primary': color.primary,
  '--color-primary-hover': color.primaryHover,
  '--color-primary-pressed': color.primaryPressed,
  '--color-text-primary': color.textPrimary,
  '--color-text-secondary': color.textSecondary,
  '--color-text-dark-primary': color.textDarkPrimary,
  '--color-text-dark-secondary': color.textDarkSecondary,
  '--color-background-primary': color.backgroundPrimary,
  '--color-background-black': color.backgroundBlack,
  '--color-background-grey': color.backgroundGrey,
  '--color-icon-primary': color.iconPrimary,
  '--color-icon-secondary': color.iconSecondary,
  '--color-icon-inverse': color.iconInverse,
  '--color-stroke-inactive': color.strokeInactive,
  '--color-stroke-active': color.strokeActive,
  '--color-stroke-dark-inactive': color.strokeDarkInactive,
  '--color-stroke-dark-active': color.strokeDarkActive,
  '--shadow-color': color.shadow,
  '--font-family': font.family,
  '--font-family-mono': font.familyMono,
  '--radius-sm': `${radius.sm}px`,
  '--radius-md': `${radius.md}px`,
  '--radius-lg': `${radius.lg}px`,
  '--header-height': `${layout.headerHeight}px`,
  '--motion-duration': motion.duration,
  '--motion-easing': motion.easing,
};

export function schemeCssVariables(name: 'light' | 'dark'): Record<string, string> {
  return Object.fromEntries(Object.entries(scheme[name]).map(([k, v]) => [`--${kebab(k)}`, v]));
}
