import React, { useState } from 'react';
import { Sun, Moon, Bell, BellOff, Volume2, VolumeX, Globe, User, Shield, ChevronRight, Check, LogOut, Smartphone, Loader, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';
import { usePushNotification } from '../hooks/usePushNotification';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
  <button
    disabled={disabled}
    onClick={() => { if (!disabled) { playSound('click'); onChange(!value); } }}
    style={{
      position: 'relative', width: 48, height: 26, borderRadius: 999, flexShrink: 0,
      border: '2.5px solid var(--dark-border)',
      background: value ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
      boxShadow: '0 2px 0 var(--dark-border)',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <div style={{
      position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: 'white',
      transition: 'left 0.2s', left: value ? 26 : 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }} />
  </button>
);

const languages = ['Türkçe', 'English', 'Español', 'Français', 'Deutsch'];

/* ─── Push notification row ─── */
const PushNotifRow: React.FC<{
  icon: React.ElementType;
  label: string;
  sub?: string;
  iconBg?: string;
  iconColor?: string;
}> = ({ icon: Icon, label, sub, iconBg = 'var(--tab-bg)', iconColor = 'var(--text-muted)' }) => {
  const { permission, subscribed, loading, error, supported, subscribe, unsubscribe } = usePushNotification();

  let statusText = sub;
  let buttonLabel = 'Bildirimleri Aç';
  let buttonAction = subscribe;
  let buttonColor = '#7B6EF6';
  let disabled = loading || !supported;

  if (!supported) {
    statusText = 'Bu tarayıcı desteklenmiyor';
    disabled = true;
  } else if (permission === 'denied') {
    statusText = 'İzin reddedildi — tarayıcı ayarlarından açın';
    disabled = true;
  } else if (subscribed) {
    statusText = '✅ Bildirimler aktif';
    buttonLabel = 'Kapat';
    buttonAction = unsubscribe;
    buttonColor = '#ef4444';
  } else if (permission === 'granted') {
    statusText = 'İzin verildi, abone olunmadı';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '2px solid var(--dark-border)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: iconBg, border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 0 var(--dark-border)' }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 1px' }}>{label}</p>
        {statusText && <p style={{ fontSize: 11, color: error ? '#ef4444' : 'var(--text-muted)', margin: 0 }}>{error || statusText}</p>}
      </div>
      <button
        onClick={() => { playSound('click'); buttonAction(); }}
        disabled={disabled}
        style={{
          flexShrink: 0, padding: '7px 14px', borderRadius: 11, fontWeight: 900, fontSize: 12,
          background: loading ? 'var(--tab-bg)' : subscribed ? 'rgba(239,68,68,0.10)' : `${buttonColor}15`,
          color: loading ? 'var(--text-muted)' : buttonColor,
          border: `2px solid ${loading ? 'var(--dark-border)' : buttonColor}`,
          boxShadow: `0 2px 0 ${loading ? 'var(--dark-border)' : buttonColor}`,
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled && !loading ? 0.5 : 1,
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'all 0.15s',
        }}
        onMouseDown={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 transparent'; } }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 0 ${buttonColor}`; }}
      >
        {loading
          ? <><Loader size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Yükleniyor</>
          : subscribed
            ? <><BellOff size={12} /> {buttonLabel}</>
            : permission === 'denied'
              ? <><WifiOff size={12} /> Engellendi</>
              : <><Bell size={12} /> {buttonLabel}</>
        }
      </button>
    </div>
  );
};

const Settings: React.FC = () => {
  const { theme, toggleTheme, soundEnabled, setSoundEnabled, notificationsEnabled, setNotificationsEnabled, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [language, setLanguage]         = useState(tr.settings.language);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [emailNotifs, setEmailNotifs]   = useState(false);
  const [activityAlerts, setActivityAlerts] = useState(true);

  const Section: React.FC<{ title: string; emoji: string; children: React.ReactNode }> = ({ title, emoji, children }) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingLeft: 4 }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0 }}>{title}</p>
      </div>
      <div style={{ ...card, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );

  const Row: React.FC<{
    icon: React.ElementType;
    label: string; sub?: string;
    iconBg?: string; iconColor?: string;
    right?: React.ReactNode; onClick?: () => void;
  }> = ({ icon: Icon, label, sub, iconBg = 'var(--tab-bg)', iconColor = 'var(--text-muted)', right, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
        borderBottom: '2px solid var(--dark-border)', cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: iconBg, border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 0 var(--dark-border)' }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: sub ? '0 0 1px' : 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
      </div>
      {right !== undefined ? right : onClick ? <ChevronRight size={16} color="var(--text-muted)" /> : null}
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>AYARLAR</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-lg mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#60a5fa,#2563eb)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>⚙️</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.settings.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Uygulama tercihlerini yönet</p>
          </div>
        </div>

        {/* ── Appearance ── */}
        <Section title={tr.settings.appearance || 'Görünüm'} emoji="🎨">
          <Row
            icon={theme === 'light' ? Sun : Moon}
            label={tr.settings.theme}
            sub={theme === 'light' ? 'Açık mod aktif' : 'Koyu mod aktif'}
            iconBg={theme === 'light' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)'}
            iconColor={theme === 'light' ? '#f59e0b' : '#818cf8'}
            right={
              <div style={{ display: 'flex', background: 'var(--tab-bg)', borderRadius: 10, border: '2px solid var(--dark-border)', padding: 3, gap: 4 }}>
                {[{ key: 'light', label: tr.settings.light || 'Açık' }, { key: 'dark', label: tr.settings.dark || 'Koyu' }].map(opt => (
                  <button key={opt.key}
                    onClick={e => { e.stopPropagation(); if (theme !== opt.key) { playSound('click'); toggleTheme(); } }}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 900,
                      background: theme === opt.key ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'transparent',
                      color: theme === opt.key ? 'white' : 'var(--text-muted)',
                      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            }
          />
        </Section>

        {/* ── Language ── */}
        <Section title={tr.settings.languageRegion || 'Dil & Bölge'} emoji="🌍">
          <div>
            <Row
              icon={Globe}
              label={tr.settings.language}
              sub={language}
              iconBg="rgba(59,130,246,0.15)"
              iconColor="#3b82f6"
              onClick={() => { playSound('click'); setShowLangPicker(!showLangPicker); }}
              right={<ChevronRight size={16} color="var(--text-muted)" style={{ transform: showLangPicker ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />}
            />
            {showLangPicker && (
              <div style={{ borderTop: '2px solid var(--dark-border)', animation: 'slideDown 0.2s ease-out' }}>
                {languages.map(lang => (
                  <button key={lang} onClick={() => { playSound('click'); setLanguage(lang); setShowLangPicker(false); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 18px', borderBottom: '1px solid var(--dark-border)', cursor: 'pointer',
                    background: 'none', transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 900, color: lang === language ? 'var(--primary-blue)' : 'var(--text-dark)' }}>{lang}</span>
                    {lang === language && <Check size={15} color="var(--primary-blue)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section title={tr.settings.notifications} emoji="🔔">
          {/* Real push notification row */}
          <PushNotifRow
            icon={Smartphone}
            label="Push Bildirimleri"
            sub="Uygulama kapalıyken anlık bildirim al"
            iconBg="rgba(123,110,246,0.15)"
            iconColor="#7B6EF6"
          />
          <Row icon={Bell} label={tr.settings.pushNotifications || 'Anlık Bildirimler'} sub="Uygulama içi bildirimler" iconBg="rgba(123,110,246,0.12)" iconColor="#9b87f5" right={<Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />} />
          <Row icon={Bell} label={tr.settings.emailNotifications || 'E-posta Bildirimleri'} iconBg="rgba(59,130,246,0.15)" iconColor="#3b82f6" right={<Toggle value={emailNotifs} onChange={setEmailNotifs} />} />
          <Row icon={Bell} label={tr.settings.activityAlerts || 'Aktivite Uyarıları'} iconBg="rgba(34,197,94,0.15)" iconColor="#22c55e" right={<Toggle value={activityAlerts} onChange={setActivityAlerts} />} />
        </Section>

        {/* ── Sound ── */}
        <Section title={tr.settings.sound} emoji="🔊">
          <Row
            icon={soundEnabled ? Volume2 : VolumeX}
            label={tr.settings.soundEffects || 'Ses Efektleri'}
            sub={soundEnabled ? 'Sesler açık' : 'Sesler kapalı'}
            iconBg={soundEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.12)'}
            iconColor={soundEnabled ? '#22c55e' : '#6b7280'}
            right={<Toggle value={soundEnabled} onChange={setSoundEnabled} />}
          />
        </Section>

        {/* ── Account ── */}
        <Section title={tr.settings.account} emoji="👤">
          <Row icon={User}   label={tr.settings.editProfile || 'Profili Düzenle'}       iconBg="rgba(107,114,128,0.12)" iconColor="var(--text-muted)" onClick={() => { playSound('click'); navigate('/settings/edit-profile'); }} />
          <Row icon={Shield} label={tr.settings.privacySecurity || 'Gizlilik & Güvenlik'} iconBg="rgba(59,130,246,0.15)"   iconColor="#3b82f6"            onClick={() => { playSound('click'); navigate('/settings/privacy'); }} />
          <Row icon={Shield} label={tr.settings.changePassword || 'Şifre Değiştir'}      iconBg="rgba(245,158,11,0.15)"  iconColor="#f59e0b"            onClick={() => { playSound('click'); navigate('/settings/change-password'); }} />
        </Section>

        {/* ── Logout ── */}
        <button onClick={() => { playSound('click'); setIsLoggedIn(false); navigate('/login'); }} style={{
          width: '100%', ...card, border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626',
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer', background: 'rgba(239,68,68,0.06)', transition: 'transform 0.1s, box-shadow 0.1s',
        }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 #dc2626'; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #dc2626'; }}
        >
          <LogOut size={18} color="#ef4444" />
          <span style={{ fontWeight: 900, fontSize: 15, color: '#ef4444' }}>{tr.settings.logout}</span>
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>NexReward v2.0.0 · {tr.settings.frontendDemo || 'Frontend Demo'}</p>

      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Settings;

