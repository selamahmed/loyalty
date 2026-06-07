import React from "react";
import { 
  Menu, 
  Bell, 
  Scan, 
  Gamepad2, 
  Gift, 
  CheckSquare, 
  ChevronRight, 
  Trophy,
  Flame,
  Star
} from "lucide-react";

export function GeoShapes() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');

        .font-fredoka {
          font-family: 'Fredoka', sans-serif;
        }

        .neo-brutal-border {
          border: 3px solid #1e1b4b;
        }

        .neo-brutal-shadow {
          box-shadow: 0px 8px 0px #1e1b4b;
        }
          
        .neo-brutal-shadow-sm {
          box-shadow: 0px 4px 0px #1e1b4b;
        }

        .geo-shape {
          position: absolute;
          z-index: 0;
          opacity: 0.8;
        }
        
        .geo-anim-1 {
          animation: float1 10s ease-in-out infinite alternate;
        }
        
        .geo-anim-2 {
          animation: float2 12s ease-in-out infinite alternate;
        }
        
        .geo-anim-3 {
          animation: float3 15s linear infinite;
        }

        @keyframes float1 {
          0% { transform: translate(0, 0) rotate(15deg); }
          100% { transform: translate(20px, -20px) rotate(25deg); }
        }
        
        @keyframes float2 {
          0% { transform: translate(0, 0) rotate(-10deg); }
          100% { transform: translate(-15px, 25px) rotate(-20deg); }
        }
        
        @keyframes float3 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
      
      <div className="relative min-h-[100dvh] w-full bg-[#f5f3ff] font-fredoka overflow-hidden text-[#1e1b4b] flex flex-col items-center">
        
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Yellow Square */}
          <div className="geo-shape geo-anim-1 neo-brutal-border bg-[#FDE68A]" 
               style={{ top: '5%', left: '10%', width: '120px', height: '120px', transform: 'rotate(15deg)' }} />
          
          {/* Coral Circle Outline */}
          <div className="geo-shape geo-anim-2 neo-brutal-border bg-transparent rounded-full border-[4px]" 
               style={{ top: '25%', right: '5%', width: '150px', height: '150px' }} />
          
          {/* Mint Triangle (CSS approach) */}
          <div className="geo-shape geo-anim-1" style={{ top: '45%', left: '-5%' }}>
            <svg width="140" height="120" viewBox="0 0 140 120" className="overflow-visible">
              <polygon points="70,10 130,110 10,110" className="fill-[#6EE7B7] stroke-[#1e1b4b]" strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </div>
          
          {/* Violet Hexagon */}
          <div className="geo-shape geo-anim-3" style={{ top: '65%', right: '10%' }}>
             <svg width="100" height="110" viewBox="0 0 100 110" className="overflow-visible">
              <polygon points="50,5 95,28 95,82 50,105 5,82 5,28" className="fill-transparent stroke-[#1e1b4b]" strokeWidth="4" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Coral Rectangle */}
          <div className="geo-shape geo-anim-2 neo-brutal-border bg-[#FF6B6B]" 
               style={{ bottom: '5%', left: '20%', width: '180px', height: '80px', transform: 'rotate(-15deg)' }} />
               
          {/* Yellow Circle */}
          <div className="geo-shape geo-anim-1 neo-brutal-border bg-[#FDE68A] rounded-full" 
               style={{ bottom: '15%', right: '-5%', width: '100px', height: '100px' }} />
        </div>

        {/* Main Content Container - Max width for mobile-like preview */}
        <div className="relative z-10 w-full max-w-md mx-auto p-4 flex flex-col gap-6 pb-20">
          
          {/* Header */}
          <header className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF6B6B] rounded-[12px] neo-brutal-border flex items-center justify-center neo-brutal-shadow-sm">
                <Menu className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-wide">NexReward <Star className="inline w-5 h-5 text-yellow-400 fill-yellow-400 -mt-1" /></h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-full font-bold neo-brutal-border neo-brutal-shadow-sm text-sm">
                4,250 pts
              </div>
              <div className="relative w-10 h-10 bg-[#6EE7B7] rounded-full neo-brutal-border flex items-center justify-center neo-brutal-shadow-sm">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF6B6B] rounded-full border-2 border-[#1e1b4b]"></span>
              </div>
            </div>
          </header>

          {/* Hero Welcome Card */}
          <div className="bg-gradient-to-br from-[#8b5cf6] to-[#c4b5fd] rounded-[24px] p-6 text-white neo-brutal-border neo-brutal-shadow relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome back,</h2>
                  <h3 className="text-xl font-medium opacity-90">StarPlayer99!</h3>
                </div>
                <div className="flex flex-col items-end">
                  <div className="bg-[#FDE68A] text-[#1e1b4b] px-3 py-1 rounded-full text-xs font-bold neo-brutal-border mb-2 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FF6B6B] fill-[#FF6B6B]" /> 7 day streak
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 neo-brutal-border border-white/40">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1e1b4b] text-white rounded-full flex items-center justify-center font-bold text-xs neo-brutal-border border-white">
                      Lv.12
                    </div>
                    <span className="font-semibold text-sm">Novice Explorer</span>
                  </div>
                  <span className="text-sm font-bold">3,450 / 4,000 XP</span>
                </div>
                <div className="w-full h-4 bg-[#1e1b4b] rounded-full overflow-hidden border-2 border-white/50">
                  <div className="h-full bg-[#6EE7B7] w-[86%] border-r-2 border-[#1e1b4b]" />
                </div>
              </div>
            </div>
            
            {/* Decorative background circle inside card */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Scan, label: "Scan QR", color: "bg-[#FDE68A]" },
              { icon: Gamepad2, label: "Play", color: "bg-[#FF6B6B]", iconColor: "text-white" },
              { icon: Gift, label: "Rewards", color: "bg-[#6EE7B7]" },
              { icon: CheckSquare, label: "Tasks", color: "bg-[#C4B5FD]" },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group transition-transform active:translate-y-1">
                <div className={\`w-[72px] h-[72px] \${action.color} rounded-[16px] neo-brutal-border neo-brutal-shadow-sm flex items-center justify-center group-active:shadow-none group-active:translate-y-1 transition-all\`}>
                  <action.icon className={\`w-8 h-8 \${action.iconColor || 'text-[#1e1b4b]'}\`} />
                </div>
                <span className="text-xs font-bold text-center">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Daily Tasks */}
          <div className="bg-white rounded-[24px] p-5 neo-brutal-border neo-brutal-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Daily Tasks</h3>
              <button className="text-sm font-bold text-[#7c3aed] flex items-center hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Buy 1 Coffee", pts: "+50 pts", progress: "0/1", done: false },
                { title: "Scan store QR", pts: "+20 pts", progress: "1/1", done: true },
                { title: "Play Spin Wheel", pts: "+100 pts", progress: "0/1", done: false },
              ].map((task, i) => (
                <div key={i} className={\`flex items-center justify-between p-3 rounded-xl neo-brutal-border \${task.done ? 'bg-gray-50' : 'bg-[#f5f3ff]'}\`}>
                  <div className="flex items-center gap-3">
                    <div className={\`w-6 h-6 rounded flex items-center justify-center neo-brutal-border \${task.done ? 'bg-[#6EE7B7]' : 'bg-white'}\`}>
                      {task.done && <CheckSquare className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={\`font-bold text-sm \${task.done ? 'line-through opacity-50' : ''}\`}>{task.title}</p>
                      <p className="text-xs font-bold text-[#7c3aed]">{task.pts}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded-md neo-brutal-border">
                    {task.progress}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Mini */}
          <div className="bg-[#FDE68A] rounded-[24px] p-5 neo-brutal-border neo-brutal-shadow relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF6B6B]" /> Leaderboard
              </h3>
            </div>
            
            <div className="space-y-2 relative z-10">
              {[
                { rank: 1, name: "CoffeeKing", pts: "12.4k", color: "bg-[#FFD700]" },
                { rank: 2, name: "StarPlayer99", pts: "4.2k", color: "bg-[#C0C0C0]", isMe: true },
                { rank: 3, name: "BeanLover", pts: "3.8k", color: "bg-[#CD7F32]" },
              ].map((player, i) => (
                <div key={i} className={\`flex items-center justify-between p-2 rounded-xl neo-brutal-border \${player.isMe ? 'bg-white' : 'bg-white/60 backdrop-blur'}\`}>
                  <div className="flex items-center gap-3">
                    <div className={\`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm neo-brutal-border \${player.color}\`}>
                      {player.rank}
                    </div>
                    <span className={\`font-bold text-sm \${player.isMe ? 'text-[#7c3aed]' : ''}\`}>
                      {player.name} {player.isMe && "(You)"}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{player.pts}</span>
                </div>
              ))}
            </div>
            
            {/* Background decoration */}
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-black/5 pointer-events-none" />
          </div>

        </div>
      </div>
    </>
  );
}
