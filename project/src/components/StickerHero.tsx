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
  footer?: React.ReactNode;
  className?: string;
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
  footer,
  className = '',
}) => {
  const dims = stickerDimensions(page, 'hero-inline');

  const copyBlock = (
    <div className="sticker-hero__copy">
      <div className="sticker-hero__badge">{badge}</div>
      <h2 className="sticker-hero__title">{title}</h2>
      {highlight && <h2 className="sticker-hero__highlight">{highlight}</h2>}
    </div>
  );

  const sticker = <PageMainSticker page={page} variant="hero-inline" />;

  const shellStyle: React.CSSProperties = {
    border: '3px solid var(--dark-border)',
    boxShadow: '0px 6px 0px var(--dark-border)',
    borderRadius: 20,
    position: 'relative',
    background: bg,
    ['--pms-size-d' as string]: `${dims.desktop}px`,
    ['--pms-size-m' as string]: `${dims.mobile}px`,
    ...(titleColor ? { ['--hero-title-color' as string]: titleColor } : {}),
    ...(highlightColor ? { ['--hero-highlight-color' as string]: highlightColor } : {}),
    ...(footer ? { height: 'auto', minHeight: height } : { height }),
  };

  if (footer) {
    return (
      <div className={['sticker-hero sticker-hero--with-footer', className].filter(Boolean).join(' ')} style={shellStyle}>
        <div className="sticker-hero__body">
          {copyBlock}
          {sticker}
        </div>
        <div className="sticker-hero__footer">{footer}</div>
      </div>
    );
  }

  return (
    <div className={['sticker-hero', className].filter(Boolean).join(' ')} style={shellStyle}>
      {copyBlock}
      {sticker}
    </div>
  );
};

export default StickerHero;
