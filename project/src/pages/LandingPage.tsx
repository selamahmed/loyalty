import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sun, Moon, ChevronDown } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   INLINE CIRCULAR STICKER — sits inside headline text
═══════════════════════════════════════════════════════════════ */
const Sticker: React.FC<{ emoji: string; bg: string; size?: number; rotate?: number }> = ({
  emoji, bg, size = 80, rotate = 0,
}) => (
  <span
    className="inline-flex items-center justify-center flex-shrink-0 align-middle"
    style={{
      width: size, height: size,
      background: bg,
      border: '3px solid #fff',
      borderRadius: '50%',
      margin: '0 6px',
      transform: `rotate(${rotate}deg)`,
      fontSize: size * 0.44,
      verticalAlign: 'middle',
      display: 'inline-flex',
      boxShadow: '0 4px 0 rgba(0,0,0,0.4)',
    }}
  >
    {emoji}
  </span>
);

/* Inline pill badge — like "CAT WORLD →" in the reference */
const InlinePill: React.FC<{ label: string; bg?: string; color?: string; onClick?: () => void }> = ({
  label, bg = '#22c55e', color = '#000', onClick,
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 align-middle flex-shrink-0"
    style={{
      background: bg,
      color,
      fontWeight: 800,
      borderRadius: 999,
      padding: '10px 24px',
      fontSize: '0.55em',
      letterSpacing: '0.04em',
      border: '2.5px solid rgba(255,255,255,0.6)',
      margin: '0 10px',
      verticalAlign: 'middle',
      display: 'inline-flex',
      boxShadow: '0 4px 0 rgba(0,0,0,0.35)',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'transform 0.1s, box-shadow 0.1s',
    }}
    onMouseDown={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(0,0,0,0.35)';
    }}
    onMouseUp={e => {
      (e.currentTarget as HTMLElement).style.transform = '';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 rgba(0,0,0,0.35)';
    }}
  >
    {label} <ArrowRight size={14} />
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   INFINITE TICKER
═══════════════════════════════════════════════════════════════ */
interface TickerItem { text: string; emoji?: string }
const TickerStrip: React.FC<{
  items: TickerItem[]; direction?: 'left' | 'right';
  bg: string; textColor: string; borderTop?: string; borderBottom?: string; speed?: number;
}> = ({ items, direction = 'left', bg, textColor, borderTop, borderBottom, speed = 28 }) => {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ background: bg, borderTop, borderBottom, padding: '11px 0' }}>
      <div style={{
        display: 'flex', width: 'max-content',
        animation: `ticker${direction === 'left' ? 'Left' : 'Right'} ${speed}s linear infinite`,
      }}>
        {tripled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-5 whitespace-nowrap flex-shrink-0">
            {item.emoji && <span style={{ fontSize: '1rem' }}>{item.emoji}</span>}
            <span className="font-black text-sm tracking-widest uppercase" style={{ color: textColor }}>{item.text}</span>
            <span style={{ color: textColor, opacity: 0.35, margin: '0 6px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CARD DECO SHAPES
═══════════════════════════════════════════════════════════════ */
const Deco = {
  CrossDots: ({ color = '#7B6EF6', opacity = 0.15 }) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ position: 'absolute', bottom: 10, right: 10, opacity, pointerEvents: 'none' }}>
      {[8, 24, 40].flatMap(x => [8, 24, 40].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={color} />))}
    </svg>
  ),
  DiagLines: ({ color = '#7B6EF6', opacity = 0.07 }) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ position: 'absolute', bottom: 0, right: 0, opacity, pointerEvents: 'none', borderRadius: '0 0 18px 0' }}>
      {[0, 12, 24, 36, 48, 60, 72, 84].map(o => <line key={o} x1={o - 32} y1="0" x2={o} y2="64" stroke={color} strokeWidth="6" />)}
    </svg>
  ),
  ZigZag: ({ color = '#F472B6', opacity = 0.2 }) => (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <polyline points="0,15 10,5 20,15 30,5 40,15 50,5 60,15" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  ),
  HalfCircle: ({ color = '#86EFAC', opacity = 0.2 }) => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none" style={{ position: 'absolute', bottom: 0, right: 0, opacity, pointerEvents: 'none' }}>
      <path d="M0 24 A24 24 0 0 1 48 24 Z" fill={color} />
    </svg>
  ),
  Plus: ({ color = '#FBBF24', opacity = 0.22 }) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ position: 'absolute', top: 10, right: 10, opacity, pointerEvents: 'none' }}>
      <rect x="10" y="2" width="6" height="22" rx="3" fill={color} />
      <rect x="2" y="10" width="22" height="6" rx="3" fill={color} />
    </svg>
  ),
  Corner: ({ color = '#7B6EF6', opacity = 0.2 }) => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <path d="M2 20 L2 2 L20 2" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  Wave: ({ color = '#A78BFA', opacity = 0.2 }) => (
    <svg width="64" height="18" viewBox="0 0 64 18" fill="none" style={{ position: 'absolute', bottom: 8, left: 8, opacity, pointerEvents: 'none' }}>
      <path d="M0 9 C8 0,16 18,24 9 C32 0,40 18,48 9 C56 0,64 18,72 9" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
  BullsEye: ({ color = '#F472B6', opacity = 0.2 }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ position: 'absolute', bottom: 8, right: 8, opacity, pointerEvents: 'none' }}>
      <circle cx="18" cy="18" r="15" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="18" cy="18" r="5" fill={color} />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const features = [
  { emoji: '⚡', title: 'Anında Ödüller',       desc: 'Her etkileşimde anında puan kazan.',             color: '#7B6EF6', Deco1: Deco.CrossDots, Deco2: Deco.Plus },
  { emoji: '🎮', title: 'Eğlenceli Oyunlar',     desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',  color: '#22c55e', Deco1: Deco.DiagLines, Deco2: Deco.Corner },
  { emoji: '🎁', title: 'Özel Ödüller',          desc: 'Puanlarını harika ödüllerle değiştir.',           color: '#f59e0b', Deco1: Deco.ZigZag,    Deco2: Deco.Plus },
  { emoji: '🎯', title: 'Günlük Görevler',       desc: 'Günlük zorlukları tamamla, serini koru.',         color: '#ef4444', Deco1: Deco.Wave,      Deco2: Deco.Corner },
  { emoji: '🏆', title: 'Liderlik Tabloları',    desc: 'Diğerleriyle yarış ve sıralamada yüksel.',        color: '#06b6d4', Deco1: Deco.HalfCircle,Deco2: Deco.Plus },
  { emoji: '💖', title: 'Sosyal Ödüller',        desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',       color: '#ec4899', Deco1: Deco.BullsEye,  Deco2: Deco.Corner },
];

const tickerHero: TickerItem[] = [
  { text: '50,000+ Aktif Kullanıcı', emoji: '👥' },
  { text: '4 Mini Oyun',             emoji: '🎮' },
  { text: '2M+ Kazanılan Puan',      emoji: '✨' },
  { text: '8 Ödül Kategorisi',       emoji: '🎁' },
  { text: '10,000+ Ödül Verildi',    emoji: '🏆' },
  { text: 'Günlük Görevler',         emoji: '🎯' },
  { text: 'Ücretsiz Kayıt',          emoji: '🎉' },
  { text: 'Liderlik Tablosu',        emoji: '👑' },
];

const testimonials = [
  { name: 'Ayşe K.',   role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika!', avatar: 'A', stars: 5 },
  { name: 'Mehmet T.', role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller gerçekten değerli.',        avatar: 'M', stars: 5 },
  { name: 'Zeynep A.', role: 'Premium Üye',          text: 'Arkadaşlarımla liderlik tablosunda yarışmak çok keyifli!',          avatar: 'Z', stars: 5 },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  const t = {
    pageBg:        isDark ? '#0c0e1e' : '#f0eeff',
    heroText:      isDark ? '#ffffff' : '#0c0e1e',
    sideText:      isDark ? 'rgba(255,255,255,0.28)' : 'rgba(12,14,30,0.35)',
    navBg:         isDark ? 'rgba(12,14,30,0.85)' : 'rgba(240,238,255,0.85)',
    navBorder:     isDark ? 'rgba(255,255,255,0.1)' : 'rgba(12,14,30,0.12)',
    cardBg:        isDark ? '#131629' : '#ffffff',
    cardBg2:       isDark ? '#0f1124' : '#f0eeff',
    border:        isDark ? '#2a2d50' : '#1e1b4b',
    shadow:        isDark ? '#000000' : '#1e1b4b',
    textPrimary:   isDark ? '#f0edff' : '#1e1b4b',
    textSecondary: isDark ? '#8b87b8' : '#6b7280',
    textMuted:     isDark ? '#5a5680' : '#9ca3af',
    pillBg:        isDark ? 'rgba(123,110,246,0.15)' : '#ede9fe',
    ghostColor:    isDark ? 'rgba(123,110,246,0.06)' : 'rgba(123,110,246,0.04)',
    footerBg:      isDark ? '#0a0c1a' : '#f0eeff',
    howBg:         isDark ? '#0f1124' : '#ffffff',
    tickerBg2:     isDark ? '#131629' : '#ffffff',
    decoOp:        isDark ? 0.14 : 0.18,
    cssVars: {
      '--l-border':  isDark ? '#2a2d50' : '#1e1b4b',
      '--l-shadow':  isDark ? '#000000' : '#1e1b4b',
      '--l-card-bg': isDark ? '#131629' : '#ffffff',
      '--l-text':    isDark ? '#f0edff' : '#1e1b4b',
      '--l-tab-bg':  isDark ? '#1e1a3a' : '#e9e5ff',
    } as React.CSSProperties,
  };

  return (
    <div style={{ background: t.pageBg, color: t.textPrimary, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.3s', ...t.cssVars }}>

      {/* ── Ghost watermark ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%) rotate(-6deg)',
          fontSize: 'clamp(120px, 22vw, 280px)', fontWeight: 900, color: t.ghostColor,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>NEXREWARD</div>
        <div style={{
          position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%) rotate(-6deg)',
          fontSize: 'clamp(80px, 14vw, 200px)', fontWeight: 900, color: t.ghostColor,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>PUAN KAZAN</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: t.navBg, backdropFilter: 'blur(16px)',
          borderBottom: `1.5px solid ${t.navBorder}`,
          transition: 'background 0.3s',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            {/* Pill logo */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,14,30,0.07)',
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(12,14,30,0.2)'}`,
              borderRadius: 999, padding: '6px 16px 6px 8px',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%)',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: 'white', fontSize: 14,
              }}>N</div>
              <span style={{ fontWeight: 900, fontSize: 15, color: t.textPrimary, letterSpacing: '-0.01em' }}>NexReward</span>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
              {[['#features', 'Özellikler'], ['#how', 'Nasıl Çalışır'], ['#testimonials', 'Yorumlar']].map(([href, label]) => (
                <a key={href} href={href} style={{ color: t.textSecondary, fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>
                  {label.toUpperCase()}
                </a>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setIsDark(!isDark)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: `2px solid ${t.border}`,
                  background: t.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 0 ${t.shadow}`, transition: 'transform 0.1s',
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                {isDark ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#7B6EF6" />}
              </button>
              <button onClick={() => navigate('/login')} className="lbtn-secondary-sm">Giriş Yap</button>
              <button onClick={() => navigate('/home')} className="lbtn-primary-sm">
                Panele Gir <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', padding: '40px 0 0' }}>

          {/* Side text — left */}
          <div className="hidden lg:block" style={{
            position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)',
            color: t.sideText, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
            lineHeight: 2.2, textTransform: 'uppercase',
          }}>
            <div>PUAN KAZAN</div>
            <div>ÖDÜL AL</div>
            <div>SIK OYNA</div>
            <div>TEKRARLA</div>
          </div>

          {/* Side text — right */}
          <div className="hidden lg:block" style={{
            position: 'absolute', right: 28, top: '42%', transform: 'translateY(-50%)',
            color: t.sideText, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
            lineHeight: 2.2, textTransform: 'uppercase', textAlign: 'right',
          }}>
            <div>OYUN, GÖREV</div>
            <div>PUAN, ÖDÜL</div>
            <div>LİDERLİK</div>
          </div>

          {/* Massive headline */}
          <div style={{ padding: '0 clamp(16px, 5vw, 80px)', textAlign: 'center' }}>
            <div style={{
              fontWeight: 900,
              fontSize: 'clamp(44px, 9.2vw, 128px)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              color: t.heroText,
              textTransform: 'uppercase',
            }}>
              {/* Line 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 4px', marginBottom: '0.04em' }}>
                <span>ALIŞVERİŞ</span>
                <Sticker emoji="⭐" bg="#f59e0b" size={Math.min(96, window.innerWidth * 0.08)} rotate={-8} />
                <span>YAPARKEN</span>
              </div>

              {/* Line 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 4px', marginBottom: '0.04em' }}>
                <span>PUAN</span>
                <InlinePill label="HEMEN BAŞLA" bg="#22c55e" color="#000" onClick={() => navigate('/home')} />
                <span>KAZAN</span>
              </div>

              {/* Line 3 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 4px', marginBottom: '0.04em' }}>
                <Sticker emoji="🏆" bg="#7B6EF6" size={Math.min(96, window.innerWidth * 0.08)} rotate={6} />
                <span>VE ÖDÜL</span>
                <Sticker emoji="🎮" bg="#ec4899" size={Math.min(88, window.innerWidth * 0.075)} rotate={-4} />
                <span>AL</span>
              </div>

              {/* Line 4 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 4px' }}>
                <span>HER</span>
                <Sticker emoji="💎" bg="#06b6d4" size={Math.min(80, window.innerWidth * 0.07)} rotate={10} />
                <span>GÜN EĞLEN</span>
              </div>
            </div>

            {/* Sub text */}
            <p style={{
              marginTop: 28, color: t.textSecondary, fontWeight: 600,
              fontSize: 'clamp(13px, 1.6vw, 18px)', maxWidth: 480, marginInline: 'auto',
            }}>
              Binlerce kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen.
            </p>
          </div>

          {/* Scroll cue */}
          <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 8 }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: t.sideText }}>
              <span style={{ fontSize: 28 }}>🐾</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kaydır ve keşfet</span>
              <ChevronDown size={16} style={{ opacity: 0.5, animation: 'bounce 1.8s ease-in-out infinite' }} />
            </div>
          </div>
        </section>

        {/* ══ HERO TICKER ══ */}
        <TickerStrip
          items={tickerHero} direction="left"
          bg={isDark ? '#7B6EF6' : '#7B6EF6'} textColor="white"
          borderTop={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          borderBottom={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          speed={28}
        />
        <TickerStrip
          items={[
            { text: 'PUAN KAZAN', emoji: '⭐' }, { text: 'ÖDÜL AL',    emoji: '🎁' },
            { text: 'OYUN OYNA', emoji: '🕹️' },  { text: 'LIDER OL',  emoji: '👑' },
            { text: 'PAYLAŞ',    emoji: '💜' },   { text: 'KEŞFET',    emoji: '🔮' },
            { text: 'YÜKSEL',    emoji: '🚀' },   { text: 'KAZAN',     emoji: '💰' },
          ]}
          direction="right"
          bg={t.tickerBg2} textColor={isDark ? '#a78bfa' : '#7B6EF6'}
          borderBottom={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          speed={20}
        />

        {/* ══ FEATURES ══ */}
        <section id="features" style={{ padding: '80px clamp(16px, 5vw, 80px)', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em',
              marginBottom: 16,
            }}>✦ ÖZELLİKLER</div>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900,
              letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, lineHeight: 1.1,
              textTransform: 'uppercase',
            }}>
              NEDEN BİZİ{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                SEVECEKSİNİZ
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', padding: '28px 24px', borderRadius: 20, overflow: 'hidden',
                  background: t.cardBg,
                  border: `2.5px solid ${t.border}`,
                  boxShadow: hovered === i ? `0 8px 0 ${t.shadow}` : `0 4px 0 ${t.shadow}`,
                  transform: hovered === i ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.15s ease', cursor: 'pointer',
                }}>
                <f.Deco1 color={f.color} opacity={t.decoOp} />
                <f.Deco2 color={f.color} opacity={isDark ? 0.3 : 0.22} />
                <div style={{
                  width: 56, height: 56, borderRadius: 16, fontSize: 26,
                  background: `${f.color}20`, border: `2px solid ${f.color}`,
                  boxShadow: `0 3px 0 ${f.color}60`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, transition: 'transform 0.15s',
                  transform: hovered === i ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontWeight: 900, fontSize: 17, color: t.textPrimary, margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: '0 0 14px', lineHeight: 1.5 }}>{f.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 900, fontSize: 13, color: f.color }}>
                  Keşfet <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TICKER 3 — yellow ══ */}
        <TickerStrip
          items={[
            { text: 'KAZAN', emoji: '💰' }, { text: 'ÖDÜL',      emoji: '🎁' },
            { text: 'EĞLEN', emoji: '🎮' }, { text: 'PAYLAŞ',    emoji: '💜' },
            { text: 'YÜKSEL',emoji: '🚀' }, { text: 'KEŞFET',    emoji: '🔮' },
            { text: 'BAŞAR', emoji: '🏆' }, { text: 'NEXREWARD', emoji: '⭐' },
          ]}
          direction="left" bg="#FBBF24" textColor="#0c0e1e"
          borderTop={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          borderBottom={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          speed={22}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" style={{ padding: '80px clamp(16px, 5vw, 80px)', background: t.howBg, borderTop: `2px solid ${t.border}`, borderBottom: `2px solid ${t.border}`, transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: t.pillBg, color: '#a78bfa',
                border: `2px solid ${t.border}`,
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 16,
              }}>✦ NASIL ÇALIŞIR</div>
              <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase' }}>4 ADIMDA BAŞLA</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {[
                { step: 1, emoji: '📝', title: 'Kayıt Ol',          desc: 'Saniyeler içinde hesabını oluştur.',    color: '#7B6EF6', D: Deco.Corner },
                { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışverişte puan kazan.',            color: '#f59e0b', D: Deco.ZigZag },
                { step: 3, emoji: '🎮', title: 'Oyun Oyna',          desc: 'Eğlen ve bonus puan kazan.',            color: '#22c55e', D: Deco.Wave },
                { step: 4, emoji: '🎉', title: 'Ödülünü Al',         desc: 'Puanlarını ödüllerle değiştir.',        color: '#ec4899', D: Deco.BullsEye },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  position: 'relative', padding: '28px 20px 24px', borderRadius: 20,
                  overflow: 'hidden', textAlign: 'center',
                  background: t.cardBg2, border: `2.5px solid ${t.border}`,
                  boxShadow: `0 5px 0 ${t.shadow}`,
                }}>
                  {i < arr.length - 1 && (
                    <div className="hidden lg:flex" style={{ position: 'absolute', top: '50%', right: -14, zIndex: 10, transform: 'translateY(-50%)', color: '#a78bfa' }}>
                      <ArrowRight size={18} />
                    </div>
                  )}
                  <item.D color={item.color} opacity={t.decoOp} />
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', margin: '0 auto 14px',
                    background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                    border: `2.5px solid ${t.border}`,
                    boxShadow: `0 3px 0 ${t.shadow}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'white', fontSize: 16,
                  }}>{item.step}</div>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{item.emoji}</div>
                  <h3 style={{ fontWeight: 900, fontSize: 16, color: t.textPrimary, margin: '0 0 6px' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" style={{ padding: '80px clamp(16px, 5vw, 80px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 16,
            }}>✦ KULLANICI YORUMLARI</div>
            <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase' }}>
              KULLANICILARIMIZ{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                NE DİYOR?
              </span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t2, i) => (
              <div key={i} style={{
                position: 'relative', padding: '28px 24px', borderRadius: 20, overflow: 'hidden',
                background: t.cardBg, border: `2.5px solid ${t.border}`,
                boxShadow: `0 5px 0 ${t.shadow}`,
                transition: 'transform 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                {i === 0 && <Deco.DiagLines color="#7B6EF6" opacity={isDark ? 0.05 : 0.04} />}
                {i === 1 && <Deco.HalfCircle color="#06b6d4" opacity={isDark ? 0.15 : 0.12} />}
                {i === 2 && <Deco.CrossDots color="#ec4899" opacity={t.decoOp} />}
                <Deco.Corner color="#7B6EF6" opacity={isDark ? 0.18 : 0.14} />
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[...Array(t2.stars)].map((_, s) => <Star key={s} size={14} fill="#FBBF24" color="#FBBF24" />)}
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>"{t2.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: `2px dashed ${isDark ? '#2a2d50' : '#c4b5fd'}` }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                    border: `2.5px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'white', fontSize: 14,
                  }}>{t2.avatar}</div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 14, color: t.textPrimary, margin: 0 }}>{t2.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, margin: 0 }}>{t2.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: '20px clamp(16px, 5vw, 80px) 80px' }}>
          <div style={{
            position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center',
            padding: '72px clamp(24px, 6vw, 80px)',
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
            border: `3px solid ${isDark ? '#000' : '#1e1b4b'}`,
            boxShadow: `0 10px 0 ${isDark ? '#000' : '#1e1b4b'}`,
          }}>
            {/* Ghost text inside CTA */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
              <span style={{ position: 'absolute', top: -10, left: -20, fontSize: 180, fontWeight: 900, color: 'white', opacity: 0.05, whiteSpace: 'nowrap', lineHeight: 1 }}>KAZAN</span>
              <Deco.DiagLines color="white" opacity={0.05} />
            </div>
            {/* Floating stickers on corners */}
            <div style={{ position: 'absolute', top: -20, left: -16 }}><Sticker emoji="⭐" bg="#f59e0b" size={56} rotate={-15} /></div>
            <div style={{ position: 'absolute', top: -18, right: -14 }}><Sticker emoji="👑" bg="#FCD34D" size={54} rotate={18} /></div>
            <div style={{ position: 'absolute', bottom: -18, left: -14 }}><Sticker emoji="⚡" bg="#FDE68A" size={52} rotate={10} /></div>
            <div style={{ position: 'absolute', bottom: -20, right: -16 }}><Sticker emoji="💖" bg="#F472B6" size={54} rotate={-18} /></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 20,
              }}>✦ HEMEN BAŞLA</div>
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900,
                color: 'white', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1,
                textTransform: 'uppercase',
              }}>KAZANMAYA HAZIR<br />MISINIZ?</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 500, marginBottom: 32, maxWidth: 420, marginInline: 'auto' }}>
                Sadakat programımıza katılın ve bugün ödül toplamaya başlayın.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                <button onClick={() => navigate('/home')} className="lbtn-dark">
                  Panele Gir <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/register')} className="lbtn-ghost">
                  Ücretsiz Kayıt Ol
                </button>
              </div>
              <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500 }}>
                Kredi kartı gerekmez &bull; İstediğin zaman iptal et
              </p>
            </div>
          </div>
        </section>

        {/* ══ TICKER 4 — pink ══ */}
        <TickerStrip
          items={[
            { text: 'NexReward ile Kazan', emoji: '💜' }, { text: 'Her Alışverişte Puan', emoji: '🛍️' },
            { text: 'Ücretsiz Üyelik',      emoji: '🎉' }, { text: 'Anında Ödül',          emoji: '⚡' },
            { text: 'Hemen Başla',          emoji: '🚀' }, { text: 'Türkiye\'nin #1',       emoji: '🏆' },
          ]}
          direction="right" bg="#F472B6" textColor="white"
          borderTop={`2px solid ${isDark ? '#2a2d50' : '#1e1b4b'}`}
          speed={24}
        />

        {/* ══ FOOTER ══ */}
        <footer style={{ background: t.footerBg, borderTop: `2px solid ${t.border}`, padding: '36px clamp(16px, 5vw, 80px)', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                border: `2px solid ${t.border}`, boxShadow: `0 2px 0 ${t.shadow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: 'white', fontSize: 13,
              }}>N</div>
              <span style={{ fontWeight: 900, fontSize: 16, color: t.textPrimary }}>NexReward</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: 0 }}>© 2026 NexReward · Daha fazla kazan, daha iyi yaşa.</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['#features', 'Özellikler'], ['#how', 'Nasıl Çalışır']].map(([href, label]) => (
                <a key={href} href={href} style={{ color: t.textMuted, fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textMuted)}>
                  {label}
                </a>
              ))}
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: t.textMuted, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = t.textMuted)}>
                Giriş
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @keyframes tickerLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes tickerRight {
          from { transform: translateX(calc(-100% / 3)); }
          to   { transform: translateX(0); }
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Nav button classes ── */
        .lbtn-primary-sm {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%);
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border, #2a2d50);
          border-radius: 14px; padding: 8px 18px; font-size: 13px;
          box-shadow: 0 4px 0 var(--l-shadow, #000);
          cursor: pointer; transition: opacity 0.15s, box-shadow 0.1s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .lbtn-primary-sm:hover  { opacity: 0.9; }
        .lbtn-primary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--l-shadow, #000); }

        .lbtn-secondary-sm {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--l-card-bg, #131629);
          color: var(--l-text, #f0edff); font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border, #2a2d50);
          border-radius: 14px; padding: 8px 18px; font-size: 13px;
          box-shadow: 0 4px 0 var(--l-shadow, #000);
          cursor: pointer; transition: background 0.15s, box-shadow 0.1s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .lbtn-secondary-sm:hover  { background: var(--l-tab-bg, #1e1a3a); }
        .lbtn-secondary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--l-shadow, #000); }

        /* ── CTA section buttons ── */
        .lbtn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1e1b4b; color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid white; border-radius: 16px;
          padding: 14px 32px; font-size: 17px;
          box-shadow: 0 5px 0 rgba(0,0,0,0.35);
          cursor: pointer; transition: opacity 0.15s, transform 0.1s, box-shadow 0.1s;
        }
        .lbtn-dark:hover  { opacity: 0.88; }
        .lbtn-dark:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,0.35); }

        .lbtn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.18); color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid white; border-radius: 16px;
          padding: 14px 32px; font-size: 17px;
          box-shadow: 0 5px 0 rgba(0,0,0,0.25);
          cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
        }
        .lbtn-ghost:hover  { background: rgba(255,255,255,0.28); }
        .lbtn-ghost:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,0.25); }
      `}</style>
    </div>
  );
};

export default LandingPage;
