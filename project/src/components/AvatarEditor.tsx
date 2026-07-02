import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Download, RefreshCw, RotateCcw, Save, Sparkles } from 'lucide-react';
import {
  ALLOWED_ACCESSORIES,
  ALLOWED_EXPRESSION_VARIANTS,
  ALLOWED_FACIAL_HAIR_VARIANTS,
  ALLOWED_HEAD_VARIANTS,
  ALLOWED_SKIN_COLORS,
  buildAvatarUrl,
  getDefaultAvatarSeed,
  randomAvatarSeed,
  STRONG_BG_COLORS,
} from '../lib/avatar';
import type {
  AvatarAccessory,
  AvatarExpressionVariant,
  AvatarFacialHairVariant,
  AvatarFlip,
  AvatarHeadVariant,
  AvatarOptions,
} from '../lib/avatar';
import './AvatarEditor.css';

interface AvatarEditorProps {
  currentSeed: string | null;
  currentUrl: string | null;
  onChange?: (seed: string, avatarUrl: string) => void;
  onSave: (seed: string, avatarUrl: string) => Promise<void>;
  loading?: boolean;
  userContext?: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  };
}

type AvatarUrlSettings = Pick<
  AvatarOptions,
  | 'seed'
  | 'size'
  | 'skinColor'
  | 'backgroundColor'
  | 'clothingColor'
  | 'accessories'
  | 'accessoriesProbability'
  | 'headVariant'
  | 'expressionVariant'
  | 'facialHairVariant'
  | 'facialHairProbability'
  | 'scale'
  | 'rotate'
  | 'translateX'
  | 'translateY'
  | 'flip'
>;

const AVATAR_SIZE = 512;

const GLASSES_OPTIONS: Array<{ value: AvatarAccessory; label: string }> = [
  { value: 'blank', label: 'Yok' },
  { value: 'glasses', label: 'Klasik' },
  { value: 'glasses2', label: 'Yuvarlak' },
  { value: 'glasses3', label: 'İnce' },
  { value: 'glasses4', label: 'Kalın' },
  { value: 'glasses5', label: 'Retro' },
  { value: 'sunglasses', label: 'Güneş' },
  { value: 'sunglasses2', label: 'Güneş 2' },
];

const HEAD_LABELS: Record<AvatarHeadVariant, string> = {
  short1: 'Kısa 1',
  short2: 'Kısa 2',
  short3: 'Kısa 3',
  short4: 'Kısa 4',
  short5: 'Kısa 5',
  medium1: 'Orta 1',
  medium2: 'Orta 2',
  medium3: 'Orta 3',
  mediumStraight: 'Düz Orta',
  long: 'Uzun',
  longCurly: 'Dalgalı',
  longBangs: 'Kakül',
  afro: 'Afro',
  bun: 'Topuz',
  buns: 'Çift Topuz',
  flatTop: 'Flat Top',
  pomp: 'Pompadour',
  hatBeanie: 'Bere',
  hatHip: 'Şapka',
};

const EXPRESSION_LABELS: Record<AvatarExpressionVariant, string> = {
  calm: 'Sakin',
  cheeky: 'Neşeli',
  cute: 'Tatlı',
  driven: 'Kararlı',
  eatingHappy: 'Mutlu',
  explaining: 'Anlatan',
  lovingGrin1: 'Sevimli 1',
  lovingGrin2: 'Sevimli 2',
  smile: 'Gülümseme',
  smileBig: 'Büyük Gülüş',
  smileLOL: 'Kahkaha',
  smileTeethGap: 'Dişlek Gülüş',
};

const FACIAL_HAIR_LABELS: Record<AvatarFacialHairVariant, string> = {
  blank: 'Yok',
  chin: 'Çene',
  goatee1: 'Keçi Sakal 1',
  goatee2: 'Keçi Sakal 2',
  moustache1: 'Bıyık 1',
  moustache2: 'Bıyık 2',
  moustache3: 'Bıyık 3',
};

const CLOTHING_COLORS = ['111827', '2563eb', 'ec4899', '06d6a0', 'ffbe0b', 'ef4444', '7c3aed'];

const cleanHex = (value: string | null): string | undefined => {
  const cleaned = value?.trim().replace(/^#/, '').toLowerCase();
  return cleaned && /^[0-9a-f]{6}$/.test(cleaned) ? cleaned : undefined;
};

const parseNumberParam = (params: URLSearchParams, key: string): number | undefined => {
  const value = Number(params.get(key));
  return Number.isFinite(value) ? value : undefined;
};

const normalizeSelect = <T extends string>(values: readonly T[], value: string | null): T | undefined =>
  values.find((item) => item === value);

const parseAvatarUrl = (url: string | null | undefined): Partial<AvatarUrlSettings> => {
  if (!url || !url.includes('dicebear.com')) return {};

  try {
    const params = new URL(url).searchParams;
    const parsedSize = Number(params.get('size'));
    const accessories = (params.get('accessories') || params.get('accessoriesType'))?.trim();
    const accessoriesProbability = Number(params.get('accessoriesProbability'));
    const facialHairProbability = Number(params.get('facialHairProbability'));

    return {
      seed: params.get('seed')?.trim() || undefined,
      size: Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : AVATAR_SIZE,
      skinColor: cleanHex(params.get('skinColor')),
      backgroundColor: cleanHex(params.get('backgroundColor')),
      clothingColor: cleanHex(params.get('clothingColor')),
      accessories: normalizeSelect(ALLOWED_ACCESSORIES, accessories ?? 'blank'),
      accessoriesProbability: Number.isFinite(accessoriesProbability) ? accessoriesProbability : undefined,
      headVariant: normalizeSelect(ALLOWED_HEAD_VARIANTS, params.get('headVariant')),
      expressionVariant: normalizeSelect(ALLOWED_EXPRESSION_VARIANTS, params.get('expressionVariant')),
      facialHairVariant: normalizeSelect(ALLOWED_FACIAL_HAIR_VARIANTS, params.get('facialHairVariant') ?? 'blank'),
      facialHairProbability: Number.isFinite(facialHairProbability) ? facialHairProbability : undefined,
      scale: parseNumberParam(params, 'scale'),
      rotate: parseNumberParam(params, 'rotate'),
      translateX: parseNumberParam(params, 'translateX'),
      translateY: parseNumberParam(params, 'translateY'),
      flip: params.get('flip') === 'horizontal' ? 'horizontal' : 'none',
    };
  } catch {
    return {};
  }
};

const randomItem = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentSeed,
  currentUrl,
  onChange,
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
  const [clothingColor, setClothingColor] = useState<string>(urlSettings.clothingColor || CLOTHING_COLORS[0]);
  const [headVariant, setHeadVariant] = useState<AvatarHeadVariant>(urlSettings.headVariant || 'hatHip');
  const [expressionVariant, setExpressionVariant] = useState<AvatarExpressionVariant>(
    urlSettings.expressionVariant || 'smileBig',
  );
  const [accessories, setAccessories] = useState<AvatarAccessory>(urlSettings.accessories || 'blank');
  const [facialHairVariant, setFacialHairVariant] = useState<AvatarFacialHairVariant>(
    urlSettings.facialHairVariant || 'blank',
  );
  const [scale, setScale] = useState<number>(urlSettings.scale ?? 1);
  const [rotate, setRotate] = useState<number>(urlSettings.rotate ?? 0);
  const [translateX, setTranslateX] = useState<number>(urlSettings.translateX ?? 0);
  const [translateY, setTranslateY] = useState<number>(urlSettings.translateY ?? 0);
  const [flip, setFlip] = useState<AvatarFlip>(urlSettings.flip || 'none');
  const [customBgHex, setCustomBgHex] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'appearance' | 'colors' | 'position'>('appearance');
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseAvatarUrl(currentUrl);
    const nextSeed = currentSeed?.trim() || parsed.seed || fallbackSeed;

    setSeed(nextSeed);
    setSkinColor(parsed.skinColor || ALLOWED_SKIN_COLORS[0]);
    setBackgroundColor(parsed.backgroundColor || STRONG_BG_COLORS[0]);
    setClothingColor(parsed.clothingColor || CLOTHING_COLORS[0]);
    setHeadVariant(parsed.headVariant || 'hatHip');
    setExpressionVariant(parsed.expressionVariant || 'smileBig');
    setAccessories(parsed.accessories || 'blank');
    setFacialHairVariant(parsed.facialHairVariant || 'blank');
    setScale(parsed.scale ?? 1);
    setRotate(parsed.rotate ?? 0);
    setTranslateX(parsed.translateX ?? 0);
    setTranslateY(parsed.translateY ?? 0);
    setFlip(parsed.flip || 'none');
  }, [currentSeed, currentUrl, fallbackSeed]);

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
      clothingColor,
      headVariant,
      expressionVariant,
      accessories,
      accessoriesProbability: accessories === 'blank' ? 0 : 100,
      facialHairVariant,
      facialHairProbability: facialHairVariant === 'blank' ? 0 : 100,
      scale,
      rotate,
      translateX,
      translateY,
      flip,
    }),
    [
      accessories,
      backgroundColor,
      clothingColor,
      expressionVariant,
      facialHairVariant,
      flip,
      headVariant,
      resolvedSeed,
      rotate,
      scale,
      skinColor,
      translateX,
      translateY,
    ],
  );

  const fallbackAvatarUrl = useMemo(
    () => buildAvatarUrl({ seed: fallbackSeed, size: AVATAR_SIZE }),
    [fallbackSeed],
  );

  useEffect(() => {
    onChange?.(resolvedSeed, avatarUrl);
  }, [avatarUrl, onChange, resolvedSeed]);

  const handleRandomize = () => {
    setSeed(randomAvatarSeed());
    setSkinColor(randomItem(ALLOWED_SKIN_COLORS));
    setBackgroundColor(randomItem(STRONG_BG_COLORS));
    setClothingColor(randomItem(CLOTHING_COLORS));
    setHeadVariant(randomItem(ALLOWED_HEAD_VARIANTS));
    setExpressionVariant(randomItem(ALLOWED_EXPRESSION_VARIANTS));
    setAccessories(randomItem(GLASSES_OPTIONS).value);
    setFacialHairVariant(Math.random() > 0.75 ? randomItem(ALLOWED_FACIAL_HAIR_VARIANTS) : 'blank');
    setScale(1);
    setRotate(0);
    setTranslateX(0);
    setTranslateY(0);
    setFlip('none');
    setCustomBgHex('');
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    const parsed = parseAvatarUrl(currentUrl);

    setSeed(currentSeed?.trim() || parsed.seed || fallbackSeed);
    setSkinColor(parsed.skinColor || ALLOWED_SKIN_COLORS[0]);
    setBackgroundColor(parsed.backgroundColor || STRONG_BG_COLORS[0]);
    setClothingColor(parsed.clothingColor || CLOTHING_COLORS[0]);
    setHeadVariant(parsed.headVariant || 'hatHip');
    setExpressionVariant(parsed.expressionVariant || 'smileBig');
    setAccessories(parsed.accessories || 'blank');
    setFacialHairVariant(parsed.facialHairVariant || 'blank');
    setScale(parsed.scale ?? 1);
    setRotate(parsed.rotate ?? 0);
    setTranslateX(parsed.translateX ?? 0);
    setTranslateY(parsed.translateY ?? 0);
    setFlip(parsed.flip || 'none');
    setCustomBgHex('');
    setError(null);
    setSuccess(null);
  };

  const copyAvatarUrl = async () => {
    try {
      await navigator.clipboard.writeText(avatarUrl);
      setSuccess('Avatar bağlantısı kopyalandı.');
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError('Bağlantı kopyalanamadı.');
    }
  };

  const downloadAvatar = async () => {
    try {
      const response = await fetch(avatarUrl);
      const svg = await response.text();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${resolvedSeed.replace(/[^a-z0-9_-]+/gi, '-') || 'avatar'}.svg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setSuccess('Avatar SVG indirildi.');
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError('Avatar indirilemedi.');
    }
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

  const renderSelect = <T extends string>(
    label: string,
    value: T,
    onNext: (next: T) => void,
    options: readonly T[],
    labels: Record<T, string>,
  ) => (
    <div className="control-group">
      <label className="control-label">{label}</label>
      <select className="input-field select-field" value={value} onChange={(event) => onNext(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </div>
  );

  const renderSlider = (
    label: string,
    value: number,
    setValue: (value: number) => void,
    min: number,
    max: number,
    step = 1,
  ) => (
    <div className="control-group">
      <div className="slider-header">
        <label className="control-label">{label}</label>
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        className="neo-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </div>
  );

  return (
    <div className="avatar-editor-container card">
      <div className="avatar-preview-section">
        <div className="avatar-title-row">
          <h4 className="avatar-section-title">Canlı Önizleme</h4>
          <button
            type="button"
            className="avatar-mini-reset"
            onClick={handleRandomize}
            disabled={saving || loading}
          >
            Rastgele
          </button>
        </div>

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

        <div className="avatar-preview-actions avatar-preview-actions--four">
          <button type="button" className="btn-secondary btn-icon" onClick={handleRandomize} disabled={saving || loading}>
            <Sparkles size={16} />
            Rastgele
          </button>
          <button type="button" className="btn-secondary btn-icon" onClick={handleReset} disabled={saving || loading}>
            <RotateCcw size={16} />
            Sıfırla
          </button>
          <button type="button" className="btn-secondary btn-icon" onClick={copyAvatarUrl}>
            <Copy size={16} />
            Kopyala
          </button>
          <button type="button" className="btn-secondary btn-icon" onClick={downloadAvatar}>
            <Download size={16} />
            İndir
          </button>
        </div>

        <div className="avatar-seed-display">
          <span className="seed-label">Seed:</span>
          <code className="seed-code">{resolvedSeed}</code>
        </div>
      </div>

      <div className="avatar-controls-section">
        <div className="avatar-tabs avatar-tabs--three">
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
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'position' ? 'active' : ''}`}
            onClick={() => setActiveTab('position')}
          >
            Poz
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

              <div className="avatar-control-grid">
                {renderSelect('Saç / Baş', headVariant, setHeadVariant, ALLOWED_HEAD_VARIANTS, HEAD_LABELS)}
                {renderSelect('Yüz İfadesi', expressionVariant, setExpressionVariant, ALLOWED_EXPRESSION_VARIANTS, EXPRESSION_LABELS)}
              </div>

              <div className="control-group">
                <label className="control-label">Gözlük</label>
                <div className="glasses-choice-grid">
                  {GLASSES_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`glasses-choice ${accessories === option.value ? 'selected' : ''}`}
                      onClick={() => setAccessories(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {renderSelect('Sakal / Bıyık', facialHairVariant, setFacialHairVariant, ALLOWED_FACIAL_HAIR_VARIANTS, FACIAL_HAIR_LABELS)}
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="avatar-tab-panel stagger-children">
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

              <div className="control-group">
                <label className="control-label">Kıyafet rengi</label>
                <div className="color-palette-grid">
                  {CLOTHING_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`color-bubble ${clothingColor === hex ? 'selected' : ''}`}
                      style={{ backgroundColor: `#${hex}` }}
                      onClick={() => setClothingColor(hex)}
                      title={`#${hex}`}
                    />
                  ))}
                </div>
              </div>

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

          {activeTab === 'position' && (
            <div className="avatar-tab-panel stagger-children">
              {renderSlider('Yakınlaştır', scale, setScale, 0.7, 1.5, 0.05)}
              {renderSlider('Döndür', rotate, setRotate, -18, 18)}
              {renderSlider('Sağa / Sola', translateX, setTranslateX, -30, 30)}
              {renderSlider('Yukarı / Aşağı', translateY, setTranslateY, -30, 30)}
              <div className="control-group">
                <label className="control-label">Yön</label>
                <div className="glasses-choice-grid">
                  {(['none', 'horizontal'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`glasses-choice ${flip === option ? 'selected' : ''}`}
                      onClick={() => setFlip(option)}
                    >
                      {option === 'none' ? 'Normal' : 'Ters Çevir'}
                    </button>
                  ))}
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
