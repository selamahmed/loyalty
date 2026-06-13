import React from 'react';

type StickerDecorImgProps = {
  src: string;
  className?: string;
  width?: number;
  height?: number;
};

/** Sticker image with reserved square aspect ratio — prevents CLS from SVG load. */
export const StickerDecorImg: React.FC<StickerDecorImgProps> = ({
  src,
  className = 'sticker-decor__img',
  width = 100,
  height = 100,
}) => (
  <img
    src={src}
    alt=""
    width={width}
    height={height}
    draggable={false}
    decoding="async"
    className={className}
  />
);

export default StickerDecorImg;
