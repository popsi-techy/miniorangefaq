import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { cssVar, layout } from '../../theme/tokens';
import { SearchInput } from './SearchInput';

/** Pinned hero field (44px) plus 8px padding above and below the fixed bar. */
const pinnedOffset = layout.touchTarget + 16;

/**
 * The large page search. Once it scrolls under the global header it pins there
 * and the field shortens, and it stays available for the rest of the page.
 */
export function StickyHeroSearch({ autoFocus, sx }: { autoFocus?: boolean; sx?: SxProps<Theme> }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const observer = new IntersectionObserver(([entry]) => setPinned(!entry.isIntersecting), {
      rootMargin: `-${layout.headerHeight}px 0px 0px 0px`,
      threshold: 0,
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sticky-search', pinned ? `${pinnedOffset}px` : '0px');
    return () => {
      root.style.removeProperty('--sticky-search');
    };
  }, [pinned]);

  return (
    <Box ref={anchorRef} sx={[{ mt: 3, mx: 'auto', maxWidth: 600, width: '100%', textAlign: 'left', height: pinned ? layout.controlHeightLarge : 'auto' }, sx] as SxProps<Theme>}>
      <Box
        sx={
          pinned
            ? {
                position: 'fixed',
                top: layout.headerHeight,
                left: 0,
                right: 0,
                zIndex: 2,
                py: 1,
                bgcolor: cssVar.surface,
                borderBottom: 1,
                borderColor: 'divider',
              }
            : undefined
        }
      >
        <Box sx={pinned ? { maxWidth: layout.pageMaxWidth, mx: 'auto', px: { xs: 2, sm: 3 } } : undefined}>
          <Box sx={pinned ? { maxWidth: 600, mx: 'auto' } : undefined}>
            <SearchInput size="hero" pinned={pinned} autoFocus={autoFocus} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
