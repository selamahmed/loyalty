import React, { useState } from 'react';
import { ChevronRight, Download, Trash2, Check } from 'lucide-react';
import AccountPageShell, { Section, Toggle, SaveButton } from '../components/AccountPageShell';
import { useApp } from '../context/AppContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const Row: React.FC<{
  label: string;
  sub?: string;
  right: React.ReactNode;
  border?: boolean;
}> = ({ label, sub, right, border = true }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
    borderBottom: border ? '2px solid var(--dark-border)' : 'none',
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: sub ? '0 0 1px' : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
    </div>
    {right}
  </div>
);

const PrivacySecurity: React.FC = () => {
  const { privacySettings, updatePrivacySettings } = useApp();
  const [settings, setSettings] = useState(privacySettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const set = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    await updatePrivacySettings(settings);
    playSound('success');
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = () => {
    playSound('click');
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexreward-verilerim.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AccountPageShell
      watermark="GİZLİLİK"
      emoji="🛡️"
      gradient="linear-gradient(180deg,#60a5fa,#2563eb)"
      title={tr.settings.privacySecurity}
      subtitle="Gizlilik tercihlerini ve güvenliği yönet"
    >
      <Section title="Görünürlük" emoji="👁️">
        <Row
          label="Profilimi herkese açık göster"
          sub="Diğer kullanıcılar profilini görebilir"
          right={<Toggle value={settings.publicProfile} onChange={v => set('publicProfile', v)} />}
        />
        <Row
          label="Liderlik tablosunda görün"
          sub="Sıralamada kullanıcı adın listelenir"
          right={<Toggle value={settings.showOnLeaderboard} onChange={v => set('showOnLeaderboard', v)} />}
        />
        <Row
          label="Aktivite geçmişini paylaş"
          sub="Son oyun ve görev aktivitelerin görünür"
          right={<Toggle value={settings.shareActivity} onChange={v => set('shareActivity', v)} />}
          border={false}
        />
      </Section>

      <Section title="Güvenlik" emoji="🔐">
        <Row
          label={tr.settings.twoFactor}
          sub="Girişlerde ek doğrulama kodu iste"
          right={<Toggle value={settings.twoFactor} onChange={v => set('twoFactor', v)} />}
        />
        <Row
          label="Oturum bildirimleri"
          sub="Yeni cihazdan girişte e-posta gönder"
          right={<Toggle value={settings.loginAlerts} onChange={v => set('loginAlerts', v)} />}
          border={false}
        />
      </Section>

      <Section title="Veri" emoji="📦">
        <button
          onClick={handleExport}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: 'none', border: 'none', borderBottom: '2px solid var(--dark-border)',
            cursor: 'pointer', textAlign: 'left',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: 'rgba(34,197,94,0.15)',
            border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 0 var(--dark-border)',
          }}>
            <Download size={17} color="#22c55e" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 1px' }}>{tr.settings.dataBackup}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Verilerini JSON olarak indir</p>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
        <button
          onClick={() => { playSound('click'); setShowDeleteConfirm(!showDeleteConfirm); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: 'rgba(239,68,68,0.12)',
            border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 0 var(--dark-border)',
          }}>
            <Trash2 size={17} color="#ef4444" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: '#ef4444', margin: '0 0 1px' }}>{tr.settings.deleteAccount}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Hesabı kalıcı olarak sil</p>
          </div>
          <ChevronRight size={16} color="#ef4444" />
        </button>
      </Section>

      {showDeleteConfirm && (
        <div style={{
          padding: 16, borderRadius: 16, background: 'rgba(239,68,68,0.08)',
          border: '2.5px solid #ef4444',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-dark)', margin: '0 0 12px', lineHeight: 1.5, fontWeight: 600 }}>
            {tr.settings.deleteAccountWarning}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { playSound('click'); setShowDeleteConfirm(false); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 11, fontWeight: 900, fontSize: 12,
                background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer',
                color: 'var(--text-dark)',
              }}
            >
              {tr.settings.cancel}
            </button>
            <button
              onClick={() => { playSound('click'); setShowDeleteConfirm(false); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 11, fontWeight: 900, fontSize: 12,
                background: '#ef4444', border: '2px solid #dc2626', cursor: 'pointer', color: 'white',
              }}
            >
              {tr.settings.confirmDelete}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.12)',
          border: '2px solid #22c55e', color: '#22c55e', fontWeight: 900, fontSize: 13,
        }}>
          <Check size={16} /> {tr.settings.savedSuccessfully}
        </div>
      )}

      <SaveButton label="Ayarları Kaydet" loading={loading} onClick={handleSave} />
    </AccountPageShell>
  );
};

export default PrivacySecurity;
