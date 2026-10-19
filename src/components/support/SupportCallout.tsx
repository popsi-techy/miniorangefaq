import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import { cssVar, iconSize } from '../../theme/tokens';

interface SupportCalloutProps {
  title?: string;
  description?: string;
  /** Article slug passed to /support so the form is pre-filled with context. */
  articleSlug?: string;
  /** "inline" = full-width row; "sidebar" = stacked for narrow columns. */
  variant?: 'inline' | 'sidebar';
}

/** Contextual entry point to the support page. */
export function SupportCallout({
  title = 'Can’t find what you need?',
  description = 'Our team can help with setup and troubleshooting.',
  articleSlug,
  variant = 'inline',
}: SupportCalloutProps) {
  const to = articleSlug ? `/support?article=${encodeURIComponent(articleSlug)}` : '/support';
  const sidebar = variant === 'sidebar';
  return (
    <Box
      component="aside"
      aria-label="Contact support"
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        flexDirection: sidebar ? 'column' : { xs: 'column', sm: 'row' },
        alignItems: sidebar ? 'flex-start' : { xs: 'flex-start', sm: 'center' },
        gap: 1.5,
      }}
    >
      <Box
        aria-hidden
        sx={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 1.5, bgcolor: cssVar.surfaceSubtle, color: cssVar.icon }}
      >
        <SupportAgentOutlined sx={{ fontSize: iconSize.md }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Button component={RouterLink} to={to} variant="contained" sx={{ flexShrink: 0, width: sidebar ? '100%' : { xs: '100%', sm: 'auto' } }}>
        Contact support
      </Button>
    </Box>
  );
}
