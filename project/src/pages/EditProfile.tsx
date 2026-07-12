import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import AvatarEditor from '../components/AvatarEditor';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInvalidateProfile } from '../hooks/useCanonicalProfile';
import { resolveAvatarSrc } from '../lib/avatarCatalog';
import { saveUserAvatar } from '../services/avatar';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { activityLogService } from '../lib/activityLogger';
import { findBadWordField } from '../lib/contentModeration';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 900,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
};

const EditProfile: React.FC = () => {
  const { user, updateUser } = useApp();
  const { authUser, profile } = useAuth();
  const invalidateProfile = useInvalidateProfile();
  const currentProfileAvatar = profile?.avatar_url ?? authUser?.avatar ?? user.avatar ?? null;
  const currentProfileAvatarSeed = profile?.avatar_seed ?? authUser?.avatar_seed ?? user.avatarSeed ?? undefined;
  const avatarDraftTouchedRef = useRef(false);

  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone ?? '',
    bio: user.bio ?? '',
  });

  const [selectedAvatar, setSelectedAvatar] = useState(() => currentProfileAvatar);
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string | undefined>(() => currentProfileAvatarSeed);
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (avatarDraftTouchedRef.current) return;
    setSelectedAvatar(currentProfileAvatar);
    setSelectedAvatarSeed(currentProfileAvatarSeed);
  }, [currentProfileAvatar, currentProfileAvatarSeed]);

  const handleAvatarDraftChange = useCallback((seed: string, url: string) => {
    avatarDraftTouchedRef.current = true;
    setSelectedAvatar(url);
    setSelectedAvatarSeed(seed);
  }, []);

  const handleSaveAvatar = async (seed: string, url: string) => {
    if (!authUser?.id) return;

    setSaving(true);
    setSaveErr('');

    try {
      const savedAvatar = await saveUserAvatar(authUser.id, seed, url);

      setSelectedAvatar(savedAvatar.avatar_url);
      setSelectedAvatarSeed(savedAvatar.avatar_seed);
      avatarDraftTouchedRef.current = false;

      await updateUser({
        avatar: savedAvatar.avatar_url,
        avatarSeed: savedAvatar.avatar_seed,
      });

      invalidateProfile(authUser.id);

      playSound('success');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      void activityLogService.logActivity({
        userId: authUser.id,
        username: form.username.trim() || authUser.username || authUser.name || authUser.email,
        email: authUser.email,
        role: authUser.role,
        action: 'Avatar güncellendi',
        actionType: 'profile_update',
        riskLevel: 'low',
        details: {
          avatarSeed: savedAvatar.avatar_seed,
          avatarUrl: savedAvatar.avatar_url,
        },
      });
    } catch (err: unknown) {
      console.error('[EditProfile] Avatar save error:', err);
      setSaveErr(err instanceof Error ? err.message : 'Avatar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) return;

    const blockedField = findBadWordField({
      username: form.username,
      bio: form.bio,
    });

    if (blockedField) {
      playSound('error');
      setSaved(false);
      setSaveErr(
        blockedField === 'username'
          ? 'Kullanici adinda uygun olmayan kelimeler var. Lutfen daha nazik bir isim sec.'
          : 'Bio alaninda uygun olmayan kelimeler var. Lutfen duzenleyip tekrar dene.',
      );
      return;
    }

    setSaving(true);
    setSaveErr('');

    try {
      const cleanSelectedAvatar = resolveAvatarSrc(selectedAvatar, selectedAvatarSeed ?? null);

      setSelectedAvatar(cleanSelectedAvatar);

      await updateUser({
        username: form.username.trim() || user.username,
        email: form.email.trim() || user.email,
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar: cleanSelectedAvatar,
        avatarSeed: selectedAvatarSeed || undefined,
      });

      playSound('success');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      void activityLogService.logActivity({
        userId: authUser.id,
        username: form.username.trim() || authUser.username || authUser.name || authUser.email,
        email: authUser.email,
        role: authUser.role,
        action: 'Profil güncellendi',
        actionType: 'profile_update',
        riskLevel: 'low',
        details: {
          avatarChanged: true,
          avatar: cleanSelectedAvatar,
          avatarSeed: selectedAvatarSeed,
        },
      });
    } catch (err: unknown) {
      console.error('[EditProfile] Profile save error:', err);
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
      maxWidth="4xl"
    >
      <Section title="Avatar Özelleştir" emoji="🎨" framed={false}>
        <AvatarEditor
          currentSeed={selectedAvatarSeed ?? null}
          currentUrl={selectedAvatar}
          onChange={handleAvatarDraftChange}
          onSave={handleSaveAvatar}
          loading={saving}
          userContext={{
            name: form.username,
            email: authUser?.email,
            id: authUser?.id,
          }}
        />
      </Section>

      <Section title="Kişisel Bilgiler" emoji="📝">
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {[
            { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
            { key: 'email', label: 'E-posta', type: 'email' },
            {
              key: 'phone',
              label: 'Telefon',
              type: 'tel',
              placeholder: '+90 5XX XXX XX XX',
            },
          ].map((field) => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [field.key]: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label style={labelStyle}>Hakkında</label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  bio: e.target.value,
                }))
              }
              rows={3}
              placeholder="Kendinden kısaca bahset..."
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 80,
              }}
            />
          </div>
        </div>
      </Section>

      {saveErr && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            border: '1.5px solid rgba(239,68,68,0.3)',
          }}
        >
          {saveErr}
        </div>
      )}

      {saved && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'rgba(34,197,94,0.12)',
            border: '2px solid #22c55e',
            color: '#22c55e',
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          <Check size={16} /> {tr.settings.savedSuccessfully}
        </div>
      )}

      <SaveButton
        label="Değişiklikleri Kaydet"
        loading={saving}
        onClick={handleSave}
      />
    </AccountPageShell>
  );
};

export default EditProfile;
