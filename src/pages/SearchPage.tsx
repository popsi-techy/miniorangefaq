import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../components/common/EmptyState';
import { FilterPill } from '../components/common/FilterPill';
import { ListPagination } from '../components/common/ListPagination';
import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeading } from '../components/common/SectionHeading';
import { QuestionList } from '../components/faq/QuestionList';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { StickyHeroSearch } from '../components/search/StickyHeroSearch';
import { SupportCallout } from '../components/support/SupportCallout';
import { usePageMeta } from '../hooks/usePageMeta';
import { useUrlParams } from '../hooks/useUrlParams';
import { getMostViewed, getTopCategory, siteConfig, topLevelCategories } from '../lib/content';
import { pluralize } from '../lib/format';
import { readPage } from '../lib/pagination';
import { searchFaqs } from '../lib/search';

/**
 * Search results for /search?q=… with an optional product facet (?product=) and paging (?page=).
 * The query stays in the URL and in the search field so Back from an article restores the results.
 */
export function SearchPage() {
  const [params, update] = useUrlParams();
  const query = (params.get('q') ?? '').trim();
  const productId = params.get('product');

  const response = useMemo(() => searchFaqs(query), [query]);

  // Product facet with counts, ordered by number of matches
  const facets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of response.results) {
      const top = getTopCategory(r.faq.categoryId);
      if (top) counts.set(top.id, (counts.get(top.id) ?? 0) + 1);
    }
    return topLevelCategories
      .filter((c) => counts.has(c.id))
      .map((c) => ({ category: c, count: counts.get(c.id)! }))
      .sort((a, b) => b.count - a.count);
  }, [response]);

  const activeFacet = facets.find((f) => f.category.id === productId)?.category;
  const results = activeFacet ? response.results.filter((r) => getTopCategory(r.faq.categoryId)?.id === activeFacet.id) : response.results;

  const pageSize = siteConfig.listing.pageSize;
  const page = readPage(params.get('page'), results.length, pageSize);
  const visible = results.slice(0, page * pageSize).map((r) => r.faq);

  usePageMeta({ title: query ? `Search results for “${query}”` : 'Search', path: '/search', noIndex: true });

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <PageHeader title={query ? 'Search' : 'Search the knowledge base'} search={false} breadcrumbs={<Breadcrumbs items={[{ label: 'Search' }]} />}>
          <StickyHeroSearch autoFocus={!query} sx={{ mt: 0, width: '100%' }} />
        </PageHeader>

        {!query && (
          <>
            <SectionHeading title="Popular questions" />
            <QuestionList faqs={getMostViewed(8)} showCategory showViews />
          </>
        )}

        {query && response.results.length > 0 && (
          <>
            {facets.length > 1 && (
              <Box
                component="nav"
                aria-label="Filter results by product"
                sx={{ display: 'flex', gap: 0.75, flexWrap: { xs: 'nowrap', sm: 'wrap' }, overflowX: { xs: 'auto', sm: 'visible' }, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, pb: 2, scrollbarWidth: 'none' }}
              >
                <FilterPill label="All" selected={!activeFacet} onClick={() => update({ product: null })} />
                {facets.map((f) => (
                  <FilterPill
                    key={f.category.id}
                    label={f.category.name}
                    selected={activeFacet?.id === f.category.id}
                    onClick={() => update({ product: f.category.id })}
                  />
                ))}
              </Box>
            )}

            <Typography variant="meta" component="p" aria-live="polite" sx={{ mb: 1 }}>
              {pluralize(results.length, 'result')}
              {activeFacet && ` in ${activeFacet.name}`}
              {response.partial && ' · partial matches (no question contains every word)'}
            </Typography>

            <QuestionList
              faqs={visible}
              showCategory
              showViews
              showDate
              terms={response.terms}
              headingComponent="h2"
              aria-label="Search results"
              linkState={{ from: 'search', query, returnTo: `/search?${params.toString()}`, returnLabel: 'results' }}
            />
            <ListPagination
              page={page}
              pageSize={pageSize}
              total={results.length}
              onChange={(p) => update({ page: p > 1 ? String(p) : null }, { replace: false })}
            />
          </>
        )}

        {query && response.results.length === 0 && (
          <EmptyState
            title={`No results for “${query}”`}
            description="Check the spelling or try a product name with a feature."
            actions={
              <>
                <Button variant="outlined" href="/">
                  Browse products
                </Button>
                <Button variant="contained" href="/support">
                  Contact support
                </Button>
              </>
            }
          />
        )}

        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <SupportCallout title="Didn’t find your answer?" />
        </Box>
      </Box>
    </PageContainer>
  );
}
