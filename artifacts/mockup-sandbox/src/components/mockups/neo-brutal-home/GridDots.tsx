import React from 'react';
import { Star, QrCode, Gamepad2, Gift, CheckCircle2, ChevronRight, Trophy, Flame, Coins, Zap } from 'lucide-react';

export function GridDots() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f5f3ff] text-[#1e1b4b] font-sans selection:bg-[#7c3aed] selection:text-white" style={{ fontFamily: '"Fredoka", sans-serif' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
          
          .bg-dots {
            background-image: radial-gradient(#7c3aed 1.5px, transparent 1.5px);
            background-size: 24px 24px;
            opacity: 0.15;
          }

          .brutal-border {
            border: 3px solid #1e1b4b;
          }

          .brutal-shadow {
            box-shadow: 0px 8px 0px #1e1b4b;
          }

          .brutal-shadow-sm {
            box-shadow: 0px 4px 0px #1e1b4b;
          }
          
          .brutal-active:active {
            transform: translateY(4px);
            box-shadow: 0px 4px 0px #1e1b4b;
          }

          .brutal-active-sm:active {
            transform: translateY(2px);
            box-shadow: 0px 2px 0px #1e1b4b;
          }
            
          .float-1 {
            animation: float1 6s ease-in-out infinite;
          }
          .float-2 {
            animation: float2 8s ease-in-out infinite;
          }
          
          @keyframes float1 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes float2 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-5deg); }
          }

          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
      </style>

      {/* Background Dots */}
      <div className="absolute inset-0 bg-dots pointer-events-none" />

      {/* Floating Shapes */}
      <div className="absolute top-20 -left-10 w-32 h-32 bg-[#c4b5fd]/40 rounded-full float-1 pointer-events-none" />
      <div className="absolute top-60 -right-8 w-24 h-24 bg-[#fde047]/50 rounded-lg brutal-border float-2 pointer-events-none transform rotate-12" />
      <div className="absolute bottom-40 -left-4 w-16 h-16 bg-[#fca5a5]/40 rounded-full float-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#86efac]/20 rounded-full float-1 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      {/* Doodle stars and zigzags */}
      <svg className="absolute top-32 right-12 w-12 h-12 text-[#f59e0b] float-1 pointer-events-none opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      
      <svg className="absolute bottom-60 right-6 w-16 h-16 text-[#6d28d9] float-2 pointer-events-none opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-4 sm:p-6 pb-24 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center brutal-border brutal-shadow-sm">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">NexReward</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full brutal-border brutal-shadow-sm">
            <Coins className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="font-bold">4,250 pts</span>
          </div>
        </header>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-[32px] p-6 text-white brutal-border brutal-shadow relative overflow-hidden">
          {/* Decorative SVG in hero */}
          <svg className="absolute top-0 right-0 text-white/10 w-32 h-32 transform translate-x-8 -translate-y-8" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" />
          </svg>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-2 backdrop-blur-sm border border-white/30">
                  <Flame className="w-4 h-4 inline-block mr-1 text-[#fde047] fill-[#fde047] -translate-y-0.5" />
                  7 day streak
                </span>
                <h2 className="text-2xl font-bold leading-tight">Welcome back,<br/>StarPlayer99!</h2>
              </div>
              <div className="bg-[#fde047] text-[#1e1b4b] w-14 h-14 rounded-full flex items-center justify-center font-bold brutal-border transform rotate-6 brutal-shadow-sm text-lg">
                Lv.12
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Next level</span>
                <span>3,450 / 4,000 XP</span>
              </div>
              <div className="h-5 bg-[#1e1b4b] rounded-full p-0.5 brutal-border">
                <div className="h-full bg-[#fde047] rounded-full border-r-[3px] border-[#1e1b4b] w-[86%] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: QrCode, label: 'Scan', color: 'bg-[#a78bfa]' },
            { icon: Gamepad2, label: 'Play', color: 'bg-[#6ee7b7]' },
            { icon: Gift, label: 'Rewards', color: 'bg-[#fca5a5]' },
            { icon: Zap, label: 'Tasks', color: 'bg-[#fde047]' }
          ].map((action, i) => (
            <button key={i} className="flex flex-col items-center gap-2 group brutal-active-sm cursor-pointer outline-none">
              <div className={`w-14 h-14 ${action.color} rounded-[16px] flex items-center justify-center brutal-border brutal-shadow-sm transition-transform group-hover:-translate-y-1`}>
                <action.icon className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Daily Tasks */}
        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-xl font-bold">Daily Tasks</h3>
            <span className="text-sm font-bold text-[#7c3aed]">2/3 Done</span>
          </div>
          
          <div className="bg-white rounded-[24px] p-4 brutal-border brutal-shadow space-y-3">
            {[
              { title: 'Check in for 7 days', pts: 50, done: true },
              { title: 'Play 1 Mini Game', pts: 100, done: true },
              { title: 'Refer a friend', pts: 500, done: false }
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-[#f5f3ff] brutal-border brutal-shadow-sm transition-transform hover:-translate-y-0.5">
                <div className={`w-8 h-8 rounded-full brutal-border flex items-center justify-center shrink-0 ${task.done ? 'bg-[#86efac] text-[#1e1b4b]' : 'bg-white'}`}>
                  {task.done && <CheckCircle2 className="w-5 h-5" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-[15px] ${task.done ? 'line-through opacity-70' : ''}`}>{task.title}</h4>
                  <span className="text-sm font-bold text-[#7c3aed]">+{task.pts} pts</span>
                </div>
                {!task.done && (
                  <button className="w-8 h-8 rounded-full bg-white brutal-border flex items-center justify-center hover:bg-[#fde047] transition-colors brutal-active-sm cursor-pointer outline-none">
                    <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
              Leaderboard
            </h3>
            <button className="text-sm font-bold text-[#7c3aed] hover:underline cursor-pointer outline-none">View All</button>
          </div>
          
          <div className="bg-white rounded-[24px] overflow-hidden brutal-border brutal-shadow">
            {[
              { rank: 1, name: 'AlexTheGreat', pts: '12,450', color: 'bg-[#fde047]' },
              { rank: 2, name: 'CryptoKing', pts: '11,200', color: 'bg-[#cbd5e1]' },
              { rank: 3, name: 'StarPlayer99', pts: '10,150', color: 'bg-[#fca5a5]' },
            ].map((user, i) => (
              <div key={i} className={`flex items-center p-4 border-b-[3px] border-[#1e1b4b] last:border-b-0 ${user.name === 'StarPlayer99' ? 'bg-[#f5f3ff]' : ''}`}>
                <div className={`w-8 h-8 rounded-full brutal-border flex items-center justify-center font-bold mr-3 ${user.color} shrink-0`}>
                  {user.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#c4b5fd] brutal-border mr-3 overflow-hidden flex items-center justify-center shrink-0 text-xl font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 font-bold truncate pr-2">
                  {user.name}
                </div>
                <div className="font-bold text-[#7c3aed]">
                  {user.pts}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
