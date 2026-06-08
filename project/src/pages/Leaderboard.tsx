import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Sparkles, Timer } from 'lucide-react';
import { leaderboard } from '../data/mockData';
import { useRewardEvents, RewardEvent, Winner } from '../context/RewardEventsContext';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Countdown hook ── */
const useCountdown = (endDate: string) => {
  const calc = () => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), mins: Math.floor((diff%3600000)/60000), secs: Math.floor((diff%60000)/1000), ended: false };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => { const t = setInterval(() => setCd(calc()), 1000); return () => clearInterval(t); }, [endDate]);
  return cd;
};

/* ── Active Event Banner ── */
const ActiveEventBanner: React.FC<{ event: RewardEvent }> = ({ event }) => {
  const ended = new Date(event.endDate) < new Date();
  const { getWinners } = useRewardEvents();
  const winners: Winner[] = ended ? getWinners(event) : [];
  const [showAll, setShowAll] = useState(false);
  const cd = useCountdown(event.endDate);
  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      {/* ── Neo-brutalism event header ── */}
      <div style={{
        background: ended ? '#BFFF00' : '#FFE500',
        borderBottom: '3px solid #000',
        padding: '20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Watermark shape */}
        <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%) rotate(10deg)', fontSize: 110, opacity: 0.1, fontWeight: 900, pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>🏆</div>

        {/* Live / ended tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
          background: '#000', color: ended ? '#BFFF00' : '#FFE500',
          borderRadius: 999, padding: '3px 12px', fontSize: 10, fontWeight: 900,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <Trophy size={9} fill="currentColor" color={ended ? '#BFFF00' : '#FFE500'} />
          {ended ? '🎉 ETKİNLİK BİTTİ' : '🔴 CANLI ETKİNLİK'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ color: '#000', fontWeight: 900, fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{event.title}</h3>
            <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: 13, margin: 0, maxWidth: 340, fontWeight: 600 }}>{event.description}</p>
          </div>

          {!ended && (
            <div style={{
              background: '#000', borderRadius: 12, padding: '8px 12px',
              flexShrink: 0, border: '2.5px solid #000',
              boxShadow: '0 4px 0 rgba(0,0,0,0.35)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Timer size={9} /> BİTİŞ
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                {[{ v: cd.days, l: 'G' }, { v: cd.hours, l: 'S' }, { v: cd.mins, l: 'D' }, { v: cd.secs, l: 'SN' }].map(u => (
                  <div key={u.l} style={{
                    background: '#FFE500', borderRadius: 8, padding: '4px 6px',
                    textAlign: 'center', minWidth: 30,
                    border: '2px solid rgba(255,255,255,0.15)',
                  }}>
                    <p style={{ color: '#000', fontWeight: 900, fontSize: 14, margin: 0, lineHeight: 1 }}>{String(u.v).padStart(2,'0')}</p>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 8, fontWeight: 800, margin: 0 }}>{u.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--card-bg)' }}>
        {!ended && (
          <>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gift size={15} color="#7B6EF6" /> Ödül Havuzu
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>— En fazla puan kazanan kazanır!</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {event.rewards.slice(0, 3).map(r => (
                <div key={r.rank} style={{
                  padding: '12px 8px', borderRadius: 14, textAlign: 'center',
                  border: '3px solid #000',
                  boxShadow: '0 4px 0 #000',
                  background: r.rank === 1 ? '#FFE500' : r.rank === 2 ? '#e2e8f0' : '#FF6B35',
                  transform: r.rank === 1 ? 'rotate(-1deg)' : r.rank === 2 ? 'rotate(0.5deg)' : 'rotate(1.5deg)',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{r.rewardImage}</div>
                  <span style={{ fontSize: 9, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>{r.label}</span>
                  <p style={{ fontWeight: 900, fontSize: 12, color: '#000', margin: '2px 0 0', lineHeight: 1.2 }}>{r.rewardName}</p>
                </div>
              ))}
            </div>
            {event.rewards.length > 3 && (
              <button onClick={() => setShowAll(v => !v)} style={{ marginTop: 10, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showAll ? '▲ Daha az' : `▼ Tüm ${event.rewards.length} ödülü gör`}
              </button>
            )}
          </>
        )}

        {ended && (
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#f59e0b" /> Kazananlar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {winners.map(w => (
                <div key={w.rank} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  border: `2.5px solid ${w.rank === 1 ? '#f59e0b' : w.rank === 2 ? '#94a3b8' : '#f97316'}`,
                  background: w.rank === 1 ? 'rgba(245,158,11,0.08)' : 'var(--tab-bg)',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{medal(w.rank)}</span>
                  <img src={w.avatar} alt={w.username} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--dark-border)', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>{w.username}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{w.points.toLocaleString()} pts</span>
                    </div>
                  </div>
                  {w.rank === 1 && (
                    <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 999, background: '#f59e0b', color: 'black', border: '1.5px solid #d97706', flexShrink: 0 }}>ŞAMPİYON</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Leaderboard ── */
const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const { events } = useRewardEvents();
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const publishedEvents = events.filter(e => e.published);

  const podiumColors = ['#94a3b8','#f59e0b','#f97316'];
  const podiumHeights = [80, 110, 60];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>LİDERLİK</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>👑</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Leaderboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Zirveye çık, efsane ol</p>
          </div>
        </div>

        {/* ── Active events ── */}
        {publishedEvents.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {publishedEvents.map(ev => <ActiveEventBanner key={ev.id} event={ev} />)}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['weekly', 'monthly', 'alltime'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 6px', borderRadius: 12, fontWeight: 900, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.1s',
              background: tab === t ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
              color: tab === t ? 'white' : 'var(--text-dark)',
              border: '3px solid var(--dark-border)',
              boxShadow: tab === t ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
            }}>{t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* ── Podium ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
          border: '3px solid #f59e0b', boxShadow: '0 6px 0 #d97706',
          padding: 'clamp(16px,4vw,28px)',
        }}>
          <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Crown size={20} color="#f59e0b" /> Top 3 Şampiyonlar
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {podiumOrder.map((player, i) => {
              const isFirst = player?.rank === 1;
              const badge = player?.rank === 1 ? '👑' : player?.rank === 2 ? '🥈' : '🥉';
              return (
                <div key={player?.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: isFirst ? 72 : 58, height: isFirst ? 72 : 58,
                      borderRadius: '50%', overflow: 'hidden',
                      border: `${isFirst ? 4 : 3}px solid ${podiumColors[i]}`,
                      boxShadow: `0 4px 0 ${podiumColors[i]}88`,
                    }}>
                      {player?.avatar && <img src={player.avatar} alt={player.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ position: 'absolute', top: -8, right: -6, fontSize: isFirst ? 22 : 18 }}>{badge}</div>
                  </div>
                  <p style={{ fontWeight: 900, fontSize: isFirst ? 14 : 12, color: 'var(--text-dark)', textAlign: 'center', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player?.username}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>{player?.points.toLocaleString()}</span>
                  </div>
                  {/* Podium block */}
                  <div style={{
                    width: isFirst ? 80 : 64, height: podiumHeights[i],
                    borderRadius: '12px 12px 0 0',
                    background: podiumColors[i], border: '3px solid var(--dark-border)',
                    boxShadow: '0 -4px 0 var(--dark-border) inset',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: isFirst ? 24 : 20, fontWeight: 900, color: 'white' }}>#{player?.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Rest of rankings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rest.map(player => (
            <div key={player.rank} style={{
              ...card,
              border: player.isCurrentUser ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
              boxShadow: player.isCurrentUser ? '0 6px 0 var(--primary-blue)' : '0 6px 0 var(--dark-border)',
              background: player.isCurrentUser ? 'rgba(123,110,246,0.07)' : 'var(--card-bg)',
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)' }}>#{player.rank}</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--dark-border)', flexShrink: 0 }}>
                <img src={player.avatar} alt={player.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.username}&background=7B6EF6&color=fff`; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, color: player.isCurrentUser ? 'var(--primary-blue)' : 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</p>
                  {player.isCurrentUser && (
                    <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', flexShrink: 0 }}>SEN</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, fontWeight: 600 }}>Seviye {player.level}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>{player.points.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Your ranking ── */}
        <div style={{
          ...card,
          border: '3px solid var(--primary-blue)', boxShadow: '0 6px 0 var(--primary-blue)',
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(123,110,246,0.06)',
        }}>
          <Trophy size={24} color="var(--primary-blue)" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>Senin Sıralaman</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} color="#22c55e" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>+2 bu hafta</span>
            </div>
          </div>
          <p style={{ fontWeight: 900, fontSize: 32, color: 'var(--primary-blue)', margin: 0 }}>#3</p>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
