import React, { useState, useCallback, useEffect } from 'react';
import { Settings, Save, CheckCircle, Loader, Zap, ToggleLeft, ToggleRight, TrendingUp, ShieldCheck, Sliders, AlertTriangle, Wrench, Power, X, Clock } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAppSettings, updateAppSettings, getMaintenanceStatus, setMaintenanceMode, type MaintenanceStatus } from '../../services/config';
import { useRealtimeTable } from '../../hooks/useRealtime';

/* ─── Types ─── */
interface PointsEconomy {
  spend_to_points: number;     // TL spent → points earned (e.g. 10 = 1₺ → 10pts)
  points_to_tl: number;        // Points needed per 1₺ value (e.g. 100 = 100pts → 1₺)
  referral_bonus: number;
  welcome_bonus: number;
}

interface EventMultipliers {
  qr_base_points: number;      // Base points per QR scan
  game_multiplier: number;     // e.g. 1.5 = 1.5x
  daily_mission_bonus: number; // bonus per completed mission
  streak_bonus: number;        // points for consecutive day streak
}

interface UserLimits {
  daily_earn_cap: number;
  max_balance: number;
  min_redeem_threshold: number;
  transaction_cooldown_min: number;
}

interface FeatureFlags {
  qr_enabled: boolean;
  games_enabled: boolean;
  referral_enabled: boolean;
  streak_enabled: boolean;
  push_notifications: boolean;
  double_points_events: boolean;
}

interface AllSettings {
  economy: PointsEconomy;
  multipliers: EventMultipliers;
  limits: UserLimits;
  flags: FeatureFlags;
}

const DEFAULTS: AllSettings = {
  economy: { spend_to_points: 10, points_to_tl: 100, referral_bonus: 250, welcome_bonus: 100 },
  multipliers: { qr_base_points: 75, game_multiplier: 1.5, daily_mission_bonus: 50, streak_bonus: 30 },
  limits: { daily_earn_cap: 1000, max_balance: 50000, min_redeem_threshold: 500, transaction_cooldown_min: 30 },
  flags: { qr_enabled: true, games_enabled: true, referral_enabled: true, streak_enabled: true, push_notifications: true, double_points_events: false },
};

/* ─── Slider control ─── */
const SliderControl: React.FC<{
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  preview: string;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, step, unit, color, preview, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--dark-border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
          <input
            type="number"
            value={value}
            min={min} max={max} step={step}
            onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            style={{
              width: 70, padding: '5px 8px', borderRadius: 10, textAlign: 'center',
              border: `2.5px solid ${color}`, background: `${color}12`,
              fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{unit}</span>
        </div>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.1s' }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', left: 0, right: 0, width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', margin: 0, padding: 0 }}
        />
      </div>

      {/* Impact preview */}
      <div style={{ padding: '6px 10px', borderRadius: 8, background: `${color}10`, border: `1.5px solid ${color}30`, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <TrendingUp size={11} color={color} />
        <span style={{ fontSize: 11, fontWeight: 700, color: color }}>{preview}</span>
      </div>
    </div>
  );
};

/* ─── Feature flag toggle ─── */
const FlagRow: React.FC<{ label: string; sub: string; value: boolean; color: string; onChange: (v: boolean) => void }> = ({ label, sub, value, color, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '2px solid var(--dark-border)', cursor: 'pointer' }} onClick={() => onChange(!value)}>
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 1px' }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 900, color: value ? color : 'var(--text-muted)', textTransform: 'uppercase' }}>{value ? 'Açık' : 'Kapalı'}</span>
      {value
        ? <ToggleRight size={28} color={color} />
        : <ToggleLeft size={28} color="var(--text-muted)" />
      }
    </div>
  </div>
);

/* ─── Section wrapper ─── */
const Section: React.FC<{ icon: React.ElementType; title: string; subtitle: string; color: string; children: React.ReactNode }> =
  ({ icon: Icon, title, subtitle, color, children }) => (
    <div style={{ borderRadius: 18, border: '2.5px solid var(--dark-border)', background: 'var(--card-bg)', boxShadow: '0 4px 0 var(--dark-border)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)', background: `${color}0a`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );

/* ─── Unsaved banner ─── */
const UnsavedBanner: React.FC<{ onSave: () => void; onDiscard: () => void; saving: boolean }> = ({ onSave, onDiscard, saving }) => (
  <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 18, background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)', animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: 'calc(100vw - 32px)' }}>
    <AlertTriangle size={16} color="#f59e0b" />
    <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>Kaydedilmemiş değişiklikler</span>
    <button onClick={onDiscard} style={{ padding: '7px 14px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>
      Geri Al
    </button>
    <button onClick={onSave} disabled={saving} style={{ padding: '7px 16px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: saving ? '#a78bfa' : 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
      {saving ? <Loader size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={12} />}
      {saving ? 'Kaydediliyor…' : 'Kaydet'}
    </button>
  </div>
);

/* ─── Maintenance Mode Panel ─── */
const MaintenancePanel: React.FC = () => {
  const [mStatus,   setMStatus]   = useState<MaintenanceStatus | null>(null);
  const [mLoading,  setMLoading]  = useState(true);
  const [mSaving,   setMSaving]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mMessage,  setMMessage]  = useState('');
  const [mTime,     setMTime]     = useState('');

  const loadStatus = useCallback(async () => {
    try {
      const s = await getMaintenanceStatus();
      setMStatus(s);
      setMMessage(s.message);
      setMTime(s.estimated_time);
    } catch { /**/ } finally { setMLoading(false); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleToggle = async (enable: boolean) => {
    setMSaving(true);
    try {
      await setMaintenanceMode(enable, mMessage, mTime);
      setMStatus(prev => prev ? { ...prev, enabled: enable } : null);
    } catch { /**/ } finally {
      setMSaving(false);
      setShowConfirm(false);
    }
  };

  const isOn = mStatus?.enabled ?? false;

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      border: `3px solid ${isOn ? '#FF3B30' : 'var(--dark-border)'}`,
      boxShadow: isOn ? '0 6px 0 #FF3B30, 0 0 40px rgba(255,59,48,0.15)' : '0 4px 0 var(--dark-border)',
      background: isOn ? 'rgba(255,59,48,0.05)' : 'var(--card-bg)',
      transition: 'all 0.3s',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: `2.5px solid ${isOn ? 'rgba(255,59,48,0.3)' : 'var(--dark-border)'}`, background: isOn ? 'rgba(255,59,48,0.08)' : 'rgba(255,59,48,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: isOn ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.1)', border: `2px solid ${isOn ? '#FF3B30' : 'rgba(255,59,48,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} color="#FF3B30" />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Bakım Modu</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Aktifken kullanıcılar bakım sayfası görür, yöneticiler erişebilir</p>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontWeight: 900, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const, border: `2px solid ${isOn ? '#FF3B30' : '#22c55e'}`, background: isOn ? 'rgba(255,59,48,0.1)' : 'rgba(34,197,94,0.1)', color: isOn ? '#FF3B30' : '#22c55e' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOn ? '#FF3B30' : '#22c55e', boxShadow: `0 0 6px ${isOn ? '#FF3B30' : '#22c55e'}`, animation: isOn ? 'pulse-dot 1s ease-in-out infinite' : 'none' }} />
            {mLoading ? '...' : isOn ? 'AKTİF' : 'KAPALI'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 22 }}>
        {/* Message input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontWeight: 900, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>
            Kullanıcıya gösterilecek mesaj
          </label>
          <textarea
            value={mMessage}
            onChange={e => setMMessage(e.target.value)}
            rows={2}
            placeholder="örn. Siteyi sizin için yeniliyoruz, kısa süre içinde dönüyoruz!"
            className="input-field resize-none"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Estimated time */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 900, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>
            <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
            Tahmini geri dönüş süresi
          </label>
          <input
            value={mTime}
            onChange={e => setMTime(e.target.value)}
            placeholder="örn. 2 saat, 30 dakika, 14:00..."
            className="input-field"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Big toggle button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={mLoading || mSaving}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 16, fontWeight: 900, fontSize: 15,
            cursor: mLoading || mSaving ? 'not-allowed' : 'pointer',
            border: `3px solid ${isOn ? '#22c55e' : '#FF3B30'}`,
            boxShadow: isOn ? '0 5px 0 #16a34a' : '0 5px 0 #c0392b',
            background: isOn ? 'rgba(34,197,94,0.12)' : 'rgba(255,59,48,0.12)',
            color: isOn ? '#16a34a' : '#FF3B30',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.15s', opacity: mLoading || mSaving ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!mLoading && !mSaving) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
          {mSaving ? (
            <Loader size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <Power size={18} />
          )}
          {mSaving ? 'Değiştiriliyor…' : isOn ? '✅ Bakım Modunu Kapat (Siteyi Aç)' : '🔧 Bakım Modunu Aç (Siteyi Kapat)'}
        </button>

        {isOn && (
          <p style={{ marginTop: 10, textAlign: 'center', fontSize: 11, color: '#FF3B30', fontWeight: 700 }}>
            ⚠️ Şu anda tüm kullanıcılar bakım sayfası görüyor
          </p>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: 16 }}>
          <div style={{ maxWidth: 400, width: '100%', background: 'var(--card-bg)', border: `3px solid ${isOn ? '#22c55e' : '#FF3B30'}`, boxShadow: `0 8px 0 ${isOn ? '#16a34a' : '#c0392b'}`, borderRadius: 22, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{isOn ? '✅' : '⚠️'}</div>
            <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', marginBottom: 8 }}>
              {isOn ? 'Bakım Modunu Kapat?' : 'Bakım Modunu Aç?'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 22 }}>
              {isOn
                ? 'Site tekrar normal çalışmaya başlayacak. Tüm kullanıcılar siteye erişebilecek.'
                : `Site kullanıcılara kapatılacak. Sadece yöneticiler erişebilecek. Mesaj: "${mMessage || 'Bakım devam ediyor...'}"`
              }
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: 'pointer', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', background: 'var(--card-bg)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <X size={14} /> İptal
              </button>
              <button onClick={() => handleToggle(!isOn)} style={{ flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: 'pointer', border: `2.5px solid ${isOn ? '#22c55e' : '#FF3B30'}`, boxShadow: isOn ? '0 3px 0 #16a34a' : '0 3px 0 #c0392b', background: isOn ? 'rgba(34,197,94,0.15)' : 'rgba(255,59,48,0.15)', color: isOn ? '#16a34a' : '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Power size={14} /> {isOn ? 'Evet, Kapat' : 'Evet, Aç'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

/* ─── Main component ─── */
const AdminSettings: React.FC = () => {
  const [saved, setSaved]       = useState<AllSettings>(DEFAULTS);
  const [draft, setDraft]       = useState<AllSettings>(DEFAULTS);
  const [saving, setSaving]     = useState(false);
  const [saved2, setSaved2]     = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  /* Load settings from DB on mount */
  const loadSettings = useCallback(async () => {
    try {
      const rows = await getAppSettings();
      if (rows.length === 0) { setDbLoaded(true); return; }
      const map: Record<string, unknown> = {};
      rows.forEach(r => { map[r.key] = r.value; });

      const merged: AllSettings = {
        economy: {
          spend_to_points:       Number(map['points_per_currency'] ?? DEFAULTS.economy.spend_to_points),
          points_to_tl:          DEFAULTS.economy.points_to_tl,
          referral_bonus:        Number(map['referral_bonus'] ?? DEFAULTS.economy.referral_bonus),
          welcome_bonus:         DEFAULTS.economy.welcome_bonus,
        },
        multipliers: {
          qr_base_points:        Number(map['qr_scan_bonus'] ?? DEFAULTS.multipliers.qr_base_points),
          game_multiplier:       DEFAULTS.multipliers.game_multiplier,
          daily_mission_bonus:   Number(map['daily_login_bonus'] ?? DEFAULTS.multipliers.daily_mission_bonus),
          streak_bonus:          DEFAULTS.multipliers.streak_bonus,
        },
        limits: {
          daily_earn_cap:        Number(map['max_daily_points'] ?? DEFAULTS.limits.daily_earn_cap),
          max_balance:           DEFAULTS.limits.max_balance,
          min_redeem_threshold:  DEFAULTS.limits.min_redeem_threshold,
          transaction_cooldown_min: DEFAULTS.limits.transaction_cooldown_min,
        },
        flags: {
          qr_enabled:            map['maintenance_mode'] !== 'true',
          games_enabled:         DEFAULTS.flags.games_enabled,
          referral_enabled:      DEFAULTS.flags.referral_enabled,
          streak_enabled:        DEFAULTS.flags.streak_enabled,
          push_notifications:    DEFAULTS.flags.push_notifications,
          double_points_events:  map['double_points_enabled'] === 'true',
        },
      };
      setSaved(merged);
      setDraft(merged);
    } catch { /* fallback to defaults */ } finally { setDbLoaded(true); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  /* realtime: reload when app_settings changes */
  useRealtimeTable('app_settings', loadSettings);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const setEco = useCallback((patch: Partial<PointsEconomy>) => setDraft(d => ({ ...d, economy: { ...d.economy, ...patch } })), []);
  const setMul = useCallback((patch: Partial<EventMultipliers>) => setDraft(d => ({ ...d, multipliers: { ...d.multipliers, ...patch } })), []);
  const setLim = useCallback((patch: Partial<UserLimits>) => setDraft(d => ({ ...d, limits: { ...d.limits, ...patch } })), []);
  const setFlag = useCallback((patch: Partial<FeatureFlags>) => setDraft(d => ({ ...d, flags: { ...d.flags, ...patch } })), []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppSettings({
        'points_per_currency':  draft.economy.spend_to_points,
        'referral_bonus':       draft.economy.referral_bonus,
        'qr_scan_bonus':        draft.multipliers.qr_base_points,
        'daily_login_bonus':    draft.multipliers.daily_mission_bonus,
        'max_daily_points':     draft.limits.daily_earn_cap,
        'double_points_enabled': draft.flags.double_points_events,
        'maintenance_mode':     !draft.flags.qr_enabled,
      });
      setSaved(draft);
    } catch (e) { console.error(e); } finally {
      setSaving(false);
      setSaved2(true);
      setTimeout(() => setSaved2(false), 2500);
    }
  };

  if (!dbLoaded) return (
    <AdminLayout>
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const handleDiscard = () => setDraft(saved);

  const { economy: eco, multipliers: mul, limits: lim, flags } = draft;

  return (
    <AdminLayout>
      {isDirty && <UnsavedBanner onSave={handleSave} onDiscard={handleDiscard} saving={saving} />}

      <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto" style={{ paddingBottom: isDirty ? 100 : undefined }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>Sistem Ayarları</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Değerleri gerçek zamanlı olarak yapılandırın</p>
          </div>
          {saved2 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
              <CheckCircle size={14} color="#16a34a" />
              <span style={{ fontSize: 12, fontWeight: 900, color: '#16a34a' }}>Kaydedildi</span>
            </div>
          )}
        </div>

        {/* ── 0. Maintenance Mode ── */}
        <MaintenancePanel />

        {/* ── 1. Puan Ekonomisi ── */}
        <Section icon={TrendingUp} title="Puan Ekonomisi" subtitle="TL ↔ Puan dönüşüm oranlarını ayarlayın (ondalık değer desteklenir)" color="#7B6EF6">
          <SliderControl
            label="Harcama → Puan Oranı"
            description="1 TL harcandığında kazanılan puan sayısı (ondalık desteklenir)"
            value={eco.spend_to_points} min={0.1} max={50} step={0.1} unit="puan/₺"
            color="#7B6EF6"
            preview={`100₺ alışveriş = ${(100 * eco.spend_to_points).toFixed(1)} puan kazanılır`}
            onChange={v => setEco({ spend_to_points: Math.round(v * 10) / 10 })}
          />
          <SliderControl
            label="Puan Değeri (Kullanım)"
            description="Kaç puan 1 TL'ye eşit — ondalık girilebilir"
            value={eco.points_to_tl} min={1} max={1000} step={0.5} unit="puan/₺"
            color="#4F8EF7"
            preview={`${eco.points_to_tl} puan = 1₺ · 1000 puan ≈ ${(1000 / eco.points_to_tl).toFixed(2)}₺`}
            onChange={v => setEco({ points_to_tl: Math.round(v * 10) / 10 })}
          />
          <SliderControl
            label="Referral Bonusu"
            description="Yeni kullanıcı davet edildiğinde verilen puan"
            value={eco.referral_bonus} min={0} max={1000} step={0.5} unit="puan"
            color="#f59e0b"
            preview={`10 davet = ${(10 * eco.referral_bonus).toFixed(1)} puan kazanılır`}
            onChange={v => setEco({ referral_bonus: Math.round(v * 10) / 10 })}
          />
          <SliderControl
            label="Hoşgeldin Bonusu"
            description="Yeni kayıt olan kullanıcıya verilen başlangıç puanı"
            value={eco.welcome_bonus} min={0} max={500} step={0.5} unit="puan"
            color="#22c55e"
            preview={`Her yeni kullanıcı ${eco.welcome_bonus} puanla başlar`}
            onChange={v => setEco({ welcome_bonus: Math.round(v * 10) / 10 })}
          />
        </Section>

        {/* ── 2. Etkinlik Çarpanları ── */}
        <Section icon={Zap} title="Etkinlik Çarpanları" subtitle="QR, oyun ve görev puan değerlerini yapılandırın" color="#f59e0b">
          <SliderControl
            label="QR Tarama Puanı"
            description="Başarılı her QR taramasında verilen temel puan"
            value={mul.qr_base_points} min={10} max={500} step={5} unit="puan"
            color="#f59e0b"
            preview={`Günde 5 tarama = ${5 * mul.qr_base_points} puan kazanılır`}
            onChange={v => setMul({ qr_base_points: v })}
          />
          <SliderControl
            label="Oyun Puanı Çarpanı"
            description="Oyunlardan kazanılan puanlara uygulanan çarpan"
            value={mul.game_multiplier} min={1} max={5} step={0.1} unit="×"
            color="#FF6B00"
            preview={`Oyun kazancı × ${mul.game_multiplier} = %${Math.round((mul.game_multiplier - 1) * 100)} bonus`}
            onChange={v => setMul({ game_multiplier: Math.round(v * 10) / 10 })}
          />
          <SliderControl
            label="Günlük Görev Bonusu"
            description="Günlük görev tamamlanınca ek puan"
            value={mul.daily_mission_bonus} min={0} max={200} step={10} unit="puan"
            color="#22c55e"
            preview={`Tüm görevler tamamsa +${mul.daily_mission_bonus} ekstra puan`}
            onChange={v => setMul({ daily_mission_bonus: v })}
          />
          <SliderControl
            label="Seri (Streak) Bonusu"
            description="Ardışık gün seri başına verilen ek puan"
            value={mul.streak_bonus} min={0} max={100} step={5} unit="puan/gün"
            color="#ec4899"
            preview={`7 günlük seri = +${7 * mul.streak_bonus} bonus puan`}
            onChange={v => setMul({ streak_bonus: v })}
          />
        </Section>

        {/* ── 3. Kullanıcı Limitleri ── */}
        <Section icon={ShieldCheck} title="Kullanıcı Limitleri" subtitle="Günlük kazanım ve kullanım kısıtlamalarını belirleyin" color="#22c55e">
          <SliderControl
            label="Günlük Kazanım Tavanı"
            description="Bir kullanıcının günde kazanabileceği maksimum puan"
            value={lim.daily_earn_cap} min={100} max={5000} step={100} unit="puan/gün"
            color="#22c55e"
            preview={`Limiti aşan kazanımlar otomatik durdurulur`}
            onChange={v => setLim({ daily_earn_cap: v })}
          />
          <SliderControl
            label="Maksimum Bakiye"
            description="Bir hesapta birikebilecek en fazla puan miktarı"
            value={lim.max_balance} min={1000} max={100000} step={1000} unit="puan"
            color="#3b82f6"
            preview={`≈ ${(lim.max_balance / eco.points_to_tl).toFixed(0)}₺ değerinde puan üst sınırı`}
            onChange={v => setLim({ max_balance: v })}
          />
          <SliderControl
            label="Minimum Kullanım Eşiği"
            description="Puan kullanmak için gereken asgari bakiye"
            value={lim.min_redeem_threshold} min={0} max={2000} step={50} unit="puan"
            color="#f59e0b"
            preview={`En az ${lim.min_redeem_threshold} puan birikmedikçe kullanım yapılamaz`}
            onChange={v => setLim({ min_redeem_threshold: v })}
          />
          <SliderControl
            label="İşlem Bekleme Süresi"
            description="Ardışık iki QR taraması arasındaki minimum süre"
            value={lim.transaction_cooldown_min} min={0} max={120} step={5} unit="dakika"
            color="#6b7280"
            preview={`Taramalar arası ${lim.transaction_cooldown_min} dk bekleme zorunlu`}
            onChange={v => setLim({ transaction_cooldown_min: v })}
          />
        </Section>

        {/* ── 4. Özellik Anahtarları ── */}
        <Section icon={Settings} title="Özellik Anahtarları" subtitle="Sistem modüllerini açın veya kapatın" color="#ec4899">
          <FlagRow label="QR Tarama Sistemi"    sub="Kullanıcıların QR kodu taramasına izin ver"       value={flags.qr_enabled}           color="#7B6EF6" onChange={v => setFlag({ qr_enabled: v })} />
          <FlagRow label="Mini Oyunlar"         sub="Oyun modülü aktif / pasif"                        value={flags.games_enabled}         color="#f59e0b" onChange={v => setFlag({ games_enabled: v })} />
          <FlagRow label="Referral Sistemi"     sub="Davet bağlantısı ve bonus aktif / pasif"          value={flags.referral_enabled}      color="#22c55e" onChange={v => setFlag({ referral_enabled: v })} />
          <FlagRow label="Seri (Streak) Takibi" sub="Ardışık gün serisi ve bonusları"                  value={flags.streak_enabled}        color="#3b82f6" onChange={v => setFlag({ streak_enabled: v })} />
          <FlagRow label="Push Bildirimleri"    sub="Kullanıcılara anlık bildirim gönderme"             value={flags.push_notifications}    color="#ec4899" onChange={v => setFlag({ push_notifications: v })} />
          <FlagRow label="Çift Puan Etkinliği"  sub="Tüm kazanımlar 2× olur (kampanya modu)"          value={flags.double_points_events}  color="#FF6B00" onChange={v => setFlag({ double_points_events: v })} />
        </Section>

        {/* Live Summary Card */}
        <div style={{ borderRadius: 18, border: '2.5px solid var(--dark-border)', background: 'var(--tab-bg)', padding: 20 }}>
          <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>📊 Canlı Özet</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: '100₺ harcama', value: `${100 * eco.spend_to_points} puan`, color: '#7B6EF6' },
              { label: '1000 puan değeri', value: `≈${(1000 / eco.points_to_tl).toFixed(2)}₺`, color: '#4F8EF7' },
              { label: 'QR + oyun/gün', value: `${mul.qr_base_points * 5 * mul.game_multiplier} puan`, color: '#f59e0b' },
              { label: 'Günlük limit', value: `${lim.daily_earn_cap.toLocaleString('tr-TR')} puan`, color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--card-bg)', border: '2px solid var(--dark-border)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; height: 8px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 3px solid var(--dark-border); box-shadow: 0 2px 0 var(--dark-border); cursor: pointer; }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminSettings;
