import { useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LanguageRounded from '@mui/icons-material/LanguageRounded';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import { AppLink } from '../components/common/AppLink';
import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SupportForm } from '../components/support/SupportForm';
import { usePageMeta } from '../hooks/usePageMeta';
import { faqPath, getFaqBySlug, siteConfig } from '../lib/content';
import { displayUrl } from '../lib/format';
import { cssVar, iconSize } from '../theme/tokens';

const channelIconSx = {
  width: 32,
  height: 32,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 1.5,
  border: 1,
  borderColor: 'divider',
  color: cssVar.icon,
  '& svg': { fontSize: iconSize.sm },
} as const;

/** One help channel. With `href` the whole row is a link; otherwise children hold the links. */
function Channel({ icon, title, value, href, children }: { icon: React.ReactNode; title: string; value?: string; href?: string; children?: React.ReactNode }) {
  const body = (
    <>
      <Box sx={channelIconSx} aria-hidden>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        {value && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {value}
          </Typography>
        )}
        {children}
      </Box>
      {href && /^https?:/.test(href) && <OpenInNewRounded aria-label="opens in a new tab" sx={{ fontSize: iconSize.sm, color: cssVar.icon }} />}
    </>
  );
  const rowSx = { display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1.5, mx: -1.5, borderRadius: 1.5, color: cssVar.text, textDecoration: 'none' } as const;
  return (
    <li>
      {href ? (
        <Box component={AppLink} href={href} sx={{ ...rowSx, '&:hover': { bgcolor: cssVar.surfaceSubtle } }}>
          {body}
        </Box>
      ) : (
        <Box sx={rowSx}>{body}</Box>
      )}
    </li>
  );
}

/** Contact support: the source site's support form plus every other help channel it lists. */
export function SupportPage() {
  usePageMeta({ title: 'Contact support', description: 'Get help from the miniOrange support team.', path: '/support' });
  const [params] = useSearchParams();
  const article = getFaqBySlug(params.get('article') ?? '');
  const { contact } = siteConfig;

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={<Breadcrumbs items={article ? [{ label: article.title, to: faqPath(article) }, { label: 'Contact support' }] : [{ label: 'Contact support' }]} />}
        title="Contact support"
        subtitle="Our team replies by email."
      />
      <Grid container spacing={{ xs: 5, md: 8 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider', borderRadius: 2, boxShadow: cssVar.shadowCard }}>
            {article && (
              <Alert severity="info" sx={{ mb: 2.5 }}>
                About: <Link href={faqPath(article)} underline="always">{article.title}</Link>
              </Alert>
            )}
            <SupportForm key={article?.id ?? 'general'} context={article ? { title: article.title, url: `${window.location.origin}${faqPath(article)}` } : undefined} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} component="aside" aria-labelledby="channels-heading">
          <Typography id="channels-heading" variant="h2" sx={{ mb: 1 }}>
            Other ways to reach us
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            <Channel icon={<EmailOutlined />} title="Email" value={contact.email} href={`mailto:${contact.email}`} />
            <Channel icon={<PhoneOutlined />} title="Phone">
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.5 }}>
                {contact.phones.map((p) => (
                  <Link key={p.number} href={`tel:${p.number.replace(/\s/g, '')}`} sx={{ color: 'inherit', fontWeight: 400, '&:hover': { color: cssVar.text } }}>
                    {p.number} ({p.label})
                  </Link>
                ))}
              </Typography>
            </Channel>
            <Channel icon={<ForumOutlined />} title="Community forum" value={displayUrl(contact.forumUrl)} href={contact.forumUrl} />
            <Channel icon={<DescriptionOutlined />} title="Documentation" value={displayUrl(contact.documentationUrl)} href={contact.documentationUrl} />
            <Channel icon={<LanguageRounded />} title="Sales & partnerships" value={displayUrl(contact.contactPageUrl)} href={contact.contactPageUrl} />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
