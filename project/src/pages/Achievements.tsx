import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Lock, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getAchievementsWithProgress } from '../services/achievements';
import type { AchievementWithProgress } from '../services/achievements';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';
import { activityLogService } from '../lib/activityLogger';
import { markMissionPageVisit } from '../lib/missionVisitTracker';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const rarityConfig = {
  common:    { label: 'Common',    bg: 'var(--tab-bg)', color: 'var(--text-muted)', accent: '#6b7280', border: 'var(--dark-border)' },
  rare:      { label: 'Rare',      bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', accent: '#3b82f6', border: '#3b82f6' },
  epic:      { label: 'Epic',      bg: 'rgba(123,110,246,0.15)', color: '#7B6EF6', accent: '#7B6EF6', border: '#7B6EF6' },
  legendary: { label: 'Legendary', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', accent: '#f59e0b', border: '#f59e0b' },
};

const Achievements: React.FC = () => {
  const { user } = useApp();
  const { authUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'completed' | 'locked'>('all');
  const [category, setCategory] = useState('all');
  const [showParticles, setShowParticles] = useState(false);
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track which achievement IDs were already logged this session to avoid duplicates
  const loggedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!authUser?.id) return;
    markMissionPageVisit('achievements_visit', authUser.id);
    setIsLoading(true);
    getAchievementsWithProgress(authUser.id)
      .then(data => {
        setAchievements(data);
        // Log newly-detected completed achievements (not previously logged this session)
        data.filter(a => a.completed && !loggedIds.current.has(a.id)).forEach(a => {
          loggedIds.current.add(a.id);
          void activityLogService.logActivity({
            userId:     authUser.id,
            username:   authUser.username ?? authUser.name ?? authUser.email,
            email:      authUser.email,
            role:       authUser.role,
            action:     `Başarı kazanıldı: ${a.title}`,
            actionType: 'achievement',
            amount:     a.points,
            riskLevel:  'low',
            details:    { achievementId: a.id, rarity: a.rarity, category: a.category },
          });
        });
      })
      .catch(() => setAchievements([]))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
  const filtered = achievements.filter(a => {
    const matchFilter = filter === 'all' || (filter === 'completed' ? a.completed : !a.completed);
    const matchCat = category === 'all' || a.category === category;
    return matchFilter && matchCat;
  });
  const completedCount = achievements.filter(a => a.completed).length;
  const totalPoints = achievements.filter(a => a.completed).reduce((s, a) => s + a.points, 0);
  const progressPct = achievements.length > 0 ? (completedCount / achievements.length) * 100 : 0;

  const filterLabels: Record<string, string> = { all: tr.achievements.title, completed: tr.home.completed, locked: tr.achievements.locked };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>BAŞARILAR</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="⭐" />

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🏆</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.achievements.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Rozetleri topla, efsane ol</p>
          </div>
        </div>

        {/* ── Hero banner (sticker) ── */}
        <StickerHero
          page="achievements"
          bg="linear-gradient(135deg,#d97706 0%,#f59e0b 100%)"
          badge="⭐ ROZETLER"
          title="Rozetleri topla,"
          highlight="efsane ol!"
        />

        {/* ── Summary hero ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
          padding: 'clamp(16px,4vw,24px)', position: 'relative', overflow: 'visible',
        }}>
          <StickerAccent seed="ach-summary" variant="shape" size={34} rotate={-8} style={{ position: 'absolute', top: -8, right: 10, zIndex: 2 }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.25)',
              border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
            }}>
              <Trophy size={28} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{tr.achievements.earned}</p>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 28, margin: '0 0 8px', lineHeight: 1 }}>{completedCount} / {achievements.length}</p>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                <Star size={14} fill="white" color="white" />
                <span style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>{totalPoints.toLocaleString()}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>puan kazanıldı</p>
            </div>
          </div>
        </div>

        {/* ── Filter buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'completed', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => { playSound('click'); setFilter(f); }}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                cursor: 'pointer', transition: 'all 0.1s', position: 'relative',
                background: filter === f ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: filter === f ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: filter === f ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}
            >
              {filterLabels[f]}
              {filter === f && (
                <StickerAccent seed={`ach-filter-${f}`} size={18} rotate={10} style={{ position: 'absolute', top: -6, right: -4 }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Category pills ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { playSound('click'); setCategory(cat); }}
              style={{
                padding: '6px 14px', borderRadius: 999, fontWeight: 900, fontSize: 11,
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.1s', textTransform: 'capitalize',
                background: category === cat
                  ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))'
                  : 'var(--card-bg)',
                color: category === cat ? '#fff' : 'var(--text-dark)',
                border: '2.5px solid var(--dark-border)',
                boxShadow: category === cat ? '0 4px 0 var(--dark-border)' : '0 3px 0 var(--dark-border)',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* ── Achievement grid ── */}
        {filtered.length === 0 ? (
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 10px' }}>🔍</p>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>{tr.common.noData}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {filtered.map((ach, index) => {
              const rarity = rarityConfig[ach.rarity as keyof typeof rarityConfig];
              const progress = Math.round((ach.progress / ach.total) * 100);
              return (
                <div
                  key={ach.id}
                  style={{
                    ...card,
                    padding: '16px 18px',
                    border: ach.completed ? `3px solid ${rarity.border}` : '3px solid var(--dark-border)',
                    boxShadow: ach.completed ? `0 6px 0 ${rarity.accent}44` : '0 6px 0 var(--dark-border)',
                    opacity: ach.completed ? 1 : 0.8,
                    cursor: 'pointer',
                    animation: `achSlideIn 0.3s ease-out ${index * 0.04}s both`,
                    transition: 'transform 0.1s',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  onClick={() => {
                    if (ach.completed) { playSound('success'); setShowParticles(true); setTimeout(() => setShowParticles(false), 2000); }
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  {ach.completed && (
                    <StickerAccent seed={`ach-card-${ach.id}`} size={20} rotate={8} style={{ position: 'absolute', top: -8, right: 8, zIndex: 2 }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: rarity.bg, border: `2.5px solid ${rarity.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, position: 'relative',
                      boxShadow: `0 3px 0 ${rarity.accent}44`,
                    }}>
                      {ach.icon}
                      {!ach.completed && (
                        <div style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                          borderRadius: '50%', background: '#6b7280', border: '2px solid var(--card-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Lock size={9} color="white" />
                        </div>
                      )}
                      {ach.completed && (
                        <div style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                          borderRadius: '50%', background: '#22c55e', border: '2px solid var(--card-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: 'white', fontSize: 10, fontWeight: 900 }}>✓</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontWeight: 900, fontSize: 14, margin: 0, color: 'var(--text-dark)', lineHeight: 1.2 }}>{ach.title}</p>
                        <span style={{
                          fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                          background: rarity.bg, color: rarity.color, border: `1.5px solid ${rarity.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                        }}>{rarity.label}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 8px', lineHeight: 1.4 }}>{ach.description}</p>

                      {!ach.completed && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>
                            <span>{ach.progress}/{ach.total}</span>
                            <span>{progress}%</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 999, width: `${progress}%`, transition: 'width 0.5s ease',
                              background: `linear-gradient(90deg,${rarity.accent},${rarity.color})`,
                            }} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b' }}>
                        <Star size={10} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>+{ach.points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes achSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Achievements;
