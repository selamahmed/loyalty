import React from 'react';
import { figureBySeed, stickerBySeed } from '../lib/stickerCatalog';

type StickerProps = {
  src: string;
  alt?: string;
  size?: number;
  rotate?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Single static sticker — no animation. */
export const Sticker: React.FC<StickerProps> = ({
  src,
  alt = '',
  size = 80,
  rotate = 0,
  opacity = 0.9,
  className = '',
  style,
}) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: 'auto',
        display: 'block',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        opacity: Math.max(opacity, 0.7),
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
    />
  );
};

export type StickerPlacement = {
  seed: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  size?: number;
  rotate?: number;
  opacity?: number;
  figure?: boolean;
};

type StickerFieldProps = {
  placements: StickerPlacement[];
  className?: string;
  style?: React.CSSProperties;
};

/** @deprecated Use PageStickerBackdrop or SectionStickerDecor from StickerDecor.tsx */
export const StickerField: React.FC<StickerFieldProps> = ({ placements, className, style }) => (
  <div
    className={className}
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, ...style }}
    aria-hidden
  >
    {placements.map((p, i) => {
      const asset = p.figure ? figureBySeed(p.seed, i) : stickerBySeed(p.seed, i);
      return (
        <div
          key={`${p.seed}-${i}`}
          style={{ position: 'absolute', top: p.top, left: p.left, right: p.right, bottom: p.bottom }}
        >
          <Sticker
            src={asset.url}
            size={p.size ?? 64}
            rotate={p.rotate}
            opacity={p.opacity ?? 0.85}
          />
        </div>
      );
    })}
  </div>
);
