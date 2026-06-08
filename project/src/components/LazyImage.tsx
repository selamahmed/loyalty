import React, { useRef, useEffect, useState, useCallback } from 'react';

const SKELETON_COLORS = ['#FFE500', '#FF2D78', '#00F5D4', '#FF6B00', '#7B6EF6'];
const SKELETON_ICONS  = ['⬛', '◼', '▪', '▰', '◾'];

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  brutalistBorder?: boolean;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  containerStyle,
  containerClassName,
  brutalistBorder = true,
  rootMargin = '120px',
  style,
  className,
  ...imgProps
}) => {
  const [inView,  setInView]  = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorIdx = useRef(Math.floor(Math.random() * SKELETON_COLORS.length));
  const iconIdx  = useRef(Math.floor(Math.random() * SKELETON_ICONS.length));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  const handleLoad  = useCallback(() => setLoaded(true),  []);
  const handleError = useCallback(() => { setErrored(true); setLoaded(true); }, []);

  const skelColor = SKELETON_COLORS[colorIdx.current];
  const skelIcon  = SKELETON_ICONS[iconIdx.current];

  const baseContainerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display:  'block',
    ...(brutalistBorder && {
      border:    '4px solid #000',
      boxShadow: '6px 6px 0px #000',
    }),
    ...containerStyle,
  };

  return (
    <>
      <div ref={containerRef} style={baseContainerStyle} className={containerClassName}>
        {/* ── Neo-brutalist skeleton ── */}
        {!loaded && (
          <div
            aria-hidden="true"
            style={{
              position:       'absolute',
              inset:          0,
              background:     skelColor,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            10,
              animation:      'nb-pulse 0.7s steps(2, end) infinite',
              zIndex:         1,
            }}
          >
            <div style={{
              width:      48,
              height:     48,
              border:     '4px solid #000',
              background: '#fff',
              boxShadow:  '4px 4px 0 #000',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize:   22,
              animation:  'nb-jitter 0.4s steps(3) infinite',
            }}>
              {skelIcon}
            </div>
            <div style={{
              width:      '55%',
              height:     10,
              background: '#000',
              boxShadow:  '3px 3px 0 rgba(0,0,0,0.3)',
            }} />
            <div style={{
              width:      '35%',
              height:     10,
              background: '#000',
              opacity:    0.5,
            }} />
          </div>
        )}

        {/* ── Actual image (loads only when in view) ── */}
        {inView && !errored && (
          <img
            {...imgProps}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width:   '100%',
              height:  '100%',
              display: 'block',
              objectFit: 'cover',
              animation: loaded ? 'nb-snap 0.2s steps(4, end) forwards' : 'none',
              opacity:   loaded ? 1 : 0,
              ...style,
            }}
            className={className}
          />
        )}

        {/* ── Error fallback ── */}
        {errored && (
          <div style={{
            position:       'absolute',
            inset:          0,
            background:     '#FF2D78',
            border:         '4px solid #000',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexDirection:  'column',
            gap:            6,
          }}>
            <span style={{ fontSize: 28, filter: 'drop-shadow(3px 3px 0 #000)' }}>✕</span>
            <p style={{ fontWeight: 900, fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              YÜKLENEMEDI
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes nb-pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.55; }
          100% { opacity: 1; }
        }
        @keyframes nb-jitter {
          0%   { transform: translate(0,0); }
          33%  { transform: translate(-3px, 3px); }
          66%  { transform: translate(3px, -2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes nb-snap {
          0%   { opacity: 0; transform: translate(-6px, 6px) scale(0.96) skew(-2deg); }
          25%  { opacity: 1; transform: translate(4px, -4px) scale(1.03) skew(1deg); }
          50%  { transform: translate(-3px, 3px) scale(0.99) skew(-1deg); }
          75%  { transform: translate(2px, -2px) scale(1.01); }
          100% { opacity: 1; transform: translate(0,0) scale(1) skew(0); }
        }
      `}</style>
    </>
  );
};

export default LazyImage;
