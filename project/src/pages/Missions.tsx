import React, { useState, useEffect } from 'react';
import { Star, Check, Clock, Trophy, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getMissionsWithStatus, completeMission } from '../services/missions';
import type { MissionWithStatus } from '../services/missions';
import { addPoints as addPointsService } from '../services/points';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';
import { WinningParticles } from '../components/WinningParticles';
import { activityLogService } from '../lib/activityLogger';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const categoryImages = {
  daily: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  weekly: 'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=400',
};

const Missions: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const { authUser } = useAuth();
  const [missionState, setMissionState] = useState<MissionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!authUser?.id) return;
    setIsLoading(true);
    getMissionsWithStatus(authUser.id)
      .then(setMissionState)
      .catch(() => setMissionState([]))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  const filtered = missionState.filter(m => m.category === tab);
  const completed = filtered.filter(m => m.completed).length;
  const totalPts = filtered.reduce((s, m) => s + m.points, 0);
  const earnedPts = filtered.filter(m => m.completed).reduce((s, m) => s + m.points, 0);
  const progressPct = filtered.length > 0 ? (completed / filtered.length) * 100 : 0;

  const handleComplete = (id: string) => {
    const mission = missionState.find(m => m.id === id);
    if (!mission || mission.completed || !authUser?.id) return;
    setMissionState(prev => {
      const next = prev.map(m => m.id === id ? { ...m, completed: true, completed_at: new Date().toISOString() } : m);
      const allCompleted = next.filter(ms => ms.category === tab && ms.completed).length === filtered.length;
      if (allCompleted) { setShowParticles(true); playSound('success'); setTimeout(() => setShowParticles(false), 2000); }
      return next;
    });
    addPoints(mission.points);
    playSound('level-up');
    showRewardPopup({ type: 'reward', title: 'Mission Complete!', subtitle: mission.title, points: mission.points });
    completeMission(authUser.id, id).catch(() => {});
    addPointsService(authUser.id, mission.points, `Görev: ${mission.title}`, 'mission', id).catch(() => {});
    void activityLogService.logActivity({
      userId:     authUser.id,
      username:   authUser.username ?? authUser.name ?? authUser.email,
      email:      authUser.email,
      role:       authUser.role,
      action:     `Görev tamamlandı: ${mission.title}`,
      actionType: 'mission',
      amount:     mission.points,
      riskLevel:  'low',
      details:    { missionId: id, category: mission.category },
    });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>GÖREVLER</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🏆" />

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#f87171,#dc2626)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🎯</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.missions.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Görevleri tamamla, puan kazan</p>
          </div>
        </div>

        {/* ── Banner illustration ── */}
        <div style={{ ...card, overflow: 'hidden', position: 'relative', height: 140 }}>
          <img src={categoryImages[tab]} alt="missions" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6,
              background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '3px 12px',
              border: '1.5px solid rgba(255,255,255,0.3)', width: 'fit-content',
            }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {tab === 'daily' ? '📅 Günlük' : '📆 Haftalık'} Görevler
              </span>
            </div>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>
              {completed}/{filtered.length} Tamamlandı
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['daily', 'weekly'] as const).map(t => (
            <button
              key={t}
              onClick={() => { playSound('click'); setTab(t); }}
              style={{
                flex: 1, padding: '12px', borderRadius: 14, fontWeight: 900, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s',
                background: tab === t ? 'linear-gradient(180deg, var(--gradient-start), var(--gradient-end))' : 'var(--card-bg)',
                color: tab === t ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: tab === t ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}
            >
              {t === 'daily' ? `📅 ${tr.missions.daily}` : `📆 ${tr.missions.weekly}`}
            </button>
          ))}
        </div>

        {/* ── Progress summary ── */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{tr.missions.progress}</p>
              <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 26, margin: 0, lineHeight: 1 }}>{completed}/{filtered.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 900, color: '#f59e0b', fontSize: 18 }}>{earnedPts}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>/ {totalPts}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>{tr.missions.ptsEarned}</p>
            </div>
          </div>
          <div style={{ height: 12, borderRadius: 999, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999, transition: 'width 0.5s ease',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
            }} />
          </div>
          {completed === filtered.length && filtered.length > 0 && (
            <div style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '2px solid #22c55e',
            }}>
              <Trophy size={16} color="#22c55e" />
              <span style={{ fontSize: 13, fontWeight: 900, color: '#22c55e' }}>Tüm görevler tamamlandı! 🎉</span>
            </div>
          )}
        </div>

        {/* ── Mission list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((mission, index) => (
            <div
              key={mission.id}
              style={{
                ...card,
                padding: '16px 18px',
                border: mission.completed ? '3px solid #22c55e' : '3px solid var(--dark-border)',
                boxShadow: mission.completed ? '0 6px 0 #16a34a' : '0 6px 0 var(--dark-border)',
                background: mission.completed ? 'rgba(34,197,94,0.05)' : 'var(--card-bg)',
                animation: `missionSlideIn 0.3s ease-out ${index * 0.06}s both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  background: mission.completed ? '#22c55e' : 'var(--tab-bg)',
                  border: '2.5px solid var(--dark-border)',
                  boxShadow: '0 3px 0 var(--dark-border)',
                }}>
                  {mission.completed ? '✓' : mission.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 900, fontSize: 14, margin: '0 0 3px',
                    color: mission.completed ? 'var(--text-muted)' : 'var(--text-dark)',
                    textDecoration: mission.completed ? 'line-through' : 'none',
                  }}>{mission.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 6px' }}>{mission.description}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)' }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>{mission.points} pts</span>
                  </div>
                </div>
                {!mission.completed ? (
                  <button
                    onClick={() => handleComplete(mission.id)}
                    style={{
                      padding: '10px 16px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                      background: 'linear-gradient(180deg, var(--gradient-start), var(--gradient-end))',
                      color: 'white', border: '2.5px solid var(--dark-border)',
                      boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', flexShrink: 0,
                      transition: 'transform 0.1s, box-shadow 0.1s',
                    }}
                    onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 var(--dark-border)'; }}
                    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 var(--dark-border)'; }}
                  >{tr.missions.complete}</button>
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#22c55e',
                    border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={18} color="white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Reset notice ── */}
        <div style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={16} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, fontWeight: 600 }}>
            {tab === 'daily' ? tr.missions.dailyReset : tr.missions.weeklyReset}
          </p>
        </div>

      </div>

      <style>{`
        @keyframes missionSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Missions;
