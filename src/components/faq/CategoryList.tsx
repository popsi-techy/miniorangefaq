import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { categoryPath } from '../../lib/content';
import { cssVar, fontSize } from '../../theme/tokens';
import type { Category } from '../../types/faq';
import { HoverArrow } from '../common/HoverArrow';
import { hoverArrowRevealSx } from '../common/hoverArrowSx';
import { HighlightedText } from '../search/HighlightedText';

interface CategoryListProps {
  categories: Category[];
  /**
   * "grid" = directory in up to `columns` columns (home, all categories);
   * "nav"  = single-column sidebar navigation with an active indicator.
   */
  variant?: 'grid' | 'nav';
  /** Columns at md+ for the grid variant (1 on mobile, 2 on tablet). */
  columns?: 1 | 2 | 3 | 4;
  terms?: string[];
  'aria-label'?: string;
  /** Category marked as current (aria-current + active style). */
  currentId?: string;
}

/** Compact list of category names. */
export function CategoryList({ categories, variant = 'grid', columns = 3, terms = [], currentId, 'aria-label': ariaLabel }: CategoryListProps) {
  const nav = variant === 'nav';
  return (
    <Box
      component="ul"
      aria-label={ariaLabel}
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'grid',
        columnGap: 3,
        rowGap: nav ? 0.25 : 0,
        gridTemplateColumns: nav
          ? '1fr'
          : { xs: '1fr', sm: columns === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))', md: `repeat(${columns}, minmax(0, 1fr))` },
        mx: nav ? 0 : -1.5,
      }}
    >
      {categories.map((c) => {
        const current = c.id === currentId;
        return (
          <li key={c.id}>
            <Box
              component={RouterLink}
              to={categoryPath(c)}
              aria-current={current ? 'page' : undefined}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minHeight: nav ? 32 : 40,
                px: 1.5,
                borderRadius: 1.5,
                fontSize: fontSize.md,
                fontWeight: current ? 500 : 400,
                color: cssVar.text,
                bgcolor: current ? cssVar.surfaceSelected : 'transparent',
                textDecoration: 'none',
                transition: 'background-color var(--motion-duration)',
                // Same hover as every list item: grey background only
                '&:hover': { bgcolor: current ? cssVar.surfaceSelected : cssVar.surfaceSubtle },
                ...hoverArrowRevealSx,
                // Small orange indicator for the active item
                ...(current && {
                  '&::before': { content: '""', position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 1, bgcolor: cssVar.accent },
                }),
              }}
            >
              <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <HighlightedText text={c.name} terms={terms} />
              </Box>
              <HoverArrow />
            </Box>
          </li>
        );
      })}
    </Box>
  );
}
