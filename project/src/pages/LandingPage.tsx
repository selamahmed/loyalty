import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Shield, Sun, Moon } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   BRIX-STYLE SVG STICKERS — bold outlines, flat fills
═══════════════════════════════════════════════════════════════ */
const S = {
  Star5: ({ s = 56, f = '#FBBF24', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  ),
  Star4: ({ s = 48, f = '#FDE68A', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <path d="M24 3 L28 20 L45 24 L28 28 L24 45 L20 28 L3 24 L20 20 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  ),
  Heart: ({ s = 52, f = '#F472B6', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 52 52" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <path d="M26 45C26 45 5 32 5 17C5 10 11 4 19 6C22 7 26 12 26 12C26 12 30 7 33 6C41 4 47 10 47 17C47 32 26 45 26 45Z" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  ),
  Bolt: ({ s = 48, f = '#FCD34D', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <polygon points="28,2 15,26 24,26 19,46 36,22 27,22" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Diamond: ({ s = 50, f = '#A78BFA', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 50 50" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <polygon points="25,3 46,18 25,47 4,18" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  ),
  Burst: ({ s = 54, f = '#FDE68A', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 54 54" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <polygon points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19" fill={f} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  ),
  Flower: ({ s = 52, f = '#86EFAC', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 52 52" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <ellipse cx="26" cy="11" rx="7" ry="11" fill={f} stroke="#1e1b4b" strokeWidth="2.2" />
      <ellipse cx="26" cy="41" rx="7" ry="11" fill={f} stroke="#1e1b4b" strokeWidth="2.2" />
      <ellipse cx="11" cy="26" rx="11" ry="7" fill={f} stroke="#1e1b4b" strokeWidth="2.2" />
      <ellipse cx="41" cy="26" rx="11" ry="7" fill={f} stroke="#1e1b4b" strokeWidth="2.2" />
      <ellipse cx="15" cy="15" rx="7" ry="10" fill={f} stroke="#1e1b4b" strokeWidth="2.2" transform="rotate(45 15 15)" />
      <ellipse cx="37" cy="37" rx="7" ry="10" fill={f} stroke="#1e1b4b" strokeWidth="2.2" transform="rotate(45 37 37)" />
      <ellipse cx="37" cy="15" rx="7" ry="10" fill={f} stroke="#1e1b4b" strokeWidth="2.2" transform="rotate(-45 37 15)" />
      <ellipse cx="15" cy="37" rx="7" ry="10" fill={f} stroke="#1e1b4b" strokeWidth="2.2" transform="rotate(-45 15 37)" />
      <circle cx="26" cy="26" r="9" fill="#FBBF24" stroke="#1e1b4b" strokeWidth="2.5" />
    </svg>
  ),
  Crown: ({ s = 52, f = '#FCD34D', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 52 52" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <path d="M6 38 L10 18 L20 28 L26 10 L32 28 L42 18 L46 38 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" />
      <rect x="6" y="38" width="40" height="7" rx="3" fill={f} stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="26" cy="10" r="3.5" fill="#F472B6" stroke="#1e1b4b" strokeWidth="2" />
      <circle cx="10" cy="18" r="3" fill="#A78BFA" stroke="#1e1b4b" strokeWidth="2" />
      <circle cx="42" cy="18" r="3" fill="#86EFAC" stroke="#1e1b4b" strokeWidth="2" />
    </svg>
  ),
  Arrow: ({ s = 52, f = '#FCA5A5', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 52 52" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <path d="M8 26 Q20 10 38 26 Q20 42 8 26Z" fill={f} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 16 L44 26 L30 36" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Circle: ({ s = 44, f = '#6EE7B7', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 44 44" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <circle cx="22" cy="22" r="19" fill={f} stroke="#1e1b4b" strokeWidth="2.8" />
      <circle cx="22" cy="22" r="10" fill="none" stroke="#1e1b4b" strokeWidth="2.2" />
      <circle cx="22" cy="22" r="3" fill="#1e1b4b" />
    </svg>
  ),
  Smile: ({ s = 50, f = '#FDE68A', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 50 50" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <circle cx="25" cy="25" r="22" fill={f} stroke="#1e1b4b" strokeWidth="2.8" />
      <circle cx="17" cy="20" r="3" fill="#1e1b4b" />
      <circle cx="33" cy="20" r="3" fill="#1e1b4b" />
      <path d="M15 30 Q25 40 35 30" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  ),
  Peace: ({ s = 48, f = '#C4B5FD', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <circle cx="24" cy="24" r="20" fill={f} stroke="#1e1b4b" strokeWidth="2.8" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="24" y1="24" x2="7" y2="38" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="24" y1="24" x2="41" y2="38" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  ),
  Ribbon: ({ s = 54, f = '#F472B6', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 54 54" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <circle cx="27" cy="27" r="14" fill={f} stroke="#1e1b4b" strokeWidth="2.8" />
      <path d="M18 18 L4 8 L12 22 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M36 18 L50 8 L42 22 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M18 36 L4 46 L12 32 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M36 36 L50 46 L42 32 Z" fill={f} stroke="#1e1b4b" strokeWidth="2.2" strokeLinejoin="round" />
      <text x="27" y="32" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff">★</text>
    </svg>
  ),
  Clover: ({ s = 50, f = '#86EFAC', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 50 50" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <circle cx="25" cy="14" r="10" fill={f} stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="25" cy="36" r="10" fill={f} stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="14" cy="25" r="10" fill={f} stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="36" cy="25" r="10" fill={f} stroke="#1e1b4b" strokeWidth="2.5" />
      <rect x="23" y="36" width="4" height="10" rx="2" fill={f} stroke="#1e1b4b" strokeWidth="2" />
    </svg>
  ),
  Triangle: ({ s = 48, f = '#FCA5A5', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <polygon points="24,4 46,44 2,44" fill={f} stroke="#1e1b4b" strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  ),
  Pin: ({ s = 44, f = '#7B6EF6', r = 0 }) => (
    <svg width={s} height={s} viewBox="0 0 44 44" fill="none" style={{ transform: `rotate(${r}deg)`, display: 'block', flexShrink: 0 }}>
      <path d="M22 4 C30 4 38 11 38 20 C38 32 22 44 22 44 C22 44 6 32 6 20 C6 11 14 4 22 4Z" fill={f} stroke="#1e1b4b" strokeWidth="2.8" />
      <circle cx="22" cy="20" r="6" fill="white" stroke="#1e1b4b" strokeWidth="2.2" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   NEO-BRUTALISM CARD SHAPE DECORATIONS
═══════════════════════════════════════════════════════════════ */
const CardDeco = {
  CrossDots: ({ color = '#7B6EF6', opacity = 0.18 }) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity, pointerEvents: 'none' }}>
      {[8, 24, 40].map(x => [8, 24, 40].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={color} />
      )))}
    </svg>
  ),
  DiagStripes: ({ color = '#7B6EF6', opacity = 0.1 }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ position: 'absolute', bottom: 0, right: 0, opacity, pointerEvents: 'none' }}>
      {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(offset => (
        <line key={offset} x1={offset - 30} y1="0" x2={offset} y2="60" stroke={color} strokeWidth="5" />
      ))}
    </svg>
  ),
  PlusMark: ({ color = '#FBBF24', opacity = 0.25 }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ position: 'absolute', top: 12, right: 12, opacity, pointerEvents: 'none' }}>
      <rect x="11" y="2" width="6" height="24" rx="3" fill={color} />
      <rect x="2" y="11" width="24" height="6" rx="3" fill={color} />
    </svg>
  ),
  ZigZag: ({ color = '#F472B6', opacity = 0.2 }) => (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <polyline points="0,15 10,5 20,15 30,5 40,15 50,5 60,15" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  ),
  CornerBracket: ({ color = '#7B6EF6', opacity = 0.22 }) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <path d="M2 20 L2 2 L20 2" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  HalfCircle: ({ color = '#86EFAC', opacity = 0.2 }) => (
    <svg width="44" height="22" viewBox="0 0 44 22" fill="none" style={{ position: 'absolute', bottom: 0, right: 0, opacity, pointerEvents: 'none' }}>
      <path d="M0 22 A22 22 0 0 1 44 22 Z" fill={color} />
    </svg>
  ),
  TinyDiamond: ({ color = '#FCD34D', opacity = 0.28 }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <polygon points="10,1 19,10 10,19 1,10" fill={color} stroke={color} strokeWidth="1" />
    </svg>
  ),
  WaveLine: ({ color = '#A78BFA', opacity = 0.2 }) => (
    <svg width="64" height="18" viewBox="0 0 64 18" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <path d="M0 9 C8 0, 16 18, 24 9 C32 0, 40 18, 48 9 C56 0, 64 18, 72 9" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
  CircleDot: ({ color = '#F472B6', opacity = 0.2 }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ position: 'absolute', bottom: 8, right: 8, opacity, pointerEvents: 'none' }}>
      <circle cx="18" cy="18" r="15" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="18" cy="18" r="5" fill={color} />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   INFINITE TICKER STRIP
═══════════════════════════════════════════════════════════════ */
interface TickerItem { text: string; emoji: string; }

const TickerStrip: React.FC<{
  items: TickerItem[];
  direction: 'left' | 'right';
  bg: string;
  textColor: string;
  borderColor?: string;
  speed?: number;
}> = ({ items, direction, bg, textColor, borderColor = '#1e1b4b', speed = 30 }) => {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="overflow-hidden w-full"
      style={{ background: bg, borderTop: `2.5px solid ${borderColor}`, borderBottom: `2.5px solid ${borderColor}`, padding: '10px 0' }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `ticker${direction === 'left' ? 'Left' : 'Right'} ${speed}s linear infinite`,
          gap: 0,
        }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-5 whitespace-nowrap flex-shrink-0">
            <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
            <span className="font-black text-sm tracking-wide" style={{ color: textColor }}>{item.text}</span>
            <span style={{ color: textColor, opacity: 0.4, margin: '0 8px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FEATURES DATA
═══════════════════════════════════════════════════════════════ */
const features = [
  { emoji: '⚡', title: 'Anında Ödüller',         desc: 'Her etkileşimde anında puan kazan.',               color: '#7B6EF6', deco: 'CrossDots' },
  { emoji: '🎮', title: 'Eğlenceli Oyunlar',       desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',    color: '#22c55e', deco: 'DiagStripes' },
  { emoji: '🎁', title: 'Özel Ödüller',            desc: 'Puanlarını harika ödüllerle değiştir.',             color: '#f59e0b', deco: 'ZigZag' },
  { emoji: '🎯', title: 'Günlük Görevler',         desc: 'Günlük zorlukları tamamla, serini koru.',           color: '#ef4444', deco: 'WaveLine' },
  { emoji: '🏆', title: 'Liderlik Tabloları',      desc: 'Diğerleriyle yarış ve sıralamada yüksel.',          color: '#06b6d4', deco: 'HalfCircle' },
  { emoji: '💖', title: 'Sosyal Ödüller',          desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',         color: '#ec4899', deco: 'CircleDot' },
];

const tickerRow1: TickerItem[] = [
  { text: '50,000+ Aktif Kullanıcı',    emoji: '👥' },
  { text: 'Anında Puan Kazan',          emoji: '⚡' },
  { text: '2M+ Kazanılan Puan',         emoji: '✨' },
  { text: 'Ücretsiz Kayıt Ol',          emoji: '🎉' },
  { text: 'Günlük Görevler',            emoji: '🎯' },
  { text: '10,000+ Ödül Verildi',       emoji: '🏆' },
  { text: 'Eğlenceli Oyunlar',          emoji: '🎮' },
  { text: 'Özel İndirimler',            emoji: '🎁' },
];

const tickerRow2: TickerItem[] = [
  { text: 'PUAN KAZAN',    emoji: '⭐' },
  { text: 'ÖDÜL AL',       emoji: '🎁' },
  { text: 'OYUN OYNA',     emoji: '🕹️' },
  { text: 'LIDER OL',      emoji: '👑' },
  { text: 'PAYLAŞ',        emoji: '💜' },
  { text: 'KEŞFET',        emoji: '🔮' },
  { text: 'YÜKSEL',        emoji: '🚀' },
  { text: 'KAZAN',         emoji: '💰' },
];

const testimonials = [
  { name: 'Ayşe K.',   role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika bir uygulama!',       avatar: 'A', stars: 5 },
  { name: 'Mehmet T.', role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller ise gerçekten değerli. Tavsiye ederim.',       avatar: 'M', stars: 5 },
  { name: 'Zeynep A.', role: 'Premium Üye',          text: 'Arkadaşlarımla liderlik tablosunda yarışmak çok keyifli!',                             avatar: 'Z', stars: 5 },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(true);

  /* ── Theme tokens ── */
  const t = {
    pageBg:        isDark ? '#0d0b1f' : '#f5f3ff',
    cardBg:        isDark ? '#1a1733' : '#ffffff',
    cardBg2:       isDark ? '#120f28' : '#f5f3ff',
    navBg:         isDark ? 'rgba(13,11,31,0.92)' : 'rgba(245,243,255,0.88)',
    border:        isDark ? '#3d3870' : '#1e1b4b',
    shadow:        isDark ? '#000000' : '#1e1b4b',
    textPrimary:   isDark ? '#f0edff' : '#1e1b4b',
    textSecondary: isDark ? '#a09ac0' : '#6b7280',
    textMuted:     isDark ? '#6b5fa0' : '#9ca3af',
    pillBg:        isDark ? 'rgba(123,110,246,0.18)' : '#ede9fe',
    pillText:      '#9B8FF8',
    footerBg:      isDark ? '#0d0b1f' : '#ffffff',
    howBg:         isDark ? '#130f2a' : '#ffffff',
    decoOpacity:   isDark ? 0.15 : 0.18,
  };

  const cardStyle = (extra?: object) => ({
    background: t.cardBg,
    border: `2.5px solid ${t.border}`,
    boxShadow: `0px 5px 0px ${t.shadow}`,
    ...extra,
  });

  const cssVars = {
    '--l-border':   t.border,
    '--l-shadow':   t.shadow,
    '--l-card-bg':  t.cardBg,
    '--l-text':     t.textPrimary,
    '--l-tab-bg':   isDark ? '#1e1a3a' : '#e9e5ff',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: t.pageBg, color: t.textPrimary, transition: 'background 0.3s, color 0.3s', ...cssVars }}>

      {/* ── Ghost background text ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%) rotate(-8deg)',
          fontSize: 'clamp(100px, 18vw, 220px)', fontWeight: 900, color: '#7B6EF6',
          opacity: isDark ? 0.05 : 0.03,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.02em',
        }}>NEXREWARD</div>
        <div style={{
          position: 'absolute', top: '52%', left: '50%', transform: 'translateX(-50%) rotate(-8deg)',
          fontSize: 'clamp(80px, 14vw, 180px)', fontWeight: 900, color: '#7B6EF6',
          opacity: isDark ? 0.04 : 0.025,
          whiteSpace: 'nowrap', lineHeight: 1,
        }}>PUAN KAZAN</div>
        <div style={{
          position: 'absolute', top: '30%', left: '-20px', transform: 'rotate(-90deg)', transformOrigin: 'left center',
          fontSize: '13px', fontWeight: 900, color: '#7B6EF6', opacity: isDark ? 0.18 : 0.12,
          letterSpacing: '0.3em', whiteSpace: 'nowrap',
        }}>KAHVE ✦ ÇAY ✦ ALIŞVERIŞ ✦ PUAN ✦ ÖDÜL ✦ EĞLEN ✦ YÜKSEL ✦</div>
        <div style={{
          position: 'absolute', top: '30%', right: '-20px', transform: 'rotate(90deg)', transformOrigin: 'right center',
          fontSize: '13px', fontWeight: 900, color: '#7B6EF6', opacity: isDark ? 0.18 : 0.12,
          letterSpacing: '0.3em', whiteSpace: 'nowrap',
        }}>KEŞFET ✦ KAZAN ✦ PAYLAŞ ✦ YARIŞ ✦ LIDER ✦ BAŞAR ✦ NEXREWARD ✦</div>
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: t.navBg, borderBottom: `2.5px solid ${t.border}`, transition: 'background 0.3s, border-color 0.3s' }}>
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: `2.5px solid ${t.border}`, boxShadow: `0px 3px 0px ${t.shadow}` }}>
                N
              </div>
              <span className="font-black text-xl tracking-tight" style={{ color: t.textPrimary }}>NexReward</span>
            </div>
            <div className="hidden md:flex items-center gap-7 font-bold text-sm" style={{ color: t.textSecondary }}>
              <a href="#features"     className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how"          className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <a href="#testimonials" className="hover:text-[#7B6EF6] transition-colors">Yorumlar</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="lbtn-secondary-sm w-9 h-9 !p-0 justify-center"
                title={isDark ? 'Açık Mod' : 'Koyu Mod'}
              >
                {isDark
                  ? <Sun size={16} style={{ color: '#FBBF24' }} />
                  : <Moon size={16} style={{ color: '#7B6EF6' }} />}
              </button>
              <button onClick={() => navigate('/login')} className="lbtn-secondary-sm">
                Giriş Yap
              </button>
              <button onClick={() => navigate('/home')} className="lbtn-primary-sm">
                Panel <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 py-16 overflow-hidden">
          {/* Sticker cloud */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <div className="absolute top-8  left-4  sm:left-12" style={{ animation: 'fl1 7s ease-in-out infinite' }}><S.Star5 s={74} f="#FBBF24" r={15} /></div>
            <div className="absolute top-28 left-0  sm:left-4"  style={{ animation: 'fl2 9s ease-in-out infinite' }}><S.Bolt  s={52} f="#FCD34D" r={-10} /></div>
            <div className="absolute top-48 left-8  sm:left-16" style={{ animation: 'fl1 11s ease-in-out infinite' }}><S.Peace s={44} f="#C4B5FD" r={20} /></div>
            <div className="absolute top-6  right-4 sm:right-14" style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Heart  s={70} f="#F472B6" r={12} /></div>
            <div className="absolute top-28 right-0 sm:right-6"  style={{ animation: 'fl1 10s ease-in-out infinite' }}><S.Burst  s={52} f="#FDE68A" r={20} /></div>
            <div className="absolute top-52 right-6 sm:right-12" style={{ animation: 'fl2 12s ease-in-out infinite' }}><S.Flower s={48} f="#86EFAC" r={-8} /></div>
            <div className="absolute top-1/2 left-1 sm:left-6 -translate-y-1/2" style={{ animation: 'fl1 13s ease-in-out infinite' }}><S.Diamond  s={56} f="#A78BFA" r={-8} /></div>
            <div className="absolute top-[45%] left-10 sm:left-20"              style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Triangle s={38} f="#FCA5A5" r={10} /></div>
            <div className="absolute top-1/2 right-1 sm:right-6 -translate-y-1/2" style={{ animation: 'fl2 10s ease-in-out infinite' }}><S.Crown  s={58} f="#FCD34D" r={-5} /></div>
            <div className="absolute top-[42%] right-10 sm:right-20"             style={{ animation: 'fl1 9s ease-in-out infinite' }}><S.Smile  s={44} f="#FDE68A" r={8} /></div>
            <div className="absolute bottom-20 left-6 sm:left-16"  style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Clover  s={52} f="#86EFAC" r={15} /></div>
            <div className="absolute bottom-10 left-0 sm:left-8"   style={{ animation: 'fl1 11s ease-in-out infinite' }}><S.Arrow   s={46} f="#FCA5A5" r={-20} /></div>
            <div className="absolute bottom-18 right-6 sm:right-16" style={{ animation: 'fl1 7s ease-in-out infinite' }}><S.Bolt   s={58} f="#FCD34D" r={5} /></div>
            <div className="absolute bottom-10 right-0 sm:right-8"  style={{ animation: 'fl2 9s ease-in-out infinite' }}><S.Circle s={44} f="#6EE7B7" r={0} /></div>
            <div className="absolute top-1/3 left-1/3"  style={{ animation: 'fl1 14s ease-in-out infinite' }}><S.Star4 s={30} f="#FBBF24" r={25} /></div>
            <div className="absolute top-2/3 right-1/3" style={{ animation: 'fl2 12s ease-in-out infinite' }}><S.Pin    s={34} f="#7B6EF6" r={-10} /></div>
            <div className="absolute top-1/4 right-1/4" style={{ animation: 'fl1 10s ease-in-out infinite' }}><S.Ribbon s={38} f="#F472B6" r={15} /></div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm"
              style={{ background: t.cardBg, border: `2.5px solid ${t.border}`, boxShadow: `0px 4px 0px ${t.shadow}`, animation: 'heroIn 0.6s ease both', color: t.textPrimary }}>
              <Sparkles size={15} style={{ color: '#7B6EF6' }} />
              Türkiye'nin #1 Sadakat Platformu
              <S.Star5 s={20} f="#FBBF24" r={12} />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.02] tracking-tight"
              style={{ color: t.textPrimary, animation: 'heroIn 0.6s 0.08s ease both' }}>
              Alışveriş<br />
              Yaparken{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Puan Kazan</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium max-w-xl mx-auto" style={{ color: t.textSecondary, animation: 'heroIn 0.6s 0.16s ease both' }}>
              Binlerce mutlu kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2" style={{ animation: 'heroIn 0.6s 0.24s ease both' }}>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -right-5 pointer-events-none z-10"><S.Star5 s={32} f="#FBBF24" r={20} /></div>
                <button onClick={() => navigate('/home')} className="lbtn-primary relative">
                  Ücretsiz Başla <ArrowRight size={20} />
                </button>
              </div>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -left-5 pointer-events-none z-10"><S.Bolt s={28} f="#FCD34D" r={-15} /></div>
                <button onClick={() => navigate('/register')} className="lbtn-secondary relative">
                  Hemen Kayıt Ol
                </button>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: t.textMuted, animation: 'heroIn 0.6s 0.32s ease both' }}>
              <Shield size={13} style={{ color: '#7B6EF6' }} />
              Kredi kartı gerekmez &bull; Ücretsiz &bull; 2 dakikada kurulum
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-4" style={{ animation: 'heroIn 0.6s 0.4s ease both' }}>
              {[
                { value: '50B+',  label: 'Aktif Kullanıcı',  color: '#7B6EF6', sticker: <S.Star5 s={22} f="#FBBF24" r={15} /> },
                { value: '2M+',   label: 'Kazanılan Puan',   color: '#f59e0b', sticker: <S.Bolt  s={22} f="#FCD34D" r={-10} /> },
                { value: '10B+',  label: 'Verilen Ödül',     color: '#22c55e', sticker: <S.Heart s={20} f="#F472B6" r={10} /> },
              ].map((s, i) => (
                <div key={i} className="relative p-3 sm:p-5 rounded-2xl text-center overflow-hidden"
                  style={cardStyle()}>
                  <div className="absolute -top-3 -right-3">{s.sticker}</div>
                  <CardDeco.CrossDots color={s.color} opacity={t.decoOpacity} />
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: t.textMuted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TICKER STRIP 1 ══ */}
        <TickerStrip items={tickerRow1} direction="left"  bg="#7B6EF6" textColor="white" borderColor={t.border} speed={25} />
        {/* ══ TICKER STRIP 2 ══ */}
        <TickerStrip items={tickerRow2} direction="right" bg={isDark ? '#1a1733' : 'white'} textColor="#7B6EF6" borderColor={t.border} speed={18} />

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-14 relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 -ml-40 pointer-events-none"><S.Flower s={44} f="#86EFAC" r={-10} /></div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: t.pillBg, color: t.pillText, border: `2px solid ${t.border}` }}>
              ✦ ÖZELLİKLER
            </div>
            <h2 className="text-4xl sm:text-5xl font-black" style={{ color: t.textPrimary }}>
              Neden Bizi{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Seveceksiniz
              </span>
            </h2>
            <p className="mt-3 font-medium max-w-lg mx-auto" style={{ color: t.textMuted }}>
              Ödülleri maksimize etmek ve deneyiminizi geliştirmek için ihtiyacınız olan her şey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const DecoComponent = CardDeco[f.deco as keyof typeof CardDeco] as React.FC<{ color: string; opacity: number }>;
              return (
                <div key={i}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group relative p-6 rounded-2xl cursor-pointer overflow-hidden"
                  style={{
                    background: t.cardBg,
                    border: `2.5px solid ${t.border}`,
                    boxShadow: hoveredFeature === i ? `0px 8px 0px ${t.shadow}` : `0px 4px 0px ${t.shadow}`,
                    transform: hoveredFeature === i ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.15s ease',
                  }}>
                  {/* Neo-brutalism card decoration */}
                  <DecoComponent color={f.color} opacity={t.decoOpacity} />
                  <CardDeco.TinyDiamond color={f.color} opacity={isDark ? 0.35 : 0.28} />
                  <CardDeco.PlusMark color={f.color} opacity={isDark ? 0.22 : 0.18} />

                  <div className="absolute -top-5 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <S.Star5 s={30} f="#FBBF24" r={20} />
                  </div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${f.color}22`, border: `2px solid ${f.color}`, boxShadow: `0px 3px 0px ${f.color}60` }}>
                    {f.emoji}
                  </div>
                  <h3 className="font-black text-lg mb-2" style={{ color: t.textPrimary }}>{f.title}</h3>
                  <p className="text-sm font-medium" style={{ color: t.textMuted }}>{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 font-black text-sm" style={{ color: f.color }}>
                    Keşfet <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ TICKER STRIP 3 ══ */}
        <TickerStrip
          items={[
            { text: 'KAZAN', emoji: '💰' }, { text: 'ÖDÜL',      emoji: '🎁' },
            { text: 'EĞLEN', emoji: '🎮' }, { text: 'PAYLAŞ',    emoji: '💜' },
            { text: 'YÜKSEL',emoji: '🚀' }, { text: 'KEŞFET',    emoji: '🔮' },
            { text: 'BAŞAR', emoji: '🏆' }, { text: 'NEXREWARD', emoji: '⭐' },
          ]}
          direction="left" bg="#FBBF24" textColor="#1e1b4b" borderColor={t.border} speed={20}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" className="py-20 px-4 sm:px-6"
          style={{ background: t.howBg, borderTop: `2.5px solid ${t.border}`, borderBottom: `2.5px solid ${t.border}`, transition: 'background 0.3s' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 relative">
              <div className="absolute -top-6 right-1/3 pointer-events-none"><S.Crown s={40} f="#FCD34D" r={10} /></div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
                style={{ background: t.pillBg, color: t.pillText, border: `2px solid ${t.border}` }}>
                ✦ NASIL ÇALIŞIR
              </div>
              <h2 className="text-4xl sm:text-5xl font-black" style={{ color: t.textPrimary }}>4 Adımda Başla</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { step: 1, emoji: '📝', title: 'Kayıt Ol',          desc: 'Saniyeler içinde hesabını oluştur.',     sticker: <S.Burst s={34} f="#FDE68A" r={10} />,  deco: 'CornerBracket', decoColor: '#7B6EF6' },
                { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışverişte puan kazan.',             sticker: <S.Star5 s={34} f="#FBBF24" r={-8} />,  deco: 'ZigZag',        decoColor: '#f59e0b' },
                { step: 3, emoji: '🎮', title: 'Oyun Oyna',          desc: 'Eğlen ve bonus puan kazan.',             sticker: <S.Bolt  s={32} f="#FCD34D" r={12} />,  deco: 'WaveLine',      decoColor: '#22c55e' },
                { step: 4, emoji: '🎉', title: 'Ödülünü Al',         desc: 'Puanlarını ödüllerle değiştir.',         sticker: <S.Ribbon s={34} f="#F472B6" r={-10} />, deco: 'CircleDot',    decoColor: '#ec4899' },
              ].map((item, i) => {
                const DecoComp = CardDeco[item.deco as keyof typeof CardDeco] as React.FC<{ color: string; opacity: number }>;
                return (
                  <div key={i} className="relative p-6 rounded-2xl text-center transition-all hover:scale-105 overflow-hidden"
                    style={{ background: t.cardBg2, border: `2.5px solid ${t.border}`, boxShadow: `0px 5px 0px ${t.shadow}` }}>
                    {i < 3 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                        <ArrowRight size={18} style={{ color: '#7B6EF6' }} />
                      </div>
                    )}
                    <DecoComp color={item.decoColor} opacity={t.decoOpacity} />
                    <CardDeco.TinyDiamond color={item.decoColor} opacity={isDark ? 0.35 : 0.28} />
                    <div className="absolute -top-5 -right-3">{item.sticker}</div>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg mb-4 mx-auto"
                      style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: `2.5px solid ${t.border}`, boxShadow: `0px 3px 0px ${t.shadow}` }}>
                      {item.step}
                    </div>
                    <div className="text-4xl mb-3">{item.emoji}</div>
                    <h3 className="font-black text-lg mb-1" style={{ color: t.textPrimary }}>{item.title}</h3>
                    <p className="text-sm font-medium" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: t.pillBg, color: t.pillText, border: `2px solid ${t.border}` }}>
              ✦ KULLANICI YORUMLARI
            </div>
            <h2 className="text-4xl sm:text-5xl font-black" style={{ color: t.textPrimary }}>
              Kullanıcılarımız{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ne Diyor?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t2, i) => (
              <div key={i} className="relative p-6 rounded-2xl transition-all hover:scale-105 overflow-hidden"
                style={cardStyle()}>
                {/* Neo-brutalism deco per testimonial card */}
                {i === 0 && <CardDeco.DiagStripes color="#7B6EF6" opacity={isDark ? 0.07 : 0.06} />}
                {i === 1 && <CardDeco.HalfCircle color="#06b6d4" opacity={isDark ? 0.18 : 0.14} />}
                {i === 2 && <CardDeco.CrossDots color="#ec4899" opacity={t.decoOpacity} />}
                <CardDeco.CornerBracket color="#7B6EF6" opacity={isDark ? 0.2 : 0.16} />

                <div className="absolute -top-4 -right-3">
                  {i === 0 ? <S.Star5 s={28} f="#FBBF24" r={15} /> : i === 1 ? <S.Burst s={28} f="#FDE68A" r={-10} /> : <S.Heart s={26} f="#F472B6" r={8} />}
                </div>
                <div className="flex mb-3 gap-0.5">
                  {[...Array(t2.stars)].map((_, s) => <Star key={s} size={14} fill="#FBBF24" style={{ color: '#FBBF24' }} />)}
                </div>
                <p className="text-sm font-medium leading-relaxed mb-5" style={{ color: t.textSecondary }}>"{t2.text}"</p>
                <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: `2px dashed ${isDark ? '#3d3870' : '#c4b5fd'}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: `2.5px solid ${t.border}` }}>
                    {t2.avatar}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: t.textPrimary }}>{t2.name}</p>
                    <p className="text-xs font-medium" style={{ color: t.textMuted }}>{t2.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-20 px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto text-center px-8 sm:px-16 py-16 rounded-2xl overflow-visible"
            style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: `3px solid ${t.border}`, boxShadow: `0px 10px 0px ${t.shadow}` }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '-20px', fontSize: '160px', fontWeight: 900, color: 'white', opacity: 0.05, whiteSpace: 'nowrap', lineHeight: 1 }}>
                KAZAN
              </span>
              <CardDeco.DiagStripes color="white" opacity={0.06} />
            </div>
            <div className="absolute -top-7 -left-6  pointer-events-none"><S.Star5   s={56} f="#FBBF24" r={-15} /></div>
            <div className="absolute -top-6 -right-7 pointer-events-none"><S.Crown   s={54} f="#FCD34D" r={20}  /></div>
            <div className="absolute -bottom-6 -left-7  pointer-events-none"><S.Bolt s={50} f="#FDE68A" r={10}  /></div>
            <div className="absolute -bottom-7 -right-6 pointer-events-none"><S.Heart s={52} f="#F472B6" r={-20} /></div>
            <div className="absolute top-4 right-16 pointer-events-none"><S.Peace s={36} f="rgba(255,255,255,0.3)" r={5} /></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-6"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
                ✦ HEMEN BAŞLA
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Kazanmaya Hazır<br />mısınız?
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-8 font-medium max-w-lg mx-auto">
                Sadakat programımıza katılın ve bugün ödül toplamaya başlayın. Ücretsiz, hızlı ve eğlenceli!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="relative inline-flex">
                  <div className="absolute -top-5 -right-5 pointer-events-none"><S.Star5 s={28} f="#FBBF24" r={18} /></div>
                  <button onClick={() => navigate('/home')} className="lbtn-dark relative">
                    Panele Gir <ArrowRight size={20} />
                  </button>
                </div>
                <button onClick={() => navigate('/register')} className="lbtn-ghost">
                  Ücretsiz Kayıt Ol
                </button>
              </div>
              <p className="mt-6 text-white/50 text-xs font-medium">
                Kredi kartı gerekmez &bull; İstediğin zaman iptal et
              </p>
            </div>
          </div>
        </section>

        {/* ══ TICKER STRIP 4 ══ */}
        <TickerStrip
          items={[
            { text: 'NexReward ile Kazan', emoji: '💜' }, { text: 'Her Alışverişte Puan', emoji: '🛍️' },
            { text: 'Ücretsiz Üyelik',      emoji: '🎉' }, { text: 'Anında Ödül',          emoji: '⚡' },
            { text: 'Hemen Başla',          emoji: '🚀' }, { text: 'Türkiye\'nin #1',       emoji: '🏆' },
            { text: 'Güvenli & Hızlı',      emoji: '🔒' }, { text: '2 Dakikada Kurulum',   emoji: '⏱️' },
          ]}
          direction="right" bg="#F472B6" textColor="white" borderColor={t.border} speed={22}
        />

        {/* ══ FOOTER ══ */}
        <footer className="px-4 sm:px-8 py-10" style={{ borderTop: `2.5px solid ${t.border}`, background: t.footerBg, transition: 'background 0.3s' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: `2px solid ${t.border}`, boxShadow: `0px 2px 0px ${t.shadow}` }}>
                N
              </div>
              <span className="font-black text-lg" style={{ color: t.textPrimary }}>NexReward</span>
            </div>
            <div className="flex items-center gap-3">
              <S.Star5 s={18} f="#FBBF24" r={10} />
              <p className="text-sm font-medium" style={{ color: t.textMuted }}>© 2026 NexReward. Daha fazla kazan, daha iyi yaşa.</p>
              <S.Star5 s={18} f="#FBBF24" r={-10} />
            </div>
            <div className="flex items-center gap-4 font-bold text-sm" style={{ color: t.textMuted }}>
              <a href="#features" className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how" className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <button onClick={() => navigate('/login')} className="hover:text-[#7B6EF6] transition-colors">Giriş</button>
            </div>
          </div>
        </footer>

      </div>

      {/* ══ GLOBAL ANIMATIONS + BUTTON CLASSES ══ */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fl1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes fl2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-22px) rotate(-7deg); }
        }
        @keyframes tickerLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes tickerRight {
          from { transform: translateX(calc(-100% / 3)); }
          to   { transform: translateX(0); }
        }

        /* ── Landing primary button ── */
        .lbtn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%);
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border);
          border-radius: 16px;
          padding: 0.875rem 2.25rem;
          font-size: 1.125rem;
          box-shadow: 0px 5px 0px var(--l-shadow);
          cursor: pointer;
          transition: opacity 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-primary:hover  { opacity: 0.92; }
        .lbtn-primary:active { transform: translateY(3px); box-shadow: 0px 2px 0px var(--l-shadow); }

        /* ── Landing secondary button ── */
        .lbtn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--l-card-bg);
          color: var(--l-text); font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border);
          border-radius: 16px;
          padding: 0.875rem 2.25rem;
          font-size: 1.125rem;
          box-shadow: 0px 5px 0px var(--l-shadow);
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-secondary:hover  { background: var(--l-tab-bg); }
        .lbtn-secondary:active { transform: translateY(3px); box-shadow: 0px 2px 0px var(--l-shadow); }

        /* ── Nav-sized variants ── */
        .lbtn-primary-sm {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%);
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border);
          border-radius: 14px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          box-shadow: 0px 4px 0px var(--l-shadow);
          cursor: pointer;
          transition: opacity 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-primary-sm:hover  { opacity: 0.92; }
        .lbtn-primary-sm:active { transform: translateY(3px); box-shadow: 0px 1px 0px var(--l-shadow); }

        .lbtn-secondary-sm {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: var(--l-card-bg);
          color: var(--l-text); font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border);
          border-radius: 14px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          box-shadow: 0px 4px 0px var(--l-shadow);
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-secondary-sm:hover  { background: var(--l-tab-bg); }
        .lbtn-secondary-sm:active { transform: translateY(3px); box-shadow: 0px 1px 0px var(--l-shadow); }

        /* ── CTA ghost button (on gradient bg) ── */
        .lbtn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.18);
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid white;
          border-radius: 16px;
          padding: 0.875rem 2.25rem;
          font-size: 1.125rem;
          box-shadow: 0px 5px 0px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-ghost:hover  { background: rgba(255,255,255,0.28); }
        .lbtn-ghost:active { transform: translateY(3px); box-shadow: 0px 2px 0px rgba(0,0,0,0.25); }

        /* ── CTA dark button (on gradient bg) ── */
        .lbtn-dark {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #1e1b4b;
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid white;
          border-radius: 16px;
          padding: 0.875rem 2.25rem;
          font-size: 1.125rem;
          box-shadow: 0px 5px 0px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: opacity 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease;
        }
        .lbtn-dark:hover  { opacity: 0.88; }
        .lbtn-dark:active { transform: translateY(3px); box-shadow: 0px 2px 0px rgba(0,0,0,0.35); }
      `}</style>
    </div>
  );
};

export default LandingPage;
