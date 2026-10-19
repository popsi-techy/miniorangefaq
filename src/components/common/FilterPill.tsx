import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { cssVar, fontSize, radius } from '../../theme/tokens';

interface FilterPillProps {
  label: string;
  selected: boolean;
  /** Render as a link (navigation) … */
  to?: string;
  /** … or as a toggle button (in-page filter). */
  onClick?: () => void;
}

/**
 * Pill used for facet filters and mobile topic navigation.
 * Selected = primary orange fill (links get aria-current, buttons aria-pressed).
 */
export function FilterPill({ label, selected, to, onClick }: FilterPillProps) {
  const sx = {
    flexShrink: 0,
    px: 1.5,
    height: 30,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: `${radius.pill}px`,
    border: 1,
    borderColor: selected ? cssVar.accent : 'divider',
    bgcolor: selected ? cssVar.accent : 'transparent',
    color: selected ? cssVar.onAccent : cssVar.text,
    font: 'inherit',
    fontSize: fontSize.sm,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color var(--motion-duration), border-color var(--motion-duration)',
    '&:hover': selected
      ? { bgcolor: cssVar.accentHover, borderColor: cssVar.accentHover }
      : { bgcolor: cssVar.surfaceSubtle },
    '@media (pointer: coarse)': { height: 40 },
  } as const;

  return to ? (
    <Box component={RouterLink} to={to} aria-current={selected ? 'page' : undefined} sx={sx}>
      {label}
    </Box>
  ) : (
    <Box component="button" type="button" aria-pressed={selected} onClick={onClick} sx={sx}>
      {label}
    </Box>
  );
}
