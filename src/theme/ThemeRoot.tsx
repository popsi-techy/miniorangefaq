import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { rootCssVariables, schemeCssVariables } from './tokens';

/**
 * Provides the MUI theme (light + dark colour schemes, default "system") and publishes
 * design tokens as CSS custom properties. Semantic variables switch with
 * `[data-mui-color-scheme]` on <html>, which MUI sets (and index.html pre-sets to avoid a flash).
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={{
          ':root': { ...rootCssVariables, ...schemeCssVariables('light') },
          '[data-mui-color-scheme="dark"]': schemeCssVariables('dark'),
        }}
      />
      {children}
    </ThemeProvider>
  );
}
