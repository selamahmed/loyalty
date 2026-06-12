import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkSupabaseConnection } from './lib/supabase';

// Run a connection check on startup so misconfiguration is visible in DevTools.
checkSupabaseConnection().then(({ ok, error }) => {
  if (ok) {
    console.info('[Supabase] ✓ Connected successfully');
  } else {
    console.error(
      '[Supabase] ✗ Connection FAILED:',
      error,
      '\n\nFix checklist:\n' +
      '1. Open project/.env.local\n' +
      '2. Set VITE_SUPABASE_ANON_KEY to your JWT anon key\n' +
      '   (Supabase Dashboard → Project Settings → API → "anon public")\n' +
      '3. Run project/supabase/schema.sql in Supabase SQL Editor\n' +
      '4. If you already ran schema.sql, also run patch_new_tables.sql\n' +
      '5. Restart the dev server after editing .env.local'
    );
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
