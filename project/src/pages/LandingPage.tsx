import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';
import { DoodleField } from '../components/neo/NeoBrutalDecor';
import AppLogo from '../components/AppLogo';
import HeroGroupComposition from '../components/HeroGroupComposition';
import { LANDING_HERO_HEADLINE_SHAPE_URLS } from '../lib/landingHeroAssets';
import { useTheme } from '../context/ThemeContext';

const LandingBelowFold = React.lazy(() => import('./LandingBelowFold'));

const LazyPageStickerBackdrop = React.lazy(() =>
  import('../components/StickerDecor').then(m => ({ default: m.PageStickerBackdrop })),
);

const HEADLINE_STICKER_ROTATIONS = [-10, 12, -8] as const;
const HEADLINE_STICKER_SIZES = [30, 28, 32] as const;

/* ─── Main component ────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode: isDark, toggleTheme } = useTheme();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showHeroBackdrop, setShowHeroBackdrop] = React.useState(false);

  React.useEffect(() => {
    const loadBackdrop = () => setShowHeroBackdrop(true);
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadBackdrop, { timeout: 1200 });
    } else {
      setTimeout(loadBackdrop, 150);
    }
  }, []);

  const heroBackdrop = showHeroBackdrop ? (
    <React.Suspense fallback={null}>
      <LazyPageStickerBackdrop preset="landing-hero" />
    </React.Suspense>
  ) : null;

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
      {heroBackdrop}
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
                  <img
                    src={LANDING_HERO_HEADLINE_SHAPE_URLS[0]}
                    alt=""
                    aria-hidden
                    width={HEADLINE_STICKER_SIZES[0]}
                    height={HEADLINE_STICKER_SIZES[0]}
                    className="hero-headline-sticker"
                    decoding="async"
                    style={{ transform: `rotate(${HEADLINE_STICKER_ROTATIONS[0]}deg)` }}
                  />
                </span>
                <span className="hero-headline-line hero-headline-line--accent" style={{ color: '#9122FF', WebkitTextStroke: isDark ? '2px #C8FF00' : 'none' }}>
                  <img
                    src={LANDING_HERO_HEADLINE_SHAPE_URLS[1]}
                    alt=""
                    aria-hidden
                    width={HEADLINE_STICKER_SIZES[1]}
                    height={HEADLINE_STICKER_SIZES[1]}
                    className="hero-headline-sticker"
                    decoding="async"
                    style={{ transform: `rotate(${HEADLINE_STICKER_ROTATIONS[1]}deg)` }}
                  />
                  YAPARKEN
                </span>
                <span className="hero-headline-line">
                  PUAN KAZAN
                  <img
                    src={LANDING_HERO_HEADLINE_SHAPE_URLS[2]}
                    alt=""
                    aria-hidden
                    width={HEADLINE_STICKER_SIZES[2]}
                    height={HEADLINE_STICKER_SIZES[2]}
                    className="hero-headline-sticker"
                    decoding="async"
                    style={{ transform: `rotate(${HEADLINE_STICKER_ROTATIONS[2]}deg)` }}
                  />
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
            <div className="hero-art" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(12px,3vw,24px)' }}>
              <HeroGroupComposition />
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="landing-below-fold-placeholder" aria-hidden style={{ minHeight: 52 }} />}>
          <LandingBelowFold
            t={t}
            isDark={isDark}
            card={card}
            hovered={hovered}
            setHovered={setHovered}
            scrollTo={scrollTo}
          />
        </Suspense>

      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes tickerLeft  { from{transform:translateX(0)} to{transform:translateX(calc(-100% / 3))} }
        @keyframes tickerRight { from{transform:translateX(calc(-100% / 3))} to{transform:translateX(0)} }

        /* ── Hero ── */
        .hero-layout { display:flex; flex-direction:column; align-items:center; gap:32px; text-align:center; }
        .hero-copy  { max-width:640px; }
        .hero-art   { width:100%; max-width:320px; min-height:clamp(240px,44vw,340px); }
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

        /* ── Nav visibility — match index.html critical (no shift on hydrate) ── */
        .nav-links { display:none; }
        @media (min-width:768px) { .nav-links { display:flex; align-items:center; gap:24px; } }

        .hamburger-btn { display:none; }
        @media (max-width:767px) { .hamburger-btn { display:flex !important; } }

        .nav-desktop-actions { display:none; }
        @media (min-width:768px) { .nav-desktop-actions { display:flex; align-items:center; gap:8px; } }

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
