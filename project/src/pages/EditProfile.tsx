import React, { useState, useRef, useMemo } from 'react';
import { Camera, Check, Trash2, Upload, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import NeoAvatar from '../components/NeoAvatar';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { activityLogService } from '../lib/activityLogger';
import { uploadAvatar, deleteAvatar } from '../services/profile';
import {
  generateAvatarSeedOptions,
  generateRandomAvatarSeed,
  getNeoAvatarSeed,
  isNeoAvatarUrl,
  toNeoAvatarUrl,
} from '../lib/avatarGenerator';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024;

type AvatarMode = 'photo' | 'neo' | 'default';

const ProgressRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 38; const circ = 2 * Math.PI * r;
  return (
    <svg width={90} height={90} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={45} cy={45} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
      <circle
        cx={45} cy={45} r={r} fill="none"
        stroke="#7B6EF6" strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 0.2s ease' }}
      />
    </svg>
  );
};

function initialAvatarMode(avatar: string): AvatarMode {
  if (!avatar) return 'default';
  if (isNeoAvatarUrl(avatar)) return 'neo';
  return 'photo';
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

  const savedNeoSeed = getNeoAvatarSeed(user.avatar);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>(() => initialAvatarMode(user.avatar));
  const [neoSeed, setNeoSeed] = useState<string | null>(() => savedNeoSeed);
  const [neoOptions, setNeoOptions] = useState<string[]>(() =>
    generateAvatarSeedOptions(6, savedNeoSeed ?? generateRandomAvatarSeed()),
  );

  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [uploadErr,   setUploadErr]   = useState('');
  const [savedAvatar, setSavedAvatar] = useState<string | null>(
    user.avatar && !isNeoAvatarUrl(user.avatar) ? user.avatar : null,
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const displayName = form.username || authUser?.name || authUser?.email || 'user';

  const photoSrc = useMemo(() => {
    if (avatarMode !== 'photo') return null;
    return previewUrl ?? savedAvatar;
  }, [avatarMode, previewUrl, savedAvatar]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('Sadece resim dosyası yükleyebilirsiniz.'); return; }
    if (file.size > MAX_BYTES)           { setUploadErr('Dosya 5 MB\'dan büyük olamaz.');            return; }
    setUploadErr('');
    setAvatarMode('photo');
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleShuffleNeo = () => {
    playSound('click');
    const next = generateAvatarSeedOptions(6);
    setNeoOptions(next);
    setNeoSeed(next[0]);
    setAvatarMode('neo');
    setPendingFile(null);
    setPreviewUrl(null);
    setUploadErr('');
  };

  const handlePickNeo = (seed: string) => {
    playSound('click');
    setNeoSeed(seed);
    setAvatarMode('neo');
    setPendingFile(null);
    setPreviewUrl(null);
    setUploadErr('');
  };

  const handleResetAvatar = () => {
    playSound('click');
    setAvatarMode('default');
    setNeoSeed(null);
    setPendingFile(null);
    setPreviewUrl(null);
    setSavedAvatar(null);
    setUploadErr('');
    if (authUser?.id) deleteAvatar(authUser.id).catch(() => {});
  };

  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    setUploadErr('');

    let finalAvatarUrl = '';

    try {
      if (avatarMode === 'photo' && pendingFile) {
        setUploading(true);
        const ticker = setInterval(() => setUploadPct(p => Math.min(p + 8, 90)), 150);
        finalAvatarUrl = await uploadAvatar(authUser.id, pendingFile);
        clearInterval(ticker);
        setUploadPct(100);
        await new Promise(r => setTimeout(r, 300));
        setSavedAvatar(finalAvatarUrl);
        setPendingFile(null);
        setPreviewUrl(null);
      } else if (avatarMode === 'photo' && savedAvatar) {
        finalAvatarUrl = savedAvatar;
      } else if (avatarMode === 'neo' && neoSeed) {
        finalAvatarUrl = toNeoAvatarUrl(neoSeed);
        await deleteAvatar(authUser.id);
        setSavedAvatar(null);
      } else {
        finalAvatarUrl = '';
        await deleteAvatar(authUser.id);
        setSavedAvatar(null);
      }

      await updateUser({
        username: form.username.trim() || user.username,
        email:    form.email.trim()    || user.email,
        phone:    form.phone.trim(),
        bio:      form.bio.trim(),
        avatar:   finalAvatarUrl,
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
        details:    {
          avatarMode,
          avatarChanged: true,
          neoSeed: avatarMode === 'neo' ? neoSeed : null,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kaydedilemedi.';
      setUploadErr(msg);
    } finally {
      setSaving(false);
      setUploading(false);
      setUploadPct(0);
    }
  };

  const btnStyle = (active = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800,
    background: active ? '#7B6EF6' : 'var(--card-bg)',
    color: active ? '#fff' : 'var(--text-muted)',
    border: '2.5px solid #000',
    boxShadow: active ? '0 3px 0 #000' : '0 3px 0 var(--dark-border)',
    cursor: 'pointer',
    opacity: uploading ? 0.5 : 1,
  });

  return (
    <AccountPageShell
      watermark="PROFİL"
      emoji="👤"
      gradient="linear-gradient(180deg,#a78bfa,#7B6EF6)"
      title={tr.settings.editProfile}
      subtitle="Kişisel bilgilerini güncelle"
    >
      {/* ── Avatar preview ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          {uploading && <ProgressRing pct={uploadPct} />}

          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%', overflow: 'hidden',
              border: '3px solid var(--dark-border)',
              boxShadow: '0 4px 0 var(--dark-border)',
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <NeoAvatar
              src={photoSrc}
              seed={avatarMode === 'neo' ? neoSeed : undefined}
              name={displayName}
              email={authUser?.email}
              size={84}
              shape="circle"
              border={false}
            />
          </div>

          {!uploading && (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 28, height: 28, borderRadius: '50%',
                background: '#7B6EF6', border: '2.5px solid var(--dark-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 0 #000',
              }}
              title="Fotoğraf yükle"
            >
              <Camera size={13} color="white" />
            </div>
          )}

          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{uploadPct}%</span>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={handlePickFile} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={btnStyle(avatarMode === 'photo')}>
            <Upload size={13} /> Fotoğraf
          </button>
          <button type="button" onClick={handleShuffleNeo} disabled={uploading} style={btnStyle(avatarMode === 'neo')}>
            <Sparkles size={13} /> Otomatik Avatar
          </button>
          <button type="button" onClick={handleResetAvatar} disabled={uploading} style={btnStyle(avatarMode === 'default')}>
            <RefreshCw size={13} /> Varsayılan
          </button>
        </div>

        {pendingFile && !uploading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            color: '#7B6EF6', fontWeight: 700, background: 'rgba(123,110,246,0.1)',
            padding: '4px 12px', borderRadius: 8, border: '1.5px solid rgba(123,110,246,0.3)',
          }}>
            <Camera size={12} />
            {pendingFile.name} · {(pendingFile.size / 1024).toFixed(0)} KB
            <button
              type="button"
              onClick={() => { setPendingFile(null); setPreviewUrl(null); setAvatarMode(savedAvatar ? 'photo' : neoSeed ? 'neo' : 'default'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        )}

        {uploadErr && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            color: '#ef4444', fontWeight: 700, background: 'rgba(239,68,68,0.08)',
            padding: '6px 12px', borderRadius: 8, border: '1.5px solid rgba(239,68,68,0.3)',
          }}>
            <AlertCircle size={13} /> {uploadErr}
          </div>
        )}
      </div>

      {/* ── Neo avatar picker ── */}
      <Section title="Otomatik Avatar Seç" emoji="🎨">
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>
            Beğendiğin bir avatarı seç veya yeni avatarlar oluştur. Kaydettiğinde Supabase&apos;de saklanır.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {neoOptions.map(seed => {
              const selected = avatarMode === 'neo' && neoSeed === seed;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => handlePickNeo(seed)}
                  style={{
                    padding: 8,
                    borderRadius: 14,
                    border: selected ? '3px solid #7B6EF6' : '2.5px solid var(--dark-border)',
                    boxShadow: selected ? '0 4px 0 #7B6EF6' : '0 3px 0 var(--dark-border)',
                    background: selected ? 'rgba(123,110,246,0.12)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <NeoAvatar seed={seed} name={displayName} email={authUser?.email} size={64} shape="rounded" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleShuffleNeo}
            disabled={uploading || saving}
            style={{
              ...btnStyle(false),
              width: '100%',
              justifyContent: 'center',
              padding: '10px 14px',
            }}
          >
            <RefreshCw size={14} /> Yeni Avatarlar Oluştur
          </button>
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

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.12)',
          border: '2px solid #22c55e', color: '#22c55e', fontWeight: 900, fontSize: 13,
        }}>
          <Check size={16} /> {tr.settings.savedSuccessfully}
        </div>
      )}

      <SaveButton
        label={uploading ? `Yükleniyor… ${uploadPct}%` : 'Değişiklikleri Kaydet'}
        loading={saving || uploading}
        onClick={handleSave}
      />
    </AccountPageShell>
  );
};

export default EditProfile;
