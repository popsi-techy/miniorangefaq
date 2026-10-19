import Box from '@mui/material/Box';
import type { Faq } from '../../types/faq';
import { QuestionRow } from './QuestionRow';

type RowProps = Omit<React.ComponentProps<typeof QuestionRow>, 'faq'>;

interface QuestionListProps extends RowProps {
  faqs: Faq[];
  'aria-label'?: string;
}

/** List of <QuestionRow>s with list semantics. Rows separate by spacing and hover, not rules. */
export function QuestionList({ faqs, 'aria-label': ariaLabel, ...rowProps }: QuestionListProps) {
  return (
    <Box component="ul" aria-label={ariaLabel} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {faqs.map((faq) => (
        <li key={faq.id}>
          <QuestionRow faq={faq} {...rowProps} />
        </li>
      ))}
    </Box>
  );
}
