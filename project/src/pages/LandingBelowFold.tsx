import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Check, ChevronRight, Zap, Gift, Gamepad2, Target, Trophy, Users } from 'lucide-react';
import { SectionBadge } from '../components/neo/NeoBrutalDecor';
import StickerAccent from '../components/StickerAccent';
import { SectionStickerDecor, StickerSectionDivider } from '../components/StickerDecor';
import { LANDING_BANNER_STICKERS, LANDING_LIFESTYLE_STICKERS, LANDING_CTA_STICKERS } from '../lib/pageStickers';
import { LANDING_TESTIMONIAL_AVATARS } from '../lib/landingDemoAvatars';
import AppLogo from '../components/AppLogo';
import { features, banners, testimonials, steps, tickerHero, TickerStrip, NBolt, NStar5, NDiamond, NHeart, NBurst, NStar4 } from './landingShared';

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

  return (
    <>
        {/* ══ TICKER 1 ══ */}
        <TickerStrip items={tickerHero} direction="left" bg="#9122FF" textColor="#C8FF00" borderTop="3px solid #000" borderBottom="3px solid #000" speed={32} />

        <StickerSectionDivider />

        {/* ══ AVANTAJLAR (stacking banners — NO rotation on mobile) ══ */}
        <SectionStickerDecor preset="landing-banners">
        <section id="banners" className="landing-section-frame landing-section-frame--banners" style={{ padding: '72px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <SectionBadge label="AVANTAJLAR" bg="#FFE500" />
            <h2 className="font-display" style={{ fontSize: 'clamp(26px,4.5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
              NEDEN <span style={{ color: '#FF3E9D' }}>NEXREWARD?</span>
            </h2>
          </div>

          {banners.map((b, i) => (
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
        <section id="features" className="landing-section-frame landing-section-frame--features" style={{ padding: '72px clamp(16px,4vw,64px)', maxWidth: 1200, margin: '0 auto' }}>
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
        </SectionStickerDecor>

        <StickerSectionDivider />

        {/* ══ TICKER 2 ══ */}
        <TickerStrip
          items={[{text:'KAZAN',emoji:'💰'},{text:'ÖDÜL',emoji:'🎁'},{text:'EĞLEN',emoji:'🎮'},{text:'PAYLAŞ',emoji:'💜'},{text:'YÜKSEL',emoji:'🚀'},{text:'KEŞFET',emoji:'🔮'},{text:'BAŞAR',emoji:'🏆'},{text:'NEXREWARD',emoji:'⭐'}]}
          direction="right" bg={isDark ? '#2A1550' : '#C8FF00'} textColor={isDark ? '#C8FF00' : '#000'}
          borderTop="2.5px solid #000" borderBottom="2.5px solid #000" speed={24}
        />

        {/* ══ HOW IT WORKS ══ */}
        <section id="how" className="landing-how-section" style={{ padding: '80px clamp(16px,4vw,64px)', background: t.howBg, borderTop: '3px solid #000', borderBottom: '3px solid #000', transition: 'background 0.3s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
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
        <section id="testimonials" className="landing-section-frame landing-testimonials-section" style={{ padding: '80px clamp(16px,4vw,64px)', maxWidth: 1100, margin: '0 auto' }}>
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
          <div className="landing-rating-summary" style={{ ...card, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
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
            <div className="landing-final-cta-card" style={{
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
        <style>{`
          .landing-section-frame {
            position: relative;
            border: 3px solid #000;
            border-radius: clamp(28px, 4vw, 38px);
            box-shadow:
              0 10px 0 #000,
              0 26px 58px ${isDark ? 'rgba(0,0,0,.34)' : 'rgba(15,7,32,.14)'};
            background:
              radial-gradient(circle at 18% 4%, ${isDark ? 'rgba(145,34,255,.16)' : 'rgba(145,34,255,.10)'}, transparent 34%),
              linear-gradient(180deg, ${isDark ? 'rgba(42,21,80,.72)' : 'rgba(255,255,255,.86)'}, ${isDark ? 'rgba(30,15,56,.62)' : 'rgba(245,240,255,.72)'});
            backdrop-filter: blur(18px);
            overflow: hidden;
          }

          .landing-section-frame::before {
            content: "";
            position: absolute;
            inset: 10px;
            border: 1px solid ${isDark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.72)'};
            border-radius: clamp(20px, 3vw, 28px);
            pointer-events: none;
          }

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
          .landing-rating-summary,
          .landing-testimonial-card,
          .landing-final-cta-card {
            border-radius: 24px !important;
            box-shadow:
              0 8px 0 #000,
              0 18px 40px ${isDark ? 'rgba(0,0,0,.28)' : 'rgba(15,7,32,.12)'} !important;
          }

          .landing-rating-summary {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(135deg, ${isDark ? 'rgba(42,21,80,.92)' : 'rgba(255,255,255,.92)'}, ${isDark ? 'rgba(30,15,56,.88)' : 'rgba(245,240,255,.86)'}) !important;
            border-radius: 28px !important;
            padding: clamp(18px, 3vw, 28px) !important;
          }

          .landing-rating-summary::after {
            content: "";
            position: absolute;
            right: -36px;
            top: -36px;
            width: 120px;
            height: 120px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(200,255,0,.18), transparent 68%);
            pointer-events: none;
          }

          .landing-testimonial-card {
            background:
              linear-gradient(180deg, ${isDark ? 'rgba(42,21,80,.90)' : 'rgba(255,255,255,.94)'}, ${isDark ? 'rgba(30,15,56,.88)' : 'rgba(245,240,255,.82)'}) !important;
            border-radius: 28px !important;
          }

          .landing-testimonial-card:hover {
            box-shadow:
              0 12px 0 #000,
              0 26px 52px ${isDark ? 'rgba(0,0,0,.34)' : 'rgba(15,7,32,.16)'} !important;
          }

          .landing-how-section {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 0%, ${isDark ? 'rgba(145,34,255,.18)' : 'rgba(145,34,255,.10)'}, transparent 38%),
              ${t.howBg} !important;
          }

          .landing-step-card {
            transition: transform .16s ease, box-shadow .16s ease;
          }

          .landing-step-card:hover {
            transform: translateY(-4px);
            box-shadow:
              0 12px 0 #000,
              0 24px 46px ${isDark ? 'rgba(0,0,0,.28)' : 'rgba(15,7,32,.14)'} !important;
          }

          .landing-final-cta-card {
            background:
              radial-gradient(circle at 18% 18%, rgba(200,255,0,.18), transparent 28%),
              linear-gradient(180deg, #B44AFF, #9122FF) !important;
          }

          @media (max-width: 560px) {
            .landing-section-frame {
              border-radius: 28px;
              box-shadow: 0 7px 0 #000, 0 20px 38px rgba(0,0,0,.24);
            }

            .landing-section-frame::before {
              inset: 8px;
              border-radius: 20px;
            }

            .landing-rating-summary {
              justify-content: center;
              text-align: center;
            }

            .landing-rating-summary .rating-divider {
              display: none;
            }
          }
        `}</style>
    </>
  );
};

export default LandingBelowFold;
