/**
 * NeoAvatar — profile avatar from bundled asset library
 */

import React, { useState } from 'react';
import { getAvatarBgColor, resolveAvatarSrc } from '../lib/avatarCatalog';
import { getInitials, getInitialsBg } from '../lib/avatarGenerator';

export type AvatarShape = 'circle' | 'rounded' | 'square';

export interface NeoAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  shape?: AvatarShape;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  border?: boolean;
}

function radiusFor(shape: AvatarShape, size: number): string {
  if (shape === 'circle') return '50%';
  if (shape === 'square') return '4px';
  return `${Math.max(6, Math.round(size * 0.18))}px`;
}

export const NeoAvatar: React.FC<NeoAvatarProps> = ({
  src,
  name,
  email,
  size = 40,
  shape = 'rounded',
  className = '',
  style,
  onClick,
  title,
  border = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const imageSrc = resolveAvatarSrc(src);
  const assetBg = getAvatarBgColor(src);
  const initials = getInitials(name, email);
  const initialsBg = getInitialsBg((name || email || 'user').trim());
  const radius = radiusFor(shape, size);
  const cursor = onClick ? 'cursor-pointer' : '';
  const tooltip = title ?? (name || email || 'User');

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: radius,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: border ? '0 0 0 2.5px #000' : undefined,
    ...style,
  };

  if (imageSrc && !imgFailed) {
    return (
      <div
        className={`${cursor} ${className}`}
        style={{ ...baseStyle, background: assetBg ?? undefined }}
        onClick={onClick}
        title={tooltip}
      >
        <img
          src={imageSrc}
          alt={initials}
          width={size}
          height={size}
          className={`w-full h-full block ${assetBg ? 'object-contain p-[8%]' : 'object-cover'}`}
          onError={() => setImgFailed(true)}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={`font-black select-none ${cursor} ${className}`}
      style={{
        ...baseStyle,
        background: initialsBg,
        color: '#000',
        fontSize,
      }}
      onClick={onClick}
      title={tooltip}
      aria-label={initials}
      role="img"
    >
      {initials}
    </div>
  );
};

export default NeoAvatar;
