import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Sparkles, Trophy, Star, Zap, Gift, Target, Heart, Gamepad2, QrCode, Shield } from 'lucide-react';
import MovingStripes from '../components/MovingStripes';

/* ─── Neo Brutalism SVG Stickers ─── */
const StarSvg: React.FC<{ size?: number; fill?: string; rot?: number; className?: string }> = ({ size = 52, fill = '#FBBF24', rot = 0, className }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none" className={className} style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <polygon points="26,2 31,19 49,19 35,30 40,47 26,37 12,47 17,30 3,19 21,19" fill={fill} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const BoltSvg: React.FC<{ size?: number; fill?: string; rot?: number }> = ({ size = 46, fill = '#FCD34D', rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <polygon points="26,2 14,24 23,24 18,44 34,20 25,20" fill={fill} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const HeartSvg: React.FC<{ size?: number; fill?: string; rot?: number }> = ({ size = 46, fill = '#F472B6', rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <path d="M23 40 C23 40 4 27 4 15 C4 8 10 3 17 5 C20 6 23 11 23 11 C23 11 26 6 29 5 C36 3 42 8 42 15 C42 27 23 40 23 40Z" fill={fill} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const DiamondSvg: React.FC<{ size?: number; fill?: string; rot?: number }> = ({ size = 44, fill = '#A78BFA', rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <polygon points="22,2 40,16 22,42 4,16" fill={fill} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const BurstSvg: React.FC<{ size?: number; fill?: string; rot?: number }> = ({ size = 50, fill = '#FDE68A', rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <polygon points="25,1 29,18 44,10 36,24 48,34 31,32 28,48 21,32 4,38 14,26 2,14 18,18" fill={fill} stroke="#1e1b4b" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const CircleSvg: React.FC<{ size?: number; fill?: string }> = ({ size = 40, fill = '#6EE7B7' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="17" fill={fill} stroke="#1e1b4b" strokeWidth="2.5" />
  </svg>
);

/* ─── Feature cards ─── */
const features = [
  { icon: Zap,      emoji: '⚡', title: 'Anında Ödüller',           desc: 'Her etkileşimde anında puan kazan.',                  color: '#7B6EF6', stickerFill: '#FCD34D' },
  { icon: Gamepad2, emoji: '🎮', title: 'Eğlenceli Oyunlaştırma',   desc: 'Oyunlar oyna ve görevleri tamamla, bonus kazan.',      color: '#22c55e', stickerFill: '#6EE7B7' },
  { icon: Gift,     emoji: '🎁', title: 'Özel Ödüller',             desc: 'Puanlarını harika ödüllerle değiştir.',                color: '#f59e0b', stickerFill: '#FCA5A5' },
  { icon: Target,   emoji: '🎯', title: 'Günlük Görevler',          desc: 'Günlük zorlukları tamamla, serini koru.',              color: '#ef4444', stickerFill: '#FDE68A' },
  { icon: Trophy,   emoji: '🏆', title: 'Liderlik Tabloları',       desc: 'Diğerleriyle yarış ve sıralamada yüksel.',             color: '#06b6d4', stickerFill: '#A78BFA' },
  { icon: Heart,    emoji: '💖', title: 'Sosyal Ödüller',           desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.',            color: '#ec4899', stickerFill: '#F472B6' },
];

const steps = [
  { step: 1, emoji: '📝', title: 'Kayıt Ol',          desc: 'Saniyeler içinde hesabını oluştur.',     sticker: <BurstSvg size={34} fill="#FDE68A" rot={10} /> },
  { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışverişte puan kazan.',             sticker: <StarSvg  size={34} fill="#FBBF24" rot={-8} /> },
  { step: 3, emoji: '🎮', title: 'Oyun Oyna',          desc: 'Eğlen ve bonus puan kazan.',              sticker: <BoltSvg  size={32} fill="#FCD34D" rot={12} /> },
  { step: 4, emoji: '🎉', title: 'Ödülünü Al',         desc: 'Puanlarını harika ödüllerle değiştir.', sticker: <HeartSvg size={32} fill="#F472B6" rot={-10} /> },
];

const stats = [
  { icon: Users,    value: '50B+',  label: 'Aktif Kullanıcı',  color: '#7B6EF6', sticker: <StarSvg  size={22} fill="#FBBF24" rot={15} /> },
  { icon: Sparkles, value: '2M+',   label: 'Kazanılan Puan',   color: '#f59e0b', sticker: <BoltSvg  size={22} fill="#FCD34D" rot={-10} /> },
  { icon: Trophy,   value: '10B+',  label: 'Verilen Ödül',     color: '#22c55e', sticker: <HeartSvg size={20} fill="#F472B6" rot={10} /> },
];

const testimonials = [
  { name: 'Ayşe K.',   role: 'Alışveriş Meraklısı', text: 'NexReward sayesinde her alışverişte ekstra kazanıyorum. Harika bir uygulama!', emoji: '🌟' },
  { name: 'Mehmet T.', role: 'Sadık Üye',            text: 'Günlük görevler çok eğlenceli, ödüller ise gerçekten değerli. Kesinlikle tavsiye ederim.', emoji: '🏆' },
  { name: 'Zeynep A.', role: 'Premium Üye',          text: 'Liderlik tablolarında arkadaşlarımla rekabet etmek çok keyifli!', emoji: '💜' },
];

/* ─────────────────────────── Component ─────────────────────────── */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--bg-color)', color: 'var(--text-dark)' }}>

      {/* Moving stripes — sits behind everything */}
      <MovingStripes position="fixed" zIndex={0} />

      {/* All page content above stripes */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ══════════ NAV ══════════ */}
        <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ borderBottom: '2.5px solid var(--dark-border)', background: 'color-mix(in srgb, var(--bg-color) 85%, transparent)' }}>
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
                N
              </div>
              <span className="font-black text-xl tracking-tight" style={{ color: 'var(--text-dark)' }}>NexReward</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
              <a href="#features" className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how" className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <a href="#testimonials" className="hover:text-[#7B6EF6] transition-colors">Yorumlar</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => navigate('/login')}
                className="px-4 sm:px-5 py-2 rounded-xl font-black text-sm transition-all active:translate-y-0.5 hover:scale-105"
                style={{ border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', background: 'var(--card-bg)', color: 'var(--text-dark)' }}>
                Giriş Yap
              </button>
              <button onClick={() => navigate('/home')}
                className="px-4 sm:px-5 py-2 rounded-xl font-black text-sm text-white transition-all active:translate-y-0.5 hover:scale-105 flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
                Panel <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-16 overflow-hidden">
          {/* Floating sticker decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-10 left-6 sm:left-16" style={{ animation: 'float1 7s ease-in-out infinite' }}><StarSvg size={72} fill="#FBBF24" rot={15} /></div>
            <div className="absolute top-28 left-2 sm:left-8"  style={{ animation: 'float2 9s ease-in-out infinite' }}><BoltSvg size={52} fill="#FCD34D" rot={-10} /></div>
            <div className="absolute top-8  right-6 sm:right-16" style={{ animation: 'float2 8s ease-in-out infinite' }}><HeartSvg size={68} fill="#F472B6" rot={12} /></div>
            <div className="absolute top-32 right-2 sm:right-10"  style={{ animation: 'float1 10s ease-in-out infinite' }}><BurstSvg size={52} fill="#FDE68A" rot={20} /></div>
            <div className="absolute top-1/2 left-2 sm:left-8 -translate-y-1/2" style={{ animation: 'float1 12s ease-in-out infinite' }}><DiamondSvg size={56} fill="#A78BFA" rot={-8} /></div>
            <div className="absolute top-1/2 right-2 sm:right-8 -translate-y-1/2" style={{ animation: 'float2 11s ease-in-out infinite' }}><StarSvg size={52} fill="#6EE7B7" rot={-18} /></div>
            <div className="absolute bottom-20 left-8 sm:left-24"  style={{ animation: 'float2 8s ease-in-out infinite' }}><BurstSvg size={56} fill="#FCA5A5" rot={30} /></div>
            <div className="absolute bottom-24 right-8 sm:right-20" style={{ animation: 'float1 7s ease-in-out infinite' }}><BoltSvg size={58} fill="#FCD34D" rot={5} /></div>
            <div className="absolute bottom-12 left-1/4" style={{ animation: 'float1 13s ease-in-out infinite' }}><CircleSvg size={42} fill="#6EE7B7" /></div>
            <div className="absolute top-1/3 right-1/4" style={{ animation: 'float2 10s ease-in-out infinite' }}><StarSvg size={32} fill="#FCA5A5" rot={25} /></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)', animation: 'heroIn 0.6s ease both' }}>
              <Sparkles size={15} style={{ color: '#7B6EF6' }} />
              <span>Türkiye'nin #1 Sadakat Platformu</span>
              <StarSvg size={20} fill="#FBBF24" rot={12} />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.02] tracking-tight"
              style={{ animation: 'heroIn 0.6s 0.08s ease both' }}>
              Alışveriş Yaparken<br />
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Puan Kazan
              </span>
            </h1>

            <p className="text-lg sm:text-xl font-medium max-w-xl mx-auto" style={{ color: 'var(--text-muted)', animation: 'heroIn 0.6s 0.16s ease both' }}>
              Binlerce mutlu kullanıcıyla birlikte puan kazan, özel ödüller aç ve her gün eğlen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2" style={{ animation: 'heroIn 0.6s 0.24s ease both' }}>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -right-5 pointer-events-none"><StarSvg size={32} fill="#FBBF24" rot={20} /></div>
                <button onClick={() => navigate('/home')}
                  className="relative px-9 py-4 rounded-2xl font-black text-white text-lg transition-all active:translate-y-1 hover:scale-105 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)' }}>
                  Ücretsiz Başla <ArrowRight size={20} />
                </button>
              </div>
              <div className="relative inline-flex">
                <div className="absolute -top-5 -left-5 pointer-events-none"><BoltSvg size={28} fill="#FCD34D" rot={-15} /></div>
                <button onClick={() => navigate('/register')}
                  className="relative px-9 py-4 rounded-2xl font-black text-lg transition-all active:translate-y-1 hover:scale-105"
                  style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)' }}>
                  Hemen Kayıt Ol
                </button>
              </div>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: 'var(--text-muted)', animation: 'heroIn 0.6s 0.32s ease both' }}>
              <Shield size={14} style={{ color: '#7B6EF6' }} />
              Kredi kartı gerekmez &bull; Ücretsiz &bull; 2 dakikada kurulum
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-4" style={{ animation: 'heroIn 0.6s 0.4s ease both' }}>
              {stats.map((s, i) => (
                <div key={i} className="relative p-3 sm:p-5 rounded-2xl text-center"
                  style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
                  <div className="absolute -top-3 -right-3">{s.sticker}</div>
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-14 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 -ml-36 pointer-events-none"><BurstSvg size={46} fill="#FDE68A" rot={-10} /></div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: 'var(--tab-bg)', color: '#7B6EF6', border: '2px solid var(--dark-border)' }}>
              ✦ ÖZELLİKLER
            </div>
            <h2 className="text-4xl sm:text-5xl font-black">
              Neden Bizi{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Seveceksiniz
              </span>
            </h2>
            <p className="mt-3 font-medium max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              Ödülleri maksimize etmek ve deneyiminizi geliştirmek için ihtiyacınız olan her şey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative p-6 rounded-2xl cursor-pointer transition-all duration-200 overflow-visible"
                style={{
                  background: 'var(--card-bg)',
                  border: '2.5px solid var(--dark-border)',
                  boxShadow: hoveredFeature === i ? `0px 8px 0px var(--dark-border)` : '0px 4px 0px var(--dark-border)',
                  transform: hoveredFeature === i ? 'translateY(-4px) scale(1.01)' : 'none',
                }}>
                {/* Hover sticker */}
                <div className="absolute -top-5 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <StarSvg size={30} fill={f.stickerFill} rot={20} />
                </div>

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}18`, border: `2px solid ${f.color}`, boxShadow: `0px 3px 0px ${f.color}60` }}>
                  {f.emoji}
                </div>
                <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-dark)' }}>{f.title}</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 font-black text-sm" style={{ color: f.color }}>
                  Keşfet <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="how" className="py-20 px-4 sm:px-6" style={{ borderTop: '2.5px solid var(--dark-border)', borderBottom: '2.5px solid var(--dark-border)', background: 'var(--card-bg)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 relative">
              <div className="absolute -top-4 right-1/3 pointer-events-none"><DiamondSvg size={38} fill="#A78BFA" rot={10} /></div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
                style={{ background: 'var(--tab-bg)', color: '#7B6EF6', border: '2px solid var(--dark-border)' }}>
                ✦ NASIL ÇALIŞIR
              </div>
              <h2 className="text-4xl sm:text-5xl font-black" style={{ color: 'var(--text-dark)' }}>4 Adımda Başla</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((item, i) => (
                <div key={i} className="relative p-6 rounded-2xl text-center transition-all hover:scale-105"
                  style={{ background: 'var(--bg-color)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
                  {/* Connector arrow */}
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <ArrowRight size={18} style={{ color: '#7B6EF6' }} />
                    </div>
                  )}
                  <div className="absolute -top-5 -right-3">{item.sticker}</div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg mb-4 mx-auto"
                    style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
                    {item.step}
                  </div>
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-dark)' }}>{item.title}</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-4"
              style={{ background: 'var(--tab-bg)', color: '#7B6EF6', border: '2px solid var(--dark-border)' }}>
              ✦ KULLANICI YORUMLARI
            </div>
            <h2 className="text-4xl sm:text-5xl font-black">
              Kullanıcılarımız{' '}
              <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ne Diyor?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="relative p-6 rounded-2xl transition-all hover:scale-105"
                style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
                <div className="absolute -top-4 -right-3 pointer-events-none">
                  {i === 0 ? <StarSvg size={28} fill="#FBBF24" rot={15} /> : i === 1 ? <BurstSvg size={28} fill="#FDE68A" rot={-10} /> : <HeartSvg size={26} fill="#F472B6" rot={8} />}
                </div>
                <div className="text-3xl mb-3">{t.emoji}</div>
                <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>"{t.text}"</p>
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '2px dashed var(--divider-dash)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2px solid var(--dark-border)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{t.name}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, s) => <Star key={s} size={12} fill="#FBBF24" style={{ color: '#FBBF24' }} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="py-20 px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto text-center px-8 sm:px-16 py-16 rounded-2xl overflow-visible"
            style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '3px solid var(--dark-border)', boxShadow: '0px 10px 0px var(--dark-border)' }}>
            {/* Corner stickers */}
            <div className="absolute -top-7 -left-6  pointer-events-none"><StarSvg size={56} fill="#FBBF24" rot={-15} /></div>
            <div className="absolute -top-6 -right-7 pointer-events-none"><HeartSvg size={52} fill="#F472B6" rot={20} /></div>
            <div className="absolute -bottom-6 -left-7 pointer-events-none"><BoltSvg size={50} fill="#FCD34D" rot={10} /></div>
            <div className="absolute -bottom-7 -right-6 pointer-events-none"><BurstSvg size={54} fill="#FDE68A" rot={-20} /></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-6 bg-white/20 text-white border-2 border-white/40">
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
                <div className="absolute -top-5 -right-5 pointer-events-none"><StarSvg size={28} fill="#FBBF24" rot={18} /></div>
                <button onClick={() => navigate('/home')}
                  className="relative px-9 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 hover:scale-105 flex items-center gap-2"
                  style={{ background: 'var(--dark-border)', color: 'white', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.35)' }}>
                  Panele Gir <ArrowRight size={20} />
                </button>
              </div>
              <button onClick={() => navigate('/register')}
                className="px-9 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 hover:scale-105 text-white"
                style={{ background: 'rgba(255,255,255,0.18)', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.25)' }}>
                Ücretsiz Kayıt Ol
              </button>
            </div>

            <p className="mt-6 text-white/60 text-xs font-medium">
              Kredi kartı gerekmez &bull; İstediğin zaman iptal et
            </p>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="px-4 sm:px-8 py-10" style={{ borderTop: '2.5px solid var(--dark-border)', background: 'var(--card-bg)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
                style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)' }}>
                N
              </div>
              <span className="font-black text-lg" style={{ color: 'var(--text-dark)' }}>NexReward</span>
            </div>
            <div className="flex items-center gap-3">
              <StarSvg size={18} fill="#FBBF24" rot={10} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>© 2026 NexReward. Daha fazla kazan, daha iyi yaşa.</p>
              <StarSvg size={18} fill="#FBBF24" rot={-10} />
            </div>
            <div className="flex items-center gap-4 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
              <a href="#features" className="hover:text-[#7B6EF6] transition-colors">Özellikler</a>
              <a href="#how" className="hover:text-[#7B6EF6] transition-colors">Nasıl Çalışır</a>
              <button onClick={() => navigate('/login')} className="hover:text-[#7B6EF6] transition-colors">Giriş</button>
            </div>
          </div>
        </footer>

      </div>{/* /z-10 wrapper */}

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-22px) rotate(-7deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
