import React from 'react';

interface MovingStripesProps {
  opacity?: number;
  zIndex?: number;
  position?: 'fixed' | 'absolute';
}

const MovingStripes: React.FC<MovingStripesProps> = ({
  opacity = 1,
  zIndex = 0,
  position = 'fixed',
}) => (
  <div
    style={{
      position,
      inset: 0,
      zIndex,
      pointerEvents: 'none',
      overflow: 'hidden',
      opacity,
    }}
  >
    {/* Stripe layer 1 — moving right */}
    <div
      style={{
        position: 'absolute',
        inset: '-100%',
        backgroundImage:
          'repeating-linear-gradient(55deg, rgba(123,110,246,0.07) 0px, rgba(123,110,246,0.07) 2px, transparent 2px, transparent 36px)',
        backgroundSize: '52px 52px',
        animation: 'stripeRight 6s linear infinite',
      }}
    />
    {/* Stripe layer 2 — moving left */}
    <div
      style={{
        position: 'absolute',
        inset: '-100%',
        backgroundImage:
          'repeating-linear-gradient(-55deg, rgba(79,142,247,0.05) 0px, rgba(79,142,247,0.05) 2px, transparent 2px, transparent 48px)',
        backgroundSize: '68px 68px',
        animation: 'stripeLeft 9s linear infinite',
      }}
    />
    <style>{`
      @keyframes stripeRight {
        from { transform: translateX(0); }
        to   { transform: translateX(52px); }
      }
      @keyframes stripeLeft {
        from { transform: translateX(0); }
        to   { transform: translateX(-68px); }
      }
    `}</style>
  </div>
);

export default MovingStripes;
