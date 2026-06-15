import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, RotateCcw, Sparkles, Check, CheckSquare, Square } from 'lucide-react';
import {
  buildAvatarUrl,
  randomAvatarSeed,
  getDefaultAvatarSeed,
  ALLOWED_SKIN_COLORS,
  STRONG_BG_COLORS,
  ALLOWED_EXPRESSIONS,
  ALLOWED_HAIRSTYLES,
  ALLOWED_CLOTHING_COLORS,
  AvatarOptions
} from '../lib/avatar';
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

const parseAvatarUrl = (url: string | null | undefined): Partial<AvatarOptions> => {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    
    // Check if the URL is indeed from dicebear
    if (!url.includes('dicebear.com')) return {};

    return {
      seed: params.get('seed') || undefined,
      size: params.get('size') ? parseInt(params.get('size')!) : undefined,
      skinColor: params.get('skinColor') || undefined,
      backgroundColor: params.get('backgroundColor') || undefined,
      expressionVariant: params.get('expressionVariant') || undefined,
      headVariant: params.get('headVariant') || undefined,
      clothingColor: params.get('clothingColor') || undefined,
      scale: params.get('scale') ? parseInt(params.get('scale')!) : undefined,
      borderRadius: params.get('radius') ? parseInt(params.get('radius')!) : undefined,
      rotate: params.get('rotate') ? parseInt(params.get('rotate')!) : undefined,
      translateX: params.get('translateX') ? parseInt(params.get('translateX')!) : undefined,
      translateY: params.get('translateY') ? parseInt(params.get('translateY')!) : undefined,
      flip: params.get('flip') === 'true' ? true : params.get('flip') === 'false' ? false : undefined,
      accessoriesProbability: params.get('accessoriesProbability') ? parseInt(params.get('accessoriesProbability')!) : undefined,
      facialHairProbability: params.get('facialHairProbability') ? parseInt(params.get('facialHairProbability')!) : undefined,
    };
  } catch (e) {
    return {};
  }
};

const formatLabel = (str: string): string => {
  // Convert camelCase or kebab-case to Title Case with spaces
  const spaced = str
    .replace(/([A-Z])/g, ' $1')
    .replace(/([0-9]+)/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
  return spaced.trim();
};

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentSeed,
  currentUrl,
  onSave,
  loading = false,
  userContext,
}) => {
  // Initial seed resolution
  const fallbackSeed = getDefaultAvatarSeed(userContext || {});
  const initialSeed = currentSeed || fallbackSeed;
  
  // Parse existing settings from URL if present
  const urlSettings = parseAvatarUrl(currentUrl);

  // Core States
  const [seed, setSeed] = useState<string>(urlSettings.seed || initialSeed);
  const [size, setSize] = useState<number>(urlSettings.size || 256);
  const [skinColor, setSkinColor] = useState<string>(urlSettings.skinColor || ALLOWED_SKIN_COLORS[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(urlSettings.backgroundColor || STRONG_BG_COLORS[0]);
  const [customBgHex, setCustomBgHex] = useState<string>('');
  const [expression, setExpression] = useState<string>(urlSettings.expressionVariant || ALLOWED_EXPRESSIONS[0]);
  const [headVariant, setHeadVariant] = useState<string>(urlSettings.headVariant || ALLOWED_HAIRSTYLES[0]);
  const [clothingColor, setClothingColor] = useState<string>(urlSettings.clothingColor || ALLOWED_CLOTHING_COLORS[0]);
  const [customClothingHex, setCustomClothingHex] = useState<string>('');
  
  // Transforms
  const [scale, setScale] = useState<number>(urlSettings.scale ?? 100);
  const [borderRadius, setBorderRadius] = useState<number>(urlSettings.borderRadius ?? 0);
  const [rotate, setRotate] = useState<number>(urlSettings.rotate ?? 0);
  const [translateX, setTranslateX] = useState<number>(urlSettings.translateX ?? 0);
  const [translateY, setTranslateY] = useState<number>(urlSettings.translateY ?? 0);
  const [flip, setFlip] = useState<boolean>(urlSettings.flip ?? false);

  // Probabilities
  const [accessoriesProbability, setAccessoriesProbability] = useState<number>(urlSettings.accessoriesProbability ?? 30);
  const [facialHairProbability, setFacialHairProbability] = useState<number>(urlSettings.facialHairProbability ?? 10);

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<'appearance' | 'colors' | 'layout'>('appearance');
  
  // Feedback States
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Watch custom bg/clothing inputs and sync
  useEffect(() => {
    if (customBgHex.match(/^[0-9a-fA-F]{6}$/)) {
      setBackgroundColor(customBgHex.toLowerCase());
    }
  }, [customBgHex]);

  useEffect(() => {
    if (customClothingHex.match(/^[0-9a-fA-F]{6}$/)) {
      setClothingColor(customClothingHex.toLowerCase());
    }
  }, [customClothingHex]);

  // Construct URL
  const avatarOptions: AvatarOptions = {
    seed,
    size,
    skinColor,
    backgroundColor,
    expressionVariant: expression,
    headVariant,
    clothingColor,
    scale,
    borderRadius,
    rotate,
    translateX,
    translateY,
    flip,
    accessoriesProbability,
    facialHairProbability,
    maskProbability: 0,
  };

  const avatarUrl = buildAvatarUrl(avatarOptions);

  const handleRandomize = () => {
    setSeed(randomAvatarSeed());
    
    // Randomize style features as well for a true randomized look
    const randomSkin = ALLOWED_SKIN_COLORS[Math.floor(Math.random() * ALLOWED_SKIN_COLORS.length)];
    const randomBg = STRONG_BG_COLORS[Math.floor(Math.random() * STRONG_BG_COLORS.length)];
    const randomExpr = ALLOWED_EXPRESSIONS[Math.floor(Math.random() * ALLOWED_EXPRESSIONS.length)];
    const randomHair = ALLOWED_HAIRSTYLES[Math.floor(Math.random() * ALLOWED_HAIRSTYLES.length)];
    const randomCloth = ALLOWED_CLOTHING_COLORS[Math.floor(Math.random() * ALLOWED_CLOTHING_COLORS.length)];
    
    setSkinColor(randomSkin);
    setBackgroundColor(randomBg);
    setExpression(randomExpr);
    setHeadVariant(randomHair);
    setClothingColor(randomCloth);
    setCustomBgHex('');
    setCustomClothingHex('');
    
    // Randomize some transforms gently
    setRotate(0);
    setTranslateX(0);
    setTranslateY(0);
    setScale(100);
    setFlip(Math.random() > 0.5);
    setAccessoriesProbability(Math.random() > 0.5 ? 100 : 0);
    setFacialHairProbability(Math.random() > 0.7 ? 100 : 0);
  };

  const handleReset = () => {
    // Revert to database state if database settings were parsed, otherwise default
    const parsed = parseAvatarUrl(currentUrl);
    setSeed(parsed.seed || initialSeed);
    setSize(parsed.size || 256);
    setSkinColor(parsed.skinColor || ALLOWED_SKIN_COLORS[0]);
    setBackgroundColor(parsed.backgroundColor || STRONG_BG_COLORS[0]);
    setExpression(parsed.expressionVariant || ALLOWED_EXPRESSIONS[0]);
    setHeadVariant(parsed.headVariant || ALLOWED_HAIRSTYLES[0]);
    setClothingColor(parsed.clothingColor || ALLOWED_CLOTHING_COLORS[0]);
    setCustomBgHex('');
    setCustomClothingHex('');
    setScale(parsed.scale ?? 100);
    setBorderRadius(parsed.borderRadius ?? 0);
    setRotate(parsed.rotate ?? 0);
    setTranslateX(parsed.translateX ?? 0);
    setTranslateY(parsed.translateY ?? 0);
    setFlip(parsed.flip ?? false);
    setAccessoriesProbability(parsed.accessoriesProbability ?? 30);
    setFacialHairProbability(parsed.facialHairProbability ?? 10);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!seed.trim()) {
      setError('Seed boş bırakılamaz.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await onSave(seed, avatarUrl);
      setSuccess('Profil avatarı başarıyla güncellendi!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-editor-container card">
      {/* Visual Live Preview Box */}
      <div className="avatar-preview-section">
        <h4 className="avatar-section-title">Canlı Önizleme</h4>
        <div className="avatar-frame-wrapper">
          <div 
            className="avatar-frame"
            style={{ borderRadius: `${borderRadius}%` }}
          >
            <img 
              src={avatarUrl} 
              alt="Avatar Önizleme" 
              className="avatar-image-preview"
            />
          </div>
        </div>

        <div className="avatar-preview-actions">
          <button
            type="button"
            className="btn-secondary btn-icon"
            onClick={handleRandomize}
            disabled={saving || loading}
            title="Rastgele Avatar Oluştur"
          >
            <Sparkles size={16} />
            Rastgele
          </button>
          
          <button
            type="button"
            className="btn-secondary btn-icon"
            onClick={handleReset}
            disabled={saving || loading}
            title="Ayarları Sıfırla"
          >
            <RotateCcw size={16} />
            Sıfırla
          </button>
        </div>

        <div className="avatar-seed-display">
          <span className="seed-label">Seed:</span>
          <code className="seed-code">{seed}</code>
        </div>
      </div>

      {/* Editor Controls Section */}
      <div className="avatar-controls-section">
        {/* Navigation Tabs */}
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
            Renk & Aksesuar
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            Yerleşim
          </button>
        </div>

        {/* Tab Contents */}
        <div className="avatar-tab-content">
          
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="avatar-tab-panel stagger-children">
              
              {/* Seed Text Input */}
              <div className="control-group">
                <label className="control-label">Avatar İsmi / Seed</label>
                <input
                  type="text"
                  className="input-field"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="İsim veya seed girin..."
                />
              </div>

              {/* Skin Color Picker */}
              <div className="control-group">
                <label className="control-label">Ten Rengi</label>
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

              {/* Expression Selector */}
              <div className="control-group">
                <label className="control-label">Yüz İfadesi</label>
                <select
                  className="input-field select-field"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                >
                  {ALLOWED_EXPRESSIONS.map((expr) => (
                    <option key={expr} value={expr}>
                      {formatLabel(expr)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hairstyle Selector */}
              <div className="control-group">
                <label className="control-label">Saç Stili</label>
                <select
                  className="input-field select-field"
                  value={headVariant}
                  onChange={(e) => setHeadVariant(e.target.value)}
                >
                  {ALLOWED_HAIRSTYLES.map((hair) => (
                    <option key={hair} value={hair}>
                      {formatLabel(hair)}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}

          {/* TAB 2: COLORS & ACCESSORIES */}
          {activeTab === 'colors' && (
            <div className="avatar-tab-panel stagger-children">
              
              {/* Background Color Picker */}
              <div className="control-group">
                <label className="control-label">Arka Plan Rengi</label>
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
                
                {/* Custom Background Hex Input */}
                <div className="custom-hex-input-wrapper" style={{ marginTop: '8px' }}>
                  <span className="hex-prefix">#</span>
                  <input
                    type="text"
                    className="input-field hex-input"
                    placeholder="Örn: FF00FF (Hex)"
                    value={customBgHex}
                    onChange={(e) => setCustomBgHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))}
                  />
                  <span className="input-info-tag">Özel Renk</span>
                </div>
              </div>

              {/* Clothing Color Picker */}
              <div className="control-group">
                <label className="control-label">Kıyafet Rengi</label>
                <div className="color-palette-grid">
                  {ALLOWED_CLOTHING_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`color-bubble ${clothingColor === hex ? 'selected' : ''}`}
                      style={{ backgroundColor: `#${hex}` }}
                      onClick={() => {
                        setClothingColor(hex);
                        setCustomClothingHex('');
                      }}
                      title={`#${hex}`}
                    />
                  ))}
                </div>

                {/* Custom Clothing Hex Input */}
                <div className="custom-hex-input-wrapper" style={{ marginTop: '8px' }}>
                  <span className="hex-prefix">#</span>
                  <input
                    type="text"
                    className="input-field hex-input"
                    placeholder="Örn: 22C55E (Hex)"
                    value={customClothingHex}
                    onChange={(e) => setCustomClothingHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))}
                  />
                  <span className="input-info-tag">Özel Renk</span>
                </div>
              </div>

              {/* Accessories Probability Selector */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Aksesuar Sıklığı (Gözlük vb.)</label>
                  <span className="slider-value">{accessoriesProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={accessoriesProbability}
                  onChange={(e) => setAccessoriesProbability(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Facial Hair Probability Selector */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Sakal / Bıyık Sıklığı</label>
                  <span className="slider-value">{facialHairProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={facialHairProbability}
                  onChange={(e) => setFacialHairProbability(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

            </div>
          )}

          {/* TAB 3: LAYOUT & TRANSFORMS */}
          {activeTab === 'layout' && (
            <div className="avatar-tab-panel stagger-children">
              
              {/* Size Input */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Görüntü Boyutu (Piksel)</label>
                  <span className="slider-value">{size}px</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="16"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Scale Slider */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Ölçekleme (Yakınlaştırma)</label>
                  <span className="slider-value">%{scale}</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="150"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Border Radius Slider */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Kenarlık Yuvarlama</label>
                  <span className="slider-value">{borderRadius}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="2"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Rotate Slider */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Döndürme (Derece)</label>
                  <span className="slider-value">{rotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotate}
                  onChange={(e) => setRotate(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Translate X Slider */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Yatay Kaydırma (X Aksı)</label>
                  <span className="slider-value">{translateX}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={translateX}
                  onChange={(e) => setTranslateX(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Translate Y Slider */}
              <div className="control-group">
                <div className="slider-header">
                  <label className="control-label">Dikey Kaydırma (Y Aksı)</label>
                  <span className="slider-value">{translateY}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={translateY}
                  onChange={(e) => setTranslateY(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              {/* Flip Checkbox */}
              <div className="control-group inline-checkbox">
                <button
                  type="button"
                  className="checkbox-button"
                  onClick={() => setFlip(!flip)}
                >
                  {flip ? (
                    <CheckSquare size={20} className="checkbox-icon checked" />
                  ) : (
                    <Square size={20} className="checkbox-icon" />
                  )}
                  <span className="control-label checkbox-label">Avatarı Yatay Çevir (Ayna Modu)</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Messaging Box */}
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

        {/* Save Button */}
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
