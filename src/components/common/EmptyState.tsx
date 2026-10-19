import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import { cssVar, iconSize } from '../../theme/tokens';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  headingComponent?: 'h1' | 'h2' | 'h3';
}

/** Quiet, centred message for "nothing here" situations (no results, empty list, 404). */
export function EmptyState({ title, description, icon, actions, headingComponent = 'h2' }: EmptyStateProps) {
  return (
    <Box role="status" sx={{ py: { xs: 6, md: 8 }, px: 3, textAlign: 'center', border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 2 }}>
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 48,
          mx: 'auto',
          mb: 2,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          color: cssVar.icon,
          '& svg': { fontSize: iconSize.lg },
        }}
      >
        {icon ?? <SearchOffRounded />}
      </Box>
      <Typography variant="h2" component={headingComponent}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 3, justifyContent: 'center' }}>
          {actions}
        </Stack>
      )}
    </Box>
  );
}
