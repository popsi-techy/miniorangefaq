import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined';
import UpdateRounded from '@mui/icons-material/UpdateRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { MetaItem } from '../components/common/MetaItem';
import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { ArticleContent } from '../components/faq/ArticleContent';
import type { ArticleLinkState } from '../components/faq/QuestionRow';
import { RelatedQuestions } from '../components/faq/RelatedQuestions';
import { ArticleFeedback } from '../components/feedback/ArticleFeedback';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import { categoryPath, faqPath, getCategoryTrail, getFaqBySlug, loadArticleBody, siteConfig } from '../lib/content';
import { formatDate, formatNumber, pluralize } from '../lib/format';
import { font, fontSize, layout, letterSpacing, lineHeight } from '../theme/tokens';
import type { Block } from '../types/faq';
import { NotFoundPage } from './NotFoundPage';

type BodyResult = { key: string; blocks: Block[] } | { key: string; error: string };

/**
 * Individual answer: /knowledgebase/:slug (same URL as the source site).
 * Header title is the product. The question, with views, date and likes, is the
 * article heading; feedback sits under the answer, then related questions.
 */
export function ArticlePage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const faq = getFaqBySlug(slug);
  const [result, setResult] = useState<BodyResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loadKey = `${faq?.id}:${attempt}`;

  usePageMeta({
    title: faq?.title ?? 'Article not found',
    description: faq?.excerpt || undefined,
    path: faq ? faqPath(faq) : undefined,
    noIndex: !faq,
  });

  useEffect(() => {
    if (!faq) return;
    let active = true;
    loadArticleBody(faq)
      .then((blocks) => active && setResult({ key: loadKey, blocks }))
      .catch((err: unknown) => active && setResult({ key: loadKey, error: err instanceof Error ? err.message : 'Unknown error' }));
    return () => {
      active = false;
    };
  }, [faq, loadKey]);

  const retry = () => setAttempt((n) => n + 1);
  // Anything not yet resolved for the current article/attempt is still loading
  const body =
    result?.key !== loadKey
      ? ({ status: 'loading' } as const)
      : 'error' in result
        ? ({ status: 'error' } as const)
        : ({ status: 'ready', blocks: result.blocks } as const);

  if (!faq) return <NotFoundPage kind="article" slug={slug} />;

  const relatedAside = siteConfig.article.relatedSidebarSlugs.includes(faq.slug);
  const trail = getCategoryTrail(faq.categoryId);
  const product = trail[0];
  const updated = formatDate(faq.updatedAt);
  // Return to the list the reader came from (search results, filtered/sorted topic list); otherwise the product
  const from = location.state as ArticleLinkState | null;
  const back =
    from?.returnTo?.startsWith('/') && from.returnLabel
      ? { href: from.returnTo, label: `Back to ${from.returnLabel}` }
      : { href: categoryPath(product), label: 'Back to all questions' };

  return (
    <PageContainer>
      <PageHeader
        titleId="product-heading"
        title={product.name}
        breadcrumbs={<Breadcrumbs items={trail.map((c) => ({ label: c.name, to: categoryPath(c) }))} />}
      />

      {/* Two-column variant (configured per question): answer at reading width, related questions in a sticky right column.
          Below md the column stacks under the answer. */}
      <Box
        sx={
          relatedAside
            ? {
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `minmax(0, ${layout.readingMaxWidth}px) ${layout.asideWidth}px` },
                justifyContent: 'center',
                columnGap: { md: 6, lg: 8 },
                rowGap: 6,
              }
            : undefined
        }
      >
        <Box component="article" aria-labelledby="article-title" sx={{ maxWidth: layout.readingMaxWidth, mx: 'auto', minWidth: 0, width: relatedAside ? 1 : undefined }}>
          <Button variant="text" size="small" startIcon={<ArrowBackRounded />} href={back.href} sx={{ ml: -1, mb: 2.5 }}>
            {back.label}
          </Button>
          <Typography
            id="article-title"
            component="h2"
            sx={{
              fontSize: { xs: fontSize['2xl'], md: fontSize['3xl'] },
              fontWeight: font.weightSemibold,
              lineHeight: lineHeight.snug,
              letterSpacing: letterSpacing.tight,
              overflowWrap: 'anywhere',
            }}
          >
            {faq.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 1, mt: 2 }}>
            {faq.views != null && <MetaItem icon={<VisibilityOutlined />}>{formatNumber(faq.views)} views</MetaItem>}
            {updated && (
              <MetaItem icon={<UpdateRounded />}>
                <time dateTime={faq.updatedAt ?? undefined}>{updated}</time>
              </MetaItem>
            )}
            <MetaItem icon={<ThumbUpOutlined />}>{pluralize(faq.helpful.yes, 'like')}</MetaItem>
          </Box>

          <Divider sx={{ my: 3 }} />

          {body.status === 'loading' && <LoadingState label="Loading answer" />}
          {body.status === 'error' && <ErrorState title="The answer could not be loaded" message="Check your connection and try again." onRetry={retry} />}
          {body.status === 'ready' &&
            (body.blocks.length ? (
              <ArticleContent blocks={body.blocks} />
            ) : (
              <ErrorState title="This answer has no content yet" message="Contact support and we will help you directly." />
            ))}

          <Box sx={{ mt: { xs: 4, md: 5 } }}>
            <ArticleFeedback key={faq.id} faq={faq} />
          </Box>
        </Box>

        {relatedAside && (
          <Box
            sx={{
              alignSelf: 'start',
              position: { md: 'sticky' },
              top: { md: `calc(${layout.headerHeight}px + var(--sticky-search, 0px) + 24px)` },
              // Never taller than the space below the sticky bars, so every item stays reachable on short screens
              maxHeight: { md: `calc(100vh - ${layout.headerHeight}px - var(--sticky-search, 0px) - 48px)` },
              overflowY: { md: 'auto' },
              // Room for the row hover background (rows bleed 12px left) and focus ring inside the scroll box
              mx: { md: -1.5 },
              px: { md: 1.5 },
            }}
          >
            <RelatedQuestions faq={faq} variant="sidebar" />
          </Box>
        )}
      </Box>

      {!relatedAside && (
        <Box sx={{ maxWidth: layout.readingMaxWidth, mx: 'auto', mt: { xs: 6, md: 8 } }}>
          <RelatedQuestions faq={faq} />
        </Box>
      )}
    </PageContainer>
  );
}
