import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { loadDeferredFonts } from './lib/loadDeferredFonts';
import ErrorBoundary from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true },
  },
});

async function bootstrap(): Promise<void> {
  // Load stylesheet before first paint — deferring caused hero layout to shift when CSS arrived.
  await import('./index.css');

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );

  const runIdle = () => {
    loadDeferredFonts();
    initMonitoring();
    void import('./lib/supabase').then(({ checkSupabaseConnection }) =>
      checkSupabaseConnection().then(({ ok, error }) => {
        if (!ok) console.error('[Supabase] Connection failed:', error);
      }),
    );
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runIdle, { timeout: 3000 });
  } else {
    setTimeout(runIdle, 1);
  }
}

void bootstrap();
