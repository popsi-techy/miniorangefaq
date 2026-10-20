import { useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../components/common/EmptyState';
import { FilterPill } from '../components/common/FilterPill';
import { ListPagination } from '../components/common/ListPagination';
import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeading } from '../components/common/SectionHeading';
import { SortSelect } from '../components/common/SortSelect';
import { CategoryList } from '../components/faq/CategoryList';
import { QuestionList } from '../components/faq/QuestionList';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SupportCallout } from '../components/support/SupportCallout';
import { usePageMeta } from '../hooks/usePageMeta';
import { useUrlParams } from '../hooks/useUrlParams';
import { categoryPath, getCategoryById, getCategoryBySlug, getCategoryTrail, getFaqsInCategory, getSubcategories, siteConfig } from '../lib/content';
import { readPage } from '../lib/pagination';
import { layout } from '../theme/tokens';
import type { Category, Faq } from '../types/faq';
import { NotFoundPage } from './NotFoundPage';

const SORT_LABELS = { views: 'Most viewed', updated: 'Recently updated', title: 'Title (A–Z)' } as const;
type SortKey = keyof typeof SORT_LABELS;
const SORTS: Record<SortKey, (a: Faq, b: Faq) => number> = {
  views: (a, b) => (b.views ?? 0) - (a.views ?? 0),
  updated: (a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''),
  title: (a, b) => a.title.localeCompare(b.title),
};

/** Topic navigation: "All questions", then any topics. Sidebar on desktop, pills on mobile. */
function TopicNav({ product, currentId }: { product: Category; currentId: string }) {
  const topics = getSubcategories(product.id);
  const items = [{ ...product, name: 'All questions' }, ...topics];
  return (
    <>
      <Box component="nav" aria-label={`${product.name} topics`} sx={{ display: { xs: 'none', md: 'block' } }}>
        <CategoryList categories={items} variant="nav" currentId={currentId} />
      </Box>
      <Box
        component="nav"
        aria-label={`${product.name} topics`}
        sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.75, overflowX: 'auto', mx: -2, px: 2, pb: 2, scrollbarWidth: 'none' }}
      >
        {items.map((c) => (
          <FilterPill key={c.id} label={c.name} selected={c.id === currentId} to={categoryPath(c)} />
        ))}
      </Box>
    </>
  );
}

/**
 * Category detail: /kb/:product or /kb/:product/:topic (same URLs as the source site).
 * Sort (?sort) and page (?page) live in the URL so Back restores the list.
 */
export function CategoryPage() {
  const slug = useParams()['*'] ?? '';
  const category = getCategoryBySlug(slug);
  const location = useLocation();
  const [params, update] = useUrlParams();

  const trail = category ? getCategoryTrail(category.id) : [];
  const product = trail[0];
  const hasTopics = product ? getSubcategories(product.id).length > 0 : false;

  const sortParam = params.get('sort');
  const sort: SortKey = sortParam && sortParam in SORT_LABELS ? (sortParam as SortKey) : 'views';

  const all = category ? getFaqsInCategory(category.id) : [];
  const list = [...all].sort(SORTS[sort]);

  const pageSize = siteConfig.listing.pageSize;
  const page = readPage(params.get('page'), list.length, pageSize);
  const visible = list.slice(0, page * pageSize);

  usePageMeta({
    title: category ? trail.map((c) => c.name).reverse().join(' – ') : 'Category not found',
    description: category ? `Questions and answers about ${trail.map((c) => c.name).join(' / ')} in the miniOrange knowledge base.` : undefined,
    path: category ? categoryPath(category) : undefined,
    noIndex: !category,
  });

  if (!category) return <NotFoundPage kind="category" />;

  const returnTo = `${location.pathname}${location.search}`;
  const parent = category.parentId ? getCategoryById(category.parentId) : undefined;

  return (
    <>
      <PageContainer>
        <PageHeader
          breadcrumbs={
            <Breadcrumbs items={[...trail.map((c, i) => ({ label: c.name, to: i < trail.length - 1 ? categoryPath(c) : undefined }))]} />
          }
          // The header always names the product; the current topic is the list heading below
          title={product.name}
          subtitle={product.description ?? undefined}
          flush
        />

        {/* Body uses the page's full content width: topics at the left margin, questions fill the rest */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `${layout.sidebarWidth}px minmax(0, 1fr)` }, columnGap: 6 }}>
          <Box
            component="aside"
            sx={{
              minWidth: 0,
              alignSelf: 'stretch',
              ml: { md: -1.5 },
              pt: { xs: 3, md: 4 },
            }}
          >
            <Box sx={{ position: { md: 'sticky' }, top: { md: `calc(${layout.headerHeight}px + var(--sticky-search, 0px) + 24px)` } }}>
              {/* Same row height and gap as the list's SectionHeading + sort, so both columns start on one line */}
              <Typography
                variant="h3"
                component="h2"
                sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', minHeight: layout.controlHeight, px: 1.5, mb: 2 }}
              >
                Topics
              </Typography>
              <TopicNav product={product} currentId={category.id} />
            </Box>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              pt: { xs: 0, md: 4 },
            }}
          >
            {/* The page header search is the only search here; this row names the current topic and sorts it */}
            <SectionHeading
              id="questions-heading"
              title={category.id === product.id ? 'All questions' : category.name}
              trailing={<SortSelect value={sort} options={SORT_LABELS} onChange={(v) => update({ sort: v === 'views' ? null : v })} />}
            />

            {visible.length ? (
              <>
                <QuestionList
                  faqs={visible}
                  showViews
                  showDate
                  showCategory={category.id === product.id && hasTopics}
                  headingComponent="h3"
                  aria-label={`Questions in ${category.name}`}
                  linkState={{ from: 'category', returnTo, returnLabel: category.name }}
                />
                <ListPagination
                  page={page}
                  pageSize={pageSize}
                  total={list.length}
                  onChange={(p) => update({ page: p > 1 ? String(p) : null }, { replace: false })}
                />
              </>
            ) : (
              <EmptyState
                title="No questions yet"
                description="Browse another category or search the knowledge base."
                actions={
                  <Button variant="contained" href={parent ? categoryPath(parent) : '/'}>
                    Browse products
                  </Button>
                }
              />
            )}

            <Box sx={{ mt: { xs: 6, md: 8 } }}>
              <SupportCallout description={`Need help with ${product.name}? Our team can help.`} />
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </>
  );
}
