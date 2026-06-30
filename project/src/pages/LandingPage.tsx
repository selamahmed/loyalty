import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { LANDING_HERO_HEADLINE_SHAPE_URLS } from '../lib/landingHeroAssets';
import { useTheme } from '../context/ThemeContext';

const LandingBelowFold = React.lazy(() => import('./LandingBelowFold'));

const HEADLINE_STICKER_ROTATIONS = [-10, 12, -8] as const;
const HEADLINE_STICKER_SIZES = [30, 28, 32] as const;

/* ─── Main component ────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode: isDark, toggleTheme } = useTheme();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  return (
    <div style={{ background: t.pageBg, color: t.textPrimary, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.3s', position: 'relative', ...t.cssVars }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ NAV ══ */}
        <nav className="landing-premium-nav" style={{ position: 'sticky', top: 0, zIndex: 50, background: t.navBg, backdropFilter: 'blur(20px)', borderBottom: '2.5px solid #000', transition: 'background 0.3s' }}>
          <div className="landing-nav-inner">
            {/* Logo */}
            <div className="landing-nav-logo">
              <AppLogo size={36} priority />
            </div>

            {/* Desktop nav links */}
            <div className="nav-links">
              {[['features','Özellikler'],['how','Nasıl Çalışır']].map(([id, label]) => (
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
              {[['features','Özellikler'],['how','Nasıl Çalışır']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id, true)}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '13px 4px', color: t.textPrimary, fontWeight: 800, fontSize: 15, background: 'none', border: 'none', borderBottom: '1.5px solid rgba(128,128,128,0.12)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  {label}
                </button>
              ))}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="lbtn-secondary-sm" style={{ flex: 1, justifyContent: 'center', padding: '11px 12px' }}>Giriş Yap</button>
                  <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="lbtn-primary-sm" style={{ flex: 1, justifyContent: 'center', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>Hemen Başlayın <ArrowRight size={13} /></button>
                </div>
                <button onClick={() => { navigate('/home'); setMenuOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg,#7B6EF6,#9122FF)', color: 'white', border: '2.5px solid #000', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 0 #000', fontFamily: 'inherit' }}>
                  Panele Gir <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section className="landing-hero-shell">
          <div className="hero-layout" style={{ padding: '0 clamp(20px,5vw,80px)', position: 'relative', zIndex: 1 }}>
            <div className="hero-copy hero-copy-card lp-hero-stagger">
              <div className="hero-live-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#C8FF00', color: '#000', border: '2.5px solid #000', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', boxShadow: '3px 3px 0 #000', marginBottom: 28, transform: 'rotate(-1.5deg)' }}>
                <span className="hero-live-dot" aria-hidden /> ÇOK YAKINDA!
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
                NeşveNext yayına hazırlanıyor. İlk kullanıcılar için QR puan, ödül, oyun ve liderlik deneyimi hazır.
              </p>
              <div className="hero-cta-row" style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <button onClick={() => navigate('/register')} className="lbtn-hero-primary">Hemen Başlayın <ArrowRight size={16} /></button>
                <button onClick={() => navigate('/login')} className="lbtn-hero-secondary">Giriş Yap</button>
              </div>
              <div className="hero-stat-row" style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[['PİLOT', 'Hazır', '#9122FF'], ['QR', 'Puan', '#FF3E9D'], ['ÖDÜL', 'Sistem', '#FF6B35']].map(([num, label, color]) => (
                  <div className="hero-stat-chip" key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.cardBg, border: '2.5px solid #000', borderRadius: 14, padding: '7px 14px', boxShadow: '3px 3px 0 #000' }}>
                    <span style={{ fontWeight: 900, fontSize: 16, color }}>{num}</span>
                    <span style={{ fontWeight: 600, fontSize: 12, color: t.textMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="landing-below-fold-placeholder" aria-hidden style={{ minHeight: 52 }} />}>
          <LandingBelowFold
            t={t}
            isDark={isDark}
            hovered={hovered}
            setHovered={setHovered}
            scrollTo={scrollTo}
          />
        </Suspense>

      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes modalPop   { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lpFadeUp { from { opacity:0; transform:translate3d(0,18px,0); } to { opacity:1; transform:none; } }
        .lp-hero-stagger > * { animation: lpFadeUp .62s cubic-bezier(.22,1,.36,1) both; }
        .lp-hero-stagger > *:nth-child(1){ animation-delay:.04s; }
        .lp-hero-stagger > *:nth-child(2){ animation-delay:.12s; }
        .lp-hero-stagger > *:nth-child(3){ animation-delay:.20s; }
        .lp-hero-stagger > *:nth-child(4){ animation-delay:.28s; }
        .lp-hero-stagger > *:nth-child(5){ animation-delay:.36s; }

        .hero-live-dot {
          width:9px; height:9px; border-radius:50%; flex-shrink:0;
          background:#16a34a; box-shadow:0 0 0 0 rgba(22,163,74,.55);
          animation: lpLivePulse 1.9s ease-out infinite;
        }
        @keyframes lpLivePulse {
          0%   { box-shadow:0 0 0 0 rgba(22,163,74,.55); }
          70%  { box-shadow:0 0 0 7px rgba(22,163,74,0); }
          100% { box-shadow:0 0 0 0 rgba(22,163,74,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-hero-stagger > *, .hero-live-dot {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }

        /* ── Hero ── */
        .landing-hero-shell {
          min-height: min(820px, calc(100vh - 60px));
          display:flex; flex-direction:column; justify-content:center;
          position:relative; padding:clamp(36px,6vh,72px) 0 clamp(24px,5vh,48px);
          overflow:hidden; border-bottom:3px solid rgba(0,0,0,0.08);
          background:
            radial-gradient(circle at 50% 4%, ${isDark ? 'rgba(145,34,255,.24)' : 'rgba(145,34,255,.16)'}, transparent 34%),
            radial-gradient(circle at 12% 26%, rgba(200,255,0,.12), transparent 22%),
            linear-gradient(180deg, ${isDark ? 'rgba(255,255,255,.025)' : 'rgba(255,255,255,.5)'}, transparent 48%);
        }
        .landing-hero-shell::before {
          content:""; position:absolute; inset:14px clamp(10px,2vw,20px) 18px;
          border-radius:clamp(28px,4vw,46px); pointer-events:none;
          background:${isDark ? 'rgba(255,255,255,.018)' : 'rgba(255,255,255,.24)'};
          opacity:.72;
        }
        .landing-premium-nav {
          padding:10px clamp(8px,2vw,16px);
          background:transparent !important;
          border-bottom:0 !important;
          backdrop-filter:none !important;
        }
        .hero-layout {
          width:min(1220px,100%); margin:0 auto;
          display:flex; flex-direction:column; align-items:center;
          gap:clamp(24px,5vw,56px); text-align:center;
        }
        .hero-copy  { max-width:640px; min-width:0; }
        .hero-copy-card {
          position:relative;
          padding:clamp(22px,4vw,38px);
          border:3px solid #000;
          border-radius:clamp(28px,4vw,38px);
          background:
            linear-gradient(180deg, ${isDark ? 'rgba(42,21,80,.82)' : 'rgba(255,255,255,.88)'}, ${isDark ? 'rgba(30,15,56,.72)' : 'rgba(245,240,255,.76)'});
          box-shadow:
            0 10px 0 #000,
            0 26px 58px ${isDark ? 'rgba(0,0,0,.34)' : 'rgba(15,7,32,.16)'};
          backdrop-filter:blur(18px);
        }
        .hero-copy-card::before {
          content:""; position:absolute; inset:10px;
          border-radius:clamp(20px,3vw,28px); pointer-events:none;
        }
        .hero-copy-card::after {
          content:""; position:absolute; top:11px; left:50%; transform:translateX(-50%);
          width:46px; height:5px; border-radius:999px;
          background:${isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'};
        }
        .hero-live-badge {
          box-shadow:0 5px 0 #000, 0 12px 26px rgba(200,255,0,.22) !important;
        }
        .hero-copy > div:first-child { margin-bottom:clamp(16px,3vw,24px) !important; }
        .hero-copy > p { margin-top:clamp(14px,2.5vw,18px) !important; max-width:560px !important; }
        .hero-copy > div:nth-of-type(2) { margin-top:clamp(18px,3vw,24px) !important; }
        .hero-copy > div:nth-of-type(3) { margin-top:clamp(18px,3vw,24px) !important; }
        @media (min-width: 900px) {
          .hero-layout { flex-direction:row; align-items:center; justify-content:center; text-align:left; gap:clamp(36px,5vw,72px); }
          .hero-copy   { flex:1; max-width:none; }
        }

        .hero-headline {
          font-weight:900; font-size:clamp(40px,7.2vw,88px);
          line-height:0.92; letter-spacing:-0.025em;
          color:${t.heroText}; text-transform:uppercase; margin:0; text-wrap:balance;
          text-shadow:${isDark ? '0 5px 0 rgba(0,0,0,.24)' : '0 4px 0 rgba(0,0,0,.08)'};
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
          .landing-hero-shell { min-height:auto; padding-top:24px; }
          .landing-hero-shell::before { inset:8px 6px 12px; border-radius:28px; }
          .hero-copy-card { padding:22px 16px 20px; border-radius:28px; box-shadow:0 7px 0 #000, 0 20px 38px rgba(0,0,0,.24); }
          .hero-copy-card::before { inset:8px; border-radius:20px; }
          .hero-headline { font-size:clamp(38px,14vw,58px); line-height:.95; }
          .hero-copy > div:first-child { transform:none !important; }
          .hero-copy > div:nth-of-type(2),
          .hero-copy > div:nth-of-type(3) { justify-content:center; }
          .hero-copy > div:nth-of-type(3) > div {
            flex:1 1 calc(33.333% - 8px); min-width:92px; justify-content:center; padding-inline:8px !important;
          }
        }

        .lbtn-hero-primary {
          position:relative; overflow:hidden;
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(180deg,#B44AFF,#9122FF); color:#C8FF00; font-weight:900; font-family:inherit;
          border:3px solid #000; border-radius:20px; padding:14px 28px; font-size:15px;
          box-shadow:0 7px 0 #000, 0 16px 34px rgba(145,34,255,.28); cursor:pointer; transition:transform 0.14s,box-shadow 0.14s; white-space:nowrap;
        }
        .lbtn-hero-primary > * { position:relative; z-index:1; }
        .lbtn-hero-primary::after {
          content:""; position:absolute; top:0; left:0; width:45%; height:100%; z-index:0;
          background:linear-gradient(110deg, transparent, rgba(255,255,255,.5), transparent);
          transform:translateX(-220%) skewX(-18deg); pointer-events:none; opacity:0;
        }
        .lbtn-hero-primary:hover { transform:translateY(-1px); }
        .lbtn-hero-primary:hover::after { animation: lpShine .75s ease; }
        .lbtn-hero-primary:active { transform:translateY(4px); box-shadow:0 1px 0 #000; }
        @keyframes lpShine {
          0%   { transform:translateX(-220%) skewX(-18deg); opacity:0; }
          22%  { opacity:1; }
          100% { transform:translateX(340%) skewX(-18deg); opacity:0; }
        }

        .lbtn-hero-secondary {
          display:inline-flex; align-items:center; gap:8px;
          background:${t.cardBg}; color:${t.textPrimary}; font-weight:900; font-family:inherit;
          border:3px solid #000; border-radius:20px; padding:14px 28px; font-size:15px;
          box-shadow:0 7px 0 #000, inset 0 1px 0 rgba(255,255,255,.14); cursor:pointer; transition:transform 0.14s,box-shadow 0.14s; white-space:nowrap;
        }
        .lbtn-hero-secondary:hover { transform:translateY(-1px); }
        .lbtn-hero-secondary:active { transform:translateY(4px); box-shadow:0 1px 0 #000; }

        .hero-stat-row { justify-content:center; }
        .hero-stat-chip {
          border-radius:18px !important;
          padding:9px 16px !important;
          box-shadow:0 5px 0 #000, inset 0 1px 0 rgba(255,255,255,.12) !important;
          backdrop-filter:blur(10px);
          transition:transform .16s ease, box-shadow .16s ease;
        }
        .hero-stat-chip:hover {
          transform:translateY(-3px);
          box-shadow:0 8px 0 #000, inset 0 1px 0 rgba(255,255,255,.14) !important;
        }
        @media (min-width:900px) { .hero-stat-row { justify-content:flex-start; } }

        .landing-premium-nav button:focus-visible,
        .lbtn-hero-primary:focus-visible,
        .lbtn-hero-secondary:focus-visible,
        .hero-stat-chip:focus-visible {
          outline:3px solid #9122FF; outline-offset:3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .lbtn-hero-primary::after { animation:none !important; opacity:0 !important; }
          .hero-stat-chip { transition:none !important; }
        }

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
          max-width: 1200px; margin: 0 auto; padding: 0 clamp(10px, 3vw, 18px);
          height: 58px; display: flex; align-items: center; justify-content: space-between;
          gap: clamp(8px, 2vw, 12px); min-width: 0;
          border:2.5px solid #000;
          border-radius:18px;
          background:${isDark ? 'rgba(30,15,56,.88)' : 'rgba(255,255,255,.94)'};
          box-shadow:0 5px 0 #000;
        }
        .landing-nav-inner::before { content:none; }
        .landing-nav-logo {
          display: flex; align-items: center; gap: 10px; flex-shrink: 0; min-width: 0;
          position:relative; z-index:1;
        }
        .landing-nav-logo__text {
          font-weight: 900; font-size: clamp(15px, 3.5vw, 17px); letter-spacing: -0.035em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .landing-nav-actions {
          display: flex; align-items: center; gap: clamp(7px, 1.5vw, 10px); flex-shrink: 0;
          position:relative; z-index:1;
        }
        .landing-nav-theme-btn,
        .hamburger-btn {
          width: 42px; height: 42px; border-radius: 15px; border: 2.5px solid #000;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 5px 0 #000, inset 0 1px 0 rgba(255,255,255,.12); flex-shrink: 0; padding: 0;
          transition:transform .14s ease, box-shadow .14s ease;
        }
        .landing-nav-theme-btn { border-radius: 50%; }
        .landing-nav-theme-btn:hover,
        .hamburger-btn:hover,
        .landing-premium-nav .lbtn-secondary-sm:hover {
          transform:translateY(-1px);
        }
        .landing-nav-theme-btn:active,
        .hamburger-btn:active {
          transform:translateY(4px);
          box-shadow:0 1px 0 #000;
        }
        .nav-link-btn {
          font-weight: 700; font-size: 11px; letter-spacing: 0.06em; transition: color 0.15s;
          white-space: nowrap; background: none; border: none; cursor: pointer;
          font-family: inherit; padding: 0;
        }

        .landing-premium-nav .lbtn-secondary-sm {
          border-radius:16px;
          padding:10px 17px;
          font-weight:900;
          box-shadow:0 5px 0 #000, inset 0 1px 0 rgba(255,255,255,.12);
          transition:transform .14s ease, box-shadow .14s ease;
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
      `}</style>
    </div>
  );
};

export default LandingPage;
