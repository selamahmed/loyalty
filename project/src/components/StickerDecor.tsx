import React, { useEffect, useState } from 'react';
import { colorfulBySeed, shapeBySeed } from '../lib/stickerCatalog';
import type { StickerPresetKey, StickerSlotConfig } from '../lib/stickerLayouts';
import { STICKER_PRESETS } from '../lib/stickerLayouts';
import StickerDecorImg from './StickerDecorImg';

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
  const [mounted, setMounted] = useState(!slot.defer);

  useEffect(() => {
    if (!slot.defer) return;
    const mount = () => setMounted(true);
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(mount, { timeout: 2200 });
      return () => (window as any).cancelIdleCallback(id);
    }
    const t = setTimeout(mount, 500);
    return () => clearTimeout(t);
  }, [slot.defer]);

  if (!mounted) return null;

  const asset = slotAsset(slot, index);
  if (!asset.url) return null;

  const classes = [
    'sticker-decor__item',
    slot.centerpiece ? 'sticker-decor__item--centerpiece' : '',
    slot.hideTablet ? 'sticker-decor__item--hide-tablet' : '',
    slot.hideMobile ? 'sticker-decor__item--hide-mobile' : '',
  ].filter(Boolean).join(' ');

  const rotate = slot.rotate ?? 0;

  return (
    <div
      className={classes}
      style={{
        position: 'absolute',
        ...(slot.centerpiece
          ? {}
          : {
              top: slot.top,
              right: slot.right,
              bottom: slot.bottom,
              left: slot.left,
            }),
        ['--stk-size-d' as string]: `${slot.sizeDesktop}px`,
        ['--stk-size-t' as string]: `${slot.sizeTablet ?? slot.sizeDesktop}px`,
        ['--stk-size-m' as string]: `${slot.sizeMobile ?? slot.sizeTablet ?? slot.sizeDesktop}px`,
        ['--stk-rotate' as string]: `${rotate}deg`,
        ['--stk-blur' as string]: `${slot.blur ?? 0}px`,
        transform: slot.centerpiece ? undefined : `rotate(${rotate}deg)`,
        opacity: slot.opacity ?? 0.1,
      }}
    >
      <StickerDecorImg src={asset.url} loading={slot.defer ? 'lazy' : 'eager'} />
    </div>
  );
};

/** Fixed viewport backdrop — sits behind all page content (z-index 0). */
export const PageStickerBackdrop: React.FC<StickerDecorProps> = ({ preset, className, style }) => (
  <div
    className={['page-sticker-backdrop', 'page-sticker-backdrop--ambient', className].filter(Boolean).join(' ')}
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
        <StickerDecorImg src={slotAsset(slot, i).url} />
      </div>
    ))}
  </div>
);
