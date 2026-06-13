import React from 'react';

export type AppLogoSize = 32 | 36 | 64 | 72;

type AppLogoProps = {
  size?: AppLogoSize;
  className?: string;
  style?: React.CSSProperties;
  inverted?: boolean;
  priority?: boolean;
};

const LOGO_FILES: Record<AppLogoSize, string> = {
  32: 'logo-32',
  36: 'logo-36',
  64: 'logo-64',
  72: 'logo-72',
};

/** Responsive logo — serves WebP at the exact display size to avoid oversized downloads. */
const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  style,
  inverted = false,
  priority = false,
}) => {
  const base = LOGO_FILES[size];

  return (
    <picture>
      <source type="image/webp" srcSet={`/assets/icons/${base}.webp`} />
      <img
        src={`/assets/icons/${base}.png`}
        alt="NexReward"
        width={size}
        height={size}
        className={className}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
          ...style,
        }}
      />
    </picture>
  );
};

export default AppLogo;
