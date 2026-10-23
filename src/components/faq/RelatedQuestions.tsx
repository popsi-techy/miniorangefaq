import Box from '@mui/material/Box';
import { categoryPath, getCategoryById, getRelated } from '../../lib/content';
import type { Faq } from '../../types/faq';
import { SectionHeading } from '../common/SectionHeading';
import { QuestionList } from './QuestionList';

interface RelatedQuestionsProps {
  faq: Faq;
  /** "section": full-width block below the answer. "sidebar": compact list for the right-hand column. */
  variant?: 'section' | 'sidebar';
}

/**
 * Related questions for an article: curated "Related Articles" from the source first,
 * topped up with popular questions from the same category.
 */
export function RelatedQuestions({ faq, variant = 'section' }: RelatedQuestionsProps) {
  const { items, curated } = getRelated(faq, 6);
  const category = getCategoryById(faq.categoryId);
  if (!items.length) return null;
  const sidebar = variant === 'sidebar';
  return (
    <Box component={sidebar ? 'aside' : 'section'} aria-labelledby="related-heading">
      <SectionHeading
        id="related-heading"
        size={sidebar ? 'small' : 'default'}
        title={curated ? 'Related questions' : `More in ${category?.name ?? 'this category'}`}
        action={category ? { label: 'View all', href: categoryPath(category) } : undefined}
      />
      <QuestionList faqs={items} linkState={{ from: 'related' }} size={sidebar ? 'compact' : 'default'} />
    </Box>
  );
}
