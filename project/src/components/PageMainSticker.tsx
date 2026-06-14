import React from 'react';
import { colorfulSticker } from '../lib/stickerCatalog';
import {
  mainStickerConfig,
  stickerDimensions,
  type StickerVariant,
} from '../lib/pageMainSticker';
import type { PageStickerKey } from '../lib/pageStickers';
import StickerDecorImg from './StickerDecorImg';

type PageMainStickerProps = {
  page: PageStickerKey | 'dashboard';
  variant?: StickerVariant;
  className?: string;
};

/** Single bare page illustration — no frame, one per screen. */
const PageMainSticker: React.FC<PageMainStickerProps> = ({
  page,
  variant = 'hero-inline',
  className = '',
}) => {
  const cfg = mainStickerConfig(page);
  const dims = stickerDimensions(page, variant);
  const asset = colorfulSticker(cfg.group);
  if (!asset?.url) return null;

  return (
    <div
      className={['page-main-sticker', `page-main-sticker--${variant}`, className].filter(Boolean).join(' ')}
      data-page={page}
      style={{
        ['--pms-size-d' as string]: `${dims.desktop}px`,
        ['--pms-size-m' as string]: `${dims.mobile}px`,
        ['--pms-rotate' as string]: `${cfg.rotate}deg`,
        ['--pms-accent' as string]: cfg.accent,
      }}
      aria-hidden
    >
      <StickerDecorImg
        src={asset.url}
        width={dims.desktop}
        height={dims.desktop}
        loading="eager"
        className="page-main-sticker__img"
      />
    </div>
  );
};

export default PageMainSticker;
