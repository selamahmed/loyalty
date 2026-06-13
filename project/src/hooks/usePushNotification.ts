import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToPush,
  savePushSubscription,
  removePushSubscription,
  subscriptionToPayload,
} from '../services/pushNotifications';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface UsePushNotification {
  permission: PushPermission;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
  supported: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export const usePushNotification = (): UsePushNotification => {
  const { authUser } = useAuth();
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  const [permission, setPermission] = useState<PushPermission>(
    supported ? (Notification.permission as PushPermission) : 'unsupported',
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    void navigator.serviceWorker.getRegistration('/sw.js').then(async reg => {
      const sub = await reg?.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) {
      setError('Bu tarayıcı push bildirimlerini desteklemiyor.');
      return;
    }
    if (!authUser?.id) {
      setError('Giriş yapmanız gerekiyor.');
      return;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidKey) {
      setError('VAPID anahtarı yapılandırılmamış (VITE_VAPID_PUBLIC_KEY).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const sub = await subscribeToPush(vapidKey);
      if (!sub) throw new Error('Bildirim izni reddedildi.');

      setPermission(Notification.permission as PushPermission);
      await savePushSubscription(authUser.id, subscriptionToPayload(sub), navigator.userAgent);
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abonelik başarısız.');
    } finally {
      setLoading(false);
    }
  }, [supported, authUser?.id]);

  const unsubscribe = useCallback(async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(authUser.id, sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abonelik kaldırılamadı.');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  return { permission, subscribed, loading, error, supported, subscribe, unsubscribe };
};
