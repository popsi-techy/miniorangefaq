import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/common/PageContainer';
import { SectionHeading } from '../components/common/SectionHeading';
import { QuestionList } from '../components/faq/QuestionList';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { PageHeader } from '../components/common/PageHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../lib/content';
import { searchFaqs } from '../lib/search';

interface NotFoundPageProps {
  kind?: 'page' | 'article' | 'category';
  /** Slug of the missing article; its words are used to suggest similar questions. */
  slug?: string;
}

const copy = {
  page: { title: 'Page not found', text: 'The page you are looking for does not exist or has moved.' },
  article: { title: 'Article not found', text: 'This article is not in this portal. It may have been removed, renamed, or not yet imported.' },
  category: { title: 'Category not found', text: 'This category does not exist or has been renamed.' },
};

/** 404 state for unknown routes, articles and categories, with ways forward. */
export function NotFoundPage({ kind = 'page', slug }: NotFoundPageProps) {
  usePageMeta({ title: copy[kind].title, noIndex: true });
  const suggestions = slug ? searchFaqs(slug.replace(/-/g, ' '), 5).results.map((r) => r.faq) : [];
  return (
    <PageContainer>
      <PageHeader breadcrumbs={<Breadcrumbs items={[{ label: copy[kind].title }]} />} />
      <Box sx={{ maxWidth: 860, mx: 'auto' }}>
        <EmptyState
          headingComponent="h1"
          title={copy[kind].title}
          description={copy[kind].text}
          actions={
            <>
              <Button variant="contained" href="/">
                Go to knowledge base home
              </Button>
              <Button variant="outlined" href="/">
                Browse products
              </Button>
              {kind === 'article' && slug && (
                <Button variant="outlined" href={`${siteConfig.sourceOrigin}/knowledgebase/${slug}/`}>
                  Try the original site
                </Button>
              )}
            </>
          }
        />
        {suggestions.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <SectionHeading title="Similar questions" />
            <QuestionList faqs={suggestions} showCategory />
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
