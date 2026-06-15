import React, { useState } from 'react';
import { Check, Shuffle } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import NeoAvatar from '../components/NeoAvatar';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { activityLogService } from '../lib/activityLogger';
import {
  isAvatarAssetRef,
  pickRandomAvatarRef,
  defaultAvatarRefForSeed,
} from '../lib/avatarCatalog';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

function initialAvatarRef(avatar: string, fallbackSeed: string): string {
  if (isAvatarAssetRef(avatar)) return avatar;
  if (avatar) return avatar.startsWith('http') ? avatar : defaultAvatarRefForSeed(avatar);
  return defaultAvatarRefForSeed(fallbackSeed);
}

const EditProfile: React.FC = () => {
  const { user, updateUser } = useApp();
  const { authUser } = useAuth();

  const [form, setForm] = useState({
    username: user.username,
    email:    user.email,
    phone:    user.phone ?? '',
    bio:      user.bio   ?? '',
  });

  const displayName = form.username || authUser?.name || authUser?.email || 'user';
  const [selectedAvatar, setSelectedAvatar] = useState(() =>
    initialAvatarRef(user.avatar, displayName),
  );
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRandomPick = () => {
    playSound('click');
    setSelectedAvatar(pickRandomAvatarRef());
  };

  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    setSaveErr('');

    try {
      await updateUser({
        username: form.username.trim() || user.username,
        email:    form.email.trim()    || user.email,
        phone:    form.phone.trim(),
        bio:      form.bio.trim(),
        avatar:   selectedAvatar,
      });

      playSound('success');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      void activityLogService.logActivity({
        userId:     authUser.id,
        username:   form.username.trim() || (authUser.username ?? authUser.name ?? authUser.email),
        email:      authUser.email,
        role:       authUser.role,
        action:     'Profil güncellendi',
        actionType: 'profile_update',
        riskLevel:  'low',
        details:    { avatarChanged: true, avatar: selectedAvatar },
      });
    } catch (err: unknown) {
      setSaveErr(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 900,
    background: 'linear-gradient(180deg,#a78bfa,#7B6EF6)',
    color: '#fff',
    border: '2.5px solid var(--dark-border)',
    boxShadow: '0 4px 0 var(--dark-border)',
    cursor: 'pointer',
  };

  return (
    <AccountPageShell
      watermark="PROFİL"
      emoji="👤"
      gradient="linear-gradient(180deg,#a78bfa,#7B6EF6)"
      title={tr.settings.editProfile}
      subtitle="Kişisel bilgilerini güncelle"
    >
      {/* ── Avatar preview & Randomizer ── */}
      <Section title="Avatarın" emoji="🎭">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' }}>
          <NeoAvatar
            src={selectedAvatar}
            name={displayName}
            email={authUser?.email}
            size={120}
            shape="circle"
          />

          <button 
            type="button" 
            onClick={handleRandomPick} 
            disabled={saving} 
            style={btnStyle}
          >
            <Shuffle size={15} />
            Rastgele Avatar Oluştur
          </button>
          
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', maxWidth: '80%' }}>
            Avatarınız isminize veya rastgele oluşturulan bir koda göre otomatik olarak üretilir.
          </p>
        </div>
      </Section>

      {/* ── Text fields ── */}
      <Section title="Kişisel Bilgiler" emoji="📝">
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
            { key: 'email',    label: 'E-posta',       type: 'email' },
            { key: 'phone',    label: 'Telefon',       type: 'tel', placeholder: '+90 5XX XXX XX XX' },
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

      {saveErr && (
        <div style={{
          padding: '10px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700,
          color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)',
        }}>
          {saveErr}
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

      <SaveButton label="Değişiklikleri Kaydet" loading={saving} onClick={handleSave} />
    </AccountPageShell>
  );
};

export default EditProfile;

