import Box from '@mui/material/Box';
import { categoryPath, getCategoryById, getRelated } from '../../lib/content';
import type { Faq } from '../../types/faq';
import { SectionHeading } from '../common/SectionHeading';
import { QuestionList } from './QuestionList';

/**
 * Related questions below an article: curated "Related Articles" from the source first,
 * topped up with popular questions from the same category.
 */
export function RelatedQuestions({ faq }: { faq: Faq }) {
  const { items, curated } = getRelated(faq, 6);
  const category = getCategoryById(faq.categoryId);
  if (!items.length) return null;
  return (
    <Box component="section" aria-labelledby="related-heading">
      <SectionHeading
        id="related-heading"
        title={curated ? 'Related questions' : `More in ${category?.name ?? 'this category'}`}
        action={category ? { label: 'View all', href: categoryPath(category) } : undefined}
      />
      <QuestionList faqs={items} linkState={{ from: 'related' }} />
    </Box>
  );
}
