import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';
import { DoodleField } from '../components/neo/NeoBrutalDecor';
import AppLogo from '../components/AppLogo';
import HeroGroupComposition from '../components/HeroGroupComposition';
import { LANDING_HERO_CENTER_URL, LANDING_HERO_HEADLINE_SHAPE_URLS } from '../lib/landingHeroAssets';
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
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = LANDING_HERO_CENTER_URL;
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
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
          <div className="landing-nav-inner">
            {/* Logo */}
            <div className="landing-nav-logo">
              <AppLogo size={36} priority style={{ borderRadius: 10, border: '2px solid #000', boxShadow: '0 2px 0 #000' }} />
              <span className="landing-nav-logo__text" style={{ color: t.textPrimary }}>NexReward</span>
            </div>

            {/* Desktop nav links */}
            <div className="nav-links">
              {[['features','Özellikler'],['banners','Avantajlar'],['how','Nasıl Çalışır'],['testimonials','Yorumlar']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} aria-label={`${label} bölümüne git`}
                  className="nav-link-btn"
                  style={{ color: t.textSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#9122FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textSecondary)}>
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="landing-nav-actions">
              <button onClick={toggleTheme} aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
                className="landing-nav-theme-btn"
                style={{ background: t.cardBg }}>
                {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color="#7B6EF6" />}
              </button>

              {/* Quick login — visible on phone/tablet only */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="nav-mobile-quick lbtn-secondary-sm"
              >
                Giriş
              </button>

              {/* Desktop-only buttons */}
              <div className="nav-desktop-actions">
                <button type="button" onClick={() => navigate('/login')} className="lbtn-secondary-sm">Giriş Yap</button>
                <button type="button" onClick={() => navigate('/admin-login')} className="nav-admin-btn">
                  🔐 Yönetici
                </button>
                <button type="button" onClick={() => navigate('/home')} className="lbtn-primary-sm">
                  Panele Gir <ArrowRight size={12} />
              </button>
              </div>

              {/* Hamburger */}
              <button type="button" className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                style={{ background: t.cardBg }}>
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
        <section className="landing-hero-shell">
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
              <div className="hero-live-panel" style={{ background: t.cardBg, color: t.textPrimary }}>
                <div className="hero-live-panel__header">
                  <span style={{ color: t.textMuted }}>Bugünkü kazanç</span>
                  <strong>1.840 puan</strong>
                </div>
                <div className="hero-live-progress"><span /></div>
                <div className="hero-live-list">
                  <div><span style={{ background: '#56C8FF' }}>QR</span><strong>QR tara</strong><small style={{ color: t.textMuted }}>+75 puan</small></div>
                  <div><span style={{ background: '#C8FF00' }}>G</span><strong>Görev</strong><small style={{ color: t.textMuted }}>+120 puan</small></div>
                  <div><span style={{ background: '#FF3E9D', color: '#fff' }}>Ö</span><strong>Ödül</strong><small style={{ color: t.textMuted }}>Kupon açıldı</small></div>
                </div>
              </div>
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
        .landing-hero-shell {
          min-height: min(820px, calc(100vh - 60px));
          display:flex; flex-direction:column; justify-content:center;
          position:relative; padding:clamp(36px,6vh,72px) 0 clamp(24px,5vh,48px);
          overflow:hidden; border-bottom:3px solid rgba(0,0,0,0.08);
        }
        .hero-layout {
          width:min(1220px,100%); margin:0 auto;
          display:flex; flex-direction:column; align-items:center;
          gap:clamp(24px,5vw,56px); text-align:center;
        }
        .hero-copy  { max-width:640px; min-width:0; }
        .hero-art   { width:100%; max-width:360px; min-height:clamp(290px,50vw,430px); min-width:0; isolation:isolate; }
        .hero-copy > div:first-child { margin-bottom:clamp(16px,3vw,24px) !important; }
        .hero-copy > p { margin-top:clamp(14px,2.5vw,18px) !important; max-width:560px !important; }
        .hero-copy > div:nth-of-type(2) { margin-top:clamp(18px,3vw,24px) !important; }
        .hero-copy > div:nth-of-type(3) { margin-top:clamp(18px,3vw,24px) !important; }
        @media (min-width: 900px) {
          .hero-layout { flex-direction:row; align-items:center; justify-content:space-between; text-align:left; gap:clamp(36px,5vw,72px); }
          .hero-copy   { flex:1; max-width:none; }
          .hero-art    { flex:0 0 min(40%, 460px); max-width:460px; }
        }

        .hero-headline {
          font-weight:900; font-size:clamp(40px,7.2vw,88px);
          line-height:0.92; letter-spacing:-0.025em;
          color:${t.heroText}; text-transform:uppercase; margin:0; text-wrap:balance;
        }
        .hero-headline-line {
          display:flex; align-items:center; justify-content:center;
          gap:clamp(6px,1.5vw,14px); min-width:0;
        }
        .hero-headline-sticker { flex-shrink:0; width:clamp(20px,2.2vw,30px); height:auto; }
        @media (min-width:900px) {
          .hero-headline-line { justify-content:flex-start; }
        }
        @media (max-width:520px) {
          .landing-hero-shell { min-height:auto; padding-top:34px; }
          .hero-headline { font-size:clamp(38px,14vw,58px); line-height:.95; }
          .hero-art { flex-direction:column; gap:0; min-height:0; }
          .hero-copy > div:first-child { transform:none !important; }
          .hero-copy > div:nth-of-type(2),
          .hero-copy > div:nth-of-type(3) { justify-content:center; }
          .hero-copy > div:nth-of-type(3) > div {
            flex:1 1 calc(33.333% - 8px); min-width:92px; justify-content:center; padding-inline:8px !important;
          }
        }

        .hero-group-composition {
          position:relative; width:min(100%,360px); aspect-ratio:1; margin-inline:auto;
          display:grid; place-items:center; filter:drop-shadow(0 12px 0 rgba(0,0,0,0.16));
        }
        .hero-group-composition__star { width:min(78%,300px); height:auto; }
        .hero-live-panel {
          position:absolute; left:50%; bottom:clamp(4px,1vw,14px); transform:translateX(-50%);
          width:min(92%,310px); border:3px solid #000; border-radius:18px; box-shadow:7px 7px 0 #000;
          padding:14px; z-index:4;
        }
        .hero-live-panel__header {
          display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;
        }
        .hero-live-panel__header span {
          display:block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em;
        }
        .hero-live-panel__header strong { display:block; font-size:20px; font-weight:900; line-height:1; }
        .hero-live-progress {
          height:10px; border:2px solid #000; border-radius:999px; background:rgba(0,0,0,.08); overflow:hidden; margin-bottom:10px;
        }
        .hero-live-progress span { display:block; width:72%; height:100%; background:linear-gradient(90deg,#C8FF00,#56C8FF); }
        .hero-live-list { display:grid; gap:7px; }
        .hero-live-list div {
          display:grid; grid-template-columns:30px 1fr auto; align-items:center; gap:9px; min-width:0;
          padding:7px; border:2px solid rgba(0,0,0,.16); border-radius:12px;
        }
        .hero-live-list span {
          width:30px; height:30px; border:2px solid #000; border-radius:10px; display:grid; place-items:center;
          font-size:11px; font-weight:900; color:#000; box-shadow:2px 2px 0 #000;
        }
        .hero-live-list strong { font-size:12px; font-weight:900; white-space:nowrap; }
        .hero-live-list small { font-size:11px; font-weight:800; white-space:nowrap; }
        @media (min-width:900px) {
          .hero-live-panel { left:auto; right:0; bottom:4%; transform:none; }
        }
        @media (max-width:520px) {
          .hero-live-panel { position:relative; left:auto; bottom:auto; transform:none; margin:-32px auto 0; width:min(100%,310px); }
          .hero-live-list div { grid-template-columns:30px 1fr; }
          .hero-live-list small { grid-column:2; }
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

        /* ── Nav layout ── */
        .landing-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 clamp(12px, 4vw, 20px);
          height: 60px; display: flex; align-items: center; justify-content: space-between;
          gap: clamp(8px, 2vw, 12px); min-width: 0;
        }
        .landing-nav-logo {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0; min-width: 0;
        }
        .landing-nav-logo__text {
          font-weight: 900; font-size: clamp(14px, 3.5vw, 16px); letter-spacing: -0.02em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .landing-nav-actions {
          display: flex; align-items: center; gap: clamp(6px, 1.5vw, 8px); flex-shrink: 0;
        }
        .landing-nav-theme-btn,
        .hamburger-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 2.5px solid #000;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 0 #000; flex-shrink: 0; padding: 0;
        }
        .landing-nav-theme-btn { border-radius: 50%; }
        .nav-link-btn {
          font-weight: 700; font-size: 11px; letter-spacing: 0.06em; transition: color 0.15s;
          white-space: nowrap; background: none; border: none; cursor: pointer;
          font-family: inherit; padding: 0;
        }
        .nav-admin-btn {
          display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 11px;
          cursor: pointer; background: #9122FF18; color: #9122FF; border: 2.5px solid #9122FF;
          font-weight: 900; font-size: 12px; box-shadow: 0 3px 0 #6b19c0; font-family: inherit;
          white-space: nowrap;
        }

        /* ── Nav visibility — match index.html critical (no shift on hydrate) ── */
        .nav-links { display: none; flex: 1; min-width: 0; align-items: center; justify-content: center; gap: clamp(10px, 2vw, 24px); }
        @media (min-width: 1024px) { .nav-links { display: flex; } }

        .nav-mobile-quick { display: inline-flex; padding: 7px 12px; font-size: 11px; }
        @media (min-width: 1024px) { .nav-mobile-quick { display: none !important; } }

        .hamburger-btn { display: none; }
        @media (max-width: 1023px) { .hamburger-btn { display: flex !important; } }

        .nav-desktop-actions { display: none; align-items: center; gap: 8px; }
        @media (min-width: 1024px) { .nav-desktop-actions { display: flex; } }

        .nav-logo-text { display: none; }

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
