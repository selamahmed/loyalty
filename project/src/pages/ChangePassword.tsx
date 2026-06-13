import React, { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../lib/activityLogger';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => { playSound('click'); setVisible(v => !v); }}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center',
          }}
        >
          {visible ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
        </button>
      </div>
    </div>
  );
};

const ChangePassword: React.FC = () => {
  const { authUser } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const strength = (() => {
    if (!next) return { label: '', color: 'var(--text-muted)', width: '0%' };
    if (next.length < 6) return { label: 'Zayıf', color: '#ef4444', width: '33%' };
    if (next.length < 10 || !/[A-Z]/.test(next) || !/[0-9]/.test(next)) return { label: 'Orta', color: '#f59e0b', width: '66%' };
    return { label: 'Güçlü', color: '#22c55e', width: '100%' };
  })();

  const handleSave = async () => {
    setError('');
    if (!current || !next || !confirm) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (next.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (next !== confirm) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      // Re-authenticate with current password first
      const email = authUser?.email ?? '';
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (signInErr) {
        setError('Mevcut şifre yanlış.');
        setLoading(false);
        return;
      }
      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: next });
      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }
      playSound('success');
      setCurrent('');
      setNext('');
      setConfirm('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (authUser) {
        void activityLogService.logActivity({
          userId:     authUser.id,
          username:   authUser.username ?? authUser.name ?? authUser.email,
          email:      authUser.email,
          role:       authUser.role,
          action:     'Şifre değiştirildi',
          actionType: 'password_change',
          riskLevel:  'medium',
        });
      }
    } catch (err) {
      setError('Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountPageShell
      watermark="ŞİFRE"
      emoji="🔑"
      gradient="linear-gradient(180deg,#fbbf24,#f59e0b)"
      title={tr.settings.changePassword}
      subtitle="Hesap şifreni güvenle güncelle"
    >
      <Section title="Şifre Bilgileri" emoji="🔒">
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PasswordField label="Mevcut Şifre" value={current} onChange={setCurrent} placeholder="••••••••" />
          <PasswordField label="Yeni Şifre" value={next} onChange={setNext} placeholder="En az 6 karakter" />
          {next && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Şifre gücü</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: strength.color }}>{strength.label}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 999, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
          <PasswordField label="Yeni Şifre (Tekrar)" value={confirm} onChange={setConfirm} placeholder="Şifreyi tekrar gir" />
        </div>
      </Section>

      <div style={{
        padding: '14px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.08)',
        border: '2px solid rgba(59,130,246,0.3)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
          Güçlü bir şifre için en az 10 karakter, büyük harf ve rakam kullanın. Şifrenizi kimseyle paylaşmayın.
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.1)',
          border: '2px solid #ef4444', color: '#ef4444', fontWeight: 900, fontSize: 13,
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.12)',
          border: '2px solid #22c55e', color: '#22c55e', fontWeight: 900, fontSize: 13,
        }}>
          <Check size={16} /> Şifreniz başarıyla güncellendi
        </div>
      )}

      <SaveButton label="Şifreyi Güncelle" loading={loading} onClick={handleSave} color="#f59e0b" />
    </AccountPageShell>
  );
};

export default ChangePassword;
