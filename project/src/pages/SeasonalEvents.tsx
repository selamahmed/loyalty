import React, { useEffect, useState, useCallback } from 'react';
import { Zap, Trophy, Calendar, Check, ChevronRight, Users, TrendingUp } from 'lucide-react';
import { getPublishedPrizeEvents } from '../services/eventLeaderboard';
import type { AppEvent, RewardPrize } from '../services/events';
import { deriveEventStatus } from '../services/events';
import {
  joinEvent, getEventLeaderboard, getMyEventParticipation, getEventWinners,
  type EventLeaderboardEntry, type EventParticipation, type EventWinner,
} from '../services/eventLeaderboard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';
import NeoAvatar from '../components/NeoAvatar';
import StickerHero from '../components/StickerHero';
import { eventEndTime, eventStartTime } from '../lib/eventDates';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

type EventStatus = 'active' | 'ended' | 'upcoming' | 'distributed';

const getEventStatus = (event: AppEvent): EventStatus => {
  const dbStatus = deriveEventStatus(event);
  if (dbStatus === 'distributed') return 'distributed';
  if (dbStatus === 'ended') return 'ended';
  if (dbStatus === 'draft' || !event.published) return 'upcoming';
  const now = Date.now();
  const start = eventStartTime(event.start_date);
  const end = eventEndTime(event.end_date);
  if (now > end) return 'ended';
  if (now < start) return 'upcoming';
  return 'active';
};

const statusConfig: Record<EventStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Aktif', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ended: { label: 'Bitti', color: 'var(--text-muted)', bg: 'var(--tab-bg)' },
  upcoming: { label: 'Yakında', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  distributed: { label: 'Ödüller Dağıtıldı', color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

const formatShortDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

const useCountdown = (endDate: string, active: boolean) => {
  const [left, setLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const diff = eventEndTime(endDate) - Date.now();
      if (diff <= 0) { setLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, active]);

  return left;
};

const SeasonalEvents: React.FC = () => {
  const { authUser } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [participation, setParticipation] = useState<EventParticipation | null>(null);
  const [leaderboard, setLeaderboard] = useState<EventLeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<EventWinner[]>([]);
  const [joining, setJoining] = useState(false);
  const eventLoadRef = React.useRef<{ key: string; loading: boolean; queued: boolean }>({
    key: '',
    loading: false,
    queued: false,
  });
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getPublishedPrizeEvents()
      .then(data => setEvents(data as unknown as AppEvent[]))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, []);

  const activeEvent = events.find(e => getEventStatus(e) === 'active') ?? events[0];
  const selectedEvent = events.find(e => e.id === (selectedId ?? activeEvent?.id)) ?? activeEvent;
  const status: EventStatus = selectedEvent ? getEventStatus(selectedEvent) : 'upcoming';
  const statusInfo = statusConfig[status];
  const accent = selectedEvent?.color ?? '#7B6EF6';
  const prizes: RewardPrize[] = Array.isArray(selectedEvent?.rewards_json)
    ? (selectedEvent!.rewards_json as RewardPrize[])
    : [];
  const countdown = useCountdown(selectedEvent?.end_date ?? '', status === 'active');

  const loadEventData = useCallback(async (eventId: string, evStatus: EventStatus) => {
    if (!eventId) return;
    const loadKey = `${eventId}:${evStatus}:${authUser?.id ?? 'anon'}`;
    if (eventLoadRef.current.loading && eventLoadRef.current.key === loadKey) {
      eventLoadRef.current.queued = true;
      return;
    }
    eventLoadRef.current = { key: loadKey, loading: true, queued: false };
    try {
      if (evStatus === 'ended' || evStatus === 'distributed') {
        setWinners(await getEventWinners(eventId));
        setLeaderboard([]);
      } else {
        setWinners([]);
        setLeaderboard(await getEventLeaderboard(eventId, 20));
      }
      if (authUser?.id) {
        setParticipation(await getMyEventParticipation(eventId));
      } else {
        setParticipation(null);
      }
    } catch {
      setLeaderboard([]);
      setWinners([]);
    } finally {
      const shouldReload = eventLoadRef.current.key === loadKey && eventLoadRef.current.queued;
      eventLoadRef.current.loading = false;
      eventLoadRef.current.queued = false;
      if (shouldReload) {
        refreshTimerRef.current = setTimeout(() => { void loadEventData(eventId, evStatus); }, 150);
      }
    }
  }, [authUser?.id]);

  const refreshEventData = useCallback((eventId: string, evStatus: EventStatus) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => { void loadEventData(eventId, evStatus); }, 200);
  }, [loadEventData]);

  useEffect(() => {
    if (!selectedEvent?.id) return;
    void loadEventData(selectedEvent.id, status);
  }, [selectedEvent?.id, status, loadEventData]);

  useEffect(() => {
    if (!selectedEvent?.id || status !== 'active') return;
    const channel = supabase
      .channel(`seasonal_event_${selectedEvent.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'event_participants',
        filter: `event_id=eq.${selectedEvent.id}`,
      }, () => refreshEventData(selectedEvent.id, status))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedEvent?.id, status, refreshEventData]);

  useEffect(() => () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  const handleJoin = async () => {
    if (!selectedEvent || joining || !authUser) return;
    setJoining(true);
    try {
      playSound('success');
      const p = await joinEvent(selectedEvent.id);
      setParticipation(p);
      await loadEventData(selectedEvent.id, status);
    } catch {
      playSound('click');
    } finally {
      setJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-enter p-8 text-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{`
        .event-scroll {
          display: flex; gap: 10px; overflow-x: auto; padding: 2px 2px 8px;
          -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }
        .event-scroll::-webkit-scrollbar { display: none; }
        .event-chip { scroll-snap-align: start; flex-shrink: 0; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>ETKİNLİK</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <p className="section-label">🌟 SINIRLI SÜRE</p>
          <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>{tr.events.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '4px 0 0', lineHeight: 1.5 }}>
            Etkinliğe katıl, etkinlik puanı kazan ve sıralamada yüksel.
          </p>
        </div>

        <StickerHero
          page="events"
          bg="linear-gradient(135deg,#ec4899 0%,#be185d 100%)"
          badge="🌟 ETKİNLİK"
          title="Sınırlı süre"
          highlight="ödüller kazan!"
        />

        <div style={{ ...card, padding: '16px 18px', position: 'relative', overflow: 'visible' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
            Nasıl çalışır?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: '1', text: 'Aktif etkinliği seç ve katıl' },
              { step: '2', text: 'QR tara, oyun oyna veya görev tamamla — etkinlik puanı kazan' },
              { step: '3', text: 'Sıralamada yüksel, bitişte ödül kazan' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 12, color: 'var(--primary-blue)',
                }}>{s.step}</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {events.length === 0 ? (
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 8px' }}>🎪</p>
            <p style={{ fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>Şu an aktif etkinlik yok</p>
          </div>
        ) : (
          <>
            <div>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', paddingLeft: 2 }}>
                Etkinlikler
              </p>
              <div className="event-scroll">
                {events.map(event => {
                  const st = getEventStatus(event);
                  const stInfo = statusConfig[st];
                  const selected = (selectedId ?? activeEvent?.id) === event.id;
                  const color = event.color ?? '#7B6EF6';

                  return (
                    <button
                      key={event.id}
                      className="event-chip press-card"
                      onClick={() => { playSound('click'); setSelectedId(event.id); }}
                      style={{
                        width: 140, padding: 0, cursor: 'pointer', textAlign: 'left',
                        background: 'var(--card-bg)',
                        border: `2.5px solid ${selected ? color : 'var(--dark-border)'}`,
                        boxShadow: selected ? `0 5px 0 ${color}` : '0 3px 0 var(--dark-border)',
                        borderRadius: 16, overflow: 'visible', position: 'relative',
                      }}
                    >

                      <div style={{
                        height: 56, background: color, position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, borderBottom: '2px solid var(--dark-border)',
                      }}>
                        {event.emoji ?? '🏆'}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.2 }}>
                          {event.title}
                        </p>
                        <span style={{
                          fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 999,
                          background: stInfo.bg, color: stInfo.color,
                          border: `1.5px solid ${stInfo.color}44`,
                        }}>
                          {stInfo.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedEvent && (
              <>
                <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
                  <div style={{ padding: '18px 20px', background: `${accent}18`, borderBottom: '2px solid var(--dark-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 999,
                          background: statusInfo.bg, color: statusInfo.color,
                          border: `1.5px solid ${statusInfo.color}55`,
                        }}>
                          {status === 'active' ? '🔴 ' : ''}{statusInfo.label}
                        </span>
                        <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: '8px 0 6px', lineHeight: 1.1 }}>
                          {selectedEvent.title}
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                          {selectedEvent.description}
                        </p>
                      </div>
                      <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>{selectedEvent.emoji ?? '🏆'}</div>
                    </div>

                    {status === 'active' && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        {[
                          { val: countdown.days, label: 'Gün' },
                          { val: countdown.hours, label: 'Saat' },
                          { val: countdown.mins, label: 'Dk' },
                          { val: countdown.secs, label: 'Sn' },
                        ].map(u => (
                          <div key={u.label} style={{
                            flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 12,
                            background: 'var(--card-bg)', border: '2px solid var(--dark-border)',
                            boxShadow: '0 2px 0 var(--dark-border)',
                          }}>
                            <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>{u.val}</p>
                            <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', margin: '2px 0 0', textTransform: 'uppercase' }}>{u.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {formatShortDate(selectedEvent.start_date)} – {formatShortDate(selectedEvent.end_date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={12} /> {selectedEvent.win_count ?? 3} kazanan
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    {participation?.joined ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, padding: 12, borderRadius: 14, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Etkinlik Puanın</p>
                          <p style={{ fontWeight: 900, fontSize: 24, color: '#f59e0b', margin: 0 }}>{(participation.points ?? 0).toLocaleString()}</p>
                        </div>
                        <div style={{ flex: 1, padding: 12, borderRadius: 14, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Sıralaman</p>
                          <p style={{ fontWeight: 900, fontSize: 24, color: 'var(--primary-blue)', margin: 0 }}>
                            {participation.rank ? `#${participation.rank}` : '—'}
                          </p>
                        </div>
                      </div>
                    ) : status === 'active' ? (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 600, textAlign: 'center' }}>
                        Katılarak etkinlik puanı biriktirmeye başla
                      </p>
                    ) : (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600, textAlign: 'center' }}>
                        {status === 'upcoming' ? `${formatDate(selectedEvent.start_date)} tarihinde başlıyor` : 'Bu etkinlik sona erdi'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Live leaderboard */}
                {status === 'active' && leaderboard.length > 0 && (
                  <div style={{ ...card, padding: '16px 18px' }}>
                    <p style={{ fontWeight: 900, fontSize: 14, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dark)' }}>
                      <TrendingUp size={16} color="#22c55e" /> Canlı Sıralama
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {leaderboard.slice(0, 10).map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, background: p.id === authUser?.id ? 'rgba(123,110,246,0.08)' : 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                          <span style={{ fontWeight: 900, fontSize: 13, width: 28, color: 'var(--text-muted)' }}>#{p.rank}</span>
                          <NeoAvatar src={p.avatar_url} name={p.username} size={32} shape="circle" />
                          <span style={{ flex: 1, fontWeight: 800, fontSize: 13, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</span>
                          <span style={{ fontWeight: 900, fontSize: 12, color: '#f59e0b' }}>{p.points.toLocaleString()} pt</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final winners */}
                {(status === 'ended' || status === 'distributed') && winners.length > 0 && (
                  <div style={{ ...card, padding: '16px 18px' }}>
                    <p style={{ fontWeight: 900, fontSize: 14, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dark)' }}>
                      <Trophy size={16} color="#f59e0b" /> Kesin Kazananlar
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {winners.map(w => (
                        <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                          <span style={{ fontSize: 18 }}>{['🥇','🥈','🥉'][w.final_rank - 1] ?? '🏅'}</span>
                          <NeoAvatar src={w.profiles?.avatar_url ?? null} name={w.profiles?.username ?? '?'} size={32} shape="circle" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 900, fontSize: 13, margin: 0, color: 'var(--text-dark)' }}>{w.profiles?.username ?? '—'}</p>
                            <p style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, margin: '2px 0 0' }}>{w.final_points.toLocaleString()} pt · {w.prize_title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prize list from admin config */}
                {prizes.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: 0 }}>{tr.events.rewards}</h2>
                      <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', borderRadius: 999, color: 'var(--text-muted)' }}>
                        {prizes.length} ödül
                      </span>
                    </div>
                    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                      {prizes.map((reward, i) => (
                        <div
                          key={reward.rank}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                            borderBottom: i < prizes.length - 1 ? '2px solid var(--dark-border)' : 'none',
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                            background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                          }}>
                            {reward.rewardImage || '🏆'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>{reward.label}</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>{reward.rewardName}</p>
                          </div>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status === 'active' && !participation?.joined && authUser && (
                  <button
                    className="press-card"
                    onClick={() => void handleJoin()}
                    disabled={joining}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 16, fontWeight: 900, fontSize: 15,
                      background: `linear-gradient(180deg, ${accent}cc, ${accent})`,
                      color: '#000', border: '3px solid var(--dark-border)',
                      boxShadow: '0 5px 0 var(--dark-border)', cursor: joining ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: joining ? 0.7 : 1,
                    }}
                  >
                    <Zap size={18} /> {joining ? 'Katılınıyor...' : 'Etkinliğe Katıl'}
                  </button>
                )}

                {status === 'active' && participation?.joined && (
                  <div style={{ ...card, padding: '12px 16px', textAlign: 'center', border: '2px solid #22c55e' }}>
                    <Check size={18} color="#22c55e" style={{ marginBottom: 4 }} />
                    <p style={{ fontWeight: 900, fontSize: 13, color: '#22c55e', margin: 0 }}>Etkinliğe katıldın — puan kazanmaya devam et!</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeasonalEvents;
