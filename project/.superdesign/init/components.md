# Shared UI components

Framework: React 18 + TypeScript. Styling uses Tailwind utility classes, inline CSS variables, and global CSS.

## AppLogo

- File: `src/components/AppLogo.tsx`
- Brand logo component used in customer headers.

```tsx
import React from 'react';

export type AppLogoSize = 32 | 36 | 64 | 72;

type AppLogoProps = {
  size?: AppLogoSize;
  className?: string;
  style?: React.CSSProperties;
  inverted?: boolean;
  priority?: boolean;
};

const LOGO_FILES: Record<AppLogoSize, string> = {
  32: 'logo-wordmark-32',
  36: 'logo-wordmark-36',
  64: 'logo-wordmark-64',
  72: 'logo-wordmark-72',
};

const LOGO_DIMENSIONS: Record<AppLogoSize, { width: number; height: number }> = {
  32: { width: 99, height: 32 },
  36: { width: 114, height: 36 },
  64: { width: 206, height: 64 },
  72: { width: 228, height: 72 },
};

/** Responsive logo â€” serves WebP at the exact display size to avoid oversized downloads. */
const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  style,
  inverted = false,
  priority = false,
}) => {
  const base = LOGO_FILES[size];
  const dimensions = LOGO_DIMENSIONS[size];

  return (
    <picture>
      <source type="image/webp" srcSet={`/assets/icons/${base}.webp`} />
      <img
        src={`/assets/icons/${base}.png`}
        alt="Nesve Next"
        width={dimensions.width}
        height={dimensions.height}
        className={className}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          objectFit: 'contain',
          display: 'block',
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
          ...style,
        }}
      />
    </picture>
  );
};

export default AppLogo;

```

## StickerDecorImg

- File: `src/components/StickerDecorImg.tsx`
- Decorative sticker image primitive with reserved dimensions.

```tsx
import React from 'react';

type StickerDecorImgProps = {
  src: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
};

/** Sticker image with reserved square aspect ratio â€” prevents CLS from SVG load. */
export const StickerDecorImg: React.FC<StickerDecorImgProps> = ({
  src,
  className = 'sticker-decor__img',
  width = 100,
  height = 100,
  loading = 'lazy',
}) => (
  <img
    src={src}
    alt=""
    width={width}
    height={height}
    draggable={false}
    decoding="async"
    loading={loading}
    className={className}
  />
);

export default StickerDecorImg;

```

## ModuleDisabledScreen

- File: `src/components/ModuleDisabledScreen.tsx`
- Shared disabled-feature status card.

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

type ModuleDisabledScreenProps = {
  title: string;
  message: string;
};

const card: React.CSSProperties = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/** Shown when an admin-disabled module is opened directly via URL. */
const ModuleDisabledScreen: React.FC<ModuleDisabledScreenProps> = ({ title, message }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, margin: '0 0 10px' }}>â¸ï¸</p>
        <h1 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 8px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
        <button type="button" className="lbtn-primary-sm" onClick={() => navigate('/home')}>
          Ana sayfaya dÃ¶n
        </button>
      </div>
    </div>
  );
};

export default ModuleDisabledScreen;

```

## RewardPopup

- File: `src/components/RewardPopup.tsx`
- Shared reward feedback modal.

```tsx
import React, { useEffect } from 'react';
import { X, Star, Trophy, Zap, Gift } from 'lucide-react';
import { RewardPopupData } from '../context/AppContext';
import LevelBadge from './LevelBadge';
import WinningParticles from './WinningParticles';
import StickerAccent from './StickerAccent';

interface RewardPopupProps {
  data: RewardPopupData;
  onDismiss: () => void;
}

const popupConfig = {
  levelup: { bg: 'from-amber-400 to-orange-500', icon: Zap, emoji: 'âš¡', title: 'Level Up!' },
  reward: { bg: 'from-green-400 to-emerald-500', icon: Gift, emoji: 'ğŸ', title: 'Reward Unlocked!' },
  achievement: { bg: 'from-blue-400 to-cyan-500', icon: Trophy, emoji: 'ğŸ†', title: 'Achievement Earned!' },
  redeem: { bg: 'from-[#7B6EF6] to-[#4F8EF7]', icon: Star, emoji: 'âœ¨', title: 'Redeemed!' },
};

const RewardPopup: React.FC<RewardPopupProps> = ({ data, onDismiss }) => {
  const config = popupConfig[data.type];
  const IconComp = config.icon;
  const level = data.level ?? Number(data.title.match(/\d+/)?.[0] ?? 1);

  useEffect(() => {
    const timer = setTimeout(onDismiss, data.type === 'levelup' ? 6200 : 4000);
    return () => clearTimeout(timer);
  }, [data.type, onDismiss]);

  if (data.type === 'levelup') {
    return (
      <div className="level-up-overlay" role="dialog" aria-label="Level up celebration">
        <WinningParticles trigger emoji="âš¡" count={110} intensity="mega" />
        <div className="level-up-orbit level-up-orbit--one" />
        <div className="level-up-orbit level-up-orbit--two" />
        <div className="level-up-stars" aria-hidden="true">
          {['âœ¦', 'â˜…', 'âœ§', 'âœ¦', 'â˜…', 'âœ§'].map((star, i) => <span key={i}>{star}</span>)}
        </div>

        <div className="level-up-card level-up-card--mega">
          <button onClick={onDismiss} className="level-up-close" aria-label="Close level up">
            <X size={18} />
          </button>

          <div className="level-up-card__beam" />
          <StickerAccent group="superstar.svg" variant="colorful" size={96} rotate={-8} className="level-up-sticker level-up-sticker--left" />
          <StickerAccent group="awesome.svg" variant="colorful" size={88} rotate={10} className="level-up-sticker level-up-sticker--right" />
          <p className="level-up-card__eyebrow">LEVEL UP COMPLETE</p>
          <h2 className="level-up-title-mega">SEVÄ°YE ATLADIN!</h2>

          <div className="level-up-badge-wrap">
            <div className="level-up-badge-ring" />
            <div className="level-up-badge-glow" />
            <LevelBadge level={level} width={124} className="level-up-badge" />
          </div>

          <div className="level-up-level-row">
            <span>Yeni seviye</span>
            <p className="level-up-level-number">Lv.{level}</p>
            <span>Acildi</span>
          </div>
          <p className="level-up-subtitle">{data.subtitle}</p>

          <div className="level-up-progress-flash">
            <span />
          </div>

          <div className="level-up-perks" aria-label="Level rewards">
            <span>Yeni rozet</span>
            <span>XP boost</span>
            <span>Liderlik +</span>
          </div>

          {data.points ? (
            <div className="level-up-bonus">
              <Star size={18} fill="currentColor" />
              <strong>+{data.points.toLocaleString()}</strong>
              <span>bonus puan</span>
            </div>
          ) : (
            <div className="level-up-bonus level-up-bonus--soft">
              <Trophy size={18} />
              <span>Yeni seviye avantajlarÄ± aÃ§Ä±ldÄ±</span>
            </div>
          )}

          <button onClick={onDismiss} className="level-up-action">
            Devam et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(11, 12, 16, 0.8)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece absolute w-3 h-3 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              background: ['#4d90ff', '#357ae8', '#22c55e', '#f59e0b', '#ef4444'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="animate-bounce-in card max-w-sm w-full p-8 text-center relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl transition-all"
          style={{ backgroundColor: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}
          aria-label="Close reward popup"
        >
          <X size={18} />
        </button>

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-float"
          style={{
            background: `linear-gradient(180deg, ${config.bg} 0%, ${config.bg}dd 100%)`,
            border: '3px solid var(--dark-border)',
            boxShadow: '0px 5px 0px var(--dark-border)',
          }}
        >
          <span className="text-4xl">{config.emoji}</span>
        </div>

        <h2 style={{ color: 'var(--text-dark)' }} className="text-2xl font-black mb-2">{data.title}</h2>
        <p style={{ color: 'var(--text-muted)' }} className="mb-6">{data.subtitle}</p>

        {data.points && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star size={20} style={{ color: '#f59e0b' }} fill="currentColor" />
            <span className="text-2xl font-black" style={{ color: '#f59e0b' }}>+{data.points}</span>
            <span style={{ color: 'var(--text-muted)' }}>puan</span>
          </div>
        )}

        <button onClick={onDismiss} className="btn-primary w-full">
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;

```


