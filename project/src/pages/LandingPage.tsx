import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Sparkles, Trophy, Star, Zap, Gift, Target, Heart, Gamepad2, Shield, QrCode } from 'lucide-react';

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
   FEATURES
═══════════════════════════════════════════════════════════════ */
const features = [
  { emoji: '⚡', title: 'Anında Ödüller',         desc: 'Her etkileşimde anında puan kazan.',               color: '#7B6EF6' },
  { emoji: '🎮', title: 'Eğlenceli Oyunlar',       desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',    color: '#22c55e' },
  { emoji: '🎁', title: 'Özel Ödüller',            desc: 'Puanlarını harika ödüllerle değiştir.',             color: '#f59e0b' },
  { emoji: '🎯', title: 'Günlük Görevler',         desc: 'Günlük zorlukları tamamla, serini koru.',           color: '#ef4444' },
  { emoji: '🏆', title: 'Liderlik Tabloları',      desc: 'Diğerleriyle yarış ve sıralamada yüksel.',          color: '#06b6d4' },
  { emoji: '💖', title: 'Sosyal Ödüller',          desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',         color: '#ec4899' },
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

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#f5f3ff', color: '#1e1b4b' }}>

      {/* ── Ghost background text (watermark layer) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
        {/* Large center text */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%) rotate(-8deg)',
          fontSize: 'clamp(100px, 18vw, 220px)', fontWeight: 900, color: '#7B6EF6', opacity: 0.03,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'inherit',
        }}>NEXREWARD</div>
        <div style={{
          position: 'absolute', top: '52%', left: '50%', transform: 'translateX(-50%) rotate(-8deg)',
          fontSize: 'clamp(80px, 14vw, 180px)', fontWeight: 900, color: '#7B6EF6', opacity: 0.025,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'inherit',
        }}>PUAN KAZAN</div>
        {/* Left side vertical */}
        <div style={{
          position: 'absolute', top: '30%', left: '-20px', transform: 'rotate(-90deg)', transformOrigin: 'left center',
          fontSize: '13px', fontWeight: 900, color: '#7B6EF6', opacity: 0.12, letterSpacing: '0.3em',
          whiteSpace: 'nowrap',
        }}>KAHVE ✦ ÇAY ✦ ALIŞVERIŞ ✦ PUAN ✦ ÖDÜL ✦ EĞLEN ✦ YÜKSEL ✦</div>
        {/* Right side vertical */}
        <div style={{
          position: 'absolute', top: '30%', right: '-20px', transform: 'rotate(90deg)', transformOrigin: 'right center',
          fontSize: '13px', fontWeight: 900, color: '#7B6EF6', opacity: 0.12, letterSpacing: '0.3em',
          whiteSpace: 'nowrap',
        }}>KEŞFET ✦ KAZAN ✦ PAYLAŞ ✦ YARIŞ ✦ LIDER ✦ BAŞAR ✦ NEXREWARD ✦</div>
      </div>

      {/* All real content above watermark */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(245,243,255,0.88)', borderBottom: '2.5px solid #1e1b4b' }}>
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b' }}>
                N
              </div>
              <span className="font-black text-xl tracking-tight" style={{ color: '#1e1b4b' }}>NexReward</span>
            </div>
            <div className="hidden md:flex items-center gap-7 font-bold text-sm" style={{ color: '#6b7280' }}>
              <a href="#features"      className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how"           className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <a href="#testimonials"  className="hover:text-[#7B6EF6] transition-colors">Yorumlar</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => navigate('/login')}
                className="px-4 sm:px-5 py-2 rounded-xl font-black text-sm transition-all active:translate-y-0.5 hover:scale-105"
                style={{ border: '2px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b', background: 'white', color: '#1e1b4b' }}>
                Giriş Yap
              </button>
              <button onClick={() => navigate('/home')}
                className="px-4 sm:px-5 py-2 rounded-xl font-black text-sm text-white transition-all active:translate-y-0.5 hover:scale-105 flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b' }}>
                Panel <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 py-16 overflow-hidden">
          {/* Sticker cloud — purely decorative */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Top-left cluster */}
            <div className="absolute top-8  left-4  sm:left-12" style={{ animation: 'fl1 7s ease-in-out infinite' }}><S.Star5 s={74} f="#FBBF24" r={15} /></div>
            <div className="absolute top-28 left-0  sm:left-4"  style={{ animation: 'fl2 9s ease-in-out infinite' }}><S.Bolt  s={52} f="#FCD34D" r={-10} /></div>
            <div className="absolute top-48 left-8  sm:left-16" style={{ animation: 'fl1 11s ease-in-out infinite' }}><S.Peace s={44} f="#C4B5FD" r={20} /></div>

            {/* Top-right cluster */}
            <div className="absolute top-6  right-4 sm:right-14" style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Heart  s={70} f="#F472B6" r={12} /></div>
            <div className="absolute top-28 right-0 sm:right-6"  style={{ animation: 'fl1 10s ease-in-out infinite' }}><S.Burst  s={52} f="#FDE68A" r={20} /></div>
            <div className="absolute top-52 right-6 sm:right-12" style={{ animation: 'fl2 12s ease-in-out infinite' }}><S.Flower s={48} f="#86EFAC" r={-8} /></div>

            {/* Mid-left */}
            <div className="absolute top-1/2 left-1 sm:left-6 -translate-y-1/2" style={{ animation: 'fl1 13s ease-in-out infinite' }}><S.Diamond  s={56} f="#A78BFA" r={-8} /></div>
            <div className="absolute top-[45%] left-10 sm:left-20"              style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Triangle s={38} f="#FCA5A5" r={10} /></div>

            {/* Mid-right */}
            <div className="absolute top-1/2 right-1 sm:right-6 -translate-y-1/2" style={{ animation: 'fl2 10s ease-in-out infinite' }}><S.Crown  s={58} f="#FCD34D" r={-5} /></div>
            <div className="absolute top-[42%] right-10 sm:right-20"             style={{ animation: 'fl1 9s ease-in-out infinite' }}><S.Smile  s={44} f="#FDE68A" r={8} /></div>

            {/* Bottom-left */}
            <div className="absolute bottom-20 left-6 sm:left-16"  style={{ animation: 'fl2 8s ease-in-out infinite' }}><S.Clover  s={52} f="#86EFAC" r={15} /></div>
            <div className="absolute bottom-10 left-0 sm:left-8"   style={{ animation: 'fl1 11s ease-in-out infinite' }}><S.Arrow   s={46} f="#FCA5A5" r={-20} /></div>

            {/* Bottom-right */}
            <div className="absolute bottom-18 right-6 sm:right-16" style={{ animation: 'fl1 7s ease-in-out infinite' }}><S.Bolt   s={58} f="#FCD34D" r={5} /></div>
            <div className="absolute bottom-10 right-0 sm:right-8"  style={{ animation: 'fl2 9s ease-in-out infinite' }}><S.Circle s={44} f="#6EE7B7" r={0} /></div>

            {/* Scatter extras */}
            <div className="absolute top-1/3 left-1/3"  style={{ animation: 'fl1 14s ease-in-out infinite' }}><S.Star4 s={30} f="#FBBF24" r={25} /></div>
            <div className="absolute top-2/3 right-1/3" style={{ animation: 'fl2 12s ease-in-out infinite' }}><S.Pin    s={34} f="#7B6EF6" r={-10} /></div>
            <div className="absolute top-1/4 right-1/4" style={{ animation: 'fl1 10s ease-in-out infinite' }}><S.Ribbon s={38} f="#F472B6" r={15} /></div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm"
              style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b', animation: 'heroIn 0.6s ease both' }}>
              <Sparkles size={15} style={{ color: '#7B6EF6' }} />
              Türkiye'nin #1 Sadakat Platformu
              <S.Star5 s={20} f="#FBBF24" r={12} />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.02] tracking-tight"
              style={{ color: '#1e1b4b', animation: 'heroIn 0.6s 0.08s ease both' }}>
              Alışveriş<br />
              Yaparken{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Puan Kazan</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium max-w-xl mx-auto" style={{ color: '#6b7280', animation: 'heroIn 0.6s 0.16s ease both' }}>
              Binlerce mutlu kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2" style={{ animation: 'heroIn 0.6s 0.24s ease both' }}>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -right-5 pointer-events-none z-10"><S.Star5 s={32} f="#FBBF24" r={20} /></div>
                <button onClick={() => navigate('/home')}
                  className="relative px-9 py-4 rounded-2xl font-black text-white text-lg transition-all active:translate-y-1 hover:scale-105 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid #1e1b4b', boxShadow: '0px 6px 0px #1e1b4b' }}>
                  Ücretsiz Başla <ArrowRight size={20} />
                </button>
              </div>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -left-5 pointer-events-none z-10"><S.Bolt s={28} f="#FCD34D" r={-15} /></div>
                <button onClick={() => navigate('/register')}
                  className="relative px-9 py-4 rounded-2xl font-black text-lg transition-all active:translate-y-1 hover:scale-105"
                  style={{ background: 'white', color: '#1e1b4b', border: '2.5px solid #1e1b4b', boxShadow: '0px 6px 0px #1e1b4b' }}>
                  Hemen Kayıt Ol
                </button>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: '#9ca3af', animation: 'heroIn 0.6s 0.32s ease both' }}>
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
                <div key={i} className="relative p-3 sm:p-5 rounded-2xl text-center"
                  style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
                  <div className="absolute -top-3 -right-3">{s.sticker}</div>
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: '#9ca3af' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TICKER STRIP 1 — moves left (violet on white) ══ */}
        <TickerStrip items={tickerRow1} direction="left"  bg="#7B6EF6" textColor="white" borderColor="#1e1b4b" speed={25} />

        {/* ══ TICKER STRIP 2 — moves right (white on violet) ══ */}
        <TickerStrip items={tickerRow2} direction="right" bg="white"   textColor="#7B6EF6" borderColor="#1e1b4b" speed={18} />

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-14 relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 -ml-40 pointer-events-none"><S.Flower s={44} f="#86EFAC" r={-10} /></div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: '#ede9fe', color: '#7B6EF6', border: '2px solid #1e1b4b' }}>
              ✦ ÖZELLİKLER
            </div>
            <h2 className="text-4xl sm:text-5xl font-black" style={{ color: '#1e1b4b' }}>
              Neden Bizi{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Seveceksiniz
              </span>
            </h2>
            <p className="mt-3 font-medium max-w-lg mx-auto" style={{ color: '#9ca3af' }}>
              Ödülleri maksimize etmek ve deneyiminizi geliştirmek için ihtiyacınız olan her şey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative p-6 rounded-2xl cursor-pointer overflow-visible"
                style={{
                  background: 'white',
                  border: '2.5px solid #1e1b4b',
                  boxShadow: hoveredFeature === i ? `0px 8px 0px #1e1b4b` : '0px 4px 0px #1e1b4b',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.15s ease',
                }}>
                <div className="absolute -top-5 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <S.Star5 s={30} f="#FBBF24" r={20} />
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}18`, border: `2px solid ${f.color}`, boxShadow: `0px 3px 0px ${f.color}60` }}>
                  {f.emoji}
                </div>
                <h3 className="font-black text-lg mb-2" style={{ color: '#1e1b4b' }}>{f.title}</h3>
                <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 font-black text-sm" style={{ color: f.color }}>
                  Keşfet <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TICKER STRIP 3 — moves left (yellow) ══ */}
        <TickerStrip
          items={[
            { text: 'KAZAN',       emoji: '💰' }, { text: 'ÖDÜL',       emoji: '🎁' },
            { text: 'EĞLEN',       emoji: '🎮' }, { text: 'PAYLAŞ',     emoji: '💜' },
            { text: 'YÜKSEL',      emoji: '🚀' }, { text: 'KEŞFET',     emoji: '🔮' },
            { text: 'BAŞAR',       emoji: '🏆' }, { text: 'NEXREWARD',  emoji: '⭐' },
          ]}
          direction="left" bg="#FBBF24" textColor="#1e1b4b" borderColor="#1e1b4b" speed={20}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" className="py-20 px-4 sm:px-6" style={{ background: 'white', borderTop: '2.5px solid #1e1b4b', borderBottom: '2.5px solid #1e1b4b' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 relative">
              <div className="absolute -top-6 right-1/3 pointer-events-none"><S.Crown s={40} f="#FCD34D" r={10} /></div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
                style={{ background: '#ede9fe', color: '#7B6EF6', border: '2px solid #1e1b4b' }}>
                ✦ NASIL ÇALIŞIR
              </div>
              <h2 className="text-4xl sm:text-5xl font-black" style={{ color: '#1e1b4b' }}>4 Adımda Başla</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { step: 1, emoji: '📝', title: 'Kayıt Ol',          desc: 'Saniyeler içinde hesabını oluştur.',      sticker: <S.Burst    s={34} f="#FDE68A" r={10} /> },
                { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışverişte puan kazan.',              sticker: <S.Star5    s={34} f="#FBBF24" r={-8} /> },
                { step: 3, emoji: '🎮', title: 'Oyun Oyna',          desc: 'Eğlen ve bonus puan kazan.',               sticker: <S.Bolt     s={32} f="#FCD34D" r={12} /> },
                { step: 4, emoji: '🎉', title: 'Ödülünü Al',         desc: 'Puanlarını ödüllerle değiştir.',           sticker: <S.Ribbon   s={34} f="#F472B6" r={-10} /> },
              ].map((item, i) => (
                <div key={i} className="relative p-6 rounded-2xl text-center transition-all hover:scale-105"
                  style={{ background: '#f5f3ff', border: '2.5px solid #1e1b4b', boxShadow: '0px 5px 0px #1e1b4b' }}>
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <ArrowRight size={18} style={{ color: '#7B6EF6' }} />
                    </div>
                  )}
                  <div className="absolute -top-5 -right-3">{item.sticker}</div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg mb-4 mx-auto"
                    style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b' }}>
                    {item.step}
                  </div>
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-black text-lg mb-1" style={{ color: '#1e1b4b' }}>{item.title}</h3>
                  <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: '#ede9fe', color: '#7B6EF6', border: '2px solid #1e1b4b' }}>
              ✦ KULLANICI YORUMLARI
            </div>
            <h2 className="text-4xl sm:text-5xl font-black" style={{ color: '#1e1b4b' }}>
              Kullanıcılarımız{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ne Diyor?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="relative p-6 rounded-2xl transition-all hover:scale-105"
                style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 5px 0px #1e1b4b' }}>
                <div className="absolute -top-4 -right-3">
                  {i === 0 ? <S.Star5 s={28} f="#FBBF24" r={15} /> : i === 1 ? <S.Burst s={28} f="#FDE68A" r={-10} /> : <S.Heart s={26} f="#F472B6" r={8} />}
                </div>
                <div className="flex mb-3 gap-0.5">
                  {[...Array(t.stars)].map((_, s) => <Star key={s} size={14} fill="#FBBF24" style={{ color: '#FBBF24' }} />)}
                </div>
                <p className="text-sm font-medium leading-relaxed mb-5" style={{ color: '#6b7280' }}>"{t.text}"</p>
                <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: '2px dashed #c4b5fd' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid #1e1b4b' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: '#1e1b4b' }}>{t.name}</p>
                    <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-20 px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto text-center px-8 sm:px-16 py-16 rounded-2xl overflow-visible"
            style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '3px solid #1e1b4b', boxShadow: '0px 10px 0px #1e1b4b' }}>
            {/* Ghost text inside CTA */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '-20px', fontSize: '160px', fontWeight: 900, color: 'white', opacity: 0.05, whiteSpace: 'nowrap', lineHeight: 1 }}>
                KAZAN
              </span>
            </div>
            {/* Corner stickers */}
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
                  <button onClick={() => navigate('/home')}
                    className="relative px-9 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 hover:scale-105 flex items-center gap-2"
                    style={{ background: '#1e1b4b', color: 'white', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.35)' }}>
                    Panele Gir <ArrowRight size={20} />
                  </button>
                </div>
                <button onClick={() => navigate('/register')}
                  className="px-9 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 hover:scale-105 text-white"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.25)' }}>
                  Ücretsiz Kayıt Ol
                </button>
              </div>
              <p className="mt-6 text-white/50 text-xs font-medium">
                Kredi kartı gerekmez &bull; İstediğin zaman iptal et
              </p>
            </div>
          </div>
        </section>

        {/* ══ TICKER STRIP 4 — moves right (pink) ══ */}
        <TickerStrip
          items={[
            { text: 'NexReward ile Kazan', emoji: '💜' }, { text: 'Her Alışverişte Puan', emoji: '🛍️' },
            { text: 'Ücretsiz Üyelik',      emoji: '🎉' }, { text: 'Anında Ödül',          emoji: '⚡' },
            { text: 'Hemen Başla',          emoji: '🚀' }, { text: 'Türkiye\'nin #1',       emoji: '🏆' },
            { text: 'Güvenli & Hızlı',      emoji: '🔒' }, { text: '2 Dakikada Kurulum',   emoji: '⏱️' },
          ]}
          direction="right" bg="#F472B6" textColor="white" borderColor="#1e1b4b" speed={22}
        />

        {/* ══ FOOTER ══ */}
        <footer className="px-4 sm:px-8 py-10" style={{ borderTop: '2.5px solid #1e1b4b', background: 'white' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid #1e1b4b', boxShadow: '0px 2px 0px #1e1b4b' }}>
                N
              </div>
              <span className="font-black text-lg" style={{ color: '#1e1b4b' }}>NexReward</span>
            </div>
            <div className="flex items-center gap-3">
              <S.Star5 s={18} f="#FBBF24" r={10} />
              <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>© 2026 NexReward. Daha fazla kazan, daha iyi yaşa.</p>
              <S.Star5 s={18} f="#FBBF24" r={-10} />
            </div>
            <div className="flex items-center gap-4 font-bold text-sm" style={{ color: '#9ca3af' }}>
              <a href="#features" className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how" className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <button onClick={() => navigate('/login')} className="hover:text-[#7B6EF6] transition-colors">Giriş</button>
            </div>
          </div>
        </footer>

      </div>{/* /z-1 content wrapper */}

      {/* ══ GLOBAL ANIMATIONS ══ */}
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
      `}</style>
    </div>
  );
};

export default LandingPage;
