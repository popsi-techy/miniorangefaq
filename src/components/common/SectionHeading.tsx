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
  /** Optional control shown on the right instead of a link (e.g. a SortSelect). */
  trailing?: ReactNode;
  component?: 'h2' | 'h3';
  /** "small" uses the h3 style (sidebars) without changing the heading level. */
  size?: 'default' | 'small';
}

/** Compact heading row for a page section, with an optional trailing link or control. */
export function SectionHeading({ id, title, action, trailing, component = 'h2', size = 'default' }: SectionHeadingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 2, rowGap: 1, mb: 2, minHeight: 28 }}>
      <Typography id={id} variant={component === 'h2' && size === 'default' ? 'h2' : 'h3'} component={component}>
        {title}
      </Typography>
      {trailing}
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
