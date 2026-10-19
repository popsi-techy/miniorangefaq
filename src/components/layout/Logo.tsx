import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { siteConfig } from '../../lib/content';
import { cssVar } from '../../theme/tokens';
import { MiniOrangeLogo } from './MiniOrangeLogo';

/**
 * Official miniOrange logo, linking to the knowledge-base home.
 * The wordmark is grey on light surfaces and white on dark ones (`inverse` for the always-dark footer).
 */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label={`${siteConfig.siteName} home`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 36,
        flexShrink: 0,
        borderRadius: 1,
        color: inverse ? 'var(--color-text-dark-primary)' : cssVar.logoText,
      }}
    >
      <MiniOrangeLogo sx={{ height: { xs: 24, md: 26 } }} />
    </Box>
  );
}
