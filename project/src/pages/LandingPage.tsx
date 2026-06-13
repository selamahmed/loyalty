import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sun, Moon, Menu, X, Zap, Gift, Gamepad2, Target, Trophy, Users, Check, ChevronRight } from 'lucide-react';
import { DoodleField, SectionBadge } from '../components/neo/NeoBrutalDecor';
import AppLogo from '../components/AppLogo';
import StickerAccent from '../components/StickerAccent';
import { PageStickerBackdrop, SectionStickerDecor, StickerSectionDivider } from '../components/StickerDecor';
import {
  LANDING_BANNER_STICKERS,
  LANDING_LIFESTYLE_STICKERS,
  LANDING_CTA_STICKERS,
  LANDING_HERO_HEADLINE_SHAPES,
} from '../lib/pageStickers';
import { demoAvatarUrl } from '../lib/avatarCatalog';
import { useApp } from '../context/AppContext';

const HeroGroupComposition = React.lazy(() => import('../components/HeroGroupComposition'));

/* ─── Ticker strip ─────────────────────────────────────────── */
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
            <span style={{ color: textColor, opacity: 0.3, margin: '0 4px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Neo-brutalism SVG shapes ─────────────────────────────── */
type ShapeProps = { color: string; size?: number; opacity?: number; rotate?: number };
const NStar5 = ({ color, size = 100, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={{ position: 'absolute', top: -size * 0.18, right: -size * 0.18, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBolt = ({ color, size = 94, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ position: 'absolute', top: -size * 0.12, right: -size * 0.12, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,2 15,26 24,26 19,46 36,22 27,22" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const NDiamond = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none" style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="25,3 46,18 25,47 4,18" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NHeart = ({ color, size = 98, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M26 45C26 45 5 32 5 17C5 10 11 4 19 6C22 7 26 12 26 12C26 12 30 7 33 6C41 4 47 10 47 17C47 32 26 45 26 45Z" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBurst = ({ color, size = 102, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 54 54" fill="none" style={{ position: 'absolute', top: -size * 0.16, right: -size * 0.16, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19" fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const NStar4 = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M24 3 L28 20 L45 24 L28 28 L24 45 L20 28 L3 24 L20 20 Z" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

/* ─── Data ──────────────────────────────────────────────────── */
const features: { icon: React.ElementType; title: string; desc: string; color: string; stickerSeed: string; Shape: React.FC<ShapeProps>; sRotate: number }[] = [
  { icon: Zap,      title: 'Anında Ödüller',    desc: 'Her etkileşimde anında puan kazan.',             color: '#9122FF', stickerSeed: 'feat-bolt',   Shape: NBolt,    sRotate: 15  },
  { icon: Gamepad2, title: 'Eğlenceli Oyunlar', desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',  color: '#FF3E9D', stickerSeed: 'feat-game',   Shape: NStar5,   sRotate: -10 },
  { icon: Gift,     title: 'Özel Ödüller',      desc: 'Puanlarını harika ödüllerle değiştir.',          color: '#FF6B35', stickerSeed: 'feat-gift',   Shape: NHeart,   sRotate: 8   },
  { icon: Target,   title: 'Günlük Görevler',   desc: 'Günlük zorlukları tamamla, serini koru.',        color: '#56C8FF', stickerSeed: 'feat-target', Shape: NBurst,   sRotate: -12 },
  { icon: Trophy,   title: 'Liderlik Tablosu',  desc: 'Diğerleriyle yarış ve sıralamada yüksel.',       color: '#FFE500', stickerSeed: 'feat-trophy', Shape: NStar4,   sRotate: 20  },
  { icon: Users,    title: 'Sosyal Ödüller',    desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',      color: '#C8FF00', stickerSeed: 'feat-social', Shape: NDiamond, sRotate: -8  },
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
  { bg: '#FFE500', textColor: '#000', tag: '👥 TOPLULUK', headline: '50K+',  sub: 'Mutlu Kullanıcı',      body: 'Türkiye\'nin en hızlı büyüyen sadakat topluluğuna katılın. Her gün yeni üyeler NexReward\'la tanışıyor.', sticker: LANDING_BANNER_STICKERS[0], stickerSize: 92, stickerRotate: 12 },
  { bg: '#C8FF00', textColor: '#000', tag: '⚡ HIZ',       headline: 'ANINDA', sub: 'Ödül Sistemi',         body: 'Alışveriş yaptığınız anda puanlar hesabınıza geçer. Bekleme yok, gecikme yok — sadece anlık kazanç.', sticker: LANDING_BANNER_STICKERS[1], stickerSize: 84, stickerRotate: -10 },
  { bg: '#FF6B35', textColor: '#fff', tag: '💰 KAZANÇ',   headline: '2M+',    sub: 'Kazanılan Puan',       body: 'Kullanıcılarımız 2 milyondan fazla puan kazandı. Her alışverişiniz bir kazanç fırsatıdır.', sticker: LANDING_BANNER_STICKERS[2], stickerSize: 88, stickerRotate: 8 },
  { bg: '#FF3E9D', textColor: '#fff', tag: '🏆 BAŞARI',   headline: '#1',     sub: 'Türkiye\'nin Platformu', body: 'En iyi sadakat deneyimini yaşayın. Ödüller, mini oyunlar, liderlik tabloları — hepsi ücretsiz.', sticker: LANDING_BANNER_STICKERS[3], stickerSize: 96, stickerRotate: -8 },
];

const testimonials = [
  { name: 'Ayşe K.',      role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika bir platform!',                           stars: 5, color: '#9122FF', Shape: NBolt    },
  { name: 'Mehmet T.',    role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller gerçekten değerli. Kesinlikle tavsiye ederim.',                  stars: 5, color: '#56C8FF', Shape: NStar4   },
  { name: 'Zeynep A.',    role: 'Premium Üye',          text: 'Arkadaşlarımla liderlik tablosunda yarışmak çok keyifli! Her gün giriş yapıyorum.',                      stars: 5, color: '#FF3E9D', Shape: NDiamond },
  { name: 'Kemal Y.',     role: 'Düzenli Kullanıcı',   text: 'Puanlarımı harika ödüllere çevirdim. Ücretsiz olmasına rağmen kalitesi inanılmaz yüksek.',               stars: 5, color: '#FF6B35', Shape: NHeart   },
  { name: 'Selin M.',     role: 'Yeni Üye',             text: 'Kayıt olmak sadece 30 saniye sürdü ve hemen puan kazanmaya başladım. Çok pratik!',                       stars: 5, color: '#FFE500', Shape: NBurst   },
  { name: 'Caner D.',     role: 'Liderlik Lideri',      text: 'Geçen ay liderlik tablosunda 1. oldum! Ödülüm gerçekten elime geçti. Teşekkürler NexReward!',            stars: 5, color: '#C8FF00', Shape: NStar5   },
];

const steps = [
  { step: 1, emoji: '📝', title: 'Kayıt Ol',           desc: 'Saniyeler içinde ücretsiz hesap oluştur.',   color: '#9122FF', Shape: NBolt    },
  { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışveriş veya QR taramada puan kazan.', color: '#FF6B35', Shape: NStar5   },
  { step: 3, emoji: '🎮', title: 'Oyun Oyna',           desc: 'Mini oyunlar ve görevlerle bonus kazan.',    color: '#22c55e', Shape: NDiamond },
  { step: 4, emoji: '🎉', title: 'Ödülünü Al',          desc: 'Puanlarını dilediğin ödülle değiştir.',      color: '#FF3E9D', Shape: NHeart   },
];

/* ─── Main component ────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode: isDark, toggleTheme } = useApp();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, []);

  // HashRouter intercepts bare "#id" hrefs as route changes → use JS scroll instead
  const scrollTo = (id: string, closeMenu = false) => {
    if (closeMenu) setMenuOpen(false);
    // Small delay so mobile drawer closes before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, closeMenu ? 80 : 0);
  };

  const t = {
    pageBg:        isDark ? '#0F0720' : '#FFF8F0',
    heroText:      isDark ? '#ffffff' : '#000000',
    navBg:         isDark ? 'rgba(15,7,32,0.97)' : 'rgba(255,248,240,0.97)',
    cardBg:        isDark ? '#1E0F38' : '#ffffff',
    cardBg2:       isDark ? '#2A1550' : '#F5F0FF',
    textPrimary:   isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#C4B5D8' : '#333333',
    textMuted:     isDark ? '#8A7AA8' : '#666666',
    pillBg:        isDark ? 'rgba(200,255,0,0.15)' : '#C8FF00',
    footerBg:      isDark ? '#080414' : '#0F0720',
    footerText:    '#ffffff',
    howBg:         isDark ? '#1A0B30' : '#F0E8FF',
    cssVars: {
      '--l-border':  '#000000',
      '--l-shadow':  '#000000',
      '--l-card-bg': isDark ? '#1E0F38' : '#ffffff',
      '--l-text':    isDark ? '#ffffff' : '#000000',
      '--l-tab-bg':  isDark ? '#2A1550' : '#F5F0FF',
    } as React.CSSProperties,
  };

  const card = { background: t.cardBg, border: '3px solid #000', boxShadow: '0 6px 0 #000', borderRadius: 20 };

  return (
    <div style={{ background: t.pageBg, color: t.textPrimary, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.3s', position: 'relative', ...t.cssVars }}>
      <PageStickerBackdrop preset="landing-hero" />
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: t.navBg, backdropFilter: 'blur(20px)', borderBottom: '2.5px solid #000', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <AppLogo size={36} priority style={{ borderRadius: 10, border: '2px solid #000', boxShadow: '0 2px 0 #000' }} />
              <span style={{ fontWeight: 900, fontSize: 16, color: t.textPrimary, letterSpacing: '-0.02em' }}>NexReward</span>
            </div>

            {/* Desktop nav links — display controlled entirely by CSS .nav-links rule */}
            <div className="nav-links" style={{ alignItems: 'center', gap: 24 }}>
              {[['features','Özellikler'],['banners','Avantajlar'],['how','Nasıl Çalışır'],['testimonials','Yorumlar']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} aria-label={`${label} bölümüne git`}
                  style={{ color: t.textSecondary, fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: '0.06em', transition: 'color 0.15s', whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#9122FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={toggleTheme} aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '2.5px solid #000', background: t.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 #000', flexShrink: 0 }}>
                {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color="#7B6EF6" />}
              </button>

              {/* Desktop-only buttons */}
              <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => navigate('/login')} className="lbtn-secondary-sm">Giriş Yap</button>
                <button onClick={() => navigate('/admin-login')} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 11, cursor: 'pointer',
                  background: '#9122FF18', color: '#9122FF', border: '2.5px solid #9122FF',
                  fontWeight: 900, fontSize: 12, boxShadow: '0 3px 0 #6b19c0', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>🔐 Yönetici</button>
                <button onClick={() => navigate('/home')} className="lbtn-primary-sm">
                  Panele Gir <ArrowRight size={12} />
                </button>
              </div>

              {/* Hamburger */}
              <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                style={{ width: 36, height: 36, borderRadius: 10, border: '2.5px solid #000', background: t.cardBg, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 #000', flexShrink: 0 }}>
                {menuOpen ? <X size={18} color={t.textPrimary} /> : <Menu size={18} color={t.textPrimary} />}
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          {menuOpen && (
            <div style={{ background: t.navBg, borderTop: '2.5px solid #000', padding: '8px 20px 20px', boxShadow: '0 8px 0 rgba(0,0,0,0.18)' }}>
              {[['features','✦ Özellikler'],['banners','✦ Avantajlar'],['how','✦ Nasıl Çalışır'],['testimonials','✦ Yorumlar']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id, true)}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '13px 4px', color: t.textPrimary, fontWeight: 800, fontSize: 15, background: 'none', border: 'none', borderBottom: '1.5px solid rgba(128,128,128,0.12)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  {label}
                </button>
              ))}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="lbtn-secondary-sm" style={{ flex: 1, justifyContent: 'center', padding: '11px 12px' }}>Giriş Yap</button>
                  <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="lbtn-primary-sm" style={{ flex: 1, justifyContent: 'center', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>Kayıt Ol <ArrowRight size={13} /></button>
                </div>
                <button onClick={() => { navigate('/home'); setMenuOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg,#7B6EF6,#9122FF)', color: 'white', border: '2.5px solid #000', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 0 #000', fontFamily: 'inherit' }}>
                  Panele Gir <ArrowRight size={14} />
                </button>
                <button onClick={() => { navigate('/admin-login'); setMenuOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 16px', borderRadius: 12, cursor: 'pointer', background: '#9122FF18', color: '#9122FF', border: '2.5px solid #9122FF', fontWeight: 900, fontSize: 13, boxShadow: '0 3px 0 #6b19c0', fontFamily: 'inherit' }}>
                  🔐 Yönetici Girişi
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', padding: '56px 0 32px', overflow: 'hidden' }}>
          <DoodleField opacity={isDark ? 0.4 : 0.65} />
          <div className="hero-layout" style={{ padding: '0 clamp(20px,5vw,80px)', position: 'relative', zIndex: 1 }}>
            {/* Copy */}
            <div className="hero-copy">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8FF00', color: '#000', border: '2.5px solid #000', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', boxShadow: '3px 3px 0 #000', marginBottom: 28, transform: 'rotate(-1.5deg)' }}>
                🎉 WE ARE LIVE!
              </div>
              <h1 className="hero-headline font-display">
                <span className="hero-headline-line">
                  ALIŞVERİŞ
                  <StickerAccent seed={LANDING_HERO_HEADLINE_SHAPES[0]} variant="shape" size={30} rotate={-10} className="hero-headline-sticker" />
                </span>
                <span className="hero-headline-line hero-headline-line--accent" style={{ color: '#9122FF', WebkitTextStroke: isDark ? '2px #C8FF00' : 'none' }}>
                  <StickerAccent seed={LANDING_HERO_HEADLINE_SHAPES[1]} variant="shape" size={28} rotate={12} className="hero-headline-sticker" />
                  YAPARKEN
                </span>
                <span className="hero-headline-line">
                  PUAN KAZAN
                  <StickerAccent seed={LANDING_HERO_HEADLINE_SHAPES[2]} variant="shape" size={32} rotate={-8} className="hero-headline-sticker" />
                </span>
              </h1>
              <p style={{ marginTop: 20, color: t.textSecondary, fontWeight: 600, fontSize: 'clamp(14px,1.6vw,18px)', maxWidth: 480, lineHeight: 1.65 }}>
                Binlerce kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen. Tamamen ücretsiz.
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <button onClick={() => navigate('/register')} className="lbtn-hero-primary">Ücretsiz Başla <ArrowRight size={16} /></button>
                <button onClick={() => navigate('/login')} className="lbtn-hero-secondary">Giriş Yap</button>
              </div>
              {/* Stats chips */}
              <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[['50K+', 'Kullanıcı', '#9122FF'], ['2M+', 'Puan', '#FF3E9D'], ['10K+', 'Ödül', '#FF6B35']].map(([num, label, color]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.cardBg, border: '2.5px solid #000', borderRadius: 14, padding: '7px 14px', boxShadow: '3px 3px 0 #000' }}>
                    <span style={{ fontWeight: 900, fontSize: 16, color }}>{num}</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: t.textMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Art — Group sticker cluster (star centerpiece) */}
            <div className="hero-art" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(12px,3vw,24px)', minHeight: 280 }}>
              <Suspense fallback={<div style={{ width: '100%', maxWidth: 320, minHeight: 260 }} aria-hidden />}>
                <HeroGroupComposition />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ══ TICKER 1 ══ */}
        <TickerStrip items={tickerHero} direction="left" bg="#9122FF" textColor="#C8FF00" borderTop="3px solid #000" borderBottom="3px solid #000" speed={32} />

        <StickerSectionDivider />

        {/* ══ AVANTAJLAR (stacking banners — NO rotation on mobile) ══ */}
        <SectionStickerDecor preset="landing-banners">
        <section id="banners" style={{ padding: '72px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <SectionBadge label="AVANTAJLAR" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              NEDEN <span style={{ color: '#FF3E9D' }}>NEXREWARD?</span>
            </h2>
          </div>

          {banners.map((b, i) => (
            <div key={i} className="banner-card" style={{
              position: 'relative', background: b.bg,
              border: '3px solid #000', borderRadius: 22, boxShadow: '6px 6px 0 #000',
              padding: 'clamp(24px,4vw,44px) clamp(20px,5vw,56px)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', flexWrap: 'wrap',
              gap: 'clamp(16px,4vw,48px)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '6px 12px 0 #000'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0 #000'; }}>
              <StickerAccent
                group={b.sticker}
                variant="colorful"
                size={b.stickerSize}
                rotate={b.stickerRotate}
                style={{ position: 'absolute', bottom: '10%', right: 'clamp(12px, 4vw, 28px)', zIndex: 2, opacity: 0.95 }}
              />
              <StickerAccent
                seed={`banner-accent-${i}`}
                variant="shape"
                size={Math.round(b.stickerSize * 0.45)}
                rotate={-14 + i * 6}
                style={{ position: 'absolute', top: '12%', left: 'clamp(10px, 3vw, 24px)', zIndex: 2, opacity: 0.8 }}
              />
              {/* Tag */}
              <div style={{ position: 'absolute', top: 14, right: 18, background: 'rgba(0,0,0,0.13)', color: b.textColor, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 900, letterSpacing: '0.07em' }}>{b.tag}</div>
              {/* Big number */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: 'Archivo Black, sans-serif', fontWeight: 900, color: b.textColor, lineHeight: 0.9, fontSize: 'clamp(44px,8vw,100px)', letterSpacing: '-0.04em' }}>{b.headline}</div>
                <div style={{ fontWeight: 800, color: b.textColor, fontSize: 'clamp(12px,1.6vw,18px)', marginTop: 4, opacity: 0.7 }}>{b.sub}</div>
              </div>
              {/* Divider */}
              <div className="banner-divider" style={{ width: 3, alignSelf: 'stretch', minHeight: 56, background: b.textColor === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)', borderRadius: 99, flexShrink: 0 }} />
              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: b.textColor, fontSize: 'clamp(13px,1.7vw,18px)', lineHeight: 1.55, margin: '0 0 14px', opacity: 0.88 }}>{b.body}</p>
                <button onClick={() => navigate('/register')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, position: 'relative',
                  background: b.textColor === '#000' ? '#000' : '#fff', color: b.textColor === '#000' ? b.bg : '#000',
                  border: `2.5px solid ${b.textColor === '#000' ? '#000' : '#fff'}`,
                  borderRadius: 13, padding: '9px 20px', fontWeight: 900, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                }}>
                  Katıl <ArrowRight size={13} />
                  <StickerAccent seed={`banner-btn-${i}`} size={22} rotate={12}
                    style={{ position: 'absolute', top: -10, right: -8 }} />
                </button>
              </div>
            </div>
          ))}
        </section>
        </SectionStickerDecor>

        {/* ══ FEATURES ══ */}
        <SectionStickerDecor preset="landing-features">
        <section id="features" style={{ padding: '72px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge label="ÖZELLİKLER" bg="#56C8FF" />
            <h2 className="font-display" style={{ fontSize: 'clamp(28px,5vw,60px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
              NEDEN BİZİ <span style={{ color: '#FF3E9D' }}>SEVECEKSİNİZ</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative', borderRadius: 20, overflow: 'hidden',
                    background: f.color, border: '3px solid #000',
                    boxShadow: hovered === i ? '8px 8px 0 #000' : '5px 5px 0 #000',
                    transform: hovered === i ? 'translateY(-5px) rotate(-0.5deg)' : 'none',
                    transition: 'all 0.15s ease', cursor: 'pointer',
                  }}>
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)' }}>
                    <StickerAccent
                      seed={f.stickerSeed}
                      variant="shape"
                      size={118}
                      rotate={-4}
                    />
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 12, background: '#fff', border: '2.5px solid #000', boxShadow: '3px 3px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={17} color={f.color} />
                    </div>
                  </div>
                  <div style={{ position: 'relative', padding: '18px 20px 22px', background: t.cardBg, borderTop: '3px solid #000' }}>
                    <h3 className="font-display" style={{ fontWeight: 900, fontSize: 14, color: t.textPrimary, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.01em' }}>{f.title}</h3>
                    <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: '0 0 14px', lineHeight: 1.55 }}>{f.desc}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 900, fontSize: 12, color: f.color, background: isDark ? 'rgba(255,255,255,0.06)' : `${f.color}18`, padding: '4px 10px', borderRadius: 8, border: `1.5px solid ${f.color}` }}>
                      Keşfet <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </SectionStickerDecor>

        <StickerSectionDivider />

        {/* ══ TICKER 2 ══ */}
        <TickerStrip
          items={[{text:'KAZAN',emoji:'💰'},{text:'ÖDÜL',emoji:'🎁'},{text:'EĞLEN',emoji:'🎮'},{text:'PAYLAŞ',emoji:'💜'},{text:'YÜKSEL',emoji:'🚀'},{text:'KEŞFET',emoji:'🔮'},{text:'BAŞAR',emoji:'🏆'},{text:'NEXREWARD',emoji:'⭐'}]}
          direction="right" bg={isDark ? '#2A1550' : '#C8FF00'} textColor={isDark ? '#C8FF00' : '#000'}
          borderTop="2.5px solid #000" borderBottom="2.5px solid #000" speed={24}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" style={{ padding: '80px clamp(16px,4vw,64px)', background: t.howBg, borderTop: '3px solid #000', borderBottom: '3px solid #000', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <SectionBadge label="NASIL ÇALIŞIR" bg="#9122FF" color="#C8FF00" />
              <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
                4 ADIMDA <span style={{ color: '#9122FF' }}>BAŞLA</span>
              </h2>
            </div>
            <div className="steps-grid">
              {steps.map((item, i) => (
                <div key={i} style={{ position: 'relative', padding: '28px 20px 24px', borderRadius: 20, overflow: 'hidden', textAlign: 'center', background: t.cardBg, border: '3px solid #000', boxShadow: '0 6px 0 #000' }}>
                  <item.Shape color={item.color} size={80} opacity={isDark ? 0.14 : 0.16} rotate={12} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', margin: '0 auto 12px', background: item.color, border: '2.5px solid #000', boxShadow: '0 3px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: item.color === '#FFE500' ? '#000' : 'white', fontSize: 14 }}>{item.step}</div>
                    <div style={{ fontSize: 34, marginBottom: 10, lineHeight: 1 }}>{item.emoji}</div>
                    <h3 style={{ fontWeight: 900, fontSize: 14, color: t.textPrimary, margin: '0 0 8px' }}>{item.title}</h3>
                    <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                  {/* Arrow connector */}
                  {i < steps.length - 1 && (
                    <div className="step-arrow" style={{ position: 'absolute', top: '50%', right: -16, zIndex: 10, transform: 'translateY(-50%)', color: '#9122FF', background: t.howBg, borderRadius: '50%', padding: 3, border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}>
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" style={{ padding: '80px clamp(16px,4vw,64px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge label="YORUMLAR" bg={isDark ? '#9122FF' : '#FFE500'} color={isDark ? '#C8FF00' : '#000'} />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              KULLANICILARIMIZ <span style={{ color: '#9122FF' }}>NE DİYOR?</span>
            </h2>
            <p style={{ color: t.textMuted, fontWeight: 600, fontSize: 14, margin: '12px 0 0' }}>
              {testimonials.length}+ gerçek kullanıcı yorumu
            </p>
          </div>

          {/* Rating summary bar */}
          <div style={{ ...card, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 48, color: '#f59e0b', margin: 0, lineHeight: 1 }}>4.9</p>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', margin: '4px 0' }}>
                {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, margin: 0 }}>Ortalama puan</p>
            </div>
            <div style={{ width: 2, height: 60, background: 'var(--dark-border,#e5e5e5)', flexShrink: 0 }} className="rating-divider" />
            <div style={{ flex: 1, minWidth: 180 }}>
              {[5,4,3].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, flexShrink: 0, width: 12, textAlign: 'right' }}>{n}</span>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <div style={{ flex: 1, height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#f59e0b', borderRadius: 99, width: n === 5 ? '92%' : n === 4 ? '6%' : '2%', transition: 'width 0.6s' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, flexShrink: 0 }}>{n === 5 ? '92%' : n === 4 ? '6%' : '2%'}</span>
                </div>
              ))}
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['✅ Güvenilir','#22c55e'],['⚡ Hızlı','#9122FF'],['🎁 Ödüllü','#FF6B35']].map(([label, color]) => (
                  <span key={label} style={{ padding: '5px 12px', borderRadius: 999, border: `2px solid ${color}`, color, fontWeight: 900, fontSize: 11 }}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {testimonials.map((t2, i) => (
              <div key={i} style={{
                ...card, position: 'relative', padding: '26px 22px 22px', overflow: 'hidden',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 0 #000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #000'; }}>
                <t2.Shape color={t2.color} size={80} opacity={isDark ? 0.1 : 0.12} rotate={i * 12} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Quote mark */}
                  <div style={{ fontSize: 48, lineHeight: 1, color: t2.color, fontWeight: 900, marginBottom: 4, opacity: 0.35 }}>"</div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                    {[...Array(t2.stars)].map((_, s) => <Star key={s} size={13} fill="#FBBF24" color="#FBBF24" />)}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>{t2.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: `2.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e5e5e5'}` }}>
                    <img src={demoAvatarUrl(t2.name)} alt={t2.name} width={42} height={42} loading="lazy" decoding="async" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #000', flexShrink: 0, boxShadow: '0 3px 0 #000' }} />
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 13, color: t.textPrimary, margin: 0 }}>{t2.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 500, color: t.textMuted, margin: '2px 0 0' }}>{t2.role}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, background: t2.color, border: '2px solid #000', boxShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={13} color={t2.color === '#FFE500' || t2.color === '#C8FF00' ? '#000' : '#fff'} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ LIFESTYLE GRID ══ */}
        <section style={{ padding: '0 clamp(16px,4vw,64px) 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionBadge label="YAŞAM TARZI" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              KAZANMAK BİR <span style={{ color: '#9122FF' }}>YAŞAM BİÇİMİ</span>
            </h2>
          </div>
          <div className="lifestyle-grid">
            {([
              { bg: '#9122FF', badge: '⭐ ALIŞVERİŞ', badgeBg: '#FFE500', text: 'Her alışverişte puan kazan, ödüllerle zenginleş.', sticker: LANDING_LIFESTYLE_STICKERS[0], stickerSize: 150, tall: true },
              { bg: '#C8FF00', badge: '⚡ ANINDA',    badgeBg: '#000',    text: 'Ödülünü saniyeler içinde al.', sticker: LANDING_LIFESTYLE_STICKERS[1], stickerSize: 90, tall: false, textColor: '#000' },
              { bg: '#FF3E9D', badge: '🎮 OYUN',      badgeBg: '#fff',    text: 'Eğlenerek kazan.', sticker: LANDING_LIFESTYLE_STICKERS[2], stickerSize: 90, tall: false },
              { bg: '#56C8FF', badge: '👥 TOPLULUK',  badgeBg: '#FF6B35', text: '50.000+ mutlu kullanıcıyla birlikte büyüyoruz.', sticker: LANDING_LIFESTYLE_STICKERS[3], stickerSize: 90, tall: false },
            ] as const).map((lcard, i) => (
              <div key={i} className={`lifestyle-card${lcard.tall ? ' lifestyle-card-tall' : ''}`}
                style={{ background: lcard.bg, border: '3px solid #000', borderRadius: 20, boxShadow: '6px 6px 0 #000', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '10px 10px 0 #000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0 #000'; }}>
                <StickerAccent
                  seed={`lifestyle-accent-${i}`}
                  variant="shape"
                  size={lcard.tall ? 44 : 32}
                  rotate={10 - i * 4}
                  style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px 0 8px' }}>
                  <StickerAccent
                    group={lcard.sticker}
                    variant="colorful"
                    size={lcard.stickerSize}
                    rotate={-6 + i * 3}
                  />
                </div>
                <div style={{ padding: '14px 18px 20px', background: 'rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: lcard.badgeBg, color: lcard.badgeBg === '#fff' ? '#000' : (lcard.badgeBg === '#000' ? '#C8FF00' : '#000'), borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 900, border: '2px solid #000', marginBottom: 8, boxShadow: '2px 2px 0 #000' }}>{lcard.badge}</div>
                  <p style={{ color: (lcard as { textColor?: string }).textColor ?? '#fff', fontWeight: 800, fontSize: lcard.tall ? 'clamp(13px,1.6vw,17px)' : 13, margin: 0, lineHeight: 1.4 }}>{lcard.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: '0 clamp(16px,4vw,64px) 88px' }}>
          <SectionStickerDecor preset="landing-cta">
          <div style={{
            position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center',
            padding: 'clamp(52px,8vw,80px) clamp(24px,6vw,80px)',
            borderRadius: 26, overflow: 'hidden',
            background: '#9122FF',
            border: '3px solid #000', boxShadow: '0 10px 0 #000',
          }}>
            <StickerAccent group={LANDING_CTA_STICKERS.large[0]} variant="colorful" size={80} rotate={-14}
              style={{ position: 'absolute', top: '6%', left: '4%', zIndex: 2 }} />
            <StickerAccent group={LANDING_CTA_STICKERS.large[1]} variant="colorful" size={72} rotate={10}
              style={{ position: 'absolute', bottom: '8%', right: '5%', zIndex: 2 }} />
            <StickerAccent seed="cta-accent-tl" variant="shape" size={52} rotate={8}
              style={{ position: 'absolute', top: '14%', right: '6%', zIndex: 2, opacity: 0.85 }} />
            <StickerAccent seed="cta-accent-bl" variant="shape" size={48} rotate={-6}
              style={{ position: 'absolute', bottom: '12%', left: '6%', zIndex: 2, opacity: 0.85 }} />
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 'clamp(80px,18vw,220px)', fontWeight: 900, color: 'rgba(0,0,0,0.06)', whiteSpace: 'nowrap', letterSpacing: '-0.04em', userSelect: 'none' }}>KAZAN</span>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.18)', color: 'white', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '6px 18px', fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 20 }}>✦ HEMEN BAŞLA</div>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px,5.5vw,58px)', fontWeight: 900, color: 'white', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.05, textTransform: 'uppercase' }}>
                KAZANMAYA HAZIR<br />MISINIZ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(14px,2vw,17px)', fontWeight: 500, marginBottom: 32, maxWidth: 400, marginInline: 'auto', lineHeight: 1.6 }}>
                Sadakat programımıza katılın ve bugün ödül toplamaya başlayın. Tamamen ücretsiz!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                <button onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', background: '#C8FF00', color: '#000', border: '2.5px solid #000', borderRadius: 16, padding: 'clamp(12px,2vw,16px) clamp(24px,4vw,36px)', fontWeight: 900, fontSize: 'clamp(14px,2vw,17px)', boxShadow: '0 5px 0 #000', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ücretsiz Kayıt Ol <ArrowRight size={16} />
                  <StickerAccent seed="cta-btn-register" size={28} rotate={12} style={{ position: 'absolute', top: -12, right: -10 }} />
                </button>
                <button onClick={() => navigate('/home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', background: '#fff', color: '#9122FF', border: '2.5px solid #000', borderRadius: 16, padding: 'clamp(12px,2vw,16px) clamp(24px,4vw,36px)', fontWeight: 900, fontSize: 'clamp(14px,2vw,17px)', boxShadow: '0 5px 0 #000', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Panele Gir
                  <StickerAccent seed="cta-btn-panel" size={24} rotate={-8} style={{ position: 'absolute', bottom: -10, left: -8 }} />
                </button>
              </div>
              <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 500 }}>Kredi kartı gerekmez &bull; İstediğin zaman iptal et</p>
            </div>
          </div>
          </SectionStickerDecor>
        </section>
        <footer style={{ background: t.footerBg, borderTop: '3px solid #000', padding: 'clamp(36px,5vw,56px) clamp(20px,4vw,64px)', color: t.footerText }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 36, marginBottom: 36 }}>
              <div>
                <AppLogo size={72} inverted style={{ marginBottom: 12, height: 'clamp(48px,6vw,68px)', width: 'clamp(48px,6vw,68px)' }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.62)', maxWidth: 240, lineHeight: 1.65, margin: 0 }}>
                  Daha fazla kazan, daha iyi yaşa.<br />Türkiye'nin #1 sadakat platformu.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {['🐦 Twitter','📸 Instagram','💼 LinkedIn'].map(s => (
                    <span key={s} style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 44, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase' }}>Platform</p>
                  {[['features','Özellikler'],['how','Nasıl Çalışır'],['banners','Avantajlar'],['testimonials','Yorumlar']].map(([id,label]) => (
                    <button key={id} onClick={() => scrollTo(id)} aria-label={`${label} bölümüne git`}
                      style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: 9, textAlign: 'left', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C8FF00')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>{label}</button>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase' }}>Hesap</p>
                  {[['Giriş Yap','/login'],['Kayıt Ol','/register'],['Panele Gir','/home'],['Admin Girişi','/admin-login']].map(([label,path]) => (
                    <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: 9, textAlign: 'left', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C8FF00')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>{label}</button>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase' }}>Yasal</p>
                  {[['Kullanım Şartları','/terms'],['Gizlilik Politikası','/privacy']].map(([label,path]) => (
                    <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: 9, textAlign: 'left', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C8FF00')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.48)', margin: 0 }}>© 2026 NexReward. Tüm hakları saklıdır.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Şartlar</button>
                <button type="button" onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Gizlilik</button>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#9122FF', color: '#C8FF00', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 900, boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>⭐ NEXREWARD</div>
            </div>
          </div>
        </footer>

      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes tickerLeft  { from{transform:translateX(0)} to{transform:translateX(calc(-100% / 3))} }
        @keyframes tickerRight { from{transform:translateX(calc(-100% / 3))} to{transform:translateX(0)} }

        /* ── Hero ── */
        .hero-layout { display:flex; flex-direction:column; align-items:center; gap:32px; text-align:center; }
        .hero-copy  { max-width:640px; }
        .hero-art   { width:100%; max-width:320px; }
        @media (min-width: 900px) {
          .hero-layout { flex-direction:row; align-items:center; justify-content:space-between; text-align:left; gap:48px; }
          .hero-copy   { flex:1; max-width:none; }
          .hero-art    { flex:0 0 38%; max-width:380px; }
        }

        .hero-headline {
          font-weight:900; font-size:clamp(42px,9vw,120px);
          line-height:0.97; letter-spacing:-0.04em;
          color:${t.heroText}; text-transform:uppercase; margin:0;
        }
        .hero-headline-line {
          display:flex; align-items:center; justify-content:center;
          gap:clamp(6px,1.5vw,14px);
        }
        .hero-headline-sticker { flex-shrink:0; }
        @media (min-width:900px) {
          .hero-headline-line { justify-content:flex-start; }
        }

        /* ── Nav buttons ── */
        .lbtn-hero-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:#9122FF; color:#C8FF00; font-weight:900; font-family:inherit;
          border:3px solid #000; border-radius:16px; padding:13px 26px; font-size:15px;
          box-shadow:0 5px 0 #000; cursor:pointer; transition:transform 0.1s,box-shadow 0.1s; white-space:nowrap;
        }
        .lbtn-hero-primary:active { transform:translateY(4px); box-shadow:0 1px 0 #000; }

        .lbtn-hero-secondary {
          display:inline-flex; align-items:center; gap:8px;
          background:${t.cardBg}; color:${t.textPrimary}; font-weight:900; font-family:inherit;
          border:3px solid #000; border-radius:16px; padding:13px 26px; font-size:15px;
          box-shadow:0 5px 0 #000; cursor:pointer; transition:transform 0.1s,box-shadow 0.1s; white-space:nowrap;
        }
        .lbtn-hero-secondary:active { transform:translateY(4px); box-shadow:0 1px 0 #000; }

        .lbtn-primary-sm {
          display:inline-flex; align-items:center; gap:5px;
          background:#9122FF; color:#C8FF00; font-weight:700; font-family:inherit;
          border:2.5px solid #000; border-radius:12px; padding:8px 15px; font-size:12px;
          box-shadow:0 4px 0 #000; cursor:pointer; transition:transform 0.1s,box-shadow 0.1s; white-space:nowrap;
        }
        .lbtn-primary-sm:active { transform:translateY(3px); box-shadow:0 1px 0 #000; }

        .lbtn-secondary-sm {
          display:inline-flex; align-items:center; gap:5px;
          background:var(--l-card-bg,#fff); color:var(--l-text,#000); font-weight:700; font-family:inherit;
          border:2.5px solid #000; border-radius:12px; padding:8px 15px; font-size:12px;
          box-shadow:0 4px 0 #000; cursor:pointer; transition:transform 0.1s,box-shadow 0.1s; white-space:nowrap;
        }
        .lbtn-secondary-sm:active { transform:translateY(3px); box-shadow:0 1px 0 #000; }

        /* ── CTA corner sticker ── */
        .cta-corner-sticker {
          width:clamp(40px,5.5vw,56px); height:clamp(40px,5.5vw,56px);
          font-size:clamp(16px,2.5vw,24px); border-radius:50%;
          border:2.5px solid #fff; display:inline-flex; align-items:center;
          justify-content:center; box-shadow:0 4px 0 rgba(0,0,0,0.3);
        }

        /* ── Nav visibility ── */
        .nav-links { display:none; }
        @media (min-width:768px) { .nav-links { display:flex; align-items:center; gap:24px; } }

        .hamburger-btn      { display:none !important; }
        @media (max-width:767px) { .hamburger-btn { display:flex !important; } }

        .nav-desktop-actions { display:flex; }
        @media (max-width:767px) { .nav-desktop-actions { display:none !important; } }

        .nav-logo-text { display:none; }

        /* ── Banners ── */
        .banner-divider { }
        @media (max-width:500px) { .banner-divider { display:none; } }

        /* ── Steps grid ── */
        .steps-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:18px; }
        .step-arrow { display:none; }
        @media (min-width:768px) { .step-arrow { display:flex; } }

        /* ── Testimonials rating divider ── */
        @media (max-width:480px) { .rating-divider { display:none; } }

        /* ── Lifestyle grid ── */
        .lifestyle-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .lifestyle-card     { min-height:190px; }
        .lifestyle-card-tall{ grid-row:span 2; min-height:400px; }
        @media (min-width:768px) {
          .lifestyle-grid { grid-template-columns:5fr 4fr 3fr; grid-template-rows:1fr 1fr; }
        }
        @media (max-width:500px) {
          .lifestyle-grid { grid-template-columns:1fr; }
          .lifestyle-card-tall { grid-row:span 1; min-height:240px; }
          .lifestyle-card      { min-height:160px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
