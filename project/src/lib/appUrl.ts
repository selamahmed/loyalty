/** Canonical app origin — used for Supabase OAuth / password-reset redirects. */
const DEFAULT_APP_URL = 'https://loyalty-bmfq.vercel.app';

export function getAppOrigin(): string {
  const envUrl = import.meta.env.VITE_APP_URL as string | undefined;
  if (envUrl?.trim()) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return DEFAULT_APP_URL;
}

export function authCallbackUrl(): string {
  return `${getAppOrigin()}/#/auth/callback`;
}

export function resetPasswordUrl(): string {
  return `${getAppOrigin()}/#/reset-password`;
}
