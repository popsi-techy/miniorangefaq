import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Honour an assigned PORT (e.g. from a preview launcher); default 5173.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks stay cached across content updates; the FAQ index and
        // per-product article bodies are split separately (see src/lib/content.ts).
        codeSplitting: {
          groups: [
            { name: 'vendor-mui', test: /node_modules[\\/](@mui|@emotion)/ },
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'faq-index', test: /src[\\/]data[\\/](faqs|categories)\.json/ },
          ],
        },
      },
    },
  },
});
