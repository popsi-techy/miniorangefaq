import { Navigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { PageContainer } from '../components/common/PageContainer';
import { SectionHeading } from '../components/common/SectionHeading';
import { CategoryCard } from '../components/faq/CategoryCard';
import { CategoryList } from '../components/faq/CategoryList';
import { QuestionList } from '../components/faq/QuestionList';
import { StickyHeroSearch } from '../components/search/StickyHeroSearch';
import { HeroBackdrop } from '../components/home/HeroBackdrop';
import { SupportCallout } from '../components/support/SupportCallout';
import { usePageMeta } from '../hooks/usePageMeta';
import { getMostViewed, getRecentlyUpdated, siteConfig, topLevelCategories } from '../lib/content';

const featured = topLevelCategories.filter((c) => c.featured);
const more = topLevelCategories.filter((c) => !c.featured);

export function HomePage() {
  usePageMeta({ path: '/' });
  const [params] = useSearchParams();
  const legacyQuery = params.get('s'); // old WordPress search URLs: /?s=term

  if (legacyQuery) return <Navigate to={`/search?q=${encodeURIComponent(legacyQuery)}`} replace />;

  return (
    <>
      <Box component="section" aria-labelledby="hero-title" sx={{ position: 'relative', isolation: 'isolate', zIndex: 2, borderBottom: 1, borderColor: 'divider', mb: { xs: 5, md: 7 } }}>
        <HeroBackdrop />
        <PageContainer>
          <Box sx={{ position: 'relative', zIndex: 1, pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, textAlign: 'center' }}>
            <Typography id="hero-title" variant="hero" sx={{ maxWidth: 640, mx: 'auto' }}>
              {siteConfig.tagline}
            </Typography>
            <Typography variant="lead" sx={{ mt: 1.5, mx: 'auto', maxWidth: 520 }}>
              {siteConfig.description}
            </Typography>
            <StickyHeroSearch sx={{ mt: { xs: 3, md: 4 } }} />
          </Box>
        </PageContainer>
      </Box>

      <PageContainer>
        <Box component="section" aria-labelledby="products-heading">
          <SectionHeading id="products-heading" title="Products" />
          <Grid container spacing={1.5} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {featured.map((c) => (
              <Grid key={c.id} size={{ xs: 6, sm: 4, md: 2 }} component="li">
                <CategoryCard category={c} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" aria-labelledby="other-products-heading" sx={{ mt: 3 }}>
          <SectionHeading id="other-products-heading" title="Our other products" />
          <CategoryList categories={more} columns={4} />
        </Box>

        <Grid container spacing={{ xs: 6, md: 6 }} sx={{ pt: { xs: 7, md: 10 } }}>
          <Grid size={{ xs: 12, md: 6 }} component="section" aria-labelledby="popular-heading">
            <SectionHeading id="popular-heading" title="Most viewed" />
            <QuestionList faqs={getMostViewed(6)} showViews linkState={{ from: 'home' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} component="section" aria-labelledby="recent-heading">
            <SectionHeading id="recent-heading" title="Recently updated" />
            <QuestionList faqs={getRecentlyUpdated(6)} showDate linkState={{ from: 'home' }} />
          </Grid>
        </Grid>

        <Box sx={{ pt: { xs: 7, md: 10 } }}>
          <SupportCallout />
        </Box>
      </PageContainer>
    </>
  );
}
