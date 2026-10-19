import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Footer } from './Footer';
import { Header } from './Header';

/** Page chrome: skip link, header, routed content and footer. Moves focus to <main> on navigation. */
export function AppShell() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'absolute',
          left: 8,
          top: -100,
          zIndex: 2000,
          px: 2,
          py: 1.5,
          bgcolor: 'var(--color-background-black)',
          color: 'var(--color-text-dark-primary)',
          borderRadius: 1,
          '&:focus': { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <Header />
      <Box component="main" id="main" ref={mainRef} tabIndex={-1} sx={{ flex: 1, outline: 'none', pb: { xs: 6, md: 10 }, overflowX: 'clip' }}>
        <Outlet />
      </Box>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
