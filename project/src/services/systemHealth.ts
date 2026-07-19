import { supabase } from '../lib/supabase';

export type HealthStatus = 'healthy' | 'degraded' | 'offline';

export type SystemHealthCheck = {
  id: 'data-api' | 'auth' | 'analytics' | 'static-content';
  name: string;
  status: HealthStatus;
  latencyMs: number | null;
  detail: string;
};

const TIMEOUT_MS = 8_000;
const SLOW_RESPONSE_MS = 3_000;

function withTimeout<T>(operation: Promise<T>): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('health-check-timeout')), TIMEOUT_MS);
    }),
  ]);
}

function unavailableStatus(message?: string): HealthStatus {
  const normalized = (message ?? '').toLowerCase();
  return normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized.includes('timeout')
    ? 'offline'
    : 'degraded';
}

async function measure(
  id: SystemHealthCheck['id'],
  name: string,
  operation: () => Promise<{ error?: { message?: string } | null; detail?: string }>,
): Promise<SystemHealthCheck> {
  const startedAt = performance.now();

  try {
    const result = await withTimeout(operation());
    const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));

    if (result.error) {
      const status = unavailableStatus(result.error.message);
      return {
        id,
        name,
        status,
        latencyMs,
        detail: status === 'offline' ? 'Yanıt alınamadı' : 'Yanıt alındı, ancak kontrol başarısız oldu',
      };
    }

    const status: HealthStatus = latencyMs > SLOW_RESPONSE_MS ? 'degraded' : 'healthy';
    return {
      id,
      name,
      status,
      latencyMs,
      detail: result.detail ?? (status === 'healthy' ? 'Çalışıyor' : 'Yavaş yanıt veriyor'),
    };
  } catch (error) {
    return {
      id,
      name,
      status: 'offline',
      latencyMs: null,
      detail: error instanceof Error && error.message === 'health-check-timeout'
        ? 'Kontrol zaman aşımına uğradı'
        : 'Yanıt alınamadı',
    };
  }
}

export async function getSystemHealth(): Promise<SystemHealthCheck[]> {
  return Promise.all([
    measure('data-api', 'Veri API’si', async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return { error };
    }),
    measure('auth', 'Kimlik Doğrulama', async () => {
      const { data, error } = await supabase.auth.getUser();
      return {
        error,
        detail: data.user ? 'Oturum doğrulandı' : 'Aktif oturum bulunamadı',
      };
    }),
    measure('analytics', 'Analitik Verileri', async () => {
      const { error } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true });
      return { error };
    }),
    measure('static-content', 'Uygulama İçeriği', async () => {
      const response = await fetch(`/assets/icons/logo-32.webp?health=${Date.now()}`, {
        cache: 'no-store',
      });
      return {
        error: response.ok ? null : { message: `HTTP ${response.status}` },
      };
    }),
  ]);
}
