import { createTheme } from '@mui/material/styles';
import { AppLink } from '../components/common/AppLink';
import { color, cssVar, font, fontSize, layout, letterSpacing, lineHeight, motion, radius, scheme, spacingUnit } from './tokens';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    hero: React.CSSProperties;
    lead: React.CSSProperties;
    meta: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    hero?: React.CSSProperties;
    lead?: React.CSSProperties;
    meta?: React.CSSProperties;
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    hero: true;
    lead: true;
    meta: true;
  }
}

const breakpoints = { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } };
const up = (bp: keyof typeof breakpoints.values) => `@media (min-width:${breakpoints.values[bp]}px)`;
/** Larger hit areas on touch devices (WCAG 2.5.5); compact controls with a mouse. */
const touch = '@media (pointer: coarse)';
const transition = (...props: string[]) => props.map((p) => `${p} ${motion.duration} ${motion.easing}`).join(', ');

const paletteFor = (name: 'light' | 'dark') => {
  const s = scheme[name];
  return {
    primary: { main: color.primary, dark: color.primaryPressed, light: color.primaryHover, contrastText: color.textDarkPrimary },
    secondary: { main: s.surfaceInverse, contrastText: s.textInverse },
    error: { main: s.danger, contrastText: color.textDarkPrimary },
    text: { primary: s.text, secondary: s.textMuted },
    background: { default: s.surface, paper: s.surface },
    divider: s.border,
    action: { hover: s.surfaceSubtle, selected: s.surfaceSelected, disabled: s.textMuted, disabledBackground: s.surfaceSelected },
  };
};

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: { palette: paletteFor('light') },
    dark: { palette: paletteFor('dark') },
  },
  breakpoints,
  spacing: spacingUnit,
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily: font.family,
    fontWeightRegular: font.weightRegular,
    fontWeightMedium: font.weightMedium,
    fontWeightBold: font.weightSemibold,
    hero: {
      fontSize: fontSize['3xl'],
      fontWeight: font.weightSemibold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
      [up('md')]: { fontSize: fontSize['4xl'] },
    },
    h1: {
      fontSize: fontSize['2xl'],
      fontWeight: font.weightSemibold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
      [up('md')]: { fontSize: fontSize['3xl'] },
    },
    h2: { fontSize: fontSize.lg, fontWeight: font.weightSemibold, lineHeight: lineHeight.snug, letterSpacing: letterSpacing.snug },
    h3: { fontSize: fontSize.md, fontWeight: font.weightSemibold, lineHeight: lineHeight.snug },
    h4: { fontSize: fontSize.md, fontWeight: font.weightSemibold, lineHeight: lineHeight.snug },
    h5: { fontSize: fontSize.md, fontWeight: font.weightMedium, lineHeight: lineHeight.snug },
    h6: { fontSize: fontSize.sm, fontWeight: font.weightSemibold, lineHeight: lineHeight.snug },
    body1: { fontSize: fontSize.md, lineHeight: lineHeight.body },
    body2: { fontSize: fontSize.sm, lineHeight: lineHeight.body },
    lead: { fontSize: fontSize.md, lineHeight: lineHeight.body, color: cssVar.textMuted, [up('md')]: { fontSize: fontSize.lg } },
    meta: { fontSize: fontSize.xs, lineHeight: lineHeight.snug, color: cssVar.textMuted, fontVariantNumeric: 'tabular-nums' },
    caption: { fontSize: fontSize.xs, lineHeight: lineHeight.snug },
    overline: { fontSize: fontSize.xs, fontWeight: font.weightMedium, letterSpacing: letterSpacing.wide, lineHeight: lineHeight.snug },
    button: { fontSize: fontSize.md, fontWeight: font.weightMedium, textTransform: 'none', letterSpacing: 0 },
  },
  transitions: {
    easing: { easeInOut: motion.easing, easeOut: motion.easing, easeIn: motion.easing, sharp: motion.easing },
  },
  components: {
    MuiTypography: {
      defaultProps: { variantMapping: { hero: 'h1', lead: 'p', meta: 'span' } },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true, LinkComponent: AppLink },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: cssVar.accent,
            color: cssVar.onAccent,
            '&:hover': { backgroundColor: cssVar.accentHover },
            '&:active': { backgroundColor: cssVar.accentPressed },
          },
        },
      ],
      styleOverrides: {
        root: {
          minHeight: layout.controlHeight,
          paddingInline: spacingUnit * 1.75,
          borderRadius: radius.md,
          fontSize: fontSize.md,
          gap: spacingUnit * 0.75,
          transition: transition('background-color', 'border-color', 'color'),
          [touch]: { minHeight: layout.touchTarget },
          '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 },
          '& .MuiButton-startIcon > svg, & .MuiButton-endIcon > svg': { fontSize: 16 },
        },
        sizeSmall: { minHeight: 28, paddingInline: spacingUnit, fontSize: fontSize.sm, [touch]: { minHeight: layout.touchTarget } },
        sizeLarge: { minHeight: layout.controlHeightLarge, paddingInline: spacingUnit * 2.5 },
        outlined: {
          borderColor: cssVar.border,
          color: cssVar.text,
          backgroundColor: cssVar.surface,
          '&:hover': { borderColor: cssVar.borderStrong, backgroundColor: cssVar.surfaceSubtle },
        },
        text: {
          color: cssVar.textMuted,
          '&:hover': { backgroundColor: cssVar.surfaceSubtle, color: cssVar.text },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: layout.controlHeight,
          height: layout.controlHeight,
          borderRadius: radius.md,
          color: cssVar.icon,
          '& svg': { fontSize: 18 },
          '&:hover': { backgroundColor: cssVar.surfaceSubtle, color: cssVar.text },
          [touch]: { width: layout.touchTarget, height: layout.touchTarget },
        },
        sizeSmall: { width: 28, height: 28, '& svg': { fontSize: 16 } },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'none', component: AppLink },
      styleOverrides: {
        root: {
          color: cssVar.text,
          fontWeight: font.weightMedium,
          textDecorationColor: cssVar.borderStrong,
          textUnderlineOffset: '0.2em',
          transition: transition('color', 'text-decoration-color'),
          '&:hover': { textDecorationColor: cssVar.text },
        },
      },
    },
    MuiTextField: {
      // Labels sit above fields (no floating/notched label)
      defaultProps: { slotProps: { inputLabel: { shrink: true } } },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          position: 'static',
          transform: 'none',
          marginBottom: spacingUnit * 0.75,
          fontSize: fontSize.sm,
          fontWeight: font.weightMedium,
          color: cssVar.text,
          '&.Mui-focused': { color: cssVar.text },
          '&.Mui-error': { color: cssVar.text },
        },
        asterisk: { color: cssVar.textMuted },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          fontSize: fontSize.md,
          backgroundColor: cssVar.surface,
          transition: transition('background-color', 'box-shadow'),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: cssVar.border, top: 0, transition: transition('border-color') },
          '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: cssVar.borderStrong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: cssVar.textMuted, borderWidth: 1 },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${cssVar.surfaceSelected}` },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: cssVar.danger },
          '&.MuiInputBase-multiline': { padding: 0 },
          '& textarea': { paddingBlock: spacingUnit * 1.25, minHeight: 0 },
        },
        input: {
          paddingBlock: 0,
          paddingInline: spacingUnit * 1.5,
          minHeight: layout.controlHeight,
          boxSizing: 'border-box',
          '&::placeholder': { color: cssVar.textMuted, opacity: 1 },
          [touch]: { minHeight: layout.touchTarget },
        },
        adornedStart: { paddingLeft: spacingUnit * 1.25, '& input': { paddingLeft: 0 } },
      },
    },
    MuiInputAdornment: {
      styleOverrides: { root: { color: cssVar.icon, '& svg': { fontSize: 16 } } },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          display: 'flex',
          alignItems: 'center',
          // Beat MUI's internal min-height so selects match other controls
          '&.MuiSelect-select.MuiInputBase-input': { minHeight: layout.controlHeight, boxSizing: 'border-box', paddingBlock: 0 },
          [touch]: { '&.MuiSelect-select.MuiInputBase-input': { minHeight: layout.touchTarget } },
        },
        icon: { color: cssVar.icon },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginInline: 0, marginTop: spacingUnit * 0.75, fontSize: fontSize.sm, color: cssVar.textMuted, '&.Mui-error': { color: cssVar.danger } } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' }, outlined: { borderColor: cssVar.border, borderRadius: radius.lg } },
    },
    MuiPopover: {
      styleOverrides: { paper: { boxShadow: cssVar.shadowPopover, borderRadius: radius.lg, marginTop: 4 } },
    },
    MuiMenu: {
      styleOverrides: { paper: { boxShadow: cssVar.shadowPopover, borderRadius: radius.lg }, list: { padding: 4 } },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 32,
          fontSize: fontSize.md,
          borderRadius: radius.sm,
          '&:hover': { backgroundColor: cssVar.surfaceSubtle },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: cssVar.surfaceSelected },
          [touch]: { minHeight: layout.touchTarget },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        // Remove Autocomplete's own input padding so it matches other inputs
        root: {
          '& .MuiOutlinedInput-root': { paddingTop: 0, paddingBottom: 0, paddingRight: 0, paddingLeft: spacingUnit * 1.25 },
          '& .MuiOutlinedInput-root .MuiAutocomplete-input': { padding: 0 },
        },
        paper: { boxShadow: cssVar.shadowPopover, borderRadius: radius.lg, marginTop: 6 },
        listbox: { padding: 4 },
        option: {
          minHeight: 36,
          borderRadius: radius.md,
          fontSize: fontSize.md,
          '&.Mui-focused, &[aria-selected="true"].Mui-focused': { backgroundColor: `${cssVar.surfaceSubtle} !important` },
        },
        groupLabel: {
          fontSize: fontSize.xs,
          fontWeight: font.weightMedium,
          color: cssVar.textMuted,
          lineHeight: '28px',
          paddingInline: 12,
          backgroundColor: cssVar.surface,
        },
        noOptions: { fontSize: fontSize.md, color: cssVar.textMuted },
      },
    },
    MuiChip: {
      variants: [
        { props: { variant: 'outlined', color: 'default' }, style: { borderColor: cssVar.border, color: cssVar.text } },
        { props: { variant: 'filled', color: 'default' }, style: { backgroundColor: cssVar.surfaceSubtle, color: cssVar.text } },
      ],
      styleOverrides: {
        root: { borderRadius: radius.md, fontWeight: font.weightMedium, fontSize: fontSize.sm, height: 28 },
        clickable: { '&:hover': { backgroundColor: cssVar.surfaceSelected } },
        sizeSmall: { fontSize: fontSize.xs, height: 24 },
        icon: { fontSize: 14, color: cssVar.icon, marginLeft: 8 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: cssVar.border } } },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          minWidth: 32,
          height: 32,
          borderRadius: radius.md,
          fontSize: fontSize.sm,
          color: cssVar.textMuted,
          '&:hover': { backgroundColor: cssVar.surfaceSubtle, color: cssVar.text },
          '&.Mui-selected': {
            backgroundColor: cssVar.surfaceSelected,
            color: cssVar.text,
            '&:hover': { backgroundColor: cssVar.surfaceSelected },
          },
          [touch]: { minWidth: layout.touchTarget, height: layout.touchTarget },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: fontSize.sm, color: cssVar.textMuted },
        li: { minWidth: 0 },
        separator: { color: cssVar.borderStrong, marginInline: 6 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          alignItems: 'flex-start',
          fontSize: fontSize.sm,
          lineHeight: lineHeight.body,
          padding: `${spacingUnit * 0.75}px ${spacingUnit * 1.5}px`,
          border: `1px solid ${cssVar.border}`,
          backgroundColor: cssVar.surfaceSubtle,
          color: cssVar.text,
        },
        icon: { color: `${cssVar.icon} !important`, '& svg': { fontSize: 18 } },
      },
      variants: [{ props: { severity: 'error' }, style: { borderColor: cssVar.danger, '& .MuiAlert-icon': { color: `${cssVar.danger} !important` } } }],
    },
    MuiAlertTitle: { styleOverrides: { root: { fontSize: fontSize.md, fontWeight: font.weightSemibold, marginBottom: 2 } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: cssVar.surfaceSubtle } } },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundColor: cssVar.surface, borderLeft: `1px solid ${cssVar.border}` } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: cssVar.surfaceInverse, color: cssVar.textInverse, fontSize: fontSize.xs, borderRadius: radius.sm },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: cssVar.border, fontSize: fontSize.sm } },
    },
  },
});
