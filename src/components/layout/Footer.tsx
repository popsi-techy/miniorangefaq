import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import Facebook from '@mui/icons-material/Facebook';
import LinkedIn from '@mui/icons-material/LinkedIn';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import X from '@mui/icons-material/X';
import YouTube from '@mui/icons-material/YouTube';
import { navigation, siteConfig } from '../../lib/content';
import { fontSize } from '../../theme/tokens';
import { PageContainer } from '../common/PageContainer';
import { Logo } from './Logo';

const year = new Date().getFullYear();
const socialIcons = { linkedin: LinkedIn, youtube: YouTube, x: X, facebook: Facebook };

const footerLinkSx = {
  color: 'var(--color-text-dark-secondary)',
  fontWeight: 400,
  fontSize: fontSize.sm,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  py: 0.5,
  '&:hover': { color: 'var(--color-text-dark-primary)' },
} as const;

/** Dark site footer with contact details and the miniOrange link directory from the source site. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: 'var(--color-background-black)', color: 'var(--color-text-dark-primary)', mt: 'auto', pt: { xs: 5, md: 7 }, pb: 4, borderTop: 1, borderColor: 'var(--color-stroke-dark-inactive)' }}
    >
      <PageContainer>
        <Grid container spacing={{ xs: 4, md: 5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Logo inverse />
            <Stack spacing={0.5} sx={{ mt: 3, alignItems: 'flex-start' }}>
              {siteConfig.contact.phones.map((p) => (
                <Link key={p.number} href={`tel:${p.number.replace(/\s/g, '')}`} sx={footerLinkSx}>
                  <PhoneOutlined fontSize="small" sx={{ color: 'var(--color-icon-inverse)' }} />
                  {p.number} ({p.label})
                </Link>
              ))}
              <Link href={`mailto:${siteConfig.contact.email}`} sx={footerLinkSx}>
                <EmailOutlined fontSize="small" sx={{ color: 'var(--color-icon-inverse)' }} />
                {siteConfig.contact.email}
              </Link>
            </Stack>
            <Typography variant="overline" component="p" sx={{ mt: 3, mb: 1, color: 'var(--color-text-dark-secondary)' }}>
              Stay connected
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {navigation.social.map((s) => {
                const Icon = socialIcons[s.icon];
                return (
                  <IconButton
                    key={s.href}
                    href={s.href}
                    aria-label={s.label}
                    sx={{
                      color: 'var(--color-icon-inverse)',
                      '&:hover': { bgcolor: 'var(--color-stroke-dark-inactive)', color: 'var(--color-icon-inverse)' },
                    }}
                  >
                    <Icon />
                  </IconButton>
                );
              })}
            </Stack>
          </Grid>
          {navigation.footer.map((group) => (
            <Grid key={group.label} size={{ xs: 6, sm: 3, md: 2 }}>
              <Typography variant="h6" component="h2" sx={{ color: 'var(--color-text-dark-primary)', mb: 1.5 }}>
                {group.label}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} sx={footerLinkSx}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: 1,
            borderColor: 'var(--color-stroke-dark-inactive)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--color-text-dark-secondary)' }}>
            © {year} {siteConfig.copyright}
          </Typography>
          <Stack direction="row" spacing={3}>
            {navigation.legal.map((l) => (
              <Link key={l.href} href={l.href} sx={footerLinkSx}>
                {l.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </PageContainer>
    </Box>
  );
}
