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

function isLandingRoute(): boolean {
  const hash = window.location.hash;
  return hash === '' || hash === '#/' || hash === '#/landing';
}

async function bootstrap(): Promise<void> {
  if (!isLandingRoute()) {
    await import('./index.css');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );

  if (isLandingRoute()) {
    const loadCss = () => { void import('./index.css'); };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadCss, { timeout: 2500 });
    } else {
      setTimeout(loadCss, 1);
    }
  }

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
