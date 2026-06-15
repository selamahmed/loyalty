import React, { useState } from 'react';
import { Check } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import AvatarEditor from '../components/AvatarEditor';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInvalidateProfile } from '../hooks/useCanonicalProfile';
import { saveUserAvatar } from '../services/avatar';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { activityLogService } from '../lib/activityLogger';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const EditProfile: React.FC = () => {
  const { user, updateUser } = useApp();
  const { authUser } = useAuth();
  const invalidateProfile = useInvalidateProfile();

  const [form, setForm] = useState({
    username: user.username,
    email:    user.email,
    phone:    user.phone ?? '',
    bio:      user.bio   ?? '',
  });

  const displayName = form.username || authUser?.name || authUser?.email || 'user';
  const [selectedAvatar, setSelectedAvatar] = useState(() => user.avatar);
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveAvatar = async (seed: string, url: string) => {
    if (!authUser?.id) return;
    const saved = await saveUserAvatar(authUser.id, seed, url);
    setSelectedAvatar(saved.avatar_url);
    await updateUser({
      avatar: saved.avatar_url,
      avatarSeed: saved.avatar_seed,
    });
    invalidateProfile(authUser.id);
    void activityLogService.logActivity({
      userId:     authUser.id,
      username:   form.username.trim() || (authUser.username ?? authUser.name ?? authUser.email),
      email:      authUser.email,
      role:       authUser.role,
      action:     'Avatar güncellendi',
      actionType: 'profile_update',
      riskLevel:  'low',
      details:    { avatarSeed: saved.avatar_seed, avatarUrl: saved.avatar_url },
    });
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
        avatarSeed: user.avatarSeed,
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

  return (
    <AccountPageShell
      watermark="PROFİL"
      emoji="👤"
      gradient="linear-gradient(180deg,#a78bfa,#7B6EF6)"
      title={tr.settings.editProfile}
      subtitle="Kişisel bilgilerini güncelle"
    >
      {/* ── Avatar customizer ── */}
      <Section title="Avatar Özelleştir" emoji="🎨">
        <div style={{ padding: '8px 10px' }}>
          <AvatarEditor
            currentSeed={user.avatarSeed || null}
            currentUrl={user.avatar || null}
            onSave={handleSaveAvatar}
            loading={saving}
            userContext={{
              name: form.username,
              email: authUser?.email,
              id: authUser?.id,
            }}
          />
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

