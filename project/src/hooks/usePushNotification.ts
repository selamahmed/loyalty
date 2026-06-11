import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY =
  'BD_vwh5zUKHGdwNUzWoUpfBx4xMwNaCcrdrYSOSKzo9ZnoPr2XScpRFKwLARCEJLvN2OpRRlOefZ4zEPkOhpU_g';

const PUSH_BASE = '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const out     = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface UsePushNotification {
  permission: PushPermission;
  subscribed:  boolean;
  loading:     boolean;
  error:       string | null;
  supported:   boolean;
  subscribe:   () => Promise<void>;
  unsubscribe: () => Promise<void>;
  broadcast:   (payload: { title: string; message: string; url?: string }) => Promise<void>;
}

export const usePushNotification = (): UsePushNotification => {
  const supported  = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  const [permission, setPermission] = useState<PushPermission>(supported ? (Notification.permission as PushPermission) : 'unsupported');
  const [subscribed,  setSubscribed]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    setSubscribed(localStorage.getItem('push_subscribed') === 'true');
  }, [supported]);

  const getRegistration = useCallback(async (): Promise<ServiceWorkerRegistration> => {
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existing) return existing;
    return navigator.serviceWorker.register('/sw.js');
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported) { setError('Bu tarayıcı push bildirimlerini desteklemiyor.'); return; }
    setLoading(true); setError(null);
    try {
      const reg  = await getRegistration();
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== 'granted') throw new Error('Bildirim izni reddedildi.');

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch(`${PUSH_BASE}/api/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub.toJSON()),
      });

      setSubscribed(true);
      localStorage.setItem('push_subscribed', 'true');
      localStorage.setItem('push_endpoint', sub.endpoint);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Abonelik başarısız.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [supported, getRegistration]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = localStorage.getItem('push_endpoint');
      if (endpoint) {
        await fetch(`${PUSH_BASE}/api/unsubscribe`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint }),
        });
      }
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      await sub?.unsubscribe();
      setSubscribed(false);
      localStorage.removeItem('push_subscribed');
      localStorage.removeItem('push_endpoint');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abonelik kaldırılamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  const broadcast = useCallback(async (payload: { title: string; message: string; url?: string }) => {
    await fetch(`${PUSH_BASE}/api/broadcast`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  }, []);

  return { permission, subscribed, loading, error, supported, subscribe, unsubscribe, broadcast };
};
