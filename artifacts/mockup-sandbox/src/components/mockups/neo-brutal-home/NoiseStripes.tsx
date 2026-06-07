import React from 'react';
import { Star, QrCode, Gamepad2, Gift, CheckSquare, Trophy, ChevronRight, Menu, Bell, Flame } from 'lucide-react';

export function NoiseStripes() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
        .font-fredoka { font-family: 'Fredoka', sans-serif; }
        
        .diagonal-stripes {
          background-color: #f5f3ff;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(124, 58, 237, 0.05),
            rgba(124, 58, 237, 0.05) 20px,
            transparent 20px,
            transparent 40px
          );
        }
        
        .neo-shadow {
          box-shadow: 0px 8px 0px #1e1b4b;
        }
        
        .neo-shadow-sm {
          box-shadow: 0px 4px 0px #1e1b4b;
        }
        
        .neo-border {
          border: 3px solid #1e1b4b;
        }
      `}</style>

      <div className="min-h-screen diagonal-stripes font-fredoka text-[#1e1b4b] relative overflow-hidden flex flex-col items-center">
        {/* Background typographic decorations */}
        <div className="absolute top-20 -left-10 text-[12rem] font-bold text-violet-500/10 pointer-events-none rotate-12 leading-none">★</div>
        <div className="absolute top-1/2 -right-16 text-[15rem] font-black text-violet-500/10 pointer-events-none -rotate-12 leading-none">+</div>
        <div className="absolute -bottom-10 -left-10 text-[10rem] font-black text-violet-500/10 pointer-events-none rotate-45 leading-none">×</div>

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-yellow-400 neo-border neo-shadow-sm rounded-xl hidden md:block" />
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-rose-400 neo-border neo-shadow-sm rounded-full hidden md:block" />

        <div className="w-full max-w-md mx-auto p-4 md:p-6 relative z-10 flex flex-col gap-6 pb-20">
          
          {/* Header */}
          <header className="flex justify-between items-center bg-white p-3 rounded-full neo-border neo-shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center neo-border text-white text-sm">
                ⭐
              </div>
              <span className="font-bold text-xl tracking-tight">NexReward</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 font-bold px-3 py-1.5 rounded-full neo-border text-sm flex items-center gap-1">
                4,250 pts
              </div>
              <button className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center neo-border hover:-translate-y-1 hover:neo-shadow-sm transition-all">
                <Bell size={20} className="text-indigo-950" />
              </button>
            </div>
          </header>

          {/* Hero Welcome Card */}
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-[32px] p-6 neo-border neo-shadow text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-[8rem] text-white/10 rotate-12">★</div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome back,</h2>
                  <h1 className="text-3xl font-black text-yellow-300">StarPlayer99!</h1>
                </div>
                <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full border-2 border-white/30 flex items-center gap-1 font-bold">
                  <Flame className="text-rose-400" size={16} fill="currentColor" />
                  <span>7 day streak</span>
                </div>
              </div>
              
              <div className="mt-8 bg-white text-indigo-950 p-4 rounded-2xl neo-border neo-shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-lg font-bold border-2 border-violet-200 text-sm">Lv.12</span>
                    <span className="font-bold text-sm text-gray-600">Pro Gamer</span>
                  </div>
                  <span className="font-bold text-sm">3,450 / 4,000 XP</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full border-2 border-indigo-950 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-violet-500 w-[86%] border-r-2 border-indigo-950"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: QrCode, label: 'QR Scan', bg: 'bg-emerald-300' },
              { icon: Gamepad2, label: 'Play', bg: 'bg-cyan-300' },
              { icon: Gift, label: 'Rewards', bg: 'bg-rose-300' },
              { icon: CheckSquare, label: 'Tasks', bg: 'bg-yellow-300' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className={\`w-[72px] h-[72px] \${action.bg} rounded-[24px] neo-border neo-shadow-sm flex items-center justify-center group-hover:-translate-y-1 transition-transform group-active:translate-y-1 group-active:shadow-none group-active:mb-[4px]\`}>
                  <action.icon size={32} className="text-indigo-950" />
                </div>
                <span className="font-bold text-xs">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Daily Tasks */}
          <div className="bg-white rounded-[32px] p-5 neo-border neo-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckSquare className="text-violet-600" />
                Daily Tasks
              </h3>
              <button className="text-violet-600 font-bold text-sm flex items-center hover:underline">
                View All <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { title: 'Check in today', pts: '+50', done: true },
                { title: 'Play 3 mini-games', pts: '+150', done: false, progress: '1/3' },
                { title: 'Share with a friend', pts: '+300', done: false },
              ].map((task, i) => (
                <div key={i} className={\`p-3 rounded-2xl neo-border flex items-center gap-3 \${task.done ? 'bg-gray-100' : 'bg-white'}\`}>
                  <div className={\`w-8 h-8 rounded-xl flex items-center justify-center neo-border \${task.done ? 'bg-emerald-400' : 'bg-white'}\`}>
                    {task.done && <CheckSquare size={16} className="text-indigo-950" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={\`font-bold \${task.done ? 'text-gray-500 line-through' : 'text-indigo-950'}\`}>{task.title}</h4>
                    {task.progress && <p className="text-xs font-bold text-gray-500">Progress: {task.progress}</p>}
                  </div>
                  <div className="font-black text-violet-600 bg-violet-100 px-2 py-1 rounded-lg neo-border text-sm">
                    {task.pts}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Mini */}
          <div className="bg-indigo-950 text-white rounded-[32px] p-5 neo-border neo-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-300">
                <Trophy className="text-yellow-400" />
                Leaderboard
              </h3>
              <button className="text-indigo-200 font-bold text-sm flex items-center hover:text-white">
                Full list <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="space-y-2 relative z-10">
              {[
                { rank: 1, name: 'DragonSlayer', pts: '12.4k', color: 'bg-yellow-400 text-indigo-950' },
                { rank: 2, name: 'NinjaCat', pts: '11.2k', color: 'bg-slate-300 text-indigo-950' },
                { rank: 3, name: 'StarPlayer99', pts: '10.8k', color: 'bg-amber-600 text-white' },
              ].map((player, i) => (
                <div key={i} className="flex items-center gap-3 bg-indigo-900 p-2 rounded-xl neo-border border-indigo-700">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-black neo-border \${player.color}\`}>
                    {player.rank}
                  </div>
                  <div className="font-bold flex-1">{player.name}</div>
                  <div className="font-bold text-yellow-300">{player.pts}</div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
