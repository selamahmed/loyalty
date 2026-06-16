import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadDeferredFonts } from './lib/loadDeferredFonts';
import ErrorBoundary from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';

function bootstrap(): void {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
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

bootstrap();
