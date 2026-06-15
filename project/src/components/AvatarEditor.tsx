import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Save, RotateCcw, Sparkles } from 'lucide-react';
import {
  ALLOWED_SKIN_COLORS,
  buildAvatarUrl,
  getDefaultAvatarSeed,
  randomAvatarSeed,
  STRONG_BG_COLORS,
} from '../lib/avatar';
import type { AvatarOptions } from '../lib/avatar';
import './AvatarEditor.css';

interface AvatarEditorProps {
  currentSeed: string | null;
  currentUrl: string | null;
  onSave: (seed: string, avatarUrl: string) => Promise<void>;
  loading?: boolean;
  userContext?: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  };
}

type AvatarUrlSettings = Pick<AvatarOptions, 'seed' | 'size' | 'skinColor' | 'backgroundColor'>;

const AVATAR_SIZE = 512;

const cleanHex = (value: string | null): string | undefined => {
  const cleaned = value?.trim().replace(/^#/, '').toLowerCase();
  return cleaned || undefined;
};

const parseAvatarUrl = (url: string | null | undefined): Partial<AvatarUrlSettings> => {
  if (!url || !url.includes('dicebear.com')) return {};

  try {
    const params = new URL(url).searchParams;
    const parsedSize = Number(params.get('size'));

    return {
      seed: params.get('seed')?.trim() || undefined,
      size: Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : AVATAR_SIZE,
      skinColor: cleanHex(params.get('skinColor')),
      backgroundColor: cleanHex(params.get('backgroundColor')),
    };
  } catch {
    return {};
  }
};

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentSeed,
  currentUrl,
  onSave,
  loading = false,
  userContext,
}) => {
  const fallbackSeed = getDefaultAvatarSeed(userContext || {});
  const urlSettings = parseAvatarUrl(currentUrl);
  const initialSeed = currentSeed?.trim() || urlSettings.seed || fallbackSeed;

  const [seed, setSeed] = useState<string>(initialSeed);
  const [skinColor, setSkinColor] = useState<string>(urlSettings.skinColor || ALLOWED_SKIN_COLORS[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    urlSettings.backgroundColor || STRONG_BG_COLORS[0],
  );
  const [customBgHex, setCustomBgHex] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'appearance' | 'colors'>('appearance');
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (/^[0-9a-fA-F]{6}$/.test(customBgHex)) {
      setBackgroundColor(customBgHex.toLowerCase());
    }
  }, [customBgHex]);

  const resolvedSeed = seed.trim() || fallbackSeed;

  const avatarUrl = useMemo(
    () => buildAvatarUrl({
      seed: resolvedSeed,
      size: AVATAR_SIZE,
      skinColor,
      backgroundColor,
    }),
    [backgroundColor, resolvedSeed, skinColor],
  );

  const fallbackAvatarUrl = useMemo(
    () => buildAvatarUrl({ seed: fallbackSeed, size: AVATAR_SIZE }),
    [fallbackSeed],
  );

  const handleRandomize = () => {
    const randomSkin = ALLOWED_SKIN_COLORS[Math.floor(Math.random() * ALLOWED_SKIN_COLORS.length)];
    const randomBg = STRONG_BG_COLORS[Math.floor(Math.random() * STRONG_BG_COLORS.length)];

    setSeed(randomAvatarSeed());
    setSkinColor(randomSkin);
    setBackgroundColor(randomBg);
    setCustomBgHex('');
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    const parsed = parseAvatarUrl(currentUrl);

    setSeed(currentSeed?.trim() || parsed.seed || fallbackSeed);
    setSkinColor(parsed.skinColor || ALLOWED_SKIN_COLORS[0]);
    setBackgroundColor(parsed.backgroundColor || STRONG_BG_COLORS[0]);
    setCustomBgHex('');
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!resolvedSeed) {
      setError('Avatar seed boş bırakılamaz.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await onSave(resolvedSeed, avatarUrl);
      setSuccess('Profil avatarı başarıyla güncellendi.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src !== fallbackAvatarUrl) {
      event.currentTarget.src = fallbackAvatarUrl;
    }
  };

  return (
    <div className="avatar-editor-container card">
      <div className="avatar-preview-section">
        <h4 className="avatar-section-title">Canlı Önizleme</h4>
        <div className="avatar-frame-wrapper">
          <div className="avatar-frame">
            <img
              src={avatarUrl}
              alt="Avatar önizleme"
              className="avatar-image-preview"
              onError={handleImageError}
            />
          </div>
        </div>

        <div className="avatar-preview-actions">
          <button
            type="button"
            className="btn-secondary btn-icon"
            onClick={handleRandomize}
            disabled={saving || loading}
            title="Rastgele avatar oluştur"
          >
            <Sparkles size={16} />
            Rastgele
          </button>

          <button
            type="button"
            className="btn-secondary btn-icon"
            onClick={handleReset}
            disabled={saving || loading}
            title="Ayarları sıfırla"
          >
            <RotateCcw size={16} />
            Sıfırla
          </button>
        </div>

        <div className="avatar-seed-display">
          <span className="seed-label">Seed:</span>
          <code className="seed-code">{resolvedSeed}</code>
        </div>
      </div>

      <div className="avatar-controls-section">
        <div className="avatar-tabs">
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Görünüm
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Renk
          </button>
        </div>

        <div className="avatar-tab-content">
          {activeTab === 'appearance' && (
            <div className="avatar-tab-panel stagger-children">
              <div className="control-group">
                <label className="control-label">Avatar ismi / seed</label>
                <input
                  type="text"
                  className="input-field"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  placeholder="İsim veya seed girin..."
                />
              </div>

              <div className="control-group">
                <label className="control-label">Ten rengi</label>
                <div className="color-palette-grid">
                  {ALLOWED_SKIN_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`color-bubble ${skinColor === hex ? 'selected' : ''}`}
                      style={{ backgroundColor: `#${hex}` }}
                      onClick={() => setSkinColor(hex)}
                      title={`#${hex}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="avatar-tab-panel stagger-children">
              <div className="control-group">
                <label className="control-label">Arka plan rengi</label>
                <div className="color-palette-grid">
                  {STRONG_BG_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`color-bubble ${backgroundColor === hex ? 'selected' : ''}`}
                      style={{ backgroundColor: `#${hex}` }}
                      onClick={() => {
                        setBackgroundColor(hex);
                        setCustomBgHex('');
                      }}
                      title={`#${hex}`}
                    />
                  ))}
                </div>

                <div className="custom-hex-input-wrapper" style={{ marginTop: '8px' }}>
                  <span className="hex-prefix">#</span>
                  <input
                    type="text"
                    className="input-field hex-input"
                    placeholder="Örn: FF00FF"
                    value={customBgHex}
                    onChange={(event) =>
                      setCustomBgHex(event.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))
                    }
                  />
                  <span className="input-info-tag">Özel renk</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="avatar-message error-message">
            {error}
          </div>
        )}
        {success && (
          <div className="avatar-message success-message">
            {success}
          </div>
        )}

        <button
          type="button"
          className="btn-primary avatar-save-btn"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin-slow" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save size={16} />
              Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AvatarEditor;
