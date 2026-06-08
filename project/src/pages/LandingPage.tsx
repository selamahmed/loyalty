import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HERO INLINE CIRCULAR STICKER — responsive via CSS class
═══════════════════════════════════════════════════════════════ */
const Sticker: React.FC<{ emoji: string; bg: string; rotate?: number }> = ({ emoji, bg, rotate = 0 }) => (
  <span className="hero-sticker" style={{ background: bg, transform: `rotate(${rotate}deg)` }}>
    {emoji}
  </span>
);

/* Inline pill badge */
const InlinePill: React.FC<{ label: string; bg?: string; color?: string; onClick?: () => void }> = ({
  label, bg = '#22c55e', color = '#000', onClick,
}) => (
  <button onClick={onClick} className="inline-pill" style={{ background: bg, color }}>
    {label} <ArrowRight size={13} />
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
          <div key={i} className="flex items-center gap-2 px-4 whitespace-nowrap flex-shrink-0">
            {item.emoji && <span style={{ fontSize: '1rem' }}>{item.emoji}</span>}
            <span className="font-black text-sm tracking-widest uppercase" style={{ color: textColor }}>{item.text}</span>
            <span style={{ color: textColor, opacity: 0.35, margin: '0 4px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEO-BRUTALISM SVG SHAPES — big, bold, for card corners
═══════════════════════════════════════════════════════════════ */
type ShapeProps = { color: string; size?: number; opacity?: number; rotate?: number };

const NStar5 = ({ color, size = 100, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none"
    style={{ position: 'absolute', top: -size * 0.18, right: -size * 0.18, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBolt = ({ color, size = 94, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', top: -size * 0.12, right: -size * 0.12, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,2 15,26 24,26 19,46 36,22 27,22"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const NDiamond = ({ color, size = 96, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="25,3 46,18 25,47 4,18"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NHeart = ({ color, size = 98, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M26 45C26 45 5 32 5 17C5 10 11 4 19 6C22 7 26 12 26 12C26 12 30 7 33 6C41 4 47 10 47 17C47 32 26 45 26 45Z"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBurst = ({ color, size = 102, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 54 54" fill="none"
    style={{ position: 'absolute', top: -size * 0.16, right: -size * 0.16, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19"
      fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const NStar4 = ({ color, size = 96, opacity = 0.22, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M24 3 L28 20 L45 24 L28 28 L24 45 L20 28 L3 24 L20 20 Z"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

/* Banner decorative shapes — large right-side SVGs */
const BannerStar = ({ color = '#000', opacity = 0.12 }) => (
  <svg width="220" height="220" viewBox="0 0 56 56" fill="none"
    style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%) rotate(12deg)', opacity, pointerEvents: 'none' }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill={color} stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);
const BannerBolt = ({ color = '#000', opacity = 0.12 }) => (
  <svg width="180" height="180" viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-60%) rotate(-8deg)', opacity, pointerEvents: 'none' }}>
    <polygon points="28,2 15,26 24,26 19,46 36,22 27,22"
      fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const BannerDiamond = ({ color = '#000', opacity = 0.12 }) => (
  <svg width="200" height="200" viewBox="0 0 50 50" fill="none"
    style={{ position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%) rotate(15deg)', opacity, pointerEvents: 'none' }}>
    <polygon points="25,3 46,18 25,47 4,18"
      fill={color} stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);
const BannerBurst = ({ color = '#000', opacity = 0.12 }) => (
  <svg width="210" height="210" viewBox="0 0 54 54" fill="none"
    style={{ position: 'absolute', right: -28, top: '50%', transform: 'translateY(-45%) rotate(-6deg)', opacity, pointerEvents: 'none' }}>
    <polygon points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19"
      fill={color} stroke="#000" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const features = [
  { emoji: '⚡', title: 'Anında Ödüller',    desc: 'Her etkileşimde anında puan kazan.',             color: '#7B6EF6', Shape: NBolt,    sOpacity: 0.2, sRotate: 15,  img: 'https://picsum.photos/seed/lightning99/600/240' },
  { emoji: '🎮', title: 'Eğlenceli Oyunlar', desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',  color: '#22c55e', Shape: NStar5,   sOpacity: 0.2, sRotate: -10, img: 'https://picsum.photos/seed/gaming44/600/240' },
  { emoji: '🎁', title: 'Özel Ödüller',      desc: 'Puanlarını harika ödüllerle değiştir.',           color: '#f59e0b', Shape: NHeart,   sOpacity: 0.2, sRotate: 8,   img: 'https://picsum.photos/seed/gifts77/600/240' },
  { emoji: '🎯', title: 'Günlük Görevler',   desc: 'Günlük zorlukları tamamla, serini koru.',         color: '#ef4444', Shape: NBurst,   sOpacity: 0.18, sRotate: -12, img: 'https://picsum.photos/seed/target55/600/240' },
  { emoji: '🏆', title: 'Liderlik Tablosu',  desc: 'Diğerleriyle yarış ve sıralamada yüksel.',        color: '#06b6d4', Shape: NStar4,   sOpacity: 0.2, sRotate: 20,  img: 'https://picsum.photos/seed/trophy22/600/240' },
  { emoji: '💖', title: 'Sosyal Ödüller',    desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',       color: '#ec4899', Shape: NDiamond, sOpacity: 0.2, sRotate: -8,  img: 'https://picsum.photos/seed/social88/600/240' },
];

const tickerHero: TickerItem[] = [
  { text: '50.000+ Aktif Kullanıcı', emoji: '👥' },
  { text: '4 Mini Oyun',             emoji: '🎮' },
  { text: '2M+ Kazanılan Puan',      emoji: '✨' },
  { text: '8 Ödül Kategorisi',       emoji: '🎁' },
  { text: '10.000+ Ödül Verildi',    emoji: '🏆' },
  { text: 'Günlük Görevler',         emoji: '🎯' },
  { text: 'Ücretsiz Kayıt',          emoji: '🎉' },
  { text: 'Liderlik Tablosu',        emoji: '👑' },
];

const banners = [
  {
    bg: '#FFE500', textColor: '#000',
    rotate: -1.4,
    tag: '👥 TOPLULUK',
    headline: '50.000+',
    sub: 'Mutlu Kullanıcı',
    body: 'Türkiye\'nin en hızlı büyüyen sadakat topluluğuna katılın. Her gün yeni üyeler NexReward\'la tanışıyor ve kazanmaya başlıyor.',
    BShape: BannerStar,
    accent: '#000',
  },
  {
    bg: '#BFFF00', textColor: '#000',
    rotate: 1.0,
    tag: '⚡ HIZ',
    headline: 'ANINDA',
    sub: 'Ödül Sistemi',
    body: 'Alışveriş yaptığınız anda puanlar hesabınıza geçer. Bekleme yok, gecikme yok — sadece anlık kazanç.',
    BShape: BannerBolt,
    accent: '#000',
  },
  {
    bg: '#FF6B35', textColor: '#fff',
    rotate: -0.8,
    tag: '💰 KAZANÇ',
    headline: '2M+',
    sub: 'Kazanılan Puan',
    body: 'Kullanıcılarımız 2 milyondan fazla puan kazandı. Online ve offline her alışverişiniz bir kazanç fırsatıdır.',
    BShape: BannerDiamond,
    accent: '#fff',
  },
  {
    bg: '#FF3E9D', textColor: '#fff',
    rotate: 1.2,
    tag: '🏆 BAŞARI',
    headline: '#1',
    sub: 'Türkiye\'nin Platformu',
    body: 'En iyi sadakat deneyimini yaşayın. Ödüller, mini oyunlar, liderlik tabloları ve çok daha fazlası — hepsi ücretsiz.',
    BShape: BannerBurst,
    accent: '#fff',
  },
];

const testimonials = [
  { name: 'Ayşe K.',   role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika bir platform!', avatar: 'A', stars: 5, photo: 'https://i.pravatar.cc/80?img=47' },
  { name: 'Mehmet T.', role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller gerçekten değerli. Kesinlikle tavsiye ederim.',       avatar: 'M', stars: 5, photo: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Zeynep A.', role: 'Premium Üye',          text: 'Arkadaşlarımla liderlik tablosunda yarışmak çok keyifli! Her gün giriş yapıyorum.',           avatar: 'Z', stars: 5, photo: 'https://i.pravatar.cc/80?img=23' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = {
    pageBg:        isDark ? '#0c0e1e' : '#f0eeff',
    heroText:      isDark ? '#ffffff' : '#0c0e1e',
    sideText:      isDark ? 'rgba(255,255,255,0.28)' : 'rgba(12,14,30,0.35)',
    navBg:         isDark ? 'rgba(12,14,30,0.92)' : 'rgba(240,238,255,0.92)',
    navBorder:     isDark ? 'rgba(255,255,255,0.1)' : 'rgba(12,14,30,0.12)',
    cardBg:        isDark ? '#131629' : '#ffffff',
    cardBg2:       isDark ? '#0f1124' : '#f0eeff',
    border:        isDark ? '#2a2d50' : '#1e1b4b',
    shadow:        isDark ? '#000000' : '#1e1b4b',
    textPrimary:   isDark ? '#f0edff' : '#1e1b4b',
    textSecondary: isDark ? '#8b87b8' : '#6b7280',
    textMuted:     isDark ? '#5a5680' : '#9ca3af',
    pillBg:        isDark ? 'rgba(123,110,246,0.15)' : '#ede9fe',
    ghostColor:    isDark ? 'rgba(123,110,246,0.055)' : 'rgba(123,110,246,0.04)',
    footerBg:      isDark ? '#0a0c1a' : '#f0eeff',
    howBg:         isDark ? '#0f1124' : '#ffffff',
    tickerBg2:     isDark ? '#131629' : '#ffffff',
    decoOp:        isDark ? 0.2 : 0.24,
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

      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '4%', left: '50%', transform: 'translateX(-50%) rotate(-6deg)',
          fontSize: 'clamp(80px, 20vw, 260px)', fontWeight: 900, color: t.ghostColor,
          whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>NEXREWARD</div>
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%) rotate(-6deg)',
          fontSize: 'clamp(60px, 13vw, 190px)', fontWeight: 900, color: t.ghostColor,
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
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            {/* Pill logo */}
            <img
              src="/logo.png"
              alt="NexReward"
              style={{ height: 40, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
            />

            {/* Desktop nav links */}
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {[['#features','Özellikler'],['#banners','Avantajlar'],['#how','Nasıl Çalışır'],['#testimonials','Yorumlar']].map(([href, label]) => (
                <a key={href} href={href} style={{ color: t.textSecondary, fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>
                  {label.toUpperCase()}
                </a>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setIsDark(!isDark)}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: `2px solid ${t.border}`,
                  background: t.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 0 ${t.shadow}`, flexShrink: 0,
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color="#7B6EF6" />}
              </button>
              <button onClick={() => navigate('/login')} className="lbtn-secondary-sm nav-login-btn">Giriş Yap</button>
              <button onClick={() => navigate('/home')} className="lbtn-primary-sm">
                <span className="btn-label-full">Panele Gir</span>
                <span className="btn-label-short">Panel</span>
                <ArrowRight size={12} />
              </button>
              {/* Hamburger — mobile only */}
              <button className="hamburger-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: `2px solid ${t.border}`,
                  background: t.cardBg, cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 0 ${t.shadow}`, flexShrink: 0,
                }}>
                {menuOpen ? <X size={16} color={t.textPrimary} /> : <Menu size={16} color={t.textPrimary} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div style={{
              background: t.navBg, borderTop: `1.5px solid ${t.navBorder}`, padding: '12px 20px 16px',
            }}>
              {[['#features','Özellikler'],['#banners','Avantajlar'],['#how','Nasıl Çalışır'],['#testimonials','Yorumlar']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 0', color: t.textPrimary, fontWeight: 700, fontSize: 15, textDecoration: 'none', borderBottom: `1px solid ${t.navBorder}` }}>
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="lbtn-secondary-sm" style={{ flex: 1 }}>Giriş Yap</button>
                <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="lbtn-primary-sm" style={{ flex: 1, justifyContent: 'center' }}>Kayıt Ol</button>
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', padding: '40px 0 0' }}>
          {/* Side annotations */}
          <div className="side-text" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: t.sideText, fontWeight: 700, fontSize: 10, letterSpacing: '0.09em', lineHeight: 2.4, textTransform: 'uppercase' }}>
            <div>PUAN KAZAN</div>
            <div>ÖDÜL AL</div>
            <div>SIK OYNA</div>
            <div>TEKRARLA</div>
          </div>
          <div className="side-text" style={{ position: 'absolute', right: 20, top: '42%', transform: 'translateY(-50%)', color: t.sideText, fontWeight: 700, fontSize: 10, letterSpacing: '0.09em', lineHeight: 2.4, textTransform: 'uppercase', textAlign: 'right' }}>
            <div>OYUN, GÖREV</div>
            <div>PUAN, ÖDÜL</div>
            <div>LİDERLİK</div>
          </div>

          {/* Massive headline */}
          <div style={{ padding: '0 clamp(14px, 4vw, 72px)', textAlign: 'center' }}>
            <div className="hero-headline">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 2px', marginBottom: '0.04em' }}>
                <span>ALIŞVERİŞ</span>
                <Sticker emoji="⭐" bg="#f59e0b" rotate={-8} />
                <span>YAPARKEN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 2px', marginBottom: '0.04em' }}>
                <span>PUAN</span>
                <InlinePill label="HEMEN BAŞLA" bg="#22c55e" color="#000" onClick={() => navigate('/home')} />
                <span>KAZAN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 2px', marginBottom: '0.04em' }}>
                <Sticker emoji="🏆" bg="#7B6EF6" rotate={6} />
                <span>VE ÖDÜL</span>
                <Sticker emoji="🎮" bg="#ec4899" rotate={-4} />
                <span>AL</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 2px' }}>
                <span>HER</span>
                <Sticker emoji="💎" bg="#06b6d4" rotate={10} />
                <span>GÜN EĞLEN</span>
              </div>
            </div>
            <p style={{ marginTop: 24, color: t.textSecondary, fontWeight: 600, fontSize: 'clamp(13px, 1.5vw, 17px)', maxWidth: 460, marginInline: 'auto', lineHeight: 1.6 }}>
              Binlerce kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen.
            </p>
          </div>

          {/* Scroll cue */}
          <div style={{ textAlign: 'center', marginTop: 36, marginBottom: 8 }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: t.sideText }}>
              <span style={{ fontSize: 24 }}>🐾</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Kaydır ve keşfet</span>
              <ChevronDown size={14} style={{ opacity: 0.5, animation: 'bounce 1.8s ease-in-out infinite' }} />
            </div>
          </div>
        </section>

        {/* ══ HERO TICKERS ══ */}
        <TickerStrip items={tickerHero} direction="left" bg="#7B6EF6" textColor="white"
          borderTop={`2px solid ${t.border}`} borderBottom={`2px solid ${t.border}`} speed={30} />
        <TickerStrip
          items={[
            { text:'PUAN KAZAN',emoji:'⭐' },{text:'ÖDÜL AL',emoji:'🎁' },
            { text:'OYUN OYNA',emoji:'🕹️' },{text:'LIDER OL',emoji:'👑' },
            { text:'PAYLAŞ',   emoji:'💜' },{text:'KEŞFET', emoji:'🔮' },
            { text:'YÜKSEL',   emoji:'🚀' },{text:'KAZAN',  emoji:'💰' },
          ]}
          direction="right" bg={t.tickerBg2} textColor={isDark ? '#a78bfa' : '#7B6EF6'}
          borderBottom={`2px solid ${t.border}`} speed={22}
        />

        {/* ══ APP PREVIEW ══ */}
        <section style={{ padding: '80px clamp(14px, 4vw, 64px)', maxWidth: 1280, margin: '0 auto', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 14,
            }}>✦ UYGULAMA</div>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              GÖRSELİN ÖTESİNDE{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>DENEYİM</span>
            </h2>
            <p style={{ color: t.textSecondary, fontWeight: 600, fontSize: 15, marginTop: 12, marginBottom: 0, maxWidth: 460, marginInline: 'auto' }}>
              Sezgisel tasarım, hızlı ödüller ve sürekli eğlence — tek uygulamada.
            </p>
          </div>

          {/* Phone frames */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(12px, 3vw, 32px)', flexWrap: 'wrap' }}>
            {[
              { img: 'https://picsum.photos/seed/appview1/390/760', label: 'Puan Paneli', color: '#7B6EF6', rotate: -4, scale: 0.88 },
              { img: 'https://picsum.photos/seed/appview2/390/760', label: 'Ödül Mağazası', color: '#22c55e', rotate: 0, scale: 1 },
              { img: 'https://picsum.photos/seed/appview3/390/760', label: 'Liderlik Tablosu', color: '#f59e0b', rotate: 4, scale: 0.88 },
            ].map((ph, i) => (
              <div key={i} style={{ flexShrink: 0, transform: `rotate(${ph.rotate}deg) scale(${ph.scale})`, transformOrigin: 'bottom center' }}>
                {/* Phone shell */}
                <div style={{
                  width: 'clamp(140px, 20vw, 210px)',
                  borderRadius: 28,
                  border: `3px solid #000`,
                  boxShadow: `0 8px 0 #000, 0 16px 40px rgba(0,0,0,0.35)`,
                  overflow: 'hidden',
                  background: '#111',
                  position: 'relative',
                }}>
                  {/* Notch */}
                  <div style={{ height: 26, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 56, height: 10, background: '#1a1a1a', borderRadius: 99 }} />
                  </div>
                  {/* Screenshot */}
                  <img src={ph.img} alt={ph.label}
                    style={{ width: '100%', aspectRatio: '9/18', objectFit: 'cover', display: 'block',
                      filter: isDark ? 'brightness(0.88) saturate(1.1)' : 'brightness(0.94)' }} />
                  {/* Color overlay accent */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, ${ph.color}18 0%, transparent 35%)`, pointerEvents: 'none' }} />
                  {/* Bottom bar */}
                  <div style={{ height: 20, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 36, height: 5, background: '#333', borderRadius: 99 }} />
                  </div>
                </div>
                {/* Label */}
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: t.cardBg, color: t.textPrimary,
                    border: `2px solid ${t.border}`,
                    borderRadius: 999, padding: '4px 12px',
                    fontSize: 11, fontWeight: 900,
                    boxShadow: `0 3px 0 ${t.shadow}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ph.color }} />
                    {ph.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ STACKING BANNERS ══ */}
        <section id="banners" style={{ position: 'relative' }}>
          {banners.map((b, i) => (
            <div key={i} style={{ height: 'clamp(150px, 22vh, 240px)', position: 'relative' }}>
              <div style={{
                position: 'sticky',
                top: `${62 + i * 8}px`,
                zIndex: 10 + i,
                padding: '0 clamp(10px, 3vw, 32px)',
              }}>
                <div style={{
                  position: 'relative',
                  background: b.bg,
                  border: '3px solid #000',
                  borderRadius: 20,
                  boxShadow: '0 7px 0 #000',
                  transform: `rotate(${b.rotate}deg)`,
                  padding: 'clamp(24px, 4vw, 44px) clamp(20px, 5vw, 56px)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(16px, 4vw, 48px)',
                  minHeight: 'clamp(130px, 18vh, 200px)',
                }}>
                  {/* Background shape */}
                  <b.BShape color={b.accent} opacity={0.11} />

                  {/* Tag */}
                  <div style={{
                    position: 'absolute', top: 12, right: 16,
                    background: 'rgba(0,0,0,0.12)', color: b.textColor,
                    borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 800,
                    letterSpacing: '0.06em', border: `1.5px solid ${b.textColor === '#000' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}`,
                  }}>{b.tag}</div>

                  {/* Headline number */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      fontWeight: 900, color: b.textColor, lineHeight: 0.9,
                      fontSize: 'clamp(48px, 9vw, 110px)', letterSpacing: '-0.04em',
                    }}>{b.headline}</div>
                    <div style={{
                      fontWeight: 900, color: b.textColor,
                      fontSize: 'clamp(13px, 2.2vw, 22px)', letterSpacing: '-0.01em', marginTop: 2, opacity: 0.75,
                    }}>{b.sub}</div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 3, alignSelf: 'stretch', background: `${b.textColor === '#000' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)'}`, borderRadius: 99, flexShrink: 0 }} className="banner-divider" />

                  {/* Body text */}
                  <div className="banner-body">
                    <p style={{
                      fontWeight: 700, color: b.textColor,
                      fontSize: 'clamp(13px, 1.8vw, 20px)', lineHeight: 1.5, margin: 0,
                      opacity: 0.85, maxWidth: 520,
                    }}>{b.body}</p>
                    <button
                      onClick={() => navigate('/register')}
                      style={{
                        marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: b.textColor === '#000' ? '#000' : '#fff',
                        color: b.textColor === '#000' ? b.bg : '#000',
                        border: `2.5px solid ${b.textColor === '#000' ? '#000' : '#fff'}`,
                        borderRadius: 12, padding: '9px 20px',
                        fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: `0 3px 0 ${b.textColor === '#000' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.3)'}`,
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(0,0,0,0.3)'; }}
                      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 3px 0 rgba(0,0,0,0.3)`; }}>
                      Katıl <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" style={{ padding: '80px clamp(14px, 4vw, 64px)', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 14,
            }}>✦ ÖZELLİKLER</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
              NEDEN BİZİ{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                SEVECEKSİNİZ
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', padding: 0, borderRadius: 20, overflow: 'hidden',
                  background: t.cardBg,
                  border: `2.5px solid ${t.border}`,
                  boxShadow: hovered === i ? `0 8px 0 ${t.shadow}` : `0 4px 0 ${t.shadow}`,
                  transform: hovered === i ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.15s ease', cursor: 'pointer',
                }}>
                {/* Cover image */}
                <div style={{ position: 'relative', height: 148, overflow: 'hidden' }}>
                  <img src={f.img} alt={f.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      filter: isDark ? 'brightness(0.78) saturate(1.15)' : 'brightness(0.92) saturate(1.1)',
                      transition: 'transform 0.3s',
                      transform: hovered === i ? 'scale(1.05)' : 'scale(1)',
                    }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 35%, ${t.cardBg} 100%)` }} />
                  {/* Color accent stripe on left */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: f.color }} />
                  {/* Emoji badge floating at bottom of image */}
                  <div style={{
                    position: 'absolute', bottom: -20, left: 20, zIndex: 2,
                    width: 44, height: 44, borderRadius: 13, fontSize: 20,
                    background: t.cardBg, border: `2.5px solid ${f.color}`,
                    boxShadow: `0 3px 0 ${f.color}80`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s',
                    transform: hovered === i ? 'scale(1.15) rotate(-6deg)' : 'scale(1)',
                  }}>{f.emoji}</div>
                </div>
                {/* Content */}
                <div style={{ position: 'relative', padding: '32px 22px 22px', zIndex: 1 }}>
                  <f.Shape color={f.color} size={96} opacity={t.decoOp} rotate={f.sRotate} />
                  <h3 style={{ fontWeight: 900, fontSize: 16, color: t.textPrimary, margin: '0 0 6px' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: '0 0 14px', lineHeight: 1.5 }}>{f.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 900, fontSize: 12, color: f.color }}>
                    Keşfet <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Yellow ticker */}
        <TickerStrip
          items={[
            {text:'KAZAN',emoji:'💰'},{text:'ÖDÜL',emoji:'🎁'},{text:'EĞLEN',emoji:'🎮'},
            {text:'PAYLAŞ',emoji:'💜'},{text:'YÜKSEL',emoji:'🚀'},{text:'KEŞFET',emoji:'🔮'},
            {text:'BAŞAR',emoji:'🏆'},{text:'NEXREWARD',emoji:'⭐'},
          ]}
          direction="left" bg="#FBBF24" textColor="#0c0e1e"
          borderTop={`2px solid #000`} borderBottom={`2px solid #000`} speed={22}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" style={{ padding: '80px clamp(14px, 4vw, 64px)', background: t.howBg, borderTop: `2px solid ${t.border}`, borderBottom: `2px solid ${t.border}`, transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: t.pillBg, color: '#a78bfa',
                border: `2px solid ${t.border}`,
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 14,
              }}>✦ NASIL ÇALIŞIR</div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase' }}>4 ADIMDA BAŞLA</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
              {[
                { step:1, emoji:'📝', title:'Kayıt Ol',         desc:'Saniyeler içinde hesabını oluştur.',  color:'#7B6EF6', Shape: NBolt   },
                { step:2, emoji:'🛍️',title:'Alışveriş & Kazan',desc:'Her alışverişte puan kazan.',          color:'#f59e0b', Shape: NStar5  },
                { step:3, emoji:'🎮', title:'Oyun Oyna',         desc:'Eğlen ve bonus puan kazan.',          color:'#22c55e', Shape: NDiamond},
                { step:4, emoji:'🎉', title:'Ödülünü Al',        desc:'Puanlarını ödüllerle değiştir.',      color:'#ec4899', Shape: NHeart  },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  position: 'relative', padding: '28px 18px 22px', borderRadius: 20,
                  overflow: 'hidden', textAlign: 'center',
                  background: t.cardBg2, border: `2.5px solid ${t.border}`,
                  boxShadow: `0 5px 0 ${t.shadow}`,
                }}>
                  {i < arr.length - 1 && (
                    <div className="step-arrow" style={{ position: 'absolute', top: '50%', right: -12, zIndex: 10, transform: 'translateY(-50%)', color: '#a78bfa' }}>
                      <ArrowRight size={16} />
                    </div>
                  )}
                  <item.Shape color={item.color} size={88} opacity={isDark ? 0.18 : 0.22} rotate={15} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', margin: '0 auto 12px',
                      background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                      border: `2.5px solid ${t.border}`, boxShadow: `0 3px 0 ${t.shadow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, color: 'white', fontSize: 15,
                    }}>{item.step}</div>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>{item.emoji}</div>
                    <h3 style={{ fontWeight: 900, fontSize: 15, color: t.textPrimary, margin: '0 0 6px' }}>{item.title}</h3>
                    <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" style={{ padding: '80px clamp(14px, 4vw, 64px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 14,
            }}>✦ KULLANICI YORUMLARI</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase' }}>
              KULLANICILARIMIZ{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>NE DİYOR?</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {testimonials.map((t2, i) => {
              const Shapes = [NBolt, NStar4, NDiamond];
              const colors = ['#7B6EF6', '#06b6d4', '#ec4899'];
              const TestShape = Shapes[i];
              return (
                <div key={i} style={{
                  position: 'relative', padding: '28px 22px 24px', borderRadius: 20, overflow: 'hidden',
                  background: t.cardBg, border: `2.5px solid ${t.border}`,
                  boxShadow: `0 5px 0 ${t.shadow}`, transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                  <TestShape color={colors[i]} size={92} opacity={isDark ? 0.16 : 0.2} rotate={i * 12} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                      {[...Array(t2.stars)].map((_,s) => <Star key={s} size={13} fill="#FBBF24" color="#FBBF24" />)}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, lineHeight: 1.65, marginBottom: 18 }}>"{t2.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: `2px dashed ${isDark ? '#2a2d50' : '#c4b5fd'}` }}>
                      <img src={t2.photo} alt={t2.name}
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${t.border}`, flexShrink: 0, boxShadow: `0 2px 0 ${t.shadow}` }} />
                      <div>
                        <p style={{ fontWeight: 900, fontSize: 13, color: t.textPrimary, margin: 0 }}>{t2.name}</p>
                        <p style={{ fontSize: 11, fontWeight: 500, color: t.textMuted, margin: 0 }}>{t2.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ LIFESTYLE GALLERY ══ */}
        <section style={{ padding: '0 clamp(14px, 4vw, 64px) 80px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.pillBg, color: '#a78bfa',
              border: `2px solid ${t.border}`,
              borderRadius: 999, padding: '5px 16px',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 14,
            }}>✦ YAŞAM TARZI</div>
            <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase' }}>
              KAZANMAK BİR{' '}
              <span style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>YAŞAM BİÇİMİ</span>
            </h2>
          </div>

          {/* Masonry-style photo grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto', gap: 14 }}>
            {/* Big left photo */}
            <div style={{ gridColumn: '1 / 6', gridRow: '1 / 3', position: 'relative', borderRadius: 20, overflow: 'hidden', border: `2.5px solid ${t.border}`, boxShadow: `0 6px 0 ${t.shadow}`, minHeight: 280 }}>
              <img src="https://picsum.photos/seed/lifestyle11/700/520" alt="Alışveriş keyfi"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isDark ? 'brightness(0.72)' : 'brightness(0.82)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFE500', color: '#000', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 900, marginBottom: 8 }}>⭐ ALIŞVERIŞ</div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(14px, 1.8vw, 18px)', margin: 0, lineHeight: 1.35 }}>Her alışverişte puan kazan, ödüllerle zenginleş.</p>
              </div>
            </div>

            {/* Top right photo */}
            <div style={{ gridColumn: '6 / 10', gridRow: '1 / 2', position: 'relative', borderRadius: 20, overflow: 'hidden', border: `2.5px solid ${t.border}`, boxShadow: `0 6px 0 ${t.shadow}`, minHeight: 140 }}>
              <img src="https://picsum.photos/seed/lifestyle22/600/320" alt="Ödül kazanma"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isDark ? 'brightness(0.72)' : 'brightness(0.82)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#BFFF00', color: '#000', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 900, marginBottom: 6 }}>⚡ ANINDA</div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>Ödülünü saniyeler içinde al.</p>
              </div>
            </div>

            {/* Top far-right photo */}
            <div style={{ gridColumn: '10 / 13', gridRow: '1 / 2', position: 'relative', borderRadius: 20, overflow: 'hidden', border: `2.5px solid ${t.border}`, boxShadow: `0 6px 0 ${t.shadow}`, minHeight: 140 }}>
              <img src="https://picsum.photos/seed/lifestyle33/400/320" alt="Oyun oyna"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isDark ? 'brightness(0.72)' : 'brightness(0.82)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FF3E9D', color: '#fff', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 900, marginBottom: 6 }}>🎮 OYUN</div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>Eğlenerek kazan.</p>
              </div>
            </div>

            {/* Bottom right wide photo */}
            <div style={{ gridColumn: '6 / 13', gridRow: '2 / 3', position: 'relative', borderRadius: 20, overflow: 'hidden', border: `2.5px solid ${t.border}`, boxShadow: `0 6px 0 ${t.shadow}`, minHeight: 140 }}>
              <img src="https://picsum.photos/seed/lifestyle44/900/340" alt="Topluluk"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isDark ? 'brightness(0.72)' : 'brightness(0.82)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FF6B35', color: '#fff', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 900 }}>👥 TOPLULUK</div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: 0 }}>50.000+ mutlu kullanıcıyla birlikte büyüyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: '10px clamp(14px, 4vw, 64px) 80px' }}>
          <div style={{
            position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center',
            padding: 'clamp(40px, 7vw, 72px) clamp(20px, 5vw, 72px)',
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(135deg,#7B6EF6 0%,#4F8EF7 100%)',
            border: '3px solid #000', boxShadow: '0 10px 0 #000',
          }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
              <span style={{ position: 'absolute', top: -20, left: -30, fontSize: 200, fontWeight: 900, color: 'white', opacity: 0.05, whiteSpace: 'nowrap', lineHeight: 1 }}>KAZAN</span>
            </div>
            <div style={{ position: 'absolute', top: -18, left: -14 }}><span className="cta-corner-sticker" style={{ background: '#f59e0b' }}>⭐</span></div>
            <div style={{ position: 'absolute', top: -16, right: -12 }}><span className="cta-corner-sticker" style={{ background: '#FCD34D' }}>👑</span></div>
            <div style={{ position: 'absolute', bottom: -16, left: -12 }}><span className="cta-corner-sticker" style={{ background: '#FDE68A' }}>⚡</span></div>
            <div style={{ position: 'absolute', bottom: -18, right: -14 }}><span className="cta-corner-sticker" style={{ background: '#F472B6' }}>💖</span></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 18,
              }}>✦ HEMEN BAŞLA</div>
              <h2 style={{ fontSize: 'clamp(26px, 5vw, 54px)', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1, textTransform: 'uppercase' }}>
                KAZANMAYA HAZIR<br />MISINIZ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px, 2vw, 17px)', fontWeight: 500, marginBottom: 28, maxWidth: 400, marginInline: 'auto' }}>
                Sadakat programımıza katılın ve bugün ödül toplamaya başlayın. Ücretsiz!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => navigate('/home')} className="lbtn-dark">Panele Gir <ArrowRight size={16} /></button>
                <button onClick={() => navigate('/register')} className="lbtn-ghost">Ücretsiz Kayıt Ol</button>
              </div>
              <p style={{ marginTop: 18, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}>Kredi kartı gerekmez &bull; İstediğin zaman iptal et</p>
            </div>
          </div>
        </section>

        {/* Pink ticker */}
        <TickerStrip
          items={[
            {text:'NexReward ile Kazan',emoji:'💜'},{text:'Her Alışverişte Puan',emoji:'🛍️'},
            {text:'Ücretsiz Üyelik',emoji:'🎉'},{text:'Anında Ödül',emoji:'⚡'},
            {text:'Hemen Başla',emoji:'🚀'},{text:"Türkiye'nin #1",emoji:'🏆'},
          ]}
          direction="right" bg="#FF3E9D" textColor="white"
          borderTop={`2px solid #000`} speed={24}
        />

        {/* ══ FOOTER ══ */}
        <footer style={{ background: t.footerBg, borderTop: `2px solid ${t.border}`, padding: 'clamp(32px, 5vw, 56px) clamp(14px, 4vw, 64px)', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <img
              src="/logo.png"
              alt="NexReward"
              style={{ height: 'clamp(64px, 10vw, 120px)', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[['#features','Özellikler'],['#how','Nasıl Çalışır']].map(([href,label]) => (
                <a key={href} href={href} style={{ color: t.textMuted, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#a78bfa')}
                  onMouseLeave={e=>(e.currentTarget.style.color=t.textMuted)}>{label}</a>
              ))}
              <button onClick={()=>navigate('/login')} style={{ background:'none',border:'none',color:t.textMuted,fontWeight:700,fontSize:12,cursor:'pointer',padding:0,fontFamily:'inherit' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#a78bfa')}
                onMouseLeave={e=>(e.currentTarget.style.color=t.textMuted)}>Giriş</button>
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, margin: 0 }}>© 2026 NexReward · Daha fazla kazan, daha iyi yaşa.</p>
          </div>
        </footer>

      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        /* ── Animations ── */
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)}
        }
        @keyframes tickerLeft {
          from{transform:translateX(0)} to{transform:translateX(calc(-100% / 3))}
        }
        @keyframes tickerRight {
          from{transform:translateX(calc(-100% / 3))} to{transform:translateX(0)}
        }

        /* ── Hero headline ── */
        .hero-headline {
          font-weight: 900;
          font-size: clamp(38px, 9vw, 122px);
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: ${t.heroText};
          text-transform: uppercase;
        }

        /* ── Hero sticker (responsive) ── */
        .hero-sticker {
          width: clamp(42px, 7.5vw, 94px);
          height: clamp(42px, 7.5vw, 94px);
          font-size: clamp(18px, 3.2vw, 40px);
          border: 3px solid rgba(255,255,255,0.88);
          border-radius: 50%;
          margin: 0 clamp(3px, 0.6vw, 9px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          vertical-align: middle;
          box-shadow: 0 4px 0 rgba(0,0,0,0.38);
        }

        /* ── Inline pill ── */
        .inline-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          border-radius: 999px;
          padding: clamp(7px, 1.2vw, 12px) clamp(14px, 2.5vw, 26px);
          font-size: clamp(0.38em, 1.2vw, 0.54em);
          letter-spacing: 0.04em;
          border: 2.5px solid rgba(255,255,255,0.55);
          margin: 0 clamp(6px, 1vw, 12px);
          vertical-align: middle;
          box-shadow: 0 4px 0 rgba(0,0,0,0.32);
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap;
        }
        .inline-pill:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.32); }

        /* ── CTA corner stickers ── */
        .cta-corner-sticker {
          width: clamp(40px, 6vw, 56px);
          height: clamp(40px, 6vw, 56px);
          font-size: clamp(16px, 2.5vw, 24px);
          border-radius: 50%;
          border: 2.5px solid #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 0 rgba(0,0,0,0.35);
        }

        /* ── Side text ── */
        .side-text { display: none; }
        @media (min-width: 1024px) { .side-text { display: block; } }

        /* ── Nav links ── */
        .nav-links { display: none; }
        @media (min-width: 768px) { .nav-links { display: flex; } }

        /* ── Hamburger ── */
        .hamburger-btn { display: none !important; }
        @media (max-width: 767px) { .hamburger-btn { display: flex !important; } }

        /* ── Nav login ── */
        .nav-login-btn { display: none; }
        @media (min-width: 640px) { .nav-login-btn { display: inline-flex; } }

        /* ── Button label ── */
        .btn-label-short { display: none; }
        .btn-label-full  { display: inline; }
        @media (max-width: 400px) {
          .btn-label-short { display: inline; }
          .btn-label-full  { display: none; }
        }

        /* ── Banner body ── */
        .banner-body { flex: 1; min-width: 0; }
        .banner-divider {}
        @media (max-width: 520px) {
          .banner-body p { font-size: 13px !important; }
          .banner-body button { margin-top: 10px !important; }
          .banner-divider { display: none; }
        }

        /* ── Step arrows ── */
        .step-arrow { display: none; }
        @media (min-width: 768px) { .step-arrow { display: flex; } }

        /* ── Nav buttons ── */
        .lbtn-primary-sm {
          display: inline-flex; align-items: center; gap: 5px;
          background: linear-gradient(180deg,#a78bfa 0%,#6d28d9 100%);
          color: white; font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border,#2a2d50);
          border-radius: 13px; padding: 8px 15px; font-size: 12px;
          box-shadow: 0 4px 0 var(--l-shadow,#000);
          cursor: pointer; transition: opacity 0.15s, box-shadow 0.1s, transform 0.1s;
          white-space: nowrap;
        }
        .lbtn-primary-sm:hover  { opacity: 0.9; }
        .lbtn-primary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--l-shadow,#000); }

        .lbtn-secondary-sm {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--l-card-bg,#131629);
          color: var(--l-text,#f0edff); font-weight: 700; font-family: inherit;
          border: 2.5px solid var(--l-border,#2a2d50);
          border-radius: 13px; padding: 8px 15px; font-size: 12px;
          box-shadow: 0 4px 0 var(--l-shadow,#000);
          cursor: pointer; transition: background 0.15s, box-shadow 0.1s, transform 0.1s;
          white-space: nowrap;
        }
        .lbtn-secondary-sm:hover  { background: var(--l-tab-bg,#1e1a3a); }
        .lbtn-secondary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--l-shadow,#000); }

        .lbtn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1e1b4b; color: white; font-weight: 800; font-family: inherit;
          border: 2.5px solid white; border-radius: 16px;
          padding: clamp(11px,2vw,15px) clamp(22px,4vw,32px); font-size: clamp(14px,2vw,17px);
          box-shadow: 0 5px 0 rgba(0,0,0,0.4);
          cursor: pointer; transition: opacity 0.15s, transform 0.1s, box-shadow 0.1s;
        }
        .lbtn-dark:hover  { opacity: 0.88; }
        .lbtn-dark:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,0.4); }

        .lbtn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.18); color: white; font-weight: 800; font-family: inherit;
          border: 2.5px solid white; border-radius: 16px;
          padding: clamp(11px,2vw,15px) clamp(22px,4vw,32px); font-size: clamp(14px,2vw,17px);
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
