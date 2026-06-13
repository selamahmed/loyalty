import React from 'react';
import { LANDING_HERO_CENTER_URL, LANDING_HERO_SATELLITE_URLS } from '../lib/landingHeroAssets';
import StickerDecorImg from './StickerDecorImg';

const HERO_SATELLITES: {
  url: string;
  size: number;
  rotate: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  hideMobile?: boolean;
}[] = LANDING_HERO_SATELLITE_URLS.map((url, i) => ({
  url,
  size: [88, 76, 68, 72][i] ?? 72,
  rotate: [14, -10, 8, -8][i] ?? 0,
  ...(i === 0 ? { top: '6%', right: '2%', hideMobile: true }
    : i === 1 ? { bottom: '10%', left: '0%' }
    : i === 2 ? { top: '12%', left: '4%', hideMobile: true }
    : { bottom: '6%', right: '6%' }),
}));

/** Hero art — colorful sticker cluster; LCP star uses stable public URL + high priority. */
const HeroGroupComposition: React.FC = () => (
  <div className="hero-group-composition" aria-hidden>
    {HERO_SATELLITES.map(s => (
      <div
        key={s.url}
        className={['hero-group-satellite', s.hideMobile ? 'sticker-decor__item--hide-mobile' : ''].filter(Boolean).join(' ')}
        style={{
          position: 'absolute',
          top: s.top,
          right: s.right,
          bottom: s.bottom,
          left: s.left,
          ['--stk-size-d' as string]: `${s.size}px`,
          ['--stk-size-m' as string]: `${Math.round(s.size * 0.75)}px`,
          transform: `rotate(${s.rotate}deg)`,
          opacity: 0.92,
          zIndex: 1,
        }}
      >
        <StickerDecorImg src={s.url} />
      </div>
    ))}
    <img
      src={LANDING_HERO_CENTER_URL}
      alt=""
      aria-hidden
      width={300}
      height={300}
      loading="eager"
      fetchPriority="high"
      decoding="sync"
      draggable={false}
      className="hero-group-composition__star"
      style={{
        width: 300,
        height: 300,
        objectFit: 'contain',
        display: 'block',
        transform: 'rotate(-4deg)',
        opacity: 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  </div>
);

export default HeroGroupComposition;
