import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { cssVar, fontSize, iconSize } from '../../theme/tokens';

interface SectionHeadingProps {
  id?: string;
  title: ReactNode;
  /** Optional "View all"-style link shown on the right. */
  action?: { label: string; href: string };
  component?: 'h2' | 'h3';
}

/** Compact heading row for a page section, with an optional trailing link. */
export function SectionHeading({ id, title, action, component = 'h2' }: SectionHeadingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5, minHeight: 28 }}>
      <Typography id={id} variant={component === 'h2' ? 'h2' : 'h3'} component={component}>
        {title}
      </Typography>
      {action && (
        <Link
          href={action.href}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: fontSize.sm,
            color: cssVar.textMuted,
            py: 0.5,
            '&:hover': { color: cssVar.text },
            '& svg': { fontSize: iconSize.xs },
          }}
        >
          {action.label}
          <ArrowForwardRounded aria-hidden />
        </Link>
      )}
    </Box>
  );
}
