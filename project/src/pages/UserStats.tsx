import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Star, Gamepad2, QrCode, Target, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statsData } from '../data/mockData';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const statCards = [
  { label: 'Toplam Kazanılan', value: '4,250', emoji: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', trend: '+12%' },
  { label: 'Oynanan Oyun',    value: '47',    emoji: '🎮', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   accent: '#22c55e', trend: '+8%' },
  { label: 'QR Tarama',       value: '23',    emoji: '📱', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', accent: '#3b82f6', trend: '+5%' },
  { label: 'Görev Tamamlandı',value: '31',    emoji: '🎯', color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)',accent: '#7B6EF6', trend: '+15%' },
];

const UserStats: React.FC = () => {
  const { user } = useApp();
  const achievePct = Math.round((user.achievements / user.totalAchievements) * 100);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>İSTATİSTİK</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#818cf8,#4f46e5)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📊</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>İstatistiklerim</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Performansını analiz et</p>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {statCards.map(s => (
            <div key={s.label} className="ns-star" style={{ ...card, padding: '16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: s.bg,
                  border: `2.5px solid ${s.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, boxShadow: `0 3px 0 ${s.accent}44`,
                }}>{s.emoji}</div>
                <span style={{
                  fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 999,
                  background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1.5px solid #22c55e',
                }}>{s.trend}</span>
              </div>
              <p style={{ fontWeight: 900, fontSize: 24, color: 'var(--text-dark)', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Points growth ── */}
        <div className="ns-burst" style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Puan Büyümesi</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={14} color="#22c55e" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#22c55e' }}>Bu ay +23%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={statsData.pointsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" strokeOpacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '3px solid var(--dark-border)', borderRadius: 14, fontSize: 12, fontWeight: 900, boxShadow: '0 4px 0 var(--dark-border)' }} />
              <Line type="monotone" dataKey="points" stroke="var(--primary-blue)" strokeWidth={3} dot={{ fill: 'var(--primary-blue)', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Activity breakdown ── */}
        <div className="ns-star" style={{ ...card, padding: '18px 20px' }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 16px' }}>Aktivite Dağılımı</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={statsData.activityBreakdown} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statsData.activityBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="var(--card-bg)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ background: 'var(--card-bg)', border: '3px solid var(--dark-border)', borderRadius: 14, fontSize: 12, fontWeight: 900 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {statsData.activityBreakdown.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0, border: '2px solid var(--dark-border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-dark)' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rewards redeemed ── */}
        <div className="ns-burst" style={{ ...card, padding: '18px 20px' }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 16px' }}>Kullanılan Ödüller</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={statsData.rewardUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" strokeOpacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '3px solid var(--dark-border)', borderRadius: 14, fontSize: 12, fontWeight: 900 }} />
              <Bar dataKey="redeemed" fill="var(--primary-blue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Achievement progress ── */}
        <div className="ns-star" style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Trophy size={20} color="#f59e0b" />
            <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Başarı İlerlemesi</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Circular progress */}
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--tab-bg)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="2.5"
                  strokeDasharray={`${achievePct} 100`} strokeDashoffset="0" strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-dark)' }}>{user.achievements}</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 4px' }}>
                {user.achievements} / {user.totalAchievements}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 600 }}>başarı kilidi açıldı</p>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 900,
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1.5px solid #f59e0b',
              }}>{achievePct}% tamamlandı</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserStats;
