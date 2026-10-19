import { RouterProvider } from 'react-router-dom';
import { ThemeRoot } from '../theme/ThemeRoot';
import { router } from './routes';

export function App() {
  return (
    <ThemeRoot>
      <RouterProvider router={router} />
    </ThemeRoot>
  );
}
