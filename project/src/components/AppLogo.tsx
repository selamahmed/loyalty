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
  32: 'logo-wordmark-32',
  36: 'logo-wordmark-36',
  64: 'logo-wordmark-64',
  72: 'logo-wordmark-72',
};

const LOGO_DIMENSIONS: Record<AppLogoSize, { width: number; height: number }> = {
  32: { width: 99, height: 32 },
  36: { width: 114, height: 36 },
  64: { width: 206, height: 64 },
  72: { width: 228, height: 72 },
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
  const dimensions = LOGO_DIMENSIONS[size];

  return (
    <picture>
      <source type="image/webp" srcSet={`/assets/icons/${base}.webp`} />
      <img
        src={`/assets/icons/${base}.png`}
        alt="Nesve Next"
        width={dimensions.width}
        height={dimensions.height}
        className={className}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
        style={{
          width: dimensions.width,
          height: dimensions.height,
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
