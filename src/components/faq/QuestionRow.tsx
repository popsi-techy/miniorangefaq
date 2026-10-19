import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { faqPath, getCategoryTrail } from '../../lib/content';
import { formatDate, formatNumber } from '../../lib/format';
import { cssVar } from '../../theme/tokens';
import type { Faq } from '../../types/faq';
import { HoverArrow } from '../common/HoverArrow';
import { hoverArrowRevealSx } from '../common/hoverArrowSx';
import { MetaItem } from '../common/MetaItem';
import { HighlightedText } from '../search/HighlightedText';

export interface ArticleLinkState {
  from: 'search' | 'category' | 'home' | 'related';
  query?: string;
  /** Path (with search params) to return to. */
  returnTo?: string;
  returnLabel?: string;
}

interface QuestionRowProps {
  faq: Faq;
  /** Show the product / topic label under the title. */
  showCategory?: boolean;
  showDate?: boolean;
  showViews?: boolean;
  terms?: string[];
  linkState?: ArticleLinkState;
  headingComponent?: 'h2' | 'h3' | 'h4' | 'span';
}

/**
 * One question in a list: title (+ optional category) on the left, date / views on the right.
 * The whole row is one link (one tab stop). Use inside <QuestionList>.
 */
export function QuestionRow({ faq, showCategory = false, showDate = false, showViews = false, terms = [], linkState, headingComponent = 'h3' }: QuestionRowProps) {
  const trail = showCategory ? getCategoryTrail(faq.categoryId) : [];
  const date = showDate ? formatDate(faq.updatedAt) : null;
  const views = showViews && faq.views != null ? formatNumber(faq.views) : null;

  return (
    <Box
      component={RouterLink}
      to={faqPath(faq)}
      state={linkState}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        py: 1.25,
        px: 1.5,
        mx: -1.5,
        color: cssVar.text,
        textDecoration: 'none',
        borderRadius: 1.5,
        transition: 'background-color var(--motion-duration) var(--motion-easing)',
        // List items use the grey hover background; only cards lift (see design-system.md)
        '&:hover': { bgcolor: cssVar.surfaceSubtle },
        ...hoverArrowRevealSx,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component={headingComponent} variant="h5" sx={{ overflowWrap: 'anywhere' }}>
          <HighlightedText text={faq.title} terms={terms} />
        </Typography>
        {trail.length > 0 && (
          <Typography variant="meta" component="p" sx={{ mt: 0.25 }}>
            {trail.map((c) => c.name).join(' / ')}
          </Typography>
        )}
        {(date || views) && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1.5, mt: 0.5 }}>
            {date && <MetaItem>{date}</MetaItem>}
            {views && <MetaItem icon={<VisibilityOutlined />}>{views}</MetaItem>}
          </Box>
        )}
      </Box>
      {(date || views) && (
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, flexShrink: 0, pt: 0.25 }}>
          {views && <MetaItem icon={<VisibilityOutlined />}>{views}</MetaItem>}
          {date && (
            <MetaItem>
              <time dateTime={faq.updatedAt ?? undefined}>{date}</time>
            </MetaItem>
          )}
        </Box>
      )}
      <HoverArrow sx={{ mt: 0.25 }} />
    </Box>
  );
}
