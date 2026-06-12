import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sun, Moon, Menu, X, Zap, Gift, Gamepad2, Target, Trophy, Users } from 'lucide-react';
import {
  HeroMascot, SpeechBubble,
  GiftDoodle, PointsBolt, GameDoodle, SocialDoodle,
  featureIllustrations,
} from '../components/neo/NeoBrutalIllustrations';
import { DoodleField, SectionBadge } from '../components/neo/NeoBrutalDecor';

/* ═══════════════════════════════════════════════════════════════
   TICKER STRIP
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
            <span style={{ color: textColor, opacity: 0.3, margin: '0 4px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEO-BRUTALISM SVG SHAPES
═══════════════════════════════════════════════════════════════ */
type ShapeProps = { color: string; size?: number; opacity?: number; rotate?: number };

const NStar5 = ({ color, size = 100, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none"
    style={{ position: 'absolute', top: -size * 0.18, right: -size * 0.18, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBolt = ({ color, size = 94, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', top: -size * 0.12, right: -size * 0.12, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="28,2 15,26 24,26 19,46 36,22 27,22"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const NDiamond = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="25,3 46,18 25,47 4,18"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NHeart = ({ color, size = 98, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M26 45C26 45 5 32 5 17C5 10 11 4 19 6C22 7 26 12 26 12C26 12 30 7 33 6C41 4 47 10 47 17C47 32 26 45 26 45Z"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const NBurst = ({ color, size = 102, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 54 54" fill="none"
    style={{ position: 'absolute', top: -size * 0.16, right: -size * 0.16, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <polygon points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19"
      fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const NStar4 = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', top: -size * 0.14, right: -size * 0.14, opacity, pointerEvents: 'none', transform: `rotate(${rotate}deg)`, zIndex: 0 }}>
    <path d="M24 3 L28 20 L45 24 L28 28 L24 45 L20 28 L3 24 L20 20 Z"
      fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
type FeatureIllus = keyof typeof featureIllustrations;

const features: {
  icon: React.FC<{ size: number; color?: string }>; title: string; desc: string; color: string;
  illus: FeatureIllus; Shape: React.FC<ShapeProps>; sRotate: number;
}[] = [
  { icon: Zap,      title: 'Anında Ödüller',    desc: 'Her etkileşimde anında puan kazan.',             color: '#9122FF', illus: 'bolt',   Shape: NBolt,    sRotate: 15  },
  { icon: Gamepad2, title: 'Eğlenceli Oyunlar', desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.',  color: '#FF3E9D', illus: 'game',   Shape: NStar5,   sRotate: -10 },
  { icon: Gift,     title: 'Özel Ödüller',      desc: 'Puanlarını harika ödüllerle değiştir.',           color: '#FF6B35', illus: 'gift',   Shape: NHeart,   sRotate: 8   },
  { icon: Target,   title: 'Günlük Görevler',   desc: 'Günlük zorlukları tamamla, serini koru.',         color: '#56C8FF', illus: 'target', Shape: NBurst,   sRotate: -12 },
  { icon: Trophy,   title: 'Liderlik Tablosu',  desc: 'Diğerleriyle yarış ve sıralamada yüksel.',        color: '#FFE500', illus: 'trophy', Shape: NStar4,   sRotate: 20  },
  { icon: Users,    title: 'Sosyal Ödüller',    desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',       color: '#C8FF00', illus: 'social', Shape: NDiamond, sRotate: -8  },
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
    bg: '#FFE500', textColor: '#000', rotate: -1.2,
    tag: '👥 TOPLULUK', headline: '50.000+', sub: 'Mutlu Kullanıcı',
    body: 'Türkiye\'nin en hızlı büyüyen sadakat topluluğuna katılın. Her gün yeni üyeler NexReward\'la tanışıyor.',
  },
  {
    bg: '#C8FF00', textColor: '#000', rotate: 0.8,
    tag: '⚡ HIZ', headline: 'ANINDA', sub: 'Ödül Sistemi',
    body: 'Alışveriş yaptığınız anda puanlar hesabınıza geçer. Bekleme yok, gecikme yok — sadece anlık kazanç.',
  },
  {
    bg: '#FF6B35', textColor: '#fff', rotate: -0.6,
    tag: '💰 KAZANÇ', headline: '2M+', sub: 'Kazanılan Puan',
    body: 'Kullanıcılarımız 2 milyondan fazla puan kazandı. Her alışverişiniz bir kazanç fırsatıdır.',
  },
  {
    bg: '#FF3E9D', textColor: '#fff', rotate: 1.0,
    tag: '🏆 BAŞARI', headline: '#1', sub: 'Türkiye\'nin Platformu',
    body: 'En iyi sadakat deneyimini yaşayın. Ödüller, mini oyunlar, liderlik tabloları — hepsi ücretsiz.',
  },
];

const testimonials = [
  { name: 'Ayşe K.',   role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika bir platform!', stars: 5, photo: 'https://i.pravatar.cc/80?img=47' },
  { name: 'Mehmet T.', role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller gerçekten değerli. Kesinlikle tavsiye ederim.', stars: 5, photo: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Zeynep A.', role: 'Premium Üye',          text: 'Arkadaşlarımla liderlik tablosunda yarışmak çok keyifli! Her gün giriş yapıyorum.', stars: 5, photo: 'https://i.pravatar.cc/80?img=23' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = {
    pageBg:        isDark ? '#1A0A2E' : '#FFF8F0',
    heroText:      isDark ? '#ffffff' : '#000000',
    navBg:         isDark ? 'rgba(26,10,46,0.96)' : 'rgba(255,248,240,0.96)',
    cardBg:        isDark ? '#2A1045' : '#ffffff',
    cardBg2:       isDark ? '#351A58' : '#F5F0FF',
    border:        '#000000',
    shadow:        '#000000',
    textPrimary:   isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#C4B5D8' : '#444444',
    textMuted:     isDark ? '#9A8AB8' : '#666666',
    pillBg:        isDark ? 'rgba(200,255,0,0.15)' : '#C8FF00',
    footerBg:      isDark ? '#120820' : '#FFF8F0',
    howBg:         isDark ? '#2A1045' : '#F0E8FF',
    cssVars: {
      '--l-border':  '#000000',
      '--l-shadow':  '#000000',
      '--l-card-bg': isDark ? '#2A1045' : '#ffffff',
      '--l-text':    isDark ? '#ffffff' : '#000000',
      '--l-tab-bg':  isDark ? '#351A58' : '#F5F0FF',
    } as React.CSSProperties,
  };

  return (
    <div style={{ background: t.pageBg, color: t.textPrimary, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.3s', ...t.cssVars }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: t.navBg, backdropFilter: 'blur(18px)',
          borderBottom: `2.5px solid #000`,
          transition: 'background 0.3s',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <img src="/logo.png" alt="NexReward" style={{ height: 38, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />

            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {[['#features','Özellikler'],['#banners','Avantajlar'],['#how','Nasıl Çalışır'],['#testimonials','Yorumlar']].map(([href, label]) => (
                <a key={href} href={href} style={{ color: t.textSecondary, fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: '0.06em', transition: 'color 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#9122FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>
                  {label.toUpperCase()}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setIsDark(!isDark)}
                style={{ width: 36, height: 36, borderRadius: '50%', border: `2.5px solid #000`, background: t.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 #000`, flexShrink: 0, transition: 'transform 0.1s' }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 #000'; }}>
                {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color="#7B6EF6" />}
              </button>
              <button onClick={() => navigate('/login')} className="lbtn-secondary-sm nav-login-btn">Giriş Yap</button>
              <button onClick={() => navigate('/home')} className="lbtn-primary-sm">
                <span className="btn-label-full">Panele Gir</span>
                <span className="btn-label-short">Panel</span>
                <ArrowRight size={12} />
              </button>
              <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 36, height: 36, borderRadius: 10, border: `2.5px solid #000`, background: t.cardBg, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 #000`, flexShrink: 0 }}>
                {menuOpen ? <X size={16} color={t.textPrimary} /> : <Menu size={16} color={t.textPrimary} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div style={{ background: t.navBg, borderTop: `2px solid #000`, padding: '12px 24px 18px' }}>
              {[['#features','Özellikler'],['#banners','Avantajlar'],['#how','Nasıl Çalışır'],['#testimonials','Yorumlar']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '11px 0', color: t.textPrimary, fontWeight: 700, fontSize: 15, textDecoration: 'none', borderBottom: `1.5px solid rgba(0,0,0,0.1)` }}>
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="lbtn-secondary-sm" style={{ flex: 1, justifyContent: 'center' }}>Giriş Yap</button>
                <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="lbtn-primary-sm" style={{ flex: 1, justifyContent: 'center' }}>Kayıt Ol <ArrowRight size={12} /></button>
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', padding: '56px 0 32px', overflow: 'hidden' }}>
          <DoodleField opacity={isDark ? 0.45 : 0.7} />

          <div className="hero-layout" style={{ padding: '0 clamp(20px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
            {/* Copy */}
            <div className="hero-copy">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#C8FF00', color: '#000', border: '2.5px solid #000',
                borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.08em', boxShadow: '3px 3px 0 #000',
                marginBottom: 28, transform: 'rotate(-1.5deg)',
              }}>🎉 WE ARE LIVE!</div>

              <h1 className="hero-headline font-display">
                <span style={{ display: 'block' }}>ALIŞVERİŞ</span>
                <span style={{ display: 'block', color: '#9122FF', WebkitTextStroke: isDark ? '2px #C8FF00' : 'none' }}>YAPARKEN</span>
                <span style={{ display: 'block' }}>PUAN KAZAN</span>
              </h1>

              <p style={{ marginTop: 20, color: t.textSecondary, fontWeight: 600, fontSize: 'clamp(14px, 1.6vw, 18px)', maxWidth: 480, lineHeight: 1.65 }}>
                Binlerce kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen. Tamamen ücretsiz.
              </p>

              <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                <button onClick={() => navigate('/register')} className="lbtn-hero-primary">
                  Ücretsiz Başla <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/login')} className="lbtn-hero-secondary">
                  Giriş Yap
                </button>
              </div>

              <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[['50K+', 'Kullanıcı', '#9122FF'], ['2M+', 'Puan', '#FF3E9D'], ['10K+', 'Ödül', '#FF6B35']].map(([num, label, color]) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: t.cardBg, border: '2.5px solid #000', borderRadius: 14,
                    padding: '8px 16px', boxShadow: '3px 3px 0 #000',
                  }}>
                    <span style={{ fontWeight: 900, fontSize: 17, color, fontFamily: 'Archivo Black, sans-serif' }}>{num}</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: t.textMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Art */}
            <div className="hero-art" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', inset: '-8%',
                background: isDark ? 'rgba(145,34,255,0.18)' : '#F0E8FF',
                borderRadius: '50%', border: '3px solid #000',
                boxShadow: '8px 8px 0 #000',
              }} />
              <HeroMascot size={340} style={{ position: 'relative', zIndex: 1, maxWidth: '100%', height: 'auto' }} />
              <SpeechBubble
                bg="#9122FF" color="#C8FF00" tail="right"
                style={{ position: 'absolute', bottom: '10%', right: '-2%', transform: 'rotate(3deg)', zIndex: 2, fontSize: 13 }}>
                +500 PUAN! ⚡
              </SpeechBubble>
            </div>
          </div>
        </section>

        {/* ══ TICKER ══ */}
        <TickerStrip items={tickerHero} direction="left" bg="#9122FF" textColor="#C8FF00"
          borderTop="3px solid #000" borderBottom="3px solid #000" speed={32} />

        {/* ══ STACKING BANNERS ══ */}
        <section id="banners" style={{ padding: '72px clamp(16px, 4vw, 64px)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <SectionBadge label="AVANTAJLAR" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              NEDEN <span style={{ color: '#FF3E9D' }}>NEXREWARD?</span>
            </h2>
          </div>
          {banners.map((b, i) => (
            <div key={i} style={{
              position: 'relative', background: b.bg,
              border: '3px solid #000', borderRadius: 22,
              boxShadow: '6px 6px 0 #000',
              transform: `rotate(${b.rotate}deg)`,
              padding: 'clamp(28px, 4vw, 48px) clamp(24px, 5vw, 60px)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center',
              gap: 'clamp(20px, 4vw, 52px)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.01)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${b.rotate}deg)`; }}>
              {/* Tag */}
              <div style={{
                position: 'absolute', top: 14, right: 18,
                background: 'rgba(0,0,0,0.13)', color: b.textColor,
                borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.07em', border: `1.5px solid ${b.textColor === '#000' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)'}`,
              }}>{b.tag}</div>
              {/* Number */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: 'Archivo Black, sans-serif', fontWeight: 900, color: b.textColor, lineHeight: 0.9, fontSize: 'clamp(52px, 10vw, 116px)', letterSpacing: '-0.04em' }}>{b.headline}</div>
                <div style={{ fontWeight: 800, color: b.textColor, fontSize: 'clamp(13px, 2vw, 21px)', marginTop: 4, opacity: 0.7 }}>{b.sub}</div>
              </div>
              {/* Divider */}
              <div className="banner-divider" style={{ width: 3, alignSelf: 'stretch', minHeight: 60, background: b.textColor === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)', borderRadius: 99, flexShrink: 0 }} />
              {/* Body */}
              <div className="banner-body">
                <p style={{ fontWeight: 700, color: b.textColor, fontSize: 'clamp(14px, 1.8vw, 20px)', lineHeight: 1.5, margin: '0 0 16px', opacity: 0.88, maxWidth: 540 }}>{b.body}</p>
                <button onClick={() => navigate('/register')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: b.textColor === '#000' ? '#000' : '#fff',
                  color: b.textColor === '#000' ? b.bg : '#000',
                  border: `2.5px solid ${b.textColor === '#000' ? '#000' : '#fff'}`,
                  borderRadius: 13, padding: '10px 22px',
                  fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: `0 4px 0 rgba(0,0,0,0.25)`, transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(0,0,0,0.25)'; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 rgba(0,0,0,0.25)'; }}>
                  Katıl <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" style={{ padding: '72px clamp(16px, 4vw, 64px)', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge label="ÖZELLİKLER" bg="#56C8FF" />
            <h2 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
              NEDEN BİZİ <span style={{ color: '#FF3E9D' }}>SEVECEKSİNİZ</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => {
              const Illus = featureIllustrations[f.illus];
              const Icon = f.icon;
              return (
                <div key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative', borderRadius: 20, overflow: 'hidden',
                    background: f.color,
                    border: '3px solid #000',
                    boxShadow: hovered === i ? '8px 8px 0 #000' : '5px 5px 0 #000',
                    transform: hovered === i ? 'translateY(-5px) rotate(-0.5deg)' : 'none',
                    transition: 'all 0.15s ease', cursor: 'pointer',
                  }}>
                  <div style={{
                    position: 'relative', height: 168, overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)',
                  }}>
                    <Illus size={132} style={{ transition: 'transform 0.3s', transform: hovered === i ? 'scale(1.1) rotate(5deg)' : 'scale(1)' }} />
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 42, height: 42, borderRadius: 13,
                      background: '#fff', border: '2.5px solid #000', boxShadow: '3px 3px 0 #000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={f.color} />
                    </div>
                  </div>
                  <div style={{ position: 'relative', padding: '20px 22px 24px', background: t.cardBg, borderTop: '3px solid #000' }}>
                    <h3 className="font-display" style={{ fontWeight: 900, fontSize: 15, color: t.textPrimary, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.01em' }}>{f.title}</h3>
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

        {/* ══ LIME TICKER ══ */}
        <TickerStrip
          items={[
            {text:'KAZAN',emoji:'💰'},{text:'ÖDÜL',emoji:'🎁'},{text:'EĞLEN',emoji:'🎮'},
            {text:'PAYLAŞ',emoji:'💜'},{text:'YÜKSEL',emoji:'🚀'},{text:'KEŞFET',emoji:'🔮'},
            {text:'BAŞAR',emoji:'🏆'},{text:'NEXREWARD',emoji:'⭐'},
          ]}
          direction="right" bg={isDark ? '#351A58' : '#C8FF00'} textColor={isDark ? '#C8FF00' : '#000'}
          borderTop="2.5px solid #000" borderBottom="2.5px solid #000" speed={24}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" style={{ padding: '80px clamp(16px, 4vw, 64px)', background: t.howBg, borderTop: `3px solid #000`, borderBottom: `3px solid #000`, transition: 'background 0.3s', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <SectionBadge label="NASIL ÇALIŞIR" bg="#9122FF" color="#C8FF00" />
              <h2 className="font-display" style={{ fontSize: 'clamp(26px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
                4 ADIMDA <span style={{ color: '#9122FF' }}>BAŞLA</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 20 }}>
              {[
                { step: 1, emoji: '📝', title: 'Kayıt Ol',          desc: 'Saniyeler içinde hesabını oluştur.',  color: '#9122FF', Shape: NBolt    },
                { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışverişte puan kazan.',          color: '#FF6B35', Shape: NStar5   },
                { step: 3, emoji: '🎮', title: 'Oyun Oyna',          desc: 'Eğlen ve bonus puan kazan.',          color: '#22c55e', Shape: NDiamond },
                { step: 4, emoji: '🎉', title: 'Ödülünü Al',         desc: 'Puanlarını ödüllerle değiştir.',      color: '#FF3E9D', Shape: NHeart   },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  position: 'relative', padding: '30px 20px 26px', borderRadius: 20,
                  overflow: 'hidden', textAlign: 'center',
                  background: t.cardBg, border: `3px solid #000`,
                  boxShadow: `0 6px 0 #000`,
                }}>
                  {i < arr.length - 1 && (
                    <div className="step-arrow" style={{ position: 'absolute', top: '50%', right: -14, zIndex: 10, transform: 'translateY(-50%)', color: '#9122FF', background: t.pageBg, borderRadius: '50%', padding: 2, border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}>
                      <ArrowRight size={14} />
                    </div>
                  )}
                  <item.Shape color={item.color} size={86} opacity={isDark ? 0.16 : 0.18} rotate={12} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', margin: '0 auto 14px',
                      background: item.color,
                      border: `2.5px solid #000`, boxShadow: `0 3px 0 #000`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, color: item.color === '#FFE500' ? '#000' : 'white', fontSize: 15,
                    }}>{item.step}</div>
                    <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>{item.emoji}</div>
                    <h3 style={{ fontWeight: 900, fontSize: 15, color: t.textPrimary, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{item.title}</h3>
                    <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" style={{ padding: '80px clamp(16px, 4vw, 64px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge label="YORUMLAR" bg={t.pillBg} />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              KULLANICILARIMIZ <span style={{ color: '#9122FF' }}>NE DİYOR?</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t2, i) => {
              const Shapes = [NBolt, NStar4, NDiamond];
              const colors = ['#9122FF', '#56C8FF', '#FF3E9D'];
              const TestShape = Shapes[i];
              return (
                <div key={i} style={{
                  position: 'relative', padding: '30px 24px 26px', borderRadius: 20, overflow: 'hidden',
                  background: t.cardBg, border: `3px solid #000`,
                  boxShadow: `0 6px 0 #000`, transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 11px 0 #000'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #000'; }}>
                  <TestShape color={colors[i]} size={90} opacity={isDark ? 0.14 : 0.16} rotate={i * 12} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                      {[...Array(t2.stars)].map((_, s) => <Star key={s} size={14} fill="#FBBF24" color="#FBBF24" />)}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: t.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>"{t2.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: `2.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5'}` }}>
                      <img src={t2.photo} alt={t2.name}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid #000`, flexShrink: 0, boxShadow: `0 3px 0 #000` }} />
                      <div>
                        <p style={{ fontWeight: 900, fontSize: 14, color: t.textPrimary, margin: 0 }}>{t2.name}</p>
                        <p style={{ fontSize: 11, fontWeight: 500, color: t.textMuted, margin: 0, marginTop: 2 }}>{t2.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ LIFESTYLE GRID ══ */}
        <section style={{ padding: '0 clamp(16px, 4vw, 64px) 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionBadge label="YAŞAM TARZI" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px, 4.5vw, 54px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              KAZANMAK BİR <span style={{ color: '#9122FF' }}>YAŞAM BİÇİMİ</span>
            </h2>
          </div>

          <div className="lifestyle-grid">
            {[
              { bg: '#9122FF', badge: '⭐ ALIŞVERİŞ', badgeBg: '#FFE500', text: 'Her alışverişte puan kazan, ödüllerle zenginleş.', Illus: GiftDoodle, tall: true },
              { bg: '#C8FF00', badge: '⚡ ANINDA',    badgeBg: '#000',    text: 'Ödülünü saniyeler içinde al.', Illus: PointsBolt, tall: false, textColor: '#000' },
              { bg: '#FF3E9D', badge: '🎮 OYUN',      badgeBg: '#fff',    text: 'Eğlenerek kazan.', Illus: GameDoodle, tall: false },
              { bg: '#56C8FF', badge: '👥 TOPLULUK',  badgeBg: '#FF6B35', text: '50.000+ mutlu kullanıcıyla birlikte büyüyoruz.', Illus: SocialDoodle, tall: false },
            ].map((card, i) => (
              <div key={i} className={`lifestyle-card${card.tall ? ' lifestyle-card-tall' : ''}`}
                style={{ background: card.bg, border: '3px solid #000', borderRadius: 20, boxShadow: '6px 6px 0 #000', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '10px 10px 0 #000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0 #000'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0 8px' }}>
                  <card.Illus size={card.tall ? 160 : 100} />
                </div>
                <div style={{ padding: '16px 20px 22px', background: 'rgba(0,0,0,0.07)' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: card.badgeBg, color: card.badgeBg === '#fff' ? '#000' : (card.badgeBg === '#000' ? '#C8FF00' : '#000'),
                    borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 900,
                    border: '2px solid #000', marginBottom: 10, boxShadow: '2px 2px 0 #000',
                  }}>{card.badge}</div>
                  <p style={{ color: card.textColor ?? '#fff', fontWeight: 800, fontSize: card.tall ? 'clamp(14px, 1.8vw, 18px)' : 13, margin: 0, lineHeight: 1.4 }}>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: '0 clamp(16px, 4vw, 64px) 88px' }}>
          <div style={{
            position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center',
            padding: 'clamp(52px, 8vw, 80px) clamp(24px, 6vw, 80px)',
            borderRadius: 26, overflow: 'hidden',
            background: 'linear-gradient(135deg, #9122FF 0%, #FF3E9D 100%)',
            border: '3px solid #000', boxShadow: '0 10px 0 #000',
          }}>
            {/* Subtle background text */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 'clamp(80px, 18vw, 220px)', fontWeight: 900, color: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap', letterSpacing: '-0.04em', userSelect: 'none' }}>KAZAN</span>
            </div>

            {/* Corner stickers */}
            <div style={{ position: 'absolute', top: -18, left: -12 }}>
              <span className="cta-corner-sticker" style={{ background: '#FFE500' }}>⭐</span>
            </div>
            <div style={{ position: 'absolute', bottom: -18, right: -12 }}>
              <span className="cta-corner-sticker" style={{ background: '#F472B6' }}>💖</span>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.18)', color: 'white',
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: 999, padding: '6px 18px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 20,
              }}>✦ HEMEN BAŞLA</div>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px, 5.5vw, 58px)', fontWeight: 900, color: 'white', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.05, textTransform: 'uppercase' }}>
                KAZANMAYA HAZIR<br />MISINIZ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(14px, 2vw, 17px)', fontWeight: 500, marginBottom: 32, maxWidth: 400, marginInline: 'auto', lineHeight: 1.6 }}>
                Sadakat programımıza katılın ve bugün ödül toplamaya başlayın. Tamamen ücretsiz!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                <button onClick={() => navigate('/register')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', color: '#9122FF',
                  border: '2.5px solid #fff', borderRadius: 16,
                  padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 36px)',
                  fontWeight: 900, fontSize: 'clamp(14px, 2vw, 17px)',
                  boxShadow: '0 5px 0 rgba(0,0,0,0.3)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 rgba(0,0,0,0.3)'; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 rgba(0,0,0,0.3)'; }}>
                  Ücretsiz Kayıt Ol <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/home')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '2.5px solid rgba(255,255,255,0.6)', borderRadius: 16,
                  padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 36px)',
                  fontWeight: 900, fontSize: 'clamp(14px, 2vw, 17px)',
                  boxShadow: '0 5px 0 rgba(0,0,0,0.2)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s, transform 0.1s, box-shadow 0.1s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 rgba(0,0,0,0.2)'; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 rgba(0,0,0,0.2)'; }}>
                  Panele Gir
                </button>
              </div>
              <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 500 }}>Kredi kartı gerekmez &bull; İstediğin zaman iptal et</p>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer style={{ background: t.footerBg, borderTop: `3px solid #000`, padding: 'clamp(36px, 5vw, 56px) clamp(16px, 4vw, 64px)', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 32 }}>
              <div>
                <img src="/logo.png" alt="NexReward" style={{ height: 'clamp(52px, 8vw, 80px)', width: 'auto', objectFit: 'contain', marginBottom: 12 }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, maxWidth: 240, lineHeight: 1.6, margin: 0 }}>
                  Daha fazla kazan, daha iyi yaşa.<br />Türkiye'nin #1 sadakat platformu.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: t.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>Platform</p>
                  {[['#features','Özellikler'],['#how','Nasıl Çalışır'],['#banners','Avantajlar']].map(([href,label]) => (
                    <a key={href} href={href} style={{ display: 'block', color: t.textSecondary, fontWeight: 600, fontSize: 13, textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#9122FF')}
                      onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>{label}</a>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: t.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>Hesap</p>
                  {[['Giriş Yap','/login'],['Kayıt Ol','/register'],['Panele Gir','/home']].map(([label,path]) => (
                    <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: t.textSecondary, fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: 8, textAlign: 'left', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#9122FF')}
                      onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5'}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, margin: 0 }}>© 2026 NexReward. Tüm hakları saklıdır.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#9122FF', color: '#C8FF00', border: '2px solid #000', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 900, boxShadow: '2px 2px 0 #000' }}>⭐ NEXREWARD</div>
            </div>
          </div>
        </footer>

      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)}
        }
        @keyframes tickerLeft {
          from{transform:translateX(0)} to{transform:translateX(calc(-100% / 3))}
        }
        @keyframes tickerRight {
          from{transform:translateX(calc(-100% / 3))} to{transform:translateX(0)}
        }

        /* ── Hero layout ── */
        .hero-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          text-align: center;
        }
        .hero-copy { max-width: 640px; }
        .hero-art { width: 100%; max-width: 360px; }
        @media (min-width: 900px) {
          .hero-layout {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            gap: 52px;
          }
          .hero-copy { flex: 1; max-width: none; }
          .hero-art { flex: 0 0 40%; max-width: 400px; }
        }

        /* ── Hero headline ── */
        .hero-headline {
          font-weight: 900;
          font-size: clamp(44px, 9.5vw, 124px);
          line-height: 0.97;
          letter-spacing: -0.04em;
          color: ${t.heroText};
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Hero buttons ── */
        .lbtn-hero-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #9122FF; color: #C8FF00;
          font-weight: 900; font-family: inherit;
          border: 3px solid #000; border-radius: 16px;
          padding: 14px 28px; font-size: 15px;
          box-shadow: 0 5px 0 #000;
          cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap; letter-spacing: 0.01em;
        }
        .lbtn-hero-primary:hover { opacity: 0.92; }
        .lbtn-hero-primary:active { transform: translateY(4px); box-shadow: 0 1px 0 #000; }

        .lbtn-hero-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${t.cardBg}; color: ${t.textPrimary};
          font-weight: 900; font-family: inherit;
          border: 3px solid #000; border-radius: 16px;
          padding: 14px 28px; font-size: 15px;
          box-shadow: 0 5px 0 #000;
          cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap;
        }
        .lbtn-hero-secondary:hover { opacity: 0.88; }
        .lbtn-hero-secondary:active { transform: translateY(4px); box-shadow: 0 1px 0 #000; }

        /* ── Nav buttons ── */
        .lbtn-primary-sm {
          display: inline-flex; align-items: center; gap: 5px;
          background: #9122FF; color: #C8FF00; font-weight: 700; font-family: inherit;
          border: 2.5px solid #000; border-radius: 13px; padding: 8px 16px; font-size: 12px;
          box-shadow: 0 4px 0 #000;
          cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap;
        }
        .lbtn-primary-sm:hover { opacity: 0.9; }
        .lbtn-primary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 #000; }

        .lbtn-secondary-sm {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--l-card-bg,#fff); color: var(--l-text,#000); font-weight: 700; font-family: inherit;
          border: 2.5px solid #000; border-radius: 13px; padding: 8px 16px; font-size: 12px;
          box-shadow: 0 4px 0 #000;
          cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
          white-space: nowrap;
        }
        .lbtn-secondary-sm:hover { opacity: 0.85; }
        .lbtn-secondary-sm:active { transform: translateY(3px); box-shadow: 0 1px 0 #000; }

        /* ── CTA corner stickers ── */
        .cta-corner-sticker {
          width: clamp(42px, 6vw, 58px);
          height: clamp(42px, 6vw, 58px);
          font-size: clamp(18px, 2.5vw, 26px);
          border-radius: 50%;
          border: 2.5px solid #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 0 rgba(0,0,0,0.3);
        }

        /* ── Responsive visibility ── */
        .nav-links { display: none; }
        @media (min-width: 768px) { .nav-links { display: flex; } }

        .hamburger-btn { display: none !important; }
        @media (max-width: 767px) { .hamburger-btn { display: flex !important; } }

        .nav-login-btn { display: none; }
        @media (min-width: 640px) { .nav-login-btn { display: inline-flex; } }

        .btn-label-short { display: none; }
        .btn-label-full  { display: inline; }
        @media (max-width: 400px) {
          .btn-label-short { display: inline; }
          .btn-label-full  { display: none; }
        }

        /* ── Banner responsive ── */
        .banner-divider {}
        .banner-body { flex: 1; min-width: 0; }
        @media (max-width: 540px) {
          .banner-body p { font-size: 13px !important; }
          .banner-divider { display: none; }
        }

        /* ── Step arrows ── */
        .step-arrow { display: none; }
        @media (min-width: 768px) { .step-arrow { display: flex; } }

        /* ── Lifestyle grid ── */
        .lifestyle-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: auto;
          gap: 16px;
        }
        .lifestyle-card { min-height: 200px; }
        .lifestyle-card-tall { grid-row: span 2; min-height: 420px; }
        @media (min-width: 768px) {
          .lifestyle-grid {
            grid-template-columns: 5fr 4fr 3fr;
            grid-template-rows: 1fr 1fr;
          }
          .lifestyle-card-tall { grid-row: span 2; }
        }
        @media (max-width: 520px) {
          .lifestyle-grid { grid-template-columns: 1fr; }
          .lifestyle-card-tall { grid-row: span 1; min-height: 260px; }
          .lifestyle-card { min-height: 180px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
