/**
 * NeoAvatar — Neo-Brutalism Avatar Component
 * ─────────────────────────────────────────────────────────────
 * Fallback priority:
 *   1. Uploaded profile image (src prop)
 *   2. Generated Neo-Brutalism SVG avatar (from name or email seed)
 *   3. Styled initials tile (last resort if SVG fails to render)
 *
 * Usage:
 *   <NeoAvatar src={user.avatar_url} name={user.username} email={user.email} size={40} />
 *   <NeoAvatar name="John Doe" size={64} shape="circle" />
 *   <NeoAvatar email="alice@example.com" size={32} shape="square" />
 */

import React, { useState, useMemo } from 'react';
import { generateNeoAvatar, getInitials, getInitialsBg } from '../lib/avatarGenerator';

/* ── Types ────────────────────────────────────────────────────── */

export type AvatarShape = 'circle' | 'rounded' | 'square';

export interface NeoAvatarProps {
  /** Uploaded photo URL — shown first if valid */
  src?: string | null;
  /** Display name — used as avatar seed and initials source */
  name?: string | null;
  /** Email — used as fallback seed when name is absent */
  email?: string | null;
  /** Pixel size (width = height). Default: 40 */
  size?: number;
  /** Border-radius style. Default: 'rounded' */
  shape?: AvatarShape;
  /** Extra CSS classes on the wrapper element */
  className?: string;
  /** Inline styles merged onto the wrapper element */
  style?: React.CSSProperties;
  /** Click handler — adds cursor-pointer automatically */
  onClick?: () => void;
  /** Accessible title / tooltip */
  title?: string;
  /** Show thick black border ring. Default: true */
  border?: boolean;
}

/* ── Helpers ──────────────────────────────────────────────────── */

function radiusFor(shape: AvatarShape, size: number): string {
  if (shape === 'circle')  return '50%';
  if (shape === 'square')  return '4px';
  return `${Math.max(6, Math.round(size * 0.18))}px`;
}

/* ── Component ────────────────────────────────────────────────── */

export const NeoAvatar: React.FC<NeoAvatarProps> = ({
  src,
  name,
  email,
  size    = 40,
  shape   = 'rounded',
  className = '',
  style,
  onClick,
  title,
  border  = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const seed = (name || email || 'user').trim();

  // Memoize SVG generation — same seed = same avatar, no recompute unless seed changes
  const svgHtml = useMemo(() => generateNeoAvatar(seed), [seed]);

  const initials = getInitials(name, email);
  const initialsBg = getInitialsBg(seed);

  const radius  = radiusFor(shape, size);
  const cursor  = onClick ? 'cursor-pointer' : '';
  const tooltip = title ?? (name || email || 'User');

  const baseStyle: React.CSSProperties = {
    width:        size,
    height:       size,
    minWidth:     size,
    borderRadius: radius,
    overflow:     'hidden',
    flexShrink:   0,
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    position:     'relative',
    // Neo-brutalist ring border — sits outside the element, doesn't shrink content
    boxShadow:    border ? `0 0 0 2.5px #000` : undefined,
    ...style,
  };

  /* ── Priority 1: Uploaded image ── */
  if (src && !imgFailed) {
    return (
      <div
        className={`${cursor} ${className}`}
        style={baseStyle}
        onClick={onClick}
        title={tooltip}
      >
        <img
          src={src}
          alt={initials}
          width={size}
          height={size}
          className="w-full h-full object-cover block"
          onError={() => setImgFailed(true)}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  /* ── Priority 2: Generated Neo-Brutalism SVG ── */
  return (
    <div
      className={`${cursor} ${className}`}
      style={baseStyle}
      onClick={onClick}
      title={tooltip}
      aria-label={initials}
      role="img"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};

/* ── Initials Fallback (exported separately for edge cases) ───── */

export const InitialsAvatar: React.FC<Omit<NeoAvatarProps, 'src'>> = ({
  name, email, size = 40, shape = 'rounded', className = '', style, onClick, title, border = true,
}) => {
  const seed     = (name || email || 'user').trim();
  const initials = getInitials(name, email);
  const bg       = getInitialsBg(seed);
  const radius   = radiusFor(shape, size);
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={`font-black select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width:        size,
        height:       size,
        minWidth:     size,
        borderRadius: radius,
        background:   bg,
        color:        '#000',
        fontSize:     fontSize,
        display:      'inline-flex',
        alignItems:   'center',
        justifyContent: 'center',
        flexShrink:   0,
        boxShadow:    border ? '0 0 0 2.5px #000' : undefined,
        ...style,
      }}
      onClick={onClick}
      title={title ?? (name || email || 'User')}
      aria-label={initials}
      role="img"
    >
      {initials}
    </div>
  );
};

export default NeoAvatar;
