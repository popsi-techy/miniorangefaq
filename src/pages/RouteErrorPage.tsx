import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import { PageContainer } from '../components/common/PageContainer';
import { Logo } from '../components/layout/Logo';
import { siteConfig } from '../lib/content';
import { cssVar, iconSize } from '../theme/tokens';

/**
 * Last-resort error screen for unexpected render or routing errors.
 * Rendered outside AppShell, so it depends only on the theme.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;
  if (import.meta.env.DEV) console.error(error);
  return (
    <PageContainer>
      <Box sx={{ py: 3 }}>
        <Logo />
      </Box>
      <Box component="main" sx={{ py: { xs: 6, md: 10 }, maxWidth: 560 }}>
        <ErrorOutlineRounded sx={{ fontSize: iconSize.xl, color: cssVar.icon, mb: 2 }} aria-hidden />
        <Typography variant="h1" sx={{ mb: 1.5 }}>
          {status === 404 ? 'Page not found' : 'Something went wrong'}
        </Typography>
        <Typography variant="lead" sx={{ display: 'block', mb: 4 }}>
          {status === 404
            ? 'The page you are looking for does not exist.'
            : `This page could not be displayed. Reload to try again, or contact ${siteConfig.contact.email} if the problem continues.`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button variant="outlined" href="/" onClick={(e) => { e.preventDefault(); window.location.assign('/'); }}>
            Go to knowledge base home
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
