import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import { cssVar, iconSize } from '../../theme/tokens';

/** Icon + short text used in metadata rows (category, updated date, views). */
export function MetaItem({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <Typography
      variant="meta"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', '& svg': { fontSize: iconSize.xs, color: cssVar.icon } }}
    >
      {icon && (
        <span aria-hidden style={{ display: 'inline-flex' }}>
          {icon}
        </span>
      )}
      {children}
    </Typography>
  );
}
