import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SYSTEM_SETTINGS,
  getSystemSettings,
  type SystemSettings,
} from '../services/config';
import { useRealtimeTable } from '../hooks/useRealtime';

type SystemSettingsContextValue = {
  settings: SystemSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SystemSettingsContext = createContext<SystemSettingsContextValue | null>(null);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getSystemSettings();
      setSettings(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRealtimeTable('app_settings', refresh);

  const value = useMemo(
    () => ({ settings, loading, error, refresh }),
    [settings, loading, error, refresh],
  );

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export function useSystemSettings(): SystemSettingsContextValue {
  const ctx = useContext(SystemSettingsContext);
  if (!ctx) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return ctx;
}

/** Shorthand for feature flags from Supabase app_settings. */
export function useFeatureFlags(): SystemSettings['flags'] {
  return useSystemSettings().settings.flags;
}

/** Shorthand for loyalty limits from Supabase app_settings. */
export function useLoyaltySettings(): SystemSettings['loyalty'] {
  return useSystemSettings().settings.loyalty;
}
