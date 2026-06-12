import React, { useEffect, useState } from 'react';
import { Zap, Star, Lock, Trophy, Calendar, Check, ChevronRight } from 'lucide-react';
import { getAllEvents } from '../services/events';
import type { AppEvent } from '../services/events';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const eventColors: Record<string, string> = {
  '1': '#06b6d4',
  '2': '#ec4899',
  '3': '#64748b',
};

const eventRewardsMap: Record<string, { id: string; title: string; points: number; unlocked: boolean; icon: string }[]> = {
  '1': [
    { id: '1', title: 'Yaz Bez Çantası', points: 300, unlocked: true, icon: '👜' },
    { id: '2', title: 'Güneş Kremi Seti', points: 150, unlocked: true, icon: '🧴' },
    { id: '3', title: 'Plaj Havlusu', points: 500, unlocked: false, icon: '🏖️' },
    { id: '4', title: 'Yaz Hediye Kutusu', points: 1000, unlocked: false, icon: '🎁' },
    { id: '5', title: 'VIP Havuz Daveti', points: 2000, unlocked: false, icon: '🎪' },
  ],
  '2': [
    { id: '1', title: 'Bahar Çiçek Kupası', points: 200, unlocked: true, icon: '🌷' },
    { id: '2', title: '%20 İndirim Kuponu', points: 100, unlocked: true, icon: '🏷️' },
    { id: '3', title: 'Çiçek Buketi', points: 400, unlocked: true, icon: '💐' },
    { id: '4', title: 'Bahar Rozeti', points: 0, unlocked: true, icon: '🏅' },
  ],
  '3': [
    { id: '1', title: 'Kış Eldiveni', points: 250, unlocked: false, icon: '🧤' },
    { id: '2', title: 'Sıcak Çikolata Kuponu', points: 120, unlocked: false, icon: '☕' },
    { id: '3', title: 'Kar Tanesi Rozeti', points: 0, unlocked: false, icon: '❄️' },
  ],
};

type EventStatus = 'active' | 'ended' | 'upcoming';

const getEventStatus = (event: AppEvent): EventStatus => {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  if (!event.active) return 'ended';
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

const statusConfig: Record<EventStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Aktif', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ended: { label: 'Bitti', color: 'var(--text-muted)', bg: 'var(--tab-bg)' },
  upcoming: { label: 'Yakında', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

const formatShortDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

const useCountdown = (endDate: string, active: boolean) => {
  const [left, setLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setLeft({ days: 0, hours: 0, mins: 0 }); return; }
      setLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endDate, active]);

  return left;
};

const SeasonalEvents: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAllEvents().then(setEvents).catch(() => setEvents([])).finally(() => setIsLoading(false));
  }, []);

  const activeEvent = events.find(e => e.active) ?? events[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedEvent = events.find(e => e.id === (selectedId ?? activeEvent?.id)) ?? activeEvent;
  const status: EventStatus = selectedEvent ? getEventStatus(selectedEvent) : 'upcoming';
  const statusInfo = statusConfig[status];
  const accent = selectedEvent ? (eventColors[selectedEvent.id] ?? '#7B6EF6') : '#7B6EF6';
  const rewards: { id: string; title: string; points: number; unlocked: boolean; icon: string }[] = selectedEvent ? (eventRewardsMap[selectedEvent.id] ?? []) : [];
  const countdown = useCountdown(selectedEvent?.end_date ?? '', status === 'active');

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
        {/* Header */}
        <div>
          <p className="section-label">🌟 SINIRLI SÜRE</p>
          <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>{tr.events.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '4px 0 0', lineHeight: 1.5 }}>
            Belirli dönemlerde katıl, ekstra puan kazan ve özel ödülleri aç.
          </p>
        </div>

        {/* How it works */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
            Nasıl çalışır?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: '1', text: 'Aktif etkinliği seç ve katıl' },
              { step: '2', text: 'QR tara, oyun oyna veya görev tamamla' },
              { step: '3', text: 'Çarpanlı puan kazan, ödülleri aç' },
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

        {/* Event picker */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', paddingLeft: 2 }}>
            Etkinlikler
          </p>
          <div className="event-scroll">
            {events.map(event => {
              const st = getEventStatus(event);
              const stInfo = statusConfig[st];
              const selected = selectedId === event.id;
              const color = eventColors[event.id] ?? '#7B6EF6';

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
                    borderRadius: 16, overflow: 'hidden',
                  }}
                >
                  <div style={{
                    height: 56, background: color, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, borderBottom: '2px solid var(--dark-border)',
                  }}>
                    {(event as typeof event & { emoji?: string }).emoji ?? '🎉'}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.2 }}>
                      {event.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 999,
                        background: stInfo.bg, color: stInfo.color,
                        border: `1.5px solid ${stInfo.color}44`,
                      }}>
                        {stInfo.label}
                      </span>
                      {st === 'active' && (
                        <span style={{ fontSize: 9, fontWeight: 900, color: color, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Zap size={8} /> {event.multiplier}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected event hero */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          <div style={{
            padding: '18px 20px',
            background: `${accent}18`,
            borderBottom: '2px solid var(--dark-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 999,
                    background: statusInfo.bg, color: statusInfo.color,
                    border: `1.5px solid ${statusInfo.color}55`,
                  }}>
                    {status === 'active' ? '🔴 ' : ''}{statusInfo.label}
                  </span>
                  {status === 'active' && (
                    <span style={{
                      fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 999,
                      background: accent, color: '#000', border: '2px solid var(--dark-border)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={10} /> {selectedEvent?.multiplier ?? '1x'} puan
                    </span>
                  )}
                </div>
                <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: '0 0 6px', lineHeight: 1.1 }}>
                  {selectedEvent?.title}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                  {selectedEvent?.description}
                </p>
              </div>
              <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>
                {selectedEvent?.emoji ?? '🎉'}
              </div>
            </div>

            {status === 'active' && (
              <div style={{
                display: 'flex', gap: 8, marginBottom: 14,
              }}>
                {[
                  { val: countdown.days, label: 'Gün' },
                  { val: countdown.hours, label: 'Saat' },
                  { val: countdown.mins, label: 'Dk' },
                ].map(u => (
                  <div key={u.label} style={{
                    flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 12,
                    background: 'var(--card-bg)', border: '2px solid var(--dark-border)',
                    boxShadow: '0 2px 0 var(--dark-border)',
                  }}>
                    <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>{u.val}</p>
                    <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', margin: '2px 0 0', textTransform: 'uppercase' }}>{u.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} />
                {selectedEvent ? `${formatShortDate(selectedEvent.start_date)} – ${formatShortDate(selectedEvent.end_date)}` : ''}
              </span>
            </div>
          </div>

          {/* Progress placeholder */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-dark)' }}>Etkinlik ilerlemen</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', fontWeight: 600, textAlign: 'center' }}>
              {status === 'active'
                ? 'Görevleri tamamlayarak ilerlemeni artır'
                : status === 'upcoming'
                  ? selectedEvent ? `${formatDate(selectedEvent.start_date)} tarihinde başlıyor` : ''
                  : 'Bu etkinlik sona erdi'}
            </p>
          </div>
        </div>

        {/* Rewards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: 0 }}>{tr.events.rewards}</h2>
            <span style={{
              fontSize: 10, fontWeight: 900, padding: '4px 10px',
              background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', borderRadius: 999,
              color: 'var(--text-muted)',
            }}>
              {rewards.filter(r => r.unlocked).length}/{rewards.length}
            </span>
          </div>

          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {rewards.map((reward, i) => (
              <div
                key={reward.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderBottom: i < rewards.length - 1 ? '2px solid var(--dark-border)' : 'none',
                  opacity: reward.unlocked ? 1 : 0.7,
                  background: reward.unlocked ? 'rgba(34,197,94,0.04)' : 'transparent',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  background: reward.unlocked ? 'rgba(34,197,94,0.12)' : 'var(--tab-bg)',
                  border: `2px solid ${reward.unlocked ? '#22c55e' : 'var(--dark-border)'}`,
                }}>
                  {reward.unlocked ? reward.icon : <Lock size={18} color="var(--text-muted)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>{reward.title}</p>
                  {reward.points > 0 ? (
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" />
                      {reward.points.toLocaleString()} puan
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Rozet ödülü</p>
                  )}
                </div>
                {reward.unlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Check size={14} color="#22c55e" strokeWidth={3} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#22c55e' }}>Açık</span>
                  </div>
                ) : (
                  <ChevronRight size={16} color="var(--text-muted)" />
                )}
              </div>
            ))}
          </div>
        </div>

        {status === 'active' && (
          <button
            className="press-card"
            onClick={() => playSound('success')}
            style={{
              width: '100%', padding: '14px', borderRadius: 16, fontWeight: 900, fontSize: 15,
              background: `linear-gradient(180deg, ${accent}cc, ${accent})`,
              color: '#000', border: '3px solid var(--dark-border)',
              boxShadow: '0 5px 0 var(--dark-border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Zap size={18} /> Etkinliğe Katıl — {selectedEvent?.multiplier ?? '1x'} Puan
          </button>
        )}
      </div>
    </div>
  );
};

export default SeasonalEvents;
