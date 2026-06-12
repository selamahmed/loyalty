import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, QrCode, Gamepad2, Target, Star, Gift, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPointsHistory } from '../services/points';
import type { PointsTransaction } from '../services/points';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

type CategoryKey = 'qr' | 'game' | 'daily' | 'achievement' | 'redeem' | 'referral';

const categoryConfig: Record<CategoryKey, { icon: React.ElementType; color: string; bg: string; emoji: string }> = {
  qr:          { icon: QrCode,    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  emoji: '📱' },
  game:        { icon: Gamepad2,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   emoji: '🎮' },
  daily:       { icon: Target,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  emoji: '📅' },
  achievement: { icon: Star,      color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)', emoji: '🏆' },
  redeem:      { icon: Gift,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🎁' },
  referral:    { icon: Users,     color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  emoji: '👥' },
};

const History: React.FC = () => {
  const { authUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) return;
    setIsLoading(true);
    getPointsHistory(authUser.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  const filtered = filter === 'all' ? history : history.filter(h => h.type === filter);
  const totalEarned   = history.filter(h => h.type === 'earned').reduce((s, h) => s + h.amount, 0);
  const totalRedeemed = history.filter(h => h.type === 'spent').reduce((s, h) => s + Math.abs(h.amount), 0);

  const grouped = filtered.reduce<Record<string, PointsTransaction[]>>((acc, h) => {
    const date = new Date(h.created_at).toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(h);
    return acc;
  }, {});

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>GEÇMİŞ</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#60a5fa,#2563eb)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📋</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Puan Geçmişi</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Tüm aktivitelerini gör</p>
          </div>
        </div>

        {/* ── Summary ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ ...card, border: '3px solid #22c55e', boxShadow: '0 6px 0 #16a34a', padding: '16px 18px', background: 'rgba(34,197,94,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <TrendingUp size={16} color="#22c55e" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kazanılan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 900, fontSize: 22, color: '#16a34a' }}>+{totalEarned.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ ...card, border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626', padding: '16px 18px', background: 'rgba(239,68,68,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <TrendingDown size={16} color="#ef4444" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Harcanan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 900, fontSize: 22, color: '#dc2626' }}>-{totalRedeemed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'earned', 'spent'] as const).map(f => {
            const labels = { all: 'Tümü', earned: 'Kazanılan', spent: 'Harcanan' };
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: '11px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                cursor: 'pointer', transition: 'all 0.1s',
                background: filter === f ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: filter === f ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: filter === f ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}>{labels[f]}</button>
            );
          })}
        </div>

        {/* ── Timeline ── */}
        {isLoading ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Yükleniyor...</p>
          </div>
        ) : Object.entries(grouped).length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 10px' }}>📭</p>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Henüz geçmiş yok</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Clock size={13} color="var(--text-muted)" />
                  <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{date}</p>
                  <div style={{ flex: 1, height: 1, background: 'var(--dark-border)', opacity: 0.2 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => {
                    const cat = categoryConfig[(item.category ?? 'daily') as CategoryKey] || categoryConfig.daily;
                    const IconComp = cat.icon;
                    const isEarned = item.type === 'earned';
                    return (
                      <div key={item.id} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: cat.bg, border: `2.5px solid ${cat.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 3px 0 ${cat.color}44`,
                        }}>
                          <IconComp size={18} color={cat.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                          <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 999, background: cat.bg, color: cat.color, textTransform: 'capitalize' }}>{item.category ?? 'other'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          {isEarned ? <TrendingUp size={14} color="#22c55e" /> : <TrendingDown size={14} color="#ef4444" />}
                          <span style={{ fontWeight: 900, fontSize: 15, color: isEarned ? '#22c55e' : '#ef4444' }}>
                            {isEarned ? '+' : '-'}{Math.abs(item.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

