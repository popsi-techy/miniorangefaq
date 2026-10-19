import Box from '@mui/material/Box';
import { highlight } from '../../lib/search';
import { cssVar } from '../../theme/tokens';

/** Renders text with search-term matches marked (soft accent fill + medium weight, not colour alone). */
export function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((seg, i) =>
        seg.match ? (
          <Box key={i} component="mark" sx={{ bgcolor: cssVar.accentSoft, color: 'inherit', fontWeight: 600, borderRadius: 0.5, px: '1px' }}>
            {seg.text}
          </Box>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
