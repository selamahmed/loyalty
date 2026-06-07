import React, { useState } from 'react';
import { Zap, Clock, Star, Lock, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { seasonalEvents } from '../data/mockData';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const eventRewards = [
  { id: '1', title: 'Yaz Bez Çantası',  points: 300,  unlocked: true,  icon: '👜' },
  { id: '2', title: 'Güneş Kremi Seti', points: 150,  unlocked: true,  icon: '🧴' },
  { id: '3', title: 'Plaj Havlusu',     points: 500,  unlocked: false, icon: '🏖️' },
  { id: '4', title: 'Yaz Hediye Kutusu',points: 1000, unlocked: false, icon: '🎁' },
  { id: '5', title: 'VIP Havuz Daveti', points: 2000, unlocked: false, icon: '🎪' },
];

const SeasonalEvents: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState(seasonalEvents[0]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>ETKİNLİKLER</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#f87171,#dc2626)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🌟</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Mevsimsel Etkinlikler</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Sınırlı süreli etkinliklere katıl</p>
          </div>
        </div>

        {/* ── Event selector grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
          {seasonalEvents.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              style={{
                ...card,
                border: selectedEvent.id === event.id ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
                boxShadow: selectedEvent.id === event.id ? '0 6px 0 var(--primary-blue)' : '0 6px 0 var(--dark-border)',
                overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { if (selectedEvent.id !== event.id) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {/* Banner */}
              <div className={`h-24 bg-gradient-to-br ${event.color} relative overflow-hidden`} style={{ borderBottom: '3px solid var(--dark-border)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontWeight: 900, color: 'white', fontSize: 14, margin: '0 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>{event.title}</p>
                  {event.active && (
                    <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 999, fontSize: 9, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Zap size={8} /> {event.multiplier}
                    </span>
                  )}
                  {!event.active && (
                    <span style={{ padding: '2px 8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>
                      {event.progress === 100 ? 'Bitti' : 'Yakında'}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--primary-blue)' }}>{event.unlockedRewards}/{event.totalRewards}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${event.progress}%`, background: 'linear-gradient(90deg,var(--gradient-start),var(--gradient-end))', borderRadius: 999 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Selected event hero ── */}
        {selectedEvent && (
          <>
            <div className={`bg-gradient-to-br ${selectedEvent.color} ns-heart`} style={{ ...card, padding: 'clamp(16px,4vw,24px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {selectedEvent.active && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(255,255,255,0.25)', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, color: 'white', marginBottom: 8 }}>
                        🔴 AKTİF ETKİNLİK
                      </span>
                    )}
                    <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: '0 0 6px', textShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>{selectedEvent.title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{selectedEvent.description}</p>
                  </div>
                  {selectedEvent.active && (
                    <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                      <Zap size={14} style={{ display: 'inline', marginRight: 4 }} />{selectedEvent.multiplier}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: 700 }}>
                    <span>Etkinlik İlerlemesi</span>
                    <span>{selectedEvent.progress}%</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selectedEvent.progress}%`, background: 'white', borderRadius: 999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.8)' }}>
                    <Calendar size={12} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Bitiş: {new Date(selectedEvent.endDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.8)' }}>
                    <Trophy size={12} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedEvent.unlockedRewards}/{selectedEvent.totalRewards} ödül kilidi açıldı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Event rewards ── */}
            <div>
              <h2 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 12px' }}>Etkinlik Ödülleri</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {eventRewards.map(reward => (
                  <div key={reward.id} style={{
                    ...card,
                    border: reward.unlocked ? '3px solid #22c55e' : '3px solid var(--dark-border)',
                    boxShadow: reward.unlocked ? '0 6px 0 #16a34a' : '0 6px 0 var(--dark-border)',
                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                    opacity: reward.unlocked ? 1 : 0.75,
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                      background: reward.unlocked ? 'rgba(34,197,94,0.12)' : 'var(--tab-bg)',
                      border: reward.unlocked ? '2.5px solid #22c55e' : '2.5px solid var(--dark-border)',
                      boxShadow: reward.unlocked ? '0 3px 0 #16a34a44' : '0 3px 0 var(--dark-border)',
                    }}>
                      {reward.unlocked ? reward.icon : <Lock size={20} color="var(--text-muted)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 4px' }}>{reward.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#f59e0b' }}>{reward.points.toLocaleString()} puan gerekli</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      {reward.unlocked ? (
                        <>
                          <span style={{ fontSize: 20 }}>✅</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#22c55e' }}>Açık</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} color="var(--text-muted)" />
                          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)' }}>Kilitli</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeasonalEvents;
