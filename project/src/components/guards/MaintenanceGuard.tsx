import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getMaintenanceStatus, type MaintenanceStatus } from '../../services/config';
import { useAuth } from '../../context/AuthContext';
import MaintenancePage from '../../pages/MaintenancePage';

const ADMIN_ROLES = ['super_admin', 'admin', 'store_admin', 'cashier'];

const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [checking, setChecking] = useState(true);

  const load = async () => {
    try {
      const s = await getMaintenanceStatus();
      setStatus(s);
    } catch {
      setStatus({ enabled: false, message: '', estimated_time: '', activated_at: null });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* Real-time: react instantly when admin toggles maintenance */
  useEffect(() => {
    const channel = supabase
      .channel('maintenance_watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'key=eq.maintenance_mode' },
        () => { load(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* Still loading auth or checking DB — render nothing (app spinner shows) */
  if (authLoading || checking) return null;

  /* Maintenance is OFF — pass through */
  if (!status?.enabled) return <>{children}</>;

  /* Maintenance is ON but user is an admin — show warning banner + allow through */
  const role = profile?.role ?? '';
  if (ADMIN_ROLES.includes(role)) {
    return (
      <>
        {/* Sticky admin-only banner */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#FF3B30', color: '#fff',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontWeight: 900, fontSize: 13, letterSpacing: '0.02em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          🔧 BAKİM MODU AKTİF — Sadece yöneticiler görebilir
          <span style={{ opacity: 0.8, fontWeight: 600, fontSize: 11 }}>Kullanıcılar bakım sayfası görüyor</span>
        </div>
        <div style={{ paddingTop: 36 }}>
          {children}
        </div>
      </>
    );
  }

  /* Everyone else — show maintenance page */
  return <MaintenancePage status={status} />;
};

export default MaintenanceGuard;
