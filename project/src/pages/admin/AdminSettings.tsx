import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Settings, Save, CheckCircle, Loader, Zap, ToggleLeft, ToggleRight, TrendingUp, ShieldCheck, Sliders, AlertTriangle, Wrench, Power, X, Clock, RefreshCw, RotateCcw, Database } from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  getMaintenanceStatus,
  setMaintenanceMode,
  getSystemSettings,
  saveSystemSettings,
  restoreSystemSettingsToDefaults,
  ensureAppSettingsSeeded,
  countSettingsDiffFromDefaults,
  DEFAULT_SYSTEM_SETTINGS,
  type MaintenanceStatus,
  type SystemSettings,
} from '../../services/config';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useRealtimeTable } from '../../hooks/useRealtime';

type AllSettings = SystemSettings;

const TICKET_UNIT_LABELS: Record<AllSettings['loyalty']['ticket_time_unit'], string> = {
  minutes: 'dakika',
  hours: 'saat',
  days: 'gün',
};

function formatTicketPreview(validFor: number, unit: AllSettings['loyalty']['ticket_time_unit']): string {
  return `Mağazadan alınan biletler ${validFor} ${TICKET_UNIT_LABELS[unit]} geçerli kalır`;
}

/* ─── Info callout ─── */
const InfoCallout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ margin: '0 20px 14px', padding: '12px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.07)', border: '1.5px solid rgba(59,130,246,0.22)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, fontWeight: 600 }}>
    {children}
  </div>
);
const UnsavedBanner: React.FC<{ onSave: () => void; onDiscard: () => void; onRestore: () => void; saving: boolean }> = ({ onSave, onDiscard, onRestore, saving }) => (
  <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 18, background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)', animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: 'calc(100vw - 24px)', flexWrap: 'wrap', justifyContent: 'center' }}>
    <AlertTriangle size={16} color="#f59e0b" />
    <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>Kaydedilmemiş değişiklikler</span>
    <button type="button" onClick={onRestore} style={{ padding: '7px 12px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '2px solid #fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
      <RotateCcw size={12} /> Varsayılan
    </button>
    <button type="button" onClick={onDiscard} style={{ padding: '7px 14px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>
      Geri Al
    </button>
    <button type="button" onClick={onSave} disabled={saving} style={{ padding: '7px 16px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: saving ? '#a78bfa' : 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
      {saving ? <Loader size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={12} />}
      {saving ? 'Kaydediliyor…' : 'Kaydet'}
    </button>
  </div>
);
const SliderControl: React.FC<{
  label: string;
  description: string;
  whereUsed?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  preview: string;
  onChange: (v: number) => void;
}> = ({ label, description, whereUsed, value, min, max, step, unit, color, preview, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--dark-border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>{description}</p>
          {whereUsed && (
            <p style={{ fontSize: 10, color: '#2563eb', margin: '6px 0 0', fontWeight: 700, lineHeight: 1.4 }}>
              📍 {whereUsed}
            </p>
          )}
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
const FlagRow: React.FC<{ label: string; sub: string; whereUsed?: string; value: boolean; color: string; onChange: (v: boolean) => void }> = ({ label, sub, whereUsed, value, color, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '2px solid var(--dark-border)', cursor: 'pointer' }} onClick={() => onChange(!value)}>
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 1px' }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>{sub}</p>
      {whereUsed && (
        <p style={{ fontSize: 10, color: '#2563eb', margin: '5px 0 0', fontWeight: 700, lineHeight: 1.4 }}>
          📍 {whereUsed}
        </p>
      )}
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

/* ─── Maintenance Mode Panel ─── */
const MaintenancePanel: React.FC = () => {
  const [mStatus,   setMStatus]   = useState<MaintenanceStatus | null>(null);
  const [mLoading,  setMLoading]  = useState(true);
  const [mSaving,   setMSaving]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mMessage,  setMMessage]  = useState('');
  const [mTime,     setMTime]     = useState('');
  const [savedMsg,  setSavedMsg]  = useState('');
  const [mError, setMError] = useState('');

  const loadStatus = useCallback(async () => {
    try {
      const s = await getMaintenanceStatus();
      setMStatus(s);
      setMMessage(s.message);
      setMTime(s.estimated_time);
    } catch { /**/ } finally { setMLoading(false); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);
  useRealtimeTable('app_settings', loadStatus);

  const isOn = mStatus?.enabled ?? false;
  const messageDirty = mStatus && (mMessage !== mStatus.message || mTime !== mStatus.estimated_time);

  const handleSaveMessage = async () => {
    setMSaving(true);
    setMError('');
    setSavedMsg('');
    try {
      await setMaintenanceMode(isOn, mMessage, mTime);
      await loadStatus();
      setSavedMsg('Mesaj kaydedildi');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'Bilinmeyen hata';
      setMError(`Kaydedilemedi: ${msg}`);
    } finally {
      setMSaving(false);
    }
  };

  const handleToggle = async (enable: boolean) => {
    setMSaving(true);
    setMError('');
    try {
      await setMaintenanceMode(enable, mMessage, mTime);
      // Re-read from DB to confirm the real state (don't trust optimistic UI)
      await loadStatus();
      setShowConfirm(false);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'Bilinmeyen hata';
      setMError(`Kaydedilemedi: ${msg}`);
      // Still reload so the badge reflects actual DB state
      await loadStatus();
    } finally {
      setMSaving(false);
    }
  };

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
        {messageDirty && (
          <button
            type="button"
            onClick={handleSaveMessage}
            disabled={mSaving}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 14, fontWeight: 900, fontSize: 13,
              marginBottom: 12, cursor: mSaving ? 'not-allowed' : 'pointer',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
              background: 'var(--tab-bg)', color: 'var(--text-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: mSaving ? 0.6 : 1,
            }}
          >
            {mSaving ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={14} />}
            Bakım Mesajını Kaydet
          </button>
        )}

        {savedMsg && (
          <p style={{ margin: '0 0 12px', textAlign: 'center', fontSize: 12, color: '#16a34a', fontWeight: 800 }}>
            ✓ {savedMsg}
          </p>
        )}

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

        {mError && (
          <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#FF3B30', fontWeight: 700, padding: '8px 12px', background: 'rgba(255,59,48,0.1)', borderRadius: 10, border: '1.5px solid #FF3B30' }}>
            ❌ {mError}
          </p>
        )}
        {isOn && !mError && (
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
  const { refresh: refreshGlobalSettings } = useSystemSettings();
  const [saved, setSaved]       = useState<AllSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [draft, setDraft]       = useState<AllSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [saving, setSaving]     = useState(false);
  const [saved2, setSaved2]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [dbLoaded, setDbLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [seedInfo, setSeedInfo] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const loadSettings = useCallback(async (silent = false) => {
    if (!silent) setDbLoaded(false);
    else setRefreshing(true);
    setLoadError('');
    try {
      const added = await ensureAppSettingsSeeded();
      if (added > 0) {
        setSeedInfo(`${added} eksik ayar Supabase'e eklendi.`);
      }
      const settings = await getSystemSettings();
      setSaved(settings);
      setDraft(settings);
      setLastSyncedAt(new Date());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Ayarlar yüklenemedi');
    } finally {
      setDbLoaded(true);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const isDirtyRef = useRef(isDirty);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  useRealtimeTable('app_settings', () => {
    if (!isDirtyRef.current) loadSettings(true);
  });

  const setEco = useCallback((patch: Partial<AllSettings['economy']>) => setDraft(d => ({ ...d, economy: { ...d.economy, ...patch } })), []);
  const setLim = useCallback((patch: Partial<AllSettings['limits']>) => setDraft(d => ({ ...d, limits: { ...d.limits, ...patch } })), []);
  const setLoyalty = useCallback((patch: Partial<AllSettings['loyalty']>) => setDraft(d => ({ ...d, loyalty: { ...d.loyalty, ...patch } })), []);
  const setFlag = useCallback((patch: Partial<AllSettings['flags']>) => setDraft(d => ({ ...d, flags: { ...d.flags, ...patch } })), []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaved2(false);
    try {
      if (draft.loyalty.max_points_limit < 1) throw new Error('Maksimum puan limiti 1 veya daha büyük olmalı.');
      if (draft.loyalty.ticket_valid_for < 1) throw new Error('Bilet geçerlilik süresi 1 veya daha büyük olmalı.');
      await saveSystemSettings(draft);
      setSaved(draft);
      setSaved2(true);
      setLastSyncedAt(new Date());
      await refreshGlobalSettings();
      setTimeout(() => setSaved2(false), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setRestoring(true);
    setSaveError('');
    try {
      const defaults = await restoreSystemSettingsToDefaults();
      setSaved(defaults);
      setDraft(defaults);
      setLastSyncedAt(new Date());
      setShowRestoreConfirm(false);
      setSaved2(true);
      await refreshGlobalSettings();
      setTimeout(() => setSaved2(false), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Varsayılanlara dönülemedi');
    } finally {
      setRestoring(false);
    }
  };

  const handleDiscardDraftToSaved = () => setDraft(saved);
  const handleRestoreDraftToDefaults = () => setDraft({ ...DEFAULT_SYSTEM_SETTINGS });

  if (!dbLoaded) return (
    <AdminLayout>
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-3">
        <Loader size={40} color="#7B6EF6" style={{ animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 13 }}>Ayarlar yükleniyor…</p>
      </div>
    </AdminLayout>
  );

  const diffCount = countSettingsDiffFromDefaults(draft);
  const { economy: eco, limits: lim, loyalty, flags } = draft;

  return (
    <AdminLayout>
      {isDirty && (
        <UnsavedBanner
          onSave={handleSave}
          onDiscard={handleDiscardDraftToSaved}
          onRestore={handleRestoreDraftToDefaults}
          saving={saving}
        />
      )}

      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto" style={{ paddingBottom: isDirty ? 100 : undefined }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={22} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>Sistem Ayarları</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
              Puan ekonomisi, bilet kuralları ve site modüllerini buradan yönetin. Değişiklikler kaydedildiğinde tüm kullanıcı ve kasa ekranlarına yansır.
            </p>
            {lastSyncedAt && (
              <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 800, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Database size={12} />
                Son senkron: {lastSyncedAt.toLocaleTimeString('tr-TR')}
                {diffCount > 0 ? ` · ${diffCount} alan varsayılandan farklı` : ' · varsayılanlarla aynı'}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => loadSettings(true)}
              disabled={refreshing}
              style={{
                padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                background: 'var(--card-bg)', color: 'var(--text-dark)',
                border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined} />
              Yenile
            </button>
            <button
              type="button"
              onClick={() => setShowRestoreConfirm(true)}
              disabled={restoring}
              style={{
                padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                border: '2.5px solid #fca5a5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <RotateCcw size={14} />
              Varsayılanlara Dön
            </button>
            {!isDirty && (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                style={{
                  padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                  background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white',
                  border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={14} />
                Kaydet
              </button>
            )}
            {saved2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                <CheckCircle size={14} color="#16a34a" />
                <span style={{ fontSize: 12, fontWeight: 900, color: '#16a34a' }}>Kaydedildi</span>
              </div>
            )}
          </div>
        </div>

        {seedInfo && (
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '2px solid #3b82f6', color: '#2563eb', fontWeight: 800, fontSize: 12 }}>
            {seedInfo}
          </div>
        )}

        {loadError && (
          <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#dc2626', fontWeight: 800, fontSize: 13 }}>
            {loadError}
          </div>
        )}

        {saveError && (
          <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#dc2626', fontWeight: 800, fontSize: 13 }}>
            Kaydedilemedi: {saveError}
          </div>
        )}

        {/* ── 0. Maintenance Mode ── */}
        <MaintenancePanel />

        <Section icon={ShieldCheck} title="Mağaza Biletleri & Puan Limiti" subtitle="Envantere düşen biletlerin süresi ve kullanıcı bakiye tavanı" color="#06b6d4">
          <InfoCallout>
            Müşteri mağazadan ürün aldığında bilet envanterine eklenir. Kasada QR veya kod ile kullanılır. Süre dolunca veya kasada işlenince bilet geçersiz olur.
          </InfoCallout>
          <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--dark-border)' }}>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 4px' }}>Bilet Geçerlilik Süresi</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.45 }}>
              Yeni satın alınan biletlerin kasada kullanılabileceği süre. Ödülün kendi bitiş tarihi varsa o tarih geçerli olur.
            </p>
            <p style={{ fontSize: 10, color: '#2563eb', margin: '0 0 12px', fontWeight: 700 }}>
              📍 Müşteri envanteri · kasa ödül işlet ekranı
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input
                type="number"
                min={1}
                max={365}
                value={loyalty.ticket_valid_for}
                onChange={e => setLoyalty({ ticket_valid_for: Math.min(365, Math.max(1, Number(e.target.value) || 1)) })}
                style={{
                  width: 80, padding: '10px 12px', borderRadius: 12, textAlign: 'center',
                  border: '2.5px solid #f59e0b', background: 'rgba(245,158,11,0.08)',
                  fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', outline: 'none',
                }}
              />
              <select
                value={loyalty.ticket_time_unit}
                onChange={e => setLoyalty({ ticket_time_unit: e.target.value as AllSettings['loyalty']['ticket_time_unit'] })}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12,
                  border: '2.5px solid var(--dark-border)', background: 'var(--card-bg)',
                  color: 'var(--text-dark)', fontWeight: 900, outline: 'none',
                }}
              >
                <option value="minutes">Dakika</option>
                <option value="hours">Saat</option>
                <option value="days">Gün</option>
              </select>
            </div>
            <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={11} color="#f59e0b" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>{formatTicketPreview(loyalty.ticket_valid_for, loyalty.ticket_time_unit)}</span>
            </div>
          </div>
          <FlagRow
            label="Puan Bakiye Limiti"
            sub="Açıkken kullanıcı belirlediğiniz maksimum puanın üzerine çıkamaz (QR ve kasa puanları dahil)."
            whereUsed="Ana sayfa puan göstergesi · puan kazanma işlemleri"
            value={loyalty.points_limit_enabled}
            color="#06b6d4"
            onChange={v => setLoyalty({ points_limit_enabled: v })}
          />
          {loyalty.points_limit_enabled && (
            <SliderControl
              label="Maksimum Puan Bakiyesi"
              description="Kullanıcının hesabında birikebilecek en yüksek puan. Limit dolunca yeni puan kazanılamaz."
              whereUsed="Profil · ana sayfa · kasa QR puan verme"
              value={loyalty.max_points_limit}
              min={100}
              max={100000}
              step={50}
              unit="puan"
              color="#06b6d4"
              preview={`${loyalty.max_points_limit.toLocaleString('tr-TR')} puana ulaşınca kazanım durur`}
              onChange={v => setLoyalty({ max_points_limit: v })}
            />
          )}
        </Section>

        <Section icon={TrendingUp} title="Kasa & Harcama Puanı" subtitle="Kasada ve müşteri QR taramasında harcama tutarından puan hesaplanır" color="#7B6EF6">
          <InfoCallout>
            Kasiyer tutar girer → QR oluşur → müşteri uygulamadan tarar → puan = <strong>harcama × oran</strong>.
            Örnek: oran 10 ise 20₺ alışveriş = 200 puan. Sabit puan yok; tutar değiştikçe puan da değişir.
          </InfoCallout>
          <SliderControl
            label="Harcama → Puan Oranı"
            description="Her 1₺ harcama için verilecek puan. Kasiyer QR oluşturma ve müşteri QR tarama aynı oranı kullanır."
            whereUsed="Kasa · QR Tara & Puan · Müşteri QR Tara · Admin QR"
            value={eco.spend_to_points} min={0.1} max={50} step={0.1} unit="puan / 1₺"
            color="#7B6EF6"
            preview={`50₺ harcama → ${(50 * eco.spend_to_points).toFixed(1)} puan · 100₺ → ${(100 * eco.spend_to_points).toFixed(1)} puan`}
            onChange={v => setEco({ spend_to_points: Math.round(v * 10) / 10 })}
          />
        </Section>

        <Section icon={Zap} title="Günlük Limitler" subtitle="Kullanıcıların günde kazanabileceği maksimum puan ve XP" color="#f59e0b">
          <InfoCallout>
            Harcama QR puanları da bu günlük puana dahildir. Limit dolunca kullanıcı o gün daha fazla puan kazanamaz.
          </InfoCallout>
          <SliderControl
            label="Günlük Puan Kazanım Tavanı"
            description="Bir kullanıcı gün içinde toplamda en fazla bu kadar puan kazanabilir (QR, görev, oyun vb. dahil)."
            whereUsed="Sunucu tarafı puan işlemleri · görev ödülleri"
            value={lim.daily_earn_cap} min={100} max={5000} step={100} unit="puan / gün"
            color="#22c55e"
            preview={`Günlük ${lim.daily_earn_cap.toLocaleString('tr-TR')} puandan sonrası engellenir`}
            onChange={v => setLim({ daily_earn_cap: v })}
          />
          <SliderControl
            label="Günlük XP Tavanı"
            description="Seviye ilerlemesi (XP) için günlük üst sınır. Puan kazanımından bağımsızdır."
            whereUsed="İlerleme yolu · seviye sistemi"
            value={lim.max_daily_xp} min={50} max={5000} step={50} unit="XP / gün"
            color="#7B6EF6"
            preview={`Günde en fazla ${lim.max_daily_xp.toLocaleString('tr-TR')} XP kazanılabilir`}
            onChange={v => setLim({ max_daily_xp: v })}
          />
        </Section>

        <Section icon={TrendingUp} title="Kayıt & Davet Bonusları" subtitle="Yeni kullanıcıları teşvik eden başlangıç puanları" color="#22c55e">
          <InfoCallout>
            Hoşgeldin bonusu kayıt sonrası, davet bonusu ise bir kullanıcı başka birini sisteme getirdiğinde verilir.
          </InfoCallout>
          <SliderControl
            label="Hoşgeldin Bonusu"
            description="Yeni kayıt olan her kullanıcının hesabına otomatik eklenen başlangıç puanı."
            whereUsed="Kayıt akışı · yeni profil oluşturma"
            value={eco.welcome_bonus} min={0} max={500} step={0.5} unit="puan"
            color="#22c55e"
            preview={`Yeni üye ${eco.welcome_bonus} puanla başlar`}
            onChange={v => setEco({ welcome_bonus: Math.round(v * 10) / 10 })}
          />
          <SliderControl
            label="Davet (Referral) Bonusu"
            description="Mevcut bir kullanıcı yeni birini davet ettiğinde davet edene verilen puan."
            whereUsed="Referral sistemi · profil davet linki"
            value={eco.referral_bonus} min={0} max={1000} step={0.5} unit="puan / davet"
            color="#f59e0b"
            preview={`5 başarılı davet = ${(5 * eco.referral_bonus).toFixed(1)} puan`}
            onChange={v => setEco({ referral_bonus: Math.round(v * 10) / 10 })}
          />
        </Section>

        <Section icon={Settings} title="Site Modülleri" subtitle="Müşteri uygulamasında hangi bölümlerin görüneceğini aç/kapat" color="#ec4899">
          <InfoCallout>
            Kapalı modüller menüden gizlenir ve ilgili sayfalar devre dışı kalır. Bakım modundan farklıdır — sadece o özelliği kapatır.
          </InfoCallout>
          <FlagRow label="QR Tarama"      sub="Müşterilerin uygulamadan QR kod okutması"                    whereUsed="Alt menü · QR Tara sayfası"           value={flags.qr_enabled}      color="#7B6EF6" onChange={v => setFlag({ qr_enabled: v })} />
          <FlagRow label="Mini Oyunlar"   sub="Oyunlar sekmesi ve puan kazanma oyunları"                  whereUsed="Ana sayfa · Oyunlar menüsü"           value={flags.games_enabled}   color="#f59e0b" onChange={v => setFlag({ games_enabled: v })} />
          <FlagRow label="Görevler"       sub="Günlük / haftalık görev listesi ve ödül toplama"             whereUsed="Görevler sayfası · ana sayfa kartı"   value={flags.missions_enabled} color="#06b6d4" onChange={v => setFlag({ missions_enabled: v })} />
          <FlagRow label="Referral Sistemi" sub="Davet linki paylaşma ve davet bonusu"                    whereUsed="Profil · kayıt davet akışı"           value={flags.referral_enabled} color="#22c55e" onChange={v => setFlag({ referral_enabled: v })} />
          <FlagRow label="Seri (Streak)"  sub="Ardışık gün girişi takibi ve seri bonusları"               whereUsed="Ana sayfa seri göstergesi"             value={flags.streak_enabled}  color="#3b82f6" onChange={v => setFlag({ streak_enabled: v })} />
        </Section>

        {/* Preview card — reflects current draft before save */}
        <div style={{ borderRadius: 18, border: '2.5px solid var(--dark-border)', background: 'var(--tab-bg)', padding: 20 }}>
          <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Canlı önizleme</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
            Kaydet&apos;e bastığınızda aşağıdaki değerler tüm siteye uygulanır.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { label: 'Kasa: 20₺ harcama', value: `${(20 * eco.spend_to_points).toFixed(0)} puan`, color: '#7B6EF6' },
              { label: 'Kasa: 100₺ harcama', value: `${(100 * eco.spend_to_points).toFixed(0)} puan`, color: '#a78bfa' },
              { label: 'Günlük puan limiti', value: `${lim.daily_earn_cap.toLocaleString('tr-TR')} puan`, color: '#22c55e' },
              { label: 'Bilet süresi', value: `${loyalty.ticket_valid_for} ${TICKET_UNIT_LABELS[loyalty.ticket_time_unit]}`, color: '#d97706' },
              { label: 'Bakiye limiti', value: loyalty.points_limit_enabled ? `${loyalty.max_points_limit.toLocaleString('tr-TR')} puan` : 'Kapalı', color: '#06b6d4' },
              { label: 'Açık modüller', value: [flags.qr_enabled && 'QR', flags.games_enabled && 'Oyun', flags.missions_enabled && 'Görev'].filter(Boolean).join(' · ') || '—', color: '#ec4899' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--card-bg)', border: '2px solid var(--dark-border)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {showRestoreConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: 16 }}>
            <div style={{ maxWidth: 420, width: '100%', background: 'var(--card-bg)', border: '3px solid #ef4444', boxShadow: '0 8px 0 #dc2626', borderRadius: 22, padding: 28 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 8px' }}>Varsayılan ayarlara dönülsün mü?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 20px' }}>
                Ekonomi, limitler, sadakat ve özellik anahtarları fabrika varsayılanlarına sıfırlanır. Bakım modu etkilenmez. Bu işlem Supabase&apos;e yazılır ve tüm site anında güncellenir.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowRestoreConfirm(false)} className="btn-secondary flex-1">İptal</button>
                <button type="button" onClick={() => void handleRestoreDefaults()} disabled={restoring} className="btn-primary flex-1" style={{ background: '#ef4444' }}>
                  {restoring ? 'Sıfırlanıyor…' : 'Evet, varsayılanlara dön'}
                </button>
              </div>
            </div>
          </div>
        )}

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
