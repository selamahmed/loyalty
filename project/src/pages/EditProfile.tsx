import React, { useState, useRef } from 'react';
import { Camera, Check, Trash2, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../components/AccountPageShell';
import NeoAvatar from '../components/NeoAvatar';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { activityLogService } from '../lib/activityLogger';
import { uploadAvatar, deleteAvatar } from '../services/profile';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/* ── Upload progress ring ───────────────────────────────── */
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

/* ── Component ─────────────────────────────────────────── */
const EditProfile: React.FC = () => {
  const { user, updateUser } = useApp();
  const { authUser } = useAuth();

  const [form, setForm] = useState({
    username: user.username,
    email:    user.email,
    phone:    user.phone ?? '',
    bio:      user.bio   ?? '',
  });

  /* Avatar states */
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null); // local blob preview
  const [pendingFile, setPendingFile] = useState<File | null>(null);   // file waiting to upload
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [uploadErr,   setUploadErr]   = useState('');

  /* current saved avatar (real URL in DB, or null = use generated) */
  const [savedAvatar, setSavedAvatar] = useState<string | null>(user.avatar || null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* ── Pick a file ── */
  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileRef.current) fileRef.current = e.target;
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('Sadece resim dosyası yükleyebilirsiniz.'); return; }
    if (file.size > MAX_BYTES)           { setUploadErr('Dosya 5 MB\'dan büyük olamaz.');            return; }
    setUploadErr('');
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Reset input so the same file can be picked again if needed
    e.target.value = '';
  };

  /* ── Reset to generated avatar ── */
  const handleResetAvatar = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setSavedAvatar(null);
    setUploadErr('');
    if (authUser?.id) deleteAvatar(authUser.id).catch(() => {});
  };

  /* ── Upload to Supabase Storage then save profile ── */
  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    setUploadErr('');

    let finalAvatarUrl: string | null = savedAvatar;

    /* If user picked a new file, upload it first */
    if (pendingFile) {
      try {
        setUploading(true);
        // Simulate progress ticks while the real upload runs
        const ticker = setInterval(() => setUploadPct(p => Math.min(p + 8, 90)), 150);
        finalAvatarUrl = await uploadAvatar(authUser.id, pendingFile);
        clearInterval(ticker);
        setUploadPct(100);
        await new Promise(r => setTimeout(r, 300));
        setSavedAvatar(finalAvatarUrl);
        setPendingFile(null);
        setPreviewUrl(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Fotoğraf yüklenemedi.';
        setUploadErr(msg);
        setSaving(false);
        setUploading(false);
        setUploadPct(0);
        return;
      } finally {
        setUploading(false);
        setUploadPct(0);
      }
    }

    /* Save text fields + avatar_url to Supabase via AppContext.updateUser */
    await updateUser({
      username: form.username.trim() || user.username,
      email:    form.email.trim()    || user.email,
      phone:    form.phone.trim(),
      bio:      form.bio.trim(),
      avatar:   finalAvatarUrl ?? '',
    });

    playSound('success');
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);

    void activityLogService.logActivity({
      userId:     authUser.id,
      username:   form.username.trim() || (authUser.username ?? authUser.name ?? authUser.email),
      email:      authUser.email,
      role:       authUser.role,
      action:     'Profil güncellendi',
      actionType: 'profile_update',
      riskLevel:  'low',
      details:    { avatarChanged: !!pendingFile || finalAvatarUrl !== savedAvatar },
    });
  };

  /* ── Displayed avatar source ── */
  const displaySrc = previewUrl ?? savedAvatar;
  const displayName = form.username || authUser?.name || authUser?.email || 'user';

  return (
    <AccountPageShell
      watermark="PROFİL"
      emoji="👤"
      gradient="linear-gradient(180deg,#a78bfa,#7B6EF6)"
      title={tr.settings.editProfile}
      subtitle="Kişisel bilgilerini güncelle"
    >
      {/* ── Avatar picker ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 4 }}>

        {/* Avatar circle with camera overlay */}
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          {/* Upload progress ring */}
          {uploading && <ProgressRing pct={uploadPct} />}

          {/* The avatar itself */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%', overflow: 'hidden',
              border: '3px solid var(--dark-border)',
              boxShadow: '0 4px 0 var(--dark-border)',
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <NeoAvatar
              src={displaySrc}
              name={displayName}
              email={authUser?.email}
              size={84}
              shape="circle"
              border={false}
            />
          </div>

          {/* Camera badge */}
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
              title="Fotoğraf değiştir"
            >
              <Camera size={13} color="white" />
            </div>
          )}

          {/* Upload spinner overlay */}
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

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={handlePickFile}
        />

        {/* Action buttons below avatar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800,
              background: '#7B6EF6', color: '#fff',
              border: '2.5px solid #000', boxShadow: '0 3px 0 #000',
              cursor: 'pointer', opacity: uploading ? 0.5 : 1,
            }}
          >
            <Upload size={13} /> Fotoğraf Yükle
          </button>

          {(displaySrc) && (
            <button
              onClick={handleResetAvatar}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                background: 'var(--card-bg)', color: 'var(--text-muted)',
                border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                cursor: 'pointer', opacity: uploading ? 0.5 : 1,
              }}
              title="Otomatik oluşturulan avatara geri dön"
            >
              <RefreshCw size={13} /> Sıfırla
            </button>
          )}
        </div>

        {/* Pending file name */}
        {pendingFile && !uploading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            color: '#7B6EF6', fontWeight: 700, background: 'rgba(123,110,246,0.1)',
            padding: '4px 12px', borderRadius: 8, border: '1.5px solid rgba(123,110,246,0.3)',
          }}>
            <Camera size={12} />
            {pendingFile.name} &nbsp;·&nbsp; {(pendingFile.size / 1024).toFixed(0)} KB
            <button
              onClick={() => { setPendingFile(null); setPreviewUrl(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
            >
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        )}

        {/* Error */}
        {uploadErr && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            color: '#ef4444', fontWeight: 700, background: 'rgba(239,68,68,0.08)',
            padding: '6px 12px', borderRadius: 8, border: '1.5px solid rgba(239,68,68,0.3)',
          }}>
            <AlertCircle size={13} /> {uploadErr}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
          {displaySrc ? 'Sıfırla\'ya tıklayarak otomatik avatara dönebilirsin' : 'Fotoğraf yüklenmezse otomatik avatar oluşturulur'}
        </p>
      </div>

      {/* ── Text fields ──────────────────────────────────── */}
      <Section title="Kişisel Bilgiler" emoji="📝">
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'username', label: 'Kullanıcı Adı',  type: 'text'  },
            { key: 'email',    label: 'E-posta',         type: 'email' },
            { key: 'phone',    label: 'Telefon',         type: 'tel',  placeholder: '+90 5XX XXX XX XX' },
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

      {/* ── Success banner ───────────────────────────────── */}
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
