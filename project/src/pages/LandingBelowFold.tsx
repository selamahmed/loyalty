import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Check, ChevronRight } from 'lucide-react';
import { SectionBadge } from '../components/neo/NeoBrutalDecor';
import StickerAccent from '../components/StickerAccent';
import { LANDING_TESTIMONIAL_AVATARS } from '../lib/landingDemoAvatars';
import AppLogo from '../components/AppLogo';
import { features, banners, testimonials, steps } from './landingShared';

export type LandingTheme = {
  pageBg: string; heroText: string; navBg: string; cardBg: string; cardBg2: string;
  textPrimary: string; textSecondary: string; textMuted: string; pillBg: string;
  footerBg: string; footerText: string; howBg: string;
  cssVars: React.CSSProperties;
};

type Props = {
  t: LandingTheme;
  isDark: boolean;
  card: React.CSSProperties;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  scrollTo: (id: string) => void;
};

const LandingBelowFold: React.FC<Props> = ({ t, isDark, card, hovered, setHovered, scrollTo }) => {
  const navigate = useNavigate();

  // Reveal section headers as they scroll into view (one-shot, GPU-only).
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-lp-reveal]'));
    if (els.length === 0) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      els.forEach(el => el.classList.add('lp-in'));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
        {/* ══ AVANTAJLAR ══ */}
        <section id="banners" className="landing-section-frame landing-section-frame--banners" style={{ padding: '56px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div data-lp-reveal style={{ textAlign: 'center', marginBottom: 8 }}>
            <SectionBadge label="AVANTAJLAR" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(24px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              NEDEN <span style={{ color: '#FF3E9D' }}>NEXREWARD?</span>
            </h2>
          </div>

          {banners.slice(0, 2).map((b, i) => (
            <div key={i} className="banner-card landing-polish-card" style={{
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
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: b.textColor === '#000' ? '#000' : '#fff', color: b.textColor === '#000' ? b.bg : '#000',
                  border: `2.5px solid ${b.textColor === '#000' ? '#000' : '#fff'}`,
                  borderRadius: 13, padding: '9px 20px', fontWeight: 900, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                }}>
                  Katıl <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="landing-section-frame landing-section-frame--features" style={{ padding: '56px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto' }}>
          <div data-lp-reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <SectionBadge label="ÖZELLİKLER" bg="#56C8FF" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
              NEDEN BİZİ <span style={{ color: '#FF3E9D' }}>SEVECEKSİNİZ</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
            {features.slice(0, 4).map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i}
                  className="landing-feature-card landing-polish-card"
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

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" className="landing-how-section" style={{ padding: '64px clamp(16px,4vw,64px)', background: t.howBg, borderTop: '2.5px solid #000', borderBottom: '2.5px solid #000', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div data-lp-reveal style={{ textAlign: 'center', marginBottom: 52 }}>
              <SectionBadge label="NASIL ÇALIŞIR" bg="#9122FF" color="#C8FF00" />
              <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
                4 ADIMDA <span style={{ color: '#9122FF' }}>BAŞLA</span>
              </h2>
            </div>
            <div className="steps-grid">
              {steps.map((item, i) => (
                <div key={i} className="landing-step-card" style={{ position: 'relative', padding: '28px 20px 24px', borderRadius: 20, overflow: 'hidden', textAlign: 'center', background: t.cardBg, border: '3px solid #000', boxShadow: '0 6px 0 #000' }}>
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
        <section id="testimonials" className="landing-section-frame landing-testimonials-section" style={{ padding: '64px clamp(16px,4vw,64px)', maxWidth: 1100, margin: '0 auto' }}>
          <div data-lp-reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <SectionBadge label="YORUMLAR" bg={isDark ? '#9122FF' : '#FFE500'} color={isDark ? '#C8FF00' : '#000'} />
            <h2 className="font-display" style={{ fontSize: 'clamp(24px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              KULLANICILARIMIZ <span style={{ color: '#9122FF' }}>NE DİYOR?</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {testimonials.slice(0, 3).map((t2, i) => (
              <div key={i} className="landing-testimonial-card" style={{
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
                    <img src={LANDING_TESTIMONIAL_AVATARS[i]} alt={t2.name} width={42} height={42} loading="lazy" decoding="async" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #000', flexShrink: 0, boxShadow: '0 3px 0 #000' }} />
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

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: '0 clamp(16px,4vw,64px) 72px' }}>
            <div className="landing-final-cta-card" style={{
            position: 'relative', maxWidth: 960, margin: '0 auto', textAlign: 'center',
            padding: 'clamp(44px,7vw,64px) clamp(24px,6vw,64px)',
            borderRadius: 22, overflow: 'hidden',
            background: '#9122FF',
            border: '2.5px solid #000', boxShadow: '0 8px 0 #000',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="font-display" style={{ fontSize: 'clamp(26px,5vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.05, textTransform: 'uppercase' }}>
                KAZANMAYA HAZIR MISINIZ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(14px,2vw,16px)', fontWeight: 500, marginBottom: 28, maxWidth: 400, marginInline: 'auto', lineHeight: 1.6 }}>
                Kayıt ol, bugün puan toplamaya başla.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8FF00', color: '#000', border: '2.5px solid #000', borderRadius: 14, padding: '12px 28px', fontWeight: 900, fontSize: 15, boxShadow: '0 4px 0 #000', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Hemen Başlayın <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#9122FF', border: '2.5px solid #000', borderRadius: 14, padding: '12px 28px', fontWeight: 900, fontSize: 15, boxShadow: '0 4px 0 #000', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Panele Gir
                </button>
              </div>
            </div>
          </div>
        </section>
        <footer style={{ background: t.footerBg, borderTop: '2.5px solid #000', padding: 'clamp(32px,4vw,48px) clamp(20px,4vw,64px)', color: t.footerText }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 28 }}>
              <div>
                <AppLogo size={64} inverted style={{ marginBottom: 10, height: 'clamp(36px,5vw,52px)', width: 'auto' }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.62)', maxWidth: 240, lineHeight: 1.65, margin: 0 }}>
                  Daha fazla kazan, daha iyi yaşa.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase' }}>Platform</p>
                  {[['features','Özellikler'],['how','Nasıl Çalışır'],['testimonials','Yorumlar']].map(([id,label]) => (
                    <button key={id} onClick={() => scrollTo(id)} aria-label={`${label} bölümüne git`}
                      style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: 9, textAlign: 'left', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C8FF00')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>{label}</button>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase' }}>Hesap</p>
                  {[['Giriş Yap','/login'],['Hemen Başlayın','/register'],['Panele Gir','/home']].map(([label,path]) => (
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#9122FF', color: '#C8FF00', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 900 }}>NEXREWARD</div>
            </div>
          </div>
        </footer>
        <style>{`
          /* ── Scroll-reveal for section headers (one-shot, transform + opacity) ── */
          [data-lp-reveal] {
            opacity: 0;
            transform: translateY(22px);
            transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1);
            will-change: opacity, transform;
          }
          [data-lp-reveal].lp-in {
            opacity: 1;
            transform: none;
            will-change: auto;
          }

          /* ── Keyboard accessibility: focus rings on below-fold buttons ── */
          .landing-section-frame button:focus-visible,
          .landing-how-section button:focus-visible,
          .landing-final-cta-card button:focus-visible,
          .lifestyle-card button:focus-visible {
            outline: 3px solid #9122FF;
            outline-offset: 3px;
          }

          @media (prefers-reduced-motion: reduce) {
            [data-lp-reveal] {
              opacity: 1 !important;
              transform: none !important;
              transition: none !important;
            }
          }

          .landing-section-frame {
            position: relative;
            border: 2.5px solid #000;
            border-radius: clamp(22px, 3vw, 32px);
            box-shadow: 0 6px 0 #000;
            background: ${isDark ? 'rgba(30,15,56,.72)' : 'rgba(255,255,255,.90)'};
            overflow: hidden;
          }

          .landing-section-frame::before { content: none; }

          .landing-section-frame > * {
            position: relative;
            z-index: 1;
          }

          .landing-section-frame--features,
          .landing-testimonials-section {
            margin-top: 18px !important;
            margin-bottom: 34px !important;
          }

          .landing-section-frame--banners {
            margin-top: 28px !important;
            margin-bottom: 34px !important;
          }

          .landing-polish-card,
          .landing-step-card,
          .landing-testimonial-card,
          .landing-final-cta-card {
            border-radius: 20px !important;
            box-shadow: 0 6px 0 #000 !important;
          }

          .landing-how-section {
            background: ${t.howBg} !important;
          }

          .landing-step-card:hover {
            transform: translateY(-3px);
          }

          .landing-final-cta-card {
            background: linear-gradient(180deg, #B44AFF, #9122FF) !important;
          }

          @media (max-width: 560px) {
            .landing-section-frame {
              border-radius: 24px;
            }
          }
        `}</style>
    </>
  );
};

export default LandingBelowFold;
