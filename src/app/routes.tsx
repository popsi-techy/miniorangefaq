import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ArticlePage } from '../pages/ArticlePage';
import { CategoryPage } from '../pages/CategoryPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RouteErrorPage } from '../pages/RouteErrorPage';
import { SearchPage } from '../pages/SearchPage';
import { SupportPage } from '../pages/SupportPage';

/**
 * URL map. /kb/* and /knowledgebase/:slug match the source site (faq.miniorange.in)
 * so existing links and bookmarks keep working.
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      // The former All categories page; every product is listed on the homepage
      { path: '/categories', element: <Navigate to="/" replace /> },
      { path: '/kb/*', element: <CategoryPage /> },
      { path: '/knowledgebase/:slug', element: <ArticlePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/support', element: <SupportPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
