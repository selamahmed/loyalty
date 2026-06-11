import React from 'react';

const STROKE = 3;

type IllusProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/* ── Hero: star mascot holding reward card (Teen Talk / Coffen vibe) ── */
export const HeroMascot: React.FC<IllusProps> = ({ size = 320, style }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 320 336" fill="none" style={style}>
    {/* squiggle bg */}
    <path d="M40 280 Q80 250 120 280 T200 275 T280 290" stroke="#FF3E9D" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M260 60 Q220 90 180 70 T100 80" stroke="#C8FF00" strokeWidth={4} fill="none" strokeLinecap="round" />
    {/* star body */}
    <polygon points="160,40 175,95 235,95 185,130 205,190 160,155 115,190 135,130 85,95 145,95"
      fill="#FFE500" stroke="#000" strokeWidth={STROKE} strokeLinejoin="round" />
    {/* face */}
    <circle cx="145" cy="118" r="8" fill="#000" />
    <circle cx="175" cy="118" r="8" fill="#000" />
    <path d="M148 138 Q160 152 172 138" stroke="#000" strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* arms */}
    <rect x="95" y="125" width="28" height="12" rx="6" fill="#FF6B35" stroke="#000" strokeWidth={2.5} transform="rotate(-25 109 131)" />
    <rect x="197" y="125" width="28" height="12" rx="6" fill="#FF6B35" stroke="#000" strokeWidth={2.5} transform="rotate(25 211 131)" />
    {/* reward card */}
    <rect x="108" y="195" width="104" height="72" rx="14" fill="#9122FF" stroke="#000" strokeWidth={STROKE} />
    <text x="160" y="228" textAnchor="middle" fill="#C8FF00" fontSize="22" fontWeight="900" fontFamily="system-ui">+500</text>
    <text x="160" y="252" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="system-ui">PUAN</text>
    {/* coin stack */}
    <ellipse cx="72" cy="248" rx="28" ry="10" fill="#FFD600" stroke="#000" strokeWidth={2.5} />
    <ellipse cx="72" cy="238" rx="28" ry="10" fill="#FFE500" stroke="#000" strokeWidth={2.5} />
    <ellipse cx="72" cy="228" rx="28" ry="10" fill="#FFD600" stroke="#000" strokeWidth={2.5} />
    <text x="72" y="233" textAnchor="middle" fill="#000" fontSize="14" fontWeight="900">★</text>
    {/* gift */}
    <rect x="228" y="210" width="52" height="44" rx="6" fill="#FF3E9D" stroke="#000" strokeWidth={STROKE} />
    <rect x="250" y="210" width="8" height="44" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <rect x="228" y="228" width="52" height="8" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    {/* sparkles */}
    <polygon points="50,80 54,92 66,92 56,100 60,112 50,104 40,112 44,100 34,92 46,92" fill="#56C8FF" stroke="#000" strokeWidth={2} />
    <polygon points="270,170 273,178 281,178 275,183 278,191 270,186 262,191 265,183 259,178 267,178" fill="#C8FF00" stroke="#000" strokeWidth={2} />
  </svg>
);

/* ── Points / lightning (Coffen energy) ── */
export const PointsBolt: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <circle cx="100" cy="100" r="88" fill="#9122FF" stroke="#000" strokeWidth={STROKE} />
    <polygon points="115,45 75,105 98,105 82,155 130,88 106,88"
      fill="#C8FF00" stroke="#000" strokeWidth={STROKE} strokeLinejoin="round" />
    <text x="100" y="178" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900" fontFamily="system-ui">ANINDA</text>
  </svg>
);

/* ── Games controller doodle ── */
export const GameDoodle: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <rect x="30" y="70" width="140" height="80" rx="28" fill="#FF3E9D" stroke="#000" strokeWidth={STROKE} />
    <circle cx="72" cy="110" r="18" fill="#9122FF" stroke="#000" strokeWidth={2.5} />
    <circle cx="72" cy="110" r="6" fill="#C8FF00" />
    <rect x="118" y="98" width="14" height="14" rx="3" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <rect x="136" y="98" width="14" height="14" rx="3" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <rect x="127" y="89" width="14" height="14" rx="3" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <rect x="127" y="107" width="14" height="14" rx="3" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <path d="M55 55 Q100 20 145 55" stroke="#FFE500" strokeWidth={4} fill="none" strokeLinecap="round" />
  </svg>
);

/* ── Gift reward box ── */
export const GiftDoodle: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <rect x="45" y="85" width="110" height="85" rx="8" fill="#FF6B35" stroke="#000" strokeWidth={STROKE} />
    <rect x="45" y="60" width="110" height="30" rx="6" fill="#FFE500" stroke="#000" strokeWidth={STROKE} />
    <rect x="95" y="60" width="10" height="110" fill="#9122FF" stroke="#000" strokeWidth={2} />
    <path d="M100 60 C80 30 55 35 55 55 C55 70 75 60 100 60 C125 60 145 70 145 55 C145 35 120 30 100 60Z"
      fill="#FF3E9D" stroke="#000" strokeWidth={2.5} />
    <polygon points="30,40 35,55 50,55 38,64 43,79 30,70 17,79 22,64 10,55 25,55" fill="#C8FF00" stroke="#000" strokeWidth={2} />
  </svg>
);

/* ── Trophy / leaderboard ── */
export const TrophyDoodle: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <path d="M65 55 H135 V95 C135 120 118 138 100 138 C82 138 65 120 65 95 Z"
      fill="#FFE500" stroke="#000" strokeWidth={STROKE} />
    <path d="M65 65 H45 C45 85 55 98 65 98" fill="none" stroke="#000" strokeWidth={STROKE} strokeLinecap="round" />
    <path d="M135 65 H155 C155 85 145 98 135 98" fill="none" stroke="#000" strokeWidth={STROKE} strokeLinecap="round" />
    <rect x="82" y="138" width="36" height="14" fill="#9122FF" stroke="#000" strokeWidth={2.5} />
    <rect x="70" y="152" width="60" height="16" rx="4" fill="#FF3E9D" stroke="#000" strokeWidth={STROKE} />
    <text x="100" y="92" textAnchor="middle" fill="#000" fontSize="28" fontWeight="900">1</text>
  </svg>
);

/* ── Mission target ── */
export const TargetDoodle: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <circle cx="100" cy="100" r="75" fill="#56C8FF" stroke="#000" strokeWidth={STROKE} />
    <circle cx="100" cy="100" r="52" fill="#fff" stroke="#000" strokeWidth={2.5} />
    <circle cx="100" cy="100" r="30" fill="#FF3E9D" stroke="#000" strokeWidth={2.5} />
    <circle cx="100" cy="100" r="10" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <line x1="100" y1="25" x2="100" y2="45" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    <line x1="100" y1="155" x2="100" y2="175" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    <line x1="25" y1="100" x2="45" y2="100" stroke="#000" strokeWidth={3} strokeLinecap="round" />
    <line x1="155" y1="100" x2="175" y2="100" stroke="#000" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/* ── Social / hearts ── */
export const SocialDoodle: React.FC<IllusProps> = ({ size = 200, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <path d="M100 155 C100 155 30 115 30 72 C30 48 50 32 72 38 C86 42 96 55 100 65 C104 55 114 42 128 38 C150 32 170 48 170 72 C170 115 100 155 100 155Z"
      fill="#FF3E9D" stroke="#000" strokeWidth={STROKE} strokeLinejoin="round" />
    <circle cx="65" cy="55" r="22" fill="#C8FF00" stroke="#000" strokeWidth={2.5} />
    <circle cx="135" cy="55" r="22" fill="#56C8FF" stroke="#000" strokeWidth={2.5} />
    <text x="65" y="62" textAnchor="middle" fontSize="18">😊</text>
    <text x="135" y="62" textAnchor="middle" fontSize="18">🎉</text>
  </svg>
);

/* ── Wordsy-style notepad for "how it works" ── */
export const NotepadDoodle: React.FC<IllusProps> = ({ size = 240, style }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 240 264" fill="none" style={style}>
    <rect x="50" y="30" width="150" height="200" rx="12" fill="#fff" stroke="#000" strokeWidth={STROKE} />
    {[55, 80, 105, 130, 155, 180].map(y => (
      <line key={y} x1="70" y1={y} x2="180" y2={y} stroke="#e0e0e0" strokeWidth={2} />
    ))}
    <rect x="38" y="20" width="18" height="220" rx="6" fill="#ddd" stroke="#000" strokeWidth={2.5} />
    {[40, 70, 100, 130, 160, 190].map(y => (
      <circle key={y} cx="47" cy={y} r="5" fill="#fff" stroke="#000" strokeWidth={1.5} />
    ))}
    <path d="M90 75 Q120 95 150 70" stroke="#9122FF" strokeWidth={4} fill="none" strokeLinecap="round" />
    <rect x="85" y="100" width="80" height="12" rx="4" fill="#C8FF00" stroke="#000" strokeWidth={2} />
    <rect x="85" y="125" width="60" height="12" rx="4" fill="#56C8FF" stroke="#000" strokeWidth={2} />
    {/* pen */}
    <rect x="175" y="55" width="14" height="90" rx="4" fill="#56C8FF" stroke="#000" strokeWidth={2.5} transform="rotate(15 182 100)" />
    <polygon points="188,148 195,165 181,158" fill="#FF3E9D" stroke="#000" strokeWidth={2} />
    <circle cx="200" cy="220" r="30" fill="#9122FF" stroke="#000" strokeWidth={STROKE} opacity="0.15" />
  </svg>
);

/* ── Phone mockup with illustrated UI inside ── */
export const PhoneMockup: React.FC<{
  variant: 'points' | 'shop' | 'leaderboard';
  label: string;
  accent: string;
  scale?: number;
  rotate?: number;
}> = ({ variant, label, accent, scale = 1, rotate = 0 }) => {
  const content = {
    points: (
      <>
        <rect x="20" y="50" width="150" height="80" rx="16" fill="#9122FF" stroke="#000" strokeWidth={2.5} />
        <text x="95" y="88" textAnchor="middle" fill="#C8FF00" fontSize="28" fontWeight="900" fontFamily="system-ui">2,450</text>
        <text x="95" y="110" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui">PUAN</text>
        <rect x="20" y="145" width="70" height="55" rx="12" fill="#C8FF00" stroke="#000" strokeWidth={2} />
        <rect x="100" y="145" width="70" height="55" rx="12" fill="#FF3E9D" stroke="#000" strokeWidth={2} />
        <text x="55" y="178" textAnchor="middle" fontSize="22">🎮</text>
        <text x="135" y="178" textAnchor="middle" fontSize="22">🎁</text>
      </>
    ),
    shop: (
      <>
        <rect x="20" y="50" width="65" height="65" rx="10" fill="#FF6B35" stroke="#000" strokeWidth={2} />
        <rect x="95" y="50" width="75" height="65" rx="10" fill="#FFE500" stroke="#000" strokeWidth={2} />
        <rect x="20" y="125" width="150" height="75" rx="12" fill="#56C8FF" stroke="#000" strokeWidth={2.5} />
        <text x="52" y="92" textAnchor="middle" fontSize="24">☕</text>
        <text x="132" y="92" textAnchor="middle" fontSize="24">👕</text>
        <text x="95" y="170" textAnchor="middle" fill="#000" fontSize="12" fontWeight="900" fontFamily="system-ui">ÖDÜL MAĞAZASI</text>
      </>
    ),
    leaderboard: (
      <>
        <rect x="55" y="45" width="80" height="50" rx="10" fill="#FFE500" stroke="#000" strokeWidth={2.5} />
        <text x="95" y="78" textAnchor="middle" fontSize="22" fontWeight="900">👑</text>
        <rect x="20" y="105" width="150" height="28" rx="8" fill="#C8FF00" stroke="#000" strokeWidth={2} />
        <rect x="20" y="140" width="150" height="28" rx="8" fill="#fff" stroke="#000" strokeWidth={2} />
        <rect x="20" y="175" width="150" height="28" rx="8" fill="#fff" stroke="#000" strokeWidth={2} />
        <text x="35" y="124" fontSize="11" fontWeight="800" fontFamily="system-ui">1. Ayşe</text>
        <text x="35" y="159" fontSize="11" fontWeight="700" fontFamily="system-ui">2. Sen</text>
        <text x="35" y="194" fontSize="11" fontWeight="700" fontFamily="system-ui">3. Mehmet</text>
      </>
    ),
  };

  return (
    <div style={{ transform: `rotate(${rotate}deg) scale(${scale})`, transformOrigin: 'bottom center', textAlign: 'center' }}>
      <div style={{
        width: 'clamp(140px, 20vw, 210px)',
        borderRadius: 28,
        border: '3px solid #000',
        boxShadow: '6px 6px 0 #000',
        overflow: 'hidden',
        background: '#fafafa',
      }}>
        <div style={{ height: 26, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 10, background: '#333', borderRadius: 99 }} />
        </div>
        <svg viewBox="0 0 190 240" width="100%" style={{ display: 'block', background: '#f5f0ff' }}>
          {content[variant]}
        </svg>
        <div style={{ height: 18, background: '#000' }} />
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
        background: '#fff', border: '2.5px solid #000', borderRadius: 999,
        padding: '4px 14px', fontSize: 11, fontWeight: 900,
        boxShadow: '3px 3px 0 #000',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
        {label}
      </div>
    </div>
  );
};

/* ── Speech bubble (Teen Talk style) ── */
export const SpeechBubble: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  tail?: 'left' | 'right';
  style?: React.CSSProperties;
}> = ({ children, bg = '#fff', color = '#000', tail = 'left', style }) => (
  <div style={{
    position: 'relative',
    background: bg,
    color,
    border: '3px solid #000',
    borderRadius: 20,
    padding: '12px 18px',
    fontWeight: 900,
    fontSize: 'clamp(13px, 2vw, 16px)',
    boxShadow: '4px 4px 0 #000',
    ...style,
  }}>
    {children}
    <div style={{
      position: 'absolute',
      bottom: -14,
      [tail === 'left' ? 'left' : 'right']: 24,
      width: 0, height: 0,
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderTop: `14px solid ${bg}`,
      filter: 'drop-shadow(0 3px 0 #000)',
    }} />
  </div>
);

/* ── Floating doodle squiggle ── */
export const Squiggle: React.FC<{ color?: string; style?: React.CSSProperties }> = ({ color = '#FF3E9D', style }) => (
  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={style}>
    <path d="M5 25 Q20 5 35 25 T65 20 T75 28" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
  </svg>
);

/* ── Decorative star burst ── */
export const StarBurst: React.FC<{ color?: string; size?: number; style?: React.CSSProperties }> = ({
  color = '#C8FF00', size = 48, style,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <polygon points="24,2 28,18 44,18 31,28 36,44 24,34 12,44 17,28 4,18 20,18"
      fill={color} stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);

export const featureIllustrations = {
  bolt: PointsBolt,
  game: GameDoodle,
  gift: GiftDoodle,
  target: TargetDoodle,
  trophy: TrophyDoodle,
  social: SocialDoodle,
} as const;
