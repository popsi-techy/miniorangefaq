import type { ReactNode } from 'react';
import Container from '@mui/material/Container';
import { layout } from '../../theme/tokens';

/** Horizontal page frame shared by every page and the header/footer. */
export function PageContainer({ children, component = 'div' }: { children: ReactNode; component?: React.ElementType }) {
  return (
    <Container component={component} maxWidth={false} sx={{ maxWidth: layout.pageMaxWidth, px: { xs: 2, sm: 3 } }}>
      {children}
    </Container>
  );
}
