import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { visuallyHidden } from '../../theme/a11y';

interface LoadingStateProps {
  /** Accessible description of what is loading. */
  label?: string;
  lines?: number;
}

/** Text-shaped skeleton for content that is loading. Announced politely to screen readers. */
export function LoadingState({ label = 'Loading content', lines = 6 }: LoadingStateProps) {
  return (
    <Box role="status" aria-live="polite" aria-busy="true">
      <Box component="span" sx={visuallyHidden}>
        {label}…
      </Box>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} variant="text" height={28} width={i % 3 === 2 ? '60%' : '100%'} sx={{ mb: 0.5 }} />
      ))}
      <Skeleton variant="rounded" height={160} sx={{ mt: 2 }} />
    </Box>
  );
}
