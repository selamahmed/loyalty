import React, { useState } from 'react';
import { Camera, Check } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import { useApp } from '../context/AppContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const EditProfile: React.FC = () => {
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone ?? '',
    bio: user.bio ?? '',
    avatar: user.avatar,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser({
      username: form.username.trim() || user.username,
      email: form.email.trim() || user.email,
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      avatar: form.avatar.trim() || user.avatar,
    });
    playSound('success');
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AccountPageShell
      watermark="PROFİL"
      emoji="👤"
      gradient="linear-gradient(180deg,#a78bfa,#7B6EF6)"
      title={tr.settings.editProfile}
      subtitle="Kişisel bilgilerini güncelle"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
          }}>
            <img src={form.avatar || user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%',
            background: '#7B6EF6', border: '2.5px solid var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={14} color="white" />
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Profil fotoğrafı URL'si ile değiştirilebilir</p>
      </div>

      <Section title="Kişisel Bilgiler" emoji="📝">
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
            { key: 'email', label: 'E-posta', type: 'email' },
            { key: 'phone', label: 'Telefon', type: 'tel', placeholder: '+90 5XX XXX XX XX' },
            { key: 'avatar', label: 'Profil Fotoğrafı URL', type: 'url' },
          ].map(field => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                placeholder={field.placeholder}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Hakkında</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Kendinden kısaca bahset..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>
      </Section>

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.12)',
          border: '2px solid #22c55e', color: '#22c55e', fontWeight: 900, fontSize: 13,
        }}>
          <Check size={16} /> {tr.settings.savedSuccessfully}
        </div>
      )}

      <SaveButton label="Değişiklikleri Kaydet" loading={loading} onClick={handleSave} />
    </AccountPageShell>
  );
};

export default EditProfile;
