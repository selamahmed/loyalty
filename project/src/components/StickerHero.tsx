import React from 'react';
import PageMainSticker from './PageMainSticker';
import { stickerDimensions } from '../lib/pageMainSticker';
import type { PageStickerKey } from '../lib/pageStickers';

type StickerHeroProps = {
  page: PageStickerKey;
  bg: string;
  badge: string;
  title: string;
  highlight?: string;
  height?: number;
  titleColor?: string;
  highlightColor?: string;
};

/** Hero banner with brand-system sticker in a reserved right slot. */
const StickerHero: React.FC<StickerHeroProps> = ({
  page,
  bg,
  badge,
  title,
  highlight,
  height = 140,
  titleColor,
  highlightColor,
}) => {
  const dims = stickerDimensions(page, 'hero-inline');

  return (
    <div
      className="sticker-hero"
      style={{
        border: '3px solid var(--dark-border)',
        boxShadow: '0px 6px 0px var(--dark-border)',
        borderRadius: 20,
        position: 'relative',
        height,
        background: bg,
        ['--pms-size-d' as string]: `${dims.desktop}px`,
        ['--pms-size-m' as string]: `${dims.mobile}px`,
        ...(titleColor ? { ['--hero-title-color' as string]: titleColor } : {}),
        ...(highlightColor ? { ['--hero-highlight-color' as string]: highlightColor } : {}),
      }}
    >
    <div className="sticker-hero__copy">
      <div className="sticker-hero__badge">{badge}</div>
      <h2 className="sticker-hero__title">{title}</h2>
      {highlight && <h2 className="sticker-hero__highlight">{highlight}</h2>}
    </div>
    <PageMainSticker page={page} variant="hero-inline" />
  </div>
  );
};

export default StickerHero;
