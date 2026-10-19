import type { SxProps, Theme } from '@mui/material/styles';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { cssVar, iconSize } from '../../theme/tokens';

/**
 * Small → arrow that slides in when its list item is hovered or keyboard-focused.
 * Put it last inside the item and spread `hoverArrowRevealSx` (./hoverArrowSx) into the item's `sx`.
 */
export function HoverArrow({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <ArrowForwardRounded
      className="hover-arrow"
      aria-hidden
      sx={[{
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        fontSize: iconSize.sm,
        color: cssVar.icon,
        opacity: 0,
        transform: 'translateX(-4px)',
        transition: 'opacity var(--motion-duration), transform var(--motion-duration)',
      }, sx] as SxProps<Theme>}
    />
  );
}
