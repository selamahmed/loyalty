import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadDeferredFonts } from './lib/loadDeferredFonts';
import { checkSupabaseConnection } from './lib/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true },
  },
});

void checkSupabaseConnection().then(({ ok, error }) => {
  if (!ok) {
    console.error('[Supabase] Connection failed:', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    loadDeferredFonts();
    initMonitoring();
  }, { timeout: 2500 });
} else {
  setTimeout(() => {
    loadDeferredFonts();
    initMonitoring();
  }, 1);
}
