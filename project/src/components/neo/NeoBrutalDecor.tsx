import React from 'react';
import { Squiggle, StarBurst } from './NeoBrutalIllustrations';

/* Scattered background doodles like Teen Talk stories */
export const DoodleField: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity }}>
    <Squiggle color="#FF3E9D" style={{ position: 'absolute', top: '8%', left: '5%', transform: 'rotate(-12deg)' }} />
    <Squiggle color="#C8FF00" style={{ position: 'absolute', top: '15%', right: '8%', transform: 'rotate(8deg) scale(1.2)' }} />
    <StarBurst color="#FFE500" size={36} style={{ position: 'absolute', top: '25%', left: '12%' }} />
    <StarBurst color="#56C8FF" size={28} style={{ position: 'absolute', top: '60%', right: '6%', transform: 'rotate(20deg)' }} />
    <Squiggle color="#9122FF" style={{ position: 'absolute', bottom: '18%', left: '8%', transform: 'rotate(5deg)' }} />
    <StarBurst color="#FF6B35" size={32} style={{ position: 'absolute', bottom: '12%', right: '14%', transform: 'rotate(-15deg)' }} />
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', top: '45%', left: '3%', opacity: 0.6 }}>
      <polygon points="30,5 35,22 52,22 38,32 44,48 30,38 16,48 22,32 8,22 25,22"
        fill="none" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
    <svg width="50" height="50" viewBox="0 0 50 50" style={{ position: 'absolute', top: '70%', right: '20%', opacity: 0.5 }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#FF3E9D" strokeWidth={3} strokeDasharray="6 4" />
    </svg>
  </div>
);

/* Section badge pill */
export const SectionBadge: React.FC<{ label: string; bg?: string; color?: string }> = ({ label, bg = '#C8FF00', color = '#000' }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: bg, color,
    border: '2.5px solid #000', borderRadius: 999,
    padding: '5px 16px', fontSize: 11, fontWeight: 900,
    letterSpacing: '0.1em', marginBottom: 14,
    boxShadow: '3px 3px 0 #000',
    textTransform: 'uppercase',
  }}>
    ✦ {label}
  </div>
);

/* Neo-brutal card wrapper */
export const NeoCard: React.FC<{
  children: React.ReactNode;
  bg?: string;
  shadow?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ children, bg = '#fff', shadow = '5px 5px 0 #000', style, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: bg,
      border: '3px solid #000',
      borderRadius: 20,
      boxShadow: shadow,
      ...style,
      cursor: onClick ? 'pointer' : undefined,
    }}
  >
    {children}
  </div>
);
