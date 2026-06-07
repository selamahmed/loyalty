import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Zap, Gift, Target, Trophy, Heart, Users, Sparkles, Gamepad2 } from 'lucide-react';

/* ── Neo Brutalism SVG Stickers ── */
const StarSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 64, color = '#FBBF24', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <polygon points="32,4 39,24 60,24 44,38 50,58 32,46 14,58 20,38 4,24 25,24" fill={color} stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const LightningSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 56, color = '#FCD34D', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <polygon points="32,4 18,30 28,30 22,54 40,24 30,24" fill={color} stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const HeartSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 56, color = '#F472B6', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <path d="M28 48 C28 48 6 34 6 20 C6 12 12 6 20 8 C24 9 28 14 28 14 C28 14 32 9 36 8 C44 6 50 12 50 20 C50 34 28 48 28 48Z" fill={color} stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const DiamondSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 52, color = '#A78BFA', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <polygon points="26,4 48,20 26,48 4,20" fill={color} stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const CircleBadge: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ size = 56, color = '#6EE7B7', style, children }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={style}>
    <circle cx="28" cy="28" r="24" fill={color} stroke="#1a1a2e" strokeWidth="3" />
    {children}
  </svg>
);

const ArrowSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 60, color = '#FCA5A5', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <path d="M10 30 L42 30 M30 16 L46 30 L30 44" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 30 L42 30 M30 16 L46 30 L30 44" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
  </svg>
);

const BurstSticker: React.FC<{ size?: number; color?: string; rot?: number; style?: React.CSSProperties }> = ({ size = 60, color = '#FDE68A', rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ transform: `rotate(${rot}deg)`, ...style }}>
    <polygon points="30,2 36,22 54,14 44,30 58,42 38,38 34,58 26,38 6,46 18,32 4,18 24,24" fill={color} stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const features = [
  { icon: Zap, title: 'Instant Rewards', desc: 'Earn points instantly with every interaction', color: '#7B6EF6', emoji: '⚡', stickerColor: '#FCD34D' },
  { icon: Gamepad2, title: 'Fun Gamification', desc: 'Play games and complete missions for bonuses', color: '#22c55e', emoji: '🎮', stickerColor: '#6EE7B7' },
  { icon: Gift, title: 'Exclusive Rewards', desc: 'Redeem your points for amazing prizes', color: '#f59e0b', emoji: '🎁', stickerColor: '#FCA5A5' },
  { icon: Target, title: 'Daily Missions', desc: 'Complete daily challenges and earn streaks', color: '#ef4444', emoji: '🎯', stickerColor: '#FDE68A' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Compete with others and climb the ranks', color: '#06b6d4', emoji: '🏆', stickerColor: '#A78BFA' },
  { icon: Heart, title: 'Social Rewards', desc: 'Earn bonus points by sharing with friends', color: '#ec4899', emoji: '💖', stickerColor: '#F472B6' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-color)' }}>

      {/* ── NAV BAR ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid #1a1a2e', boxShadow: '0px 3px 0px #1a1a2e' }}
          >N</div>
          <span className="font-black text-xl" style={{ color: 'var(--text-dark)' }}>NexReward</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-xl font-black text-sm transition-all active:scale-95 hover:scale-105"
            style={{ border: '2px solid #1a1a2e', boxShadow: '0px 3px 0px #1a1a2e', background: 'var(--card-bg)', color: 'var(--text-dark)' }}
          >Log In</button>
          <button
            onClick={() => navigate('/home')}
            className="px-5 py-2 rounded-xl font-black text-sm text-white transition-all active:scale-95 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2px solid #1a1a2e', boxShadow: '0px 3px 0px #1a1a2e' }}
          >Dashboard →</button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">

        {/* Floating sticker decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top left cluster */}
          <div className="absolute top-8 left-6 sm:left-16 animate-[stickerFloat1_6s_ease-in-out_infinite]">
            <StarSticker size={72} color="#FBBF24" rot={15} />
          </div>
          <div className="absolute top-24 left-2 sm:left-8 animate-[stickerFloat2_8s_ease-in-out_infinite]">
            <LightningSticker size={48} color="#FCD34D" rot={-10} />
          </div>

          {/* Top right cluster */}
          <div className="absolute top-6 right-8 sm:right-20 animate-[stickerFloat2_7s_ease-in-out_infinite]">
            <HeartSticker size={64} color="#F472B6" rot={12} />
          </div>
          <div className="absolute top-28 right-4 sm:right-10 animate-[stickerFloat1_9s_ease-in-out_infinite]">
            <BurstSticker size={52} color="#FDE68A" rot={20} />
          </div>

          {/* Mid left */}
          <div className="absolute top-1/2 left-3 sm:left-12 -translate-y-1/2 animate-[stickerFloat1_11s_ease-in-out_infinite]">
            <DiamondSticker size={56} color="#A78BFA" rot={-8} />
          </div>

          {/* Mid right */}
          <div className="absolute top-1/2 right-3 sm:right-12 -translate-y-1/2 animate-[stickerFloat2_10s_ease-in-out_infinite]">
            <StarSticker size={56} color="#6EE7B7" rot={-18} />
          </div>

          {/* Bottom left */}
          <div className="absolute bottom-16 left-8 sm:left-24 animate-[stickerFloat2_8s_ease-in-out_infinite]">
            <BurstSticker size={60} color="#FCA5A5" rot={30} />
          </div>

          {/* Bottom right */}
          <div className="absolute bottom-20 right-8 sm:right-20 animate-[stickerFloat1_7s_ease-in-out_infinite]">
            <LightningSticker size={60} color="#FCD34D" rot={5} />
          </div>

          {/* Bottom center-left */}
          <div className="absolute bottom-10 left-1/4 animate-[stickerFloat1_12s_ease-in-out_infinite]">
            <CircleBadge size={44} color="#6EE7B7" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm"
            style={{ background: 'var(--card-bg)', border: '2.5px solid #1a1a2e', boxShadow: '0px 4px 0px #1a1a2e' }}>
            <Sparkles size={16} style={{ color: '#7B6EF6' }} />
            <span style={{ color: 'var(--text-dark)' }}>The #1 Loyalty Rewards Platform</span>
            <StarSticker size={22} color="#FBBF24" rot={10} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight"
            style={{ color: 'var(--text-dark)', animation: 'heroIn 0.7s cubic-bezier(.22,1,.36,1) both' }}>
            Earn Rewards<br />
            <span style={{
              background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>While You Shop</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto font-medium"
            style={{ animation: 'heroIn 0.7s 0.1s cubic-bezier(.22,1,.36,1) both' }}>
            Join thousands of happy customers earning points, unlocking exclusive rewards, and having fun every day.
          </p>

          {/* CTA buttons — with sticker accents */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
            style={{ animation: 'heroIn 0.7s 0.2s cubic-bezier(.22,1,.36,1) both' }}>

            {/* Primary CTA */}
            <div className="relative inline-block">
              <div className="absolute -top-4 -right-4 z-10">
                <StarSticker size={32} color="#FBBF24" rot={20} />
              </div>
              <button
                onClick={() => navigate('/home')}
                className="relative px-8 py-4 rounded-2xl font-black text-white text-lg transition-all active:translate-y-1 active:shadow-none hover:scale-105 flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
                  border: '2.5px solid #1a1a2e',
                  boxShadow: '0px 6px 0px #1a1a2e',
                }}
              >
                Get Started Free <ArrowRight size={20} />
              </button>
            </div>

            {/* Secondary CTA */}
            <div className="relative inline-block">
              <div className="absolute -top-4 -left-4 z-10">
                <LightningSticker size={30} color="#FCD34D" rot={-15} />
              </div>
              <button
                onClick={() => navigate('/register')}
                className="relative px-8 py-4 rounded-2xl font-black text-lg transition-all active:translate-y-1 active:shadow-none hover:scale-105"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--text-dark)',
                  border: '2.5px solid #1a1a2e',
                  boxShadow: '0px 6px 0px #1a1a2e',
                }}
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6"
            style={{ animation: 'heroIn 0.7s 0.3s cubic-bezier(.22,1,.36,1) both' }}>
            {[
              { icon: Users, value: '50K+', label: 'Active Users', color: '#7B6EF6', sticker: <StarSticker size={24} color="#FBBF24" rot={15} /> },
              { icon: Sparkles, value: '2M+', label: 'Points Earned', color: '#f59e0b', sticker: <LightningSticker size={24} color="#FCD34D" rot={-10} /> },
              { icon: Trophy, value: '10K+', label: 'Rewards Given', color: '#22c55e', sticker: <HeartSticker size={22} color="#F472B6" rot={10} /> },
            ].map((s, i) => (
              <div key={i} className="relative p-3 sm:p-5 rounded-2xl text-center"
                style={{ background: 'var(--card-bg)', border: '2.5px solid #1a1a2e', boxShadow: '0px 4px 0px #1a1a2e' }}>
                <div className="absolute -top-3 -right-3">{s.sticker}</div>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 -ml-32">
            <BurstSticker size={48} color="#FDE68A" rot={-10} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: 'var(--text-dark)' }}>
            Why You'll{' '}
            <span style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Love Us
            </span>
          </h2>
          <p className="text-gray-500 mt-3 font-medium max-w-lg mx-auto">Everything you need to maximize rewards and enjoy the experience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i}
              className="group relative p-6 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer overflow-visible"
              style={{ background: 'var(--card-bg)', border: '2.5px solid #1a1a2e', boxShadow: '0px 5px 0px #1a1a2e', animationDelay: `${i * 0.06}s` }}
            >
              {/* Sticker badge on corner */}
              <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <StarSticker size={32} color={f.stickerColor} rot={20} />
              </div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${f.color}18`, border: `2px solid ${f.color}`, boxShadow: `0px 3px 0px ${f.color}50` }}>
                {f.emoji}
              </div>
              <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-dark)' }}>{f.title}</h3>
              <p className="text-sm text-gray-500 font-medium">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 font-black text-sm" style={{ color: f.color }}>
                Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--card-bg)', borderTop: '2.5px solid #1a1a2e', borderBottom: '2.5px solid #1a1a2e' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 relative">
            <div className="absolute -top-4 right-1/3">
              <DiamondSticker size={40} color="#A78BFA" rot={10} />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black" style={{ color: 'var(--text-dark)' }}>How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: 1, title: 'Sign Up', desc: 'Create your account in seconds', emoji: '📝', sticker: <BurstSticker size={36} color="#FDE68A" rot={10} /> },
              { step: 2, title: 'Shop & Earn', desc: 'Get points on every purchase', emoji: '🛍️', sticker: <StarSticker size={36} color="#FBBF24" rot={-8} /> },
              { step: 3, title: 'Play Games', desc: 'Have fun and earn bonuses', emoji: '🎮', sticker: <LightningSticker size={34} color="#FCD34D" rot={12} /> },
              { step: 4, title: 'Redeem', desc: 'Exchange points for rewards', emoji: '🎉', sticker: <HeartSticker size={34} color="#F472B6" rot={-10} /> },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl text-center"
                style={{ background: 'var(--bg-color)', border: '2.5px solid #1a1a2e', boxShadow: '0px 5px 0px #1a1a2e' }}>
                <div className="absolute -top-5 -right-3">{item.sticker}</div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg mb-4 mx-auto"
                  style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2px solid #1a1a2e', boxShadow: '0px 3px 0px #1a1a2e' }}>
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-dark)' }}>{item.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="relative max-w-3xl mx-auto text-center p-10 sm:p-16 rounded-2xl overflow-visible"
          style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '3px solid #1a1a2e', boxShadow: '0px 8px 0px #1a1a2e' }}>

          {/* Corner stickers */}
          <div className="absolute -top-6 -left-5"><StarSticker size={54} color="#FBBF24" rot={-15} /></div>
          <div className="absolute -top-5 -right-6"><HeartSticker size={50} color="#F472B6" rot={20} /></div>
          <div className="absolute -bottom-5 -left-6"><LightningSticker size={48} color="#FCD34D" rot={10} /></div>
          <div className="absolute -bottom-6 -right-5"><BurstSticker size={52} color="#FDE68A" rot={-20} /></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-white/85 text-base sm:text-lg mb-8 font-medium">Join our loyalty program and start collecting rewards today.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative inline-block">
                <div className="absolute -top-4 -right-4 z-10"><StarSticker size={28} color="#FBBF24" rot={18} /></div>
                <button
                  onClick={() => navigate('/home')}
                  className="relative px-8 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 active:shadow-none hover:scale-105 flex items-center gap-2"
                  style={{ background: '#1a1a2e', color: 'white', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.4)' }}
                >
                  Enter Dashboard <ArrowRight size={20} />
                </button>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-xl font-black text-lg transition-all active:translate-y-1 active:shadow-none hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2.5px solid white', boxShadow: '0px 5px 0px rgba(0,0,0,0.3)' }}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t-2 border-[#1a1a2e]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <StarSticker size={20} color="#FBBF24" rot={10} />
          <span className="font-black text-lg" style={{ color: 'var(--text-dark)' }}>NexReward</span>
          <StarSticker size={20} color="#FBBF24" rot={-10} />
        </div>
        <p className="text-gray-500 text-sm font-medium">© 2026 NexReward. Earn more, live better.</p>
      </footer>

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stickerFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }
        @keyframes stickerFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-7deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
