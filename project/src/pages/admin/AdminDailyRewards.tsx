import React, { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, CheckCircle, ToggleLeft, ToggleRight, Flame, Calendar, Crown, AlertTriangle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { DEFAULT_REWARDS, DayReward } from '../../components/DailyRewardModal';
import { getDailyRewardAdminStats, getDailyRewardConfig, upsertDailyRewardDay } from '../../services/config';
import { useRealtimeTable } from '../../hooks/useRealtime';

const DAY_COLORS  = ['rgba(123,110,246,0.18)','rgba(34,197,94,0.15)','rgba(6,182,212,0.15)','rgba(245,158,11,0.15)','rgba(239,68,68,0.15)','rgba(236,72,153,0.15)','rgba(255,229,0,0.18)'];
const DAY_BORDERS = ['#7B6EF6','#22c55e','#06b6d4','#f59e0b','#ef4444','#ec4899','#FFE500'];

const EMOJIS = ['🌟','🎁','💎','🎯','🔥','⚡','👑','🏆','🎮','💰','🎪','🌈','🦄','🎉','✨','🚀','💫','🎊','🥇','🎖️'];

const AdminDailyRewards: React.FC = () => {
  const [rewards, setRewards]   = useState<DayReward[]>(DEFAULT_REWARDS);
  const [enabled, setEnabled]   = useState(true);
  const [saved, setSaved]       = useState(false);
  const [dirty, setDirty]       = useState(false);
  const [showEmoji, setShowEmoji] = useState<number | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalPointsAwarded: 0, activeStreakUsers: 0, lastClaimLabel: 'Yükleniyor' });

  const loadFromDB = useCallback(async () => {
    try {
      setLoadError(null);
      const rows = await getDailyRewardConfig();
      if (rows.length > 0) {
        const mapped: DayReward[] = rows.map(r => ({
          day: r.day_number,
          emoji: (r.bonus_value as Record<string, string>)?.emoji ?? '🎁',
          points: r.points,
          label: (r.bonus_value as Record<string, string>)?.label ?? `Gün ${r.day_number}`,
          isBig: r.is_special,
        }));
        // Fill any missing days from defaults
        const allDays = DEFAULT_REWARDS.map(def => mapped.find(m => m.day === def.day) ?? def);
        setRewards(allDays);
        setEnabled(rows.some(r => r.enabled));
      }
      setStats(await getDailyRewardAdminStats());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Supabase bağlantısı kurulamadı';
      setLoadError(message);
    } finally { setDbLoaded(true); }
  }, []);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);
  useRealtimeTable('daily_reward_config', loadFromDB);

  const saveAll = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Save all rewards to DB
      await Promise.all(rewards.map(r =>
        upsertDailyRewardDay({
          day_number: r.day,
          points: r.points,
          bonus_type: 'points',
          bonus_value: { emoji: r.emoji, label: r.label ?? `Gün ${r.day}` },
          is_special: r.isBig ?? false,
          enabled: enabled,
        })
      ));
      setDirty(false);
      setSaved(true);
      await loadFromDB();
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Kaydetme başarısız oldu';
      setSaveError(message);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => { setRewards(DEFAULT_REWARDS); setDirty(true); };

  const updateReward = (day: number, patch: Partial<DayReward>) => {
    setRewards(prev => prev.map(r => r.day === day ? { ...r, ...patch } : r));
    setDirty(true);
  };

  const totalPoints = rewards.reduce((s, r) => s + r.points, 0);

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(123,110,246,0.18)', border: '2.5px solid #7B6EF6', boxShadow: '0 4px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            🗓️
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>Günlük Giriş Ödülleri</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>7 günlük ödül takvimini yapılandırın</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={resetToDefaults} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, border: '2.5px solid #000', background: 'var(--card-bg)', fontWeight: 900, fontSize: 12, cursor: 'pointer', boxShadow: '0 3px 0 #000', color: 'var(--text-dark)' }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 #000'; }}>
              <RotateCcw size={13} /> Varsayılan
            </button>
            <button onClick={saveAll} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, border: '2.5px solid #000', background: saved ? '#4ade80' : '#7B6EF6', fontWeight: 900, fontSize: 12, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saved ? '0 3px 0 #16a34a' : '0 3px 0 #000', color: '#fff', opacity: saving ? 0.7 : 1 }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 #000'; }}>
              {saving ? 'Kaydediliyor...' : saved ? <><CheckCircle size={13} /> Kaydedildi</> : <><Save size={13} /> Kaydet</>}
            </button>
          </div>
        </div>

        {(loadError || saveError) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#fee2e2', border: '2.5px solid #ef4444', boxShadow: '0 3px 0 #991b1b' }}>
            <AlertTriangle size={15} color="#991b1b" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontWeight: 900, fontSize: 12, color: '#991b1b', lineHeight: 1.45 }}>
              {saveError ?? loadError}
            </span>
          </div>
        )}

        {/* Feature toggle */}
        <div style={{ borderRadius: 18, border: '3px solid #000', background: 'var(--card-bg)', boxShadow: '0 4px 0 #000', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 2px' }}>Günlük Ödül Sistemi</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Kullanıcılar her gün giriş yaparak puan kazanır</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setEnabled(e => !e); setDirty(true); }}>
            <span style={{ fontWeight: 900, fontSize: 12, color: enabled ? '#16a34a' : '#6b7280' }}>{enabled ? 'AKTİF' : 'PASİF'}</span>
            {enabled
              ? <ToggleRight size={30} color="#22c55e" />
              : <ToggleLeft size={30} color="#9ca3af" />
            }
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { emoji: '🏆', label: 'Toplam Puan', value: totalPoints.toLocaleString('tr-TR'), color: '#f59e0b' },
            { emoji: '🔥', label: 'Aktif Seri', value: stats.activeStreakUsers.toLocaleString('tr-TR'), color: '#ef4444' },
            { emoji: '📅', label: 'Son Giriş', value: stats.lastClaimLabel, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 16, border: '2.5px solid #000', background: 'var(--card-bg)', boxShadow: '0 3px 0 #000', padding: '14px 12px', textAlign: 'center' }}>
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <p style={{ fontWeight: 900, fontSize: 18, color: s.color, margin: '4px 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Dirty warning */}
        {dirty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#fef9c3', border: '2.5px solid #ca8a04', boxShadow: '0 3px 0 #ca8a04' }}>
            <AlertTriangle size={15} color="#ca8a04" />
            <span style={{ fontWeight: 900, fontSize: 12, color: '#854d0e' }}>Kaydedilmemiş değişiklikler var</span>
          </div>
        )}

        {/* Day cards */}
        <div style={{ borderRadius: 18, border: '3px solid #000', background: 'var(--card-bg)', boxShadow: '0 4px 0 #000', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '2.5px solid #000', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="var(--text-dark)" />
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>7 Günlük Ödül Takvimi</p>
          </div>
          {rewards.map((reward, idx) => {
            const bg = DAY_COLORS[idx % DAY_COLORS.length];
            const bdr = DAY_BORDERS[idx % DAY_BORDERS.length];
            return (
              <div key={reward.day} style={{ padding: '14px 20px', borderBottom: idx < 6 ? '2.5px solid #e5e7eb' : 'none', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>

                {/* Day badge */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `2.5px solid ${bdr}`, boxShadow: `0 3px 0 ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setShowEmoji(showEmoji === reward.day ? null : reward.day)}>
                  <span style={{ fontSize: 22 }}>{reward.emoji}</span>
                </div>

                {/* Emoji picker */}
                {showEmoji === reward.day && (
                  <div style={{ position: 'absolute', left: 64, top: 8, zIndex: 50, background: 'white', border: '2.5px solid #000', borderRadius: 14, padding: 10, boxShadow: '4px 4px 0 #000', display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                    {EMOJIS.map(em => (
                      <button key={em} onClick={() => { updateReward(reward.day, { emoji: em }); setShowEmoji(null); }}
                        style={{ fontSize: 20, padding: 4, borderRadius: 8, border: '1.5px solid transparent', cursor: 'pointer', background: 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1.5px solid #000'; (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1.5px solid transparent'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* Day info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>Gün {reward.day}</span>
                    {reward.isBig && (
                      <span style={{ padding: '2px 7px', background: '#fef08a', border: '1.5px solid #f59e0b', borderRadius: 99, fontSize: 10, fontWeight: 900, color: '#92400e' }}>BÜYÜK ÖDÜL</span>
                    )}
                  </div>
                  {/* Label input */}
                  <input
                    type="text"
                    value={reward.label}
                    onChange={e => updateReward(reward.day, { label: e.target.value })}
                    style={{ width: '100%', padding: '5px 10px', borderRadius: 8, border: '2px solid #e5e7eb', background: 'var(--tab-bg)', fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Ödül etiketi..."
                  />
                </div>

                {/* Points input */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Puan</span>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={reward.points}
                    onChange={e => updateReward(reward.day, { points: parseInt(e.target.value) || 0 })}
                    style={{ width: 72, padding: '7px 8px', borderRadius: 10, border: `2.5px solid ${bdr}`, background: bg, fontWeight: 900, fontSize: 16, color: '#111', textAlign: 'center', outline: 'none', boxShadow: `0 2px 0 ${bdr}` }}
                  />
                </div>

                {/* Big reward toggle */}
                <div
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => updateReward(reward.day, { isBig: !reward.isBig })}
                  title={reward.isBig ? 'Büyük ödül — tıkla kaldırmak için' : 'Büyük ödül olarak işaretle'}
                >
                  <Crown size={20} color={reward.isBig ? '#f59e0b' : '#d1d5db'} strokeWidth={reward.isBig ? 2.5 : 1.5} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        <div style={{ borderRadius: 18, border: '3px solid #000', background: 'var(--tab-bg)', padding: 20, boxShadow: '0 4px 0 #000' }}>
          <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>📱 Önizleme</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {rewards.map((r, i) => {
              const bg = DAY_COLORS[i % DAY_COLORS.length];
              const bdr = DAY_BORDERS[i % DAY_BORDERS.length];
              return (
                <div key={r.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px', borderRadius: 12, border: `2.5px solid ${bdr}`, background: bg, boxShadow: `0 3px 0 ${bdr}`, minWidth: r.isBig ? 64 : 52, flexShrink: 0, position: 'relative' }}>
                  {r.isBig && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', border: '1.5px solid #000', borderRadius: 99, padding: '1px 5px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 7, fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>MEGA</span>
                    </div>
                  )}
                  <span style={{ fontSize: 20, lineHeight: 1, marginBottom: 3 }}>{r.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: '#374151', textTransform: 'uppercase' }}>G{r.day}</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#111' }}>+{r.points}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontWeight: 600 }}>
            Toplam 7 gün tamamlandığında kullanıcı {rewards.reduce((s, r) => s + r.points, 0).toLocaleString('tr-TR')} puan kazanır
          </p>
        </div>

        {/* Streak is stored in Supabase user_streaks — no local reset */}
        <div style={{ borderRadius: 18, border: '2.5px dashed #e5e7eb', padding: '14px 20px' }}>
          <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px' }}>Günlük Seri (Supabase)</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            Kullanıcı serileri artık <code>user_streaks</code> tablosunda tutulur. Test için Admin → Kullanıcılar üzerinden yönetin.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDailyRewards;
