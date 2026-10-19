import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { cssVar } from '../../theme/tokens';
import { StickyHeroSearch } from '../search/StickyHeroSearch';

interface PageHeaderProps {
  /** Page H1. Omit when the page renders its own heading (e.g. the 404 empty state). */
  title?: ReactNode;
  /** id for the H1, for aria-labelledby. */
  titleId?: string;
  /** Breadcrumbs or a "Back to…" link, shown centred above the title. */
  breadcrumbs?: ReactNode;
  /** One short line (or a meta row) under the title. */
  subtitle?: ReactNode;
  /** Show the knowledge-base search (same as the homepage) under the title. Default true. */
  search?: boolean;
  /** Extra controls under the title, e.g. a filter field or the large search. */
  children?: ReactNode;
}

/**
 * Centred page header ("mini hero") used by every page except Home:
 * breadcrumbs → H1 → subtitle → controls → search, all centred, on a full-width soft
 * gradient (top-centre orange wash over a grey-to-white fade) with a divider below.
 */
export function PageHeader({ title, titleId, breadcrumbs, subtitle, search = true, children }: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        isolation: 'isolate',
        zIndex: 2,
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 5 },
        mb: { xs: 3, md: 4 },
        textAlign: 'center',
        // Full-bleed background + divider (main clips the horizontal overflow)
        '&::before': {
          content: '""',
          position: 'absolute',
          zIndex: -1,
          top: 0,
          bottom: 0,
          left: '50%',
          width: '100vw',
          transform: 'translateX(-50%)',
          borderBottom: 1,
          borderColor: 'divider',
          background: [
            `radial-gradient(50% 100% at 50% 0%, ${cssVar.pageGlow} 0%, transparent 100%)`,
            `linear-gradient(to bottom, ${cssVar.surfaceSubtle}, ${cssVar.surface})`,
          ].join(', '),
        },
      }}
    >
      {breadcrumbs && <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', '& .MuiBreadcrumbs-ol': { justifyContent: 'center' } }}>{breadcrumbs}</Box>}
      {title && (
        <Typography id={titleId} variant="h1" sx={{ maxWidth: 760, mx: 'auto', overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Box sx={{ mt: 1, mx: 'auto', maxWidth: 640, color: 'text.secondary', typography: 'body1', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          {subtitle}
        </Box>
      )}
      {children && <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', textAlign: 'left' }}>{children}</Box>}
      {search && <StickyHeroSearch />}
    </Box>
  );
}
