import React from 'react';
import { colorfulBySeed, shapeBySeed } from '../lib/stickerCatalog';
import type { StickerPresetKey, StickerSlotConfig } from '../lib/stickerLayouts';
import { STICKER_PRESETS } from '../lib/stickerLayouts';

type StickerDecorProps = {
  preset: StickerPresetKey;
  className?: string;
  style?: React.CSSProperties;
};

function slotAsset(slot: StickerSlotConfig, index: number) {
  if (slot.colorful) return colorfulBySeed(slot.seed, index);
  return shapeBySeed(slot.seed, index, !!slot.figure);
}

const StickerSlot: React.FC<{ slot: StickerSlotConfig; index: number }> = ({ slot, index }) => {
  const asset = slotAsset(slot, index);
  if (!asset.url) return null;

  const classes = [
    'sticker-decor__item',
    slot.hideTablet ? 'sticker-decor__item--hide-tablet' : '',
    slot.hideMobile ? 'sticker-decor__item--hide-mobile' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        position: 'absolute',
        top: slot.top,
        right: slot.right,
        bottom: slot.bottom,
        left: slot.left,
        ['--stk-size-d' as string]: `${slot.sizeDesktop}px`,
        ['--stk-size-t' as string]: `${slot.sizeTablet ?? slot.sizeDesktop}px`,
        ['--stk-size-m' as string]: `${slot.sizeMobile ?? slot.sizeTablet ?? slot.sizeDesktop}px`,
        transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined,
        opacity: slot.opacity ?? 0.85,
      }}
    >
      <img src={asset.url} alt="" draggable={false} className="sticker-decor__img" />
    </div>
  );
};

/** Fixed viewport backdrop — sits behind all page content (z-index 0). */
export const PageStickerBackdrop: React.FC<StickerDecorProps> = ({ preset, className, style }) => (
  <div
    className={['page-sticker-backdrop', className].filter(Boolean).join(' ')}
    style={style}
    aria-hidden
  >
    {STICKER_PRESETS[preset].map((slot, i) => (
      <StickerSlot key={slot.id} slot={slot} index={i} />
    ))}
  </div>
);

/** Inline section wrapper — stickers in section margins, content stays on top. */
export const SectionStickerDecor: React.FC<StickerDecorProps & { children: React.ReactNode }> = ({
  preset,
  children,
  className,
  style,
}) => (
  <div className={['section-sticker-decor', className].filter(Boolean).join(' ')} style={style}>
    <div className="section-sticker-decor__bg" aria-hidden>
      {STICKER_PRESETS[preset].map((slot, i) => (
        <StickerSlot key={slot.id} slot={slot} index={i} />
      ))}
    </div>
    <div className="section-sticker-decor__content">{children}</div>
  </div>
);

/** Horizontal divider strip between landing sections. */
export const StickerSectionDivider: React.FC<{ preset?: StickerPresetKey }> = ({ preset = 'landing-divider' }) => (
  <div className="sticker-section-divider" aria-hidden>
    {STICKER_PRESETS[preset].map((slot, i) => (
      <div
        key={slot.id}
        className={[
          'sticker-section-divider__item',
          slot.hideTablet ? 'sticker-decor__item--hide-tablet' : '',
          slot.hideMobile ? 'sticker-decor__item--hide-mobile' : '',
        ].filter(Boolean).join(' ')}
        style={{
          ['--stk-size-d' as string]: `${slot.sizeDesktop}px`,
          ['--stk-size-t' as string]: `${slot.sizeTablet ?? slot.sizeDesktop}px`,
          ['--stk-size-m' as string]: `${slot.sizeMobile ?? slot.sizeTablet ?? slot.sizeDesktop}px`,
          transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined,
          opacity: slot.opacity ?? 0.9,
        }}
      >
        <img
          src={slotAsset(slot, i).url}
          alt=""
          draggable={false}
          className="sticker-decor__img"
        />
      </div>
    ))}
  </div>
);
