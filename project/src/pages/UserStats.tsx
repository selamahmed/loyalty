import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Trophy, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StickerHero from '../components/StickerHero';
import { loadUserStats, STAT_CARD_CONFIG, type UserStatsData } from '../services/userStats';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const tooltipStyle = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  borderRadius: 14,
  fontSize: 12,
  fontWeight: 900 as const,
  boxShadow: '0 4px 0 var(--dark-border)',
};

const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px',
  }}>
    <BarChart3 size={28} strokeWidth={2.5} opacity={0.45} />
    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{message}</p>
  </div>
);

const UserStats: React.FC = () => {
  const { user } = useApp();
  const { authUser } = useAuth();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) return;
    setLoading(true);
    setError(null);
    loadUserStats(authUser.id)
      .then(setStats)
      .catch(() => {
        setStats(null);
        setError('İstatistikler yüklenemedi.');
      })
      .finally(() => setLoading(false));
  }, [authUser?.id]);

  const achievePct = user.totalAchievements > 0
    ? Math.round((user.achievements / user.totalAchievements) * 100)
    : 0;

  const pointsTrend = stats?.pointsTrendPct;
  const hasPointsChart = (stats?.pointsOverTime.length ?? 0) > 0;
  const hasActivityChart = (stats?.activityBreakdown.length ?? 0) > 0;
  const hasRewardsChart = (stats?.rewardUsage.length ?? 0) > 0;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>İSTATİSTİK</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>
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

        <StickerHero
          page="stats"
          bg="linear-gradient(135deg,#818cf8 0%,#4f46e5 100%)"
          badge="📊 İSTATİSTİK"
          title="Performansını"
          highlight="analiz et!"
        />

        {error && (
          <div style={{ ...card, padding: '14px 16px', borderColor: '#ef4444', background: 'rgba(239,68,68,0.06)' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {STAT_CARD_CONFIG.map(s => {
            const raw = stats?.[s.key] ?? 0;
            return (
              <div key={s.key} style={{ ...card, padding: '16px 14px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: s.bg, marginBottom: 10,
                  border: `2.5px solid ${s.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, boxShadow: `0 3px 0 ${s.accent}44`,
                }}>{s.emoji}</div>
                <p style={{
                  fontWeight: 900, fontSize: 24, color: 'var(--text-dark)', margin: '0 0 2px', lineHeight: 1,
                  opacity: loading ? 0.35 : 1,
                }}>
                  {loading ? '—' : s.format(raw)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Puan Büyümesi</h2>
            {!loading && pointsTrend != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {pointsTrend >= 0 ? <TrendingUp size={14} color="#22c55e" /> : <TrendingDown size={14} color="#ef4444" />}
                <span style={{ fontSize: 11, fontWeight: 900, color: pointsTrend >= 0 ? '#22c55e' : '#ef4444' }}>
                  Bu ay {pointsTrend >= 0 ? '+' : ''}{pointsTrend}%
                </span>
              </div>
            )}
          </div>
          {loading ? (
            <EmptyChart message="Yükleniyor…" />
          ) : hasPointsChart ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats!.pointsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" strokeOpacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="points" stroke="var(--primary-blue)" strokeWidth={3} dot={{ fill: 'var(--primary-blue)', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Henüz puan kazanmadın. QR tara veya görev tamamla!" />
          )}
        </div>

        <div style={{ ...card, padding: '18px 20px' }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 16px' }}>Aktivite Dağılımı</h2>
          {loading ? (
            <EmptyChart message="Yükleniyor…" />
          ) : hasActivityChart ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 'min(100%, 180px)', height: 180, flexShrink: 0, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats!.activityBreakdown} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {stats!.activityBreakdown.map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="var(--card-bg)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: unknown) => `${val}%`} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats!.activityBreakdown.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0, border: '2px solid var(--dark-border)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, fontWeight: 600 }}>{item.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-dark)' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="Aktivite verisi yok. Uygulamayı kullanmaya başla!" />
          )}
        </div>

        <div style={{ ...card, padding: '18px 20px' }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 16px' }}>Kullanılan Ödüller</h2>
          {loading ? (
            <EmptyChart message="Yükleniyor…" />
          ) : hasRewardsChart ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats!.rewardUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" strokeOpacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="redeemed" fill="var(--primary-blue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Henüz ödül kullanmadın. Mağazadan ödül al!" />
          )}
        </div>

        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Trophy size={20} color="#f59e0b" />
            <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Başarı İlerlemesi</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--tab-bg)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="2.5"
                  strokeDasharray={`${achievePct} 100`} strokeLinecap="round"
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
