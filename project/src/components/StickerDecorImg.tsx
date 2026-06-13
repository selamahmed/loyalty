import React from 'react';

type StickerDecorImgProps = {
  src: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
};

/** Sticker image with reserved square aspect ratio — prevents CLS from SVG load. */
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
