import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Copy, Check } from 'lucide-react';
import NeoAvatar from './NeoAvatar';
import { buildAvatarUrl, randomAvatarSeed } from '../lib/avatar';

interface AvatarEditorProps {
  currentSeed: string | null;
  onSave: (seed: string, avatarUrl: string) => Promise<void>;
  loading?: boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ currentSeed, onSave, loading = false }) => {
  const [seed, setSeed] = useState(currentSeed || 'user');
  const [previewSeed, setPreviewSeed] = useState(seed);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentSeed) {
      setSeed(currentSeed);
      setPreviewSeed(currentSeed);
    }
  }, [currentSeed]);

  const avatarUrl = buildAvatarUrl(previewSeed);

  const handleRandomize = () => {
    const newSeed = randomAvatarSeed();
    setPreviewSeed(newSeed);
  };

  const handleCopyToMain = () => {
    setSeed(previewSeed);
  };

  const handleCopySeedToClipboard = () => {
    navigator.clipboard.writeText(previewSeed).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    if (!previewSeed.trim()) {
      setError('Seed cannot be empty');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSeed(previewSeed);
      await onSave(previewSeed, avatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save avatar');
      setPreviewSeed(seed);
    } finally {
      setSaving(false);
    }
  };

  const card = {
    background: 'var(--card-bg)',
    border: '3px solid var(--dark-border)',
    boxShadow: '0px 5px 0px var(--dark-border)',
    borderRadius: 20,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Current Avatar Display */}
      <div style={{ ...card, padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 900, color: '#a78bfa', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Avatar Önizlemesi
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <NeoAvatar src={avatarUrl} name={previewSeed} size={120} shape="circle" />
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
          Seed: <code style={{ background: 'var(--tab-bg)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{previewSeed}</code>
        </p>
      </div>

      {/* Seed Input */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
          Avatar Seed
        </label>
        <input
          type="text"
          value={previewSeed}
          onChange={(e) => {
            setPreviewSeed(e.target.value);
            setError(null);
          }}
          placeholder="Seed değerini girin (örn: john_doe)"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: '2.5px solid var(--dark-border)',
            boxShadow: '0 3px 0 var(--dark-border)',
            background: 'var(--input-bg)',
            color: 'var(--text-dark)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, margin: '6px 0 0' }}>
            {error}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          type="button"
          onClick={handleRandomize}
          disabled={saving || loading}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 13,
            background: 'rgba(167,139,250,0.12)',
            border: '2.5px solid #a78bfa',
            boxShadow: '0 4px 0 var(--dark-border)',
            color: '#a78bfa',
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            opacity: saving || loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.1s',
          }}
          onMouseDown={(e) => !saving && !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)')}
          onMouseUp={(e) => !saving && !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 var(--dark-border)')}
        >
          <RefreshCw size={16} />
          Rastgele
        </button>
        <button
          type="button"
          onClick={handleCopySeedToClipboard}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 13,
            background: 'rgba(34,197,94,0.12)',
            border: '2.5px solid #22c55e',
            boxShadow: '0 4px 0 var(--dark-border)',
            color: '#22c55e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.1s',
          }}
          onMouseDown={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)')}
          onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 var(--dark-border)')}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading || previewSeed === seed}
        style={{
          padding: '14px 18px',
          borderRadius: 12,
          fontWeight: 900,
          fontSize: 14,
          background: previewSeed === seed ? 'var(--tab-bg)' : '#7B6EF6',
          border: `2.5px solid ${previewSeed === seed ? 'var(--dark-border)' : 'var(--dark-border)'}`,
          boxShadow: previewSeed === seed ? '0 3px 0 var(--dark-border)' : '0 5px 0 var(--dark-border)',
          color: previewSeed === seed ? 'var(--text-muted)' : 'white',
          cursor: saving || loading || previewSeed === seed ? 'not-allowed' : 'pointer',
          opacity: saving || loading || previewSeed === seed ? 0.6 : 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.1s',
        }}
        onMouseDown={(e) => previewSeed !== seed && !saving && !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)')}
        onMouseUp={(e) => previewSeed !== seed && !saving && !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 var(--dark-border)')}
      >
        <Save size={16} />
        {saving || loading ? 'Kaydediliyor...' : previewSeed === seed ? 'Değişiklik Yok' : 'Avatar\'ı Kaydet'}
      </button>
    </div>
  );
};

export default AvatarEditor;
