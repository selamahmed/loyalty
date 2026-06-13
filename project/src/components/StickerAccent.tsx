import React from 'react';

import { colorfulSticker, colorfulBySeed, shapeBySeed } from '../lib/stickerCatalog';



type StickerAccentProps = {

  seed?: string;

  /** Colorful Group filename — for large hero stickers only */

  group?: string;

  /** colorful = big heroes/backgrounds; shape = buttons & cards (default) */

  variant?: 'colorful' | 'shape';

  size?: number;

  rotate?: number;

  /** Pick figure sub-pool within shapes */

  figure?: boolean;

  className?: string;

  style?: React.CSSProperties;

};



/** Inline sticker — colorful for heroes, shapes for buttons/cards. */

export const StickerAccent: React.FC<StickerAccentProps> = ({

  seed = 'accent',

  group,

  variant = 'shape',

  size = 48,

  rotate = 0,

  figure = false,

  className = '',

  style,

}) => {

  const asset = group

    ? colorfulSticker(group)

    : variant === 'colorful'

      ? colorfulBySeed(seed, 0)

      : shapeBySeed(seed, 0, figure);



  if (!asset?.url) return null;



  return (

    <div

      className={['sticker-accent', className].filter(Boolean).join(' ')}

      style={{

        width: size,

        lineHeight: 0,

        pointerEvents: 'none',

        userSelect: 'none',

        transform: rotate ? `rotate(${rotate}deg)` : undefined,

        ...style,

      }}

      aria-hidden

    >

      <img src={asset.url} alt="" draggable={false} className="sticker-decor__img" />

    </div>

  );

};



export default StickerAccent;


