import React, { useState } from 'react';
import { QrCode, Camera, Check, Zap, RotateCcw, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const fakeQRResults = [
  { code: 'STORE42-BONUS',    title: 'Mağaza Ziyaret Bonusu!', points: 75,  location: 'Mağaza #42 - Ana Cad.' },
  { code: 'EVENT2026-SPECIAL',title: 'Etkinlik Özel Kodu!',    points: 150, location: 'Yaz Etkinliği Standı' },
  { code: 'PARTNER-CAFE',     title: 'Partner Kafe Ziyareti!', points: 50,  location: 'Coffee Corner' },
  { code: 'PROMO-SALE',       title: 'İndirim Promosyonu!',    points: 100, location: 'Online Özel' },
];

const QRScanner: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<typeof fakeQRResults[0] | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ code: string; points: number; time: string; location: string }[]>([
    { code: 'STORE18-DAILY', points: 75,  time: '2 gün önce', location: 'Mağaza #18' },
    { code: 'EVENT2025-X',   points: 100, time: '5 gün önce', location: 'Özel Etkinlik' },
  ]);

  const startScan = () => {
    setScanning(true); setResult(null); setError(''); setScanProgress(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15 + 5;
      setScanProgress(Math.min(prog, 95));
      if (prog >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          setScanProgress(100);
          const r = fakeQRResults[Math.floor(Math.random() * fakeQRResults.length)];
          setResult(r); setScanning(false);
        }, 500);
      }
    }, 150);
  };

  const claimReward = () => {
    if (!result) return;
    addPoints(result.points);
    showRewardPopup({ type: 'reward', title: result.title, subtitle: `${result.location} adresinde QR kod taradın`, points: result.points });
    setHistory(prev => [{ code: result.code, points: result.points, time: 'Az önce', location: result.location }, ...prev]);
    setResult(null); setScanProgress(0);
  };

  const handleManualSubmit = () => {
    const found = fakeQRResults.find(r => r.code === manualCode.trim().toUpperCase());
    if (found) { setResult(found); setError(''); }
    else setError('Geçersiz kod. Lütfen tekrar dene.');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>QR TARA</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-lg mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📱</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>QR Tarayıcı</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Kod tara, anında puan kazan</p>
          </div>
        </div>

        {/* ── Scanner viewport ── */}
        <div className="ns-bolt" style={{ ...card, padding: 20 }}>
          {/* Camera area */}
          <div style={{
            aspectRatio: '1/1', width: '100%', maxWidth: 300, margin: '0 auto 16px',
            background: '#0f172a', borderRadius: 20, overflow: 'hidden', position: 'relative',
            border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)',
          }}>
            {scanning && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent,rgba(123,110,246,0.18),transparent)', animation: 'qrPulse 1.5s ease-in-out infinite' }} />
                {/* Corner guides */}
                {[{ top: 24, left: 24 }, { top: 24, right: 24 }, { bottom: 24, left: 24 }, { bottom: 24, right: 24 }].map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 28, height: 28,
                    borderTop: i < 2 ? '4px solid #a78bfa' : 'none',
                    borderBottom: i >= 2 ? '4px solid #a78bfa' : 'none',
                    borderLeft: i % 2 === 0 ? '4px solid #a78bfa' : 'none',
                    borderRight: i % 2 !== 0 ? '4px solid #a78bfa' : 'none',
                    ...pos,
                  }} />
                ))}
                {/* Scan line */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg,transparent,#a78bfa,transparent)',
                  boxShadow: '0 0 10px #a78bfa',
                  top: `${scanProgress}%`, transition: 'top 0.15s linear',
                }} />
                <p style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>Taranıyor...</p>
              </>
            )}

            {result && !scanning && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#22c55e', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(34,197,94,0.5)' }}>
                  <Check size={34} color="white" />
                </div>
                <p style={{ color: 'white', fontWeight: 900, fontSize: 18, textAlign: 'center', margin: 0 }}>Kod Bulundu!</p>
              </div>
            )}

            {!scanning && !result && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'rgba(255,255,255,0.4)' }}>
                <Camera size={52} />
                <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', margin: 0 }}>Taramayı başlatmak için dokun</p>
              </div>
            )}
          </div>

          {/* Progress bar while scanning */}
          {scanning && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 10, background: 'var(--tab-bg)', borderRadius: 999, border: '2px solid var(--dark-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scanProgress}%`, background: 'linear-gradient(90deg,var(--gradient-start),var(--gradient-end))', borderRadius: 999, transition: 'width 0.15s linear' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>QR kod analiz ediliyor...</p>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', borderRadius: 14, border: '2.5px solid #22c55e', boxShadow: '0 4px 0 #16a34a', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--dark-border)' }}>
                  <Check size={22} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 3px' }}>{result.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <MapPin size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{result.location}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', border: '2px solid #f59e0b' }}>
                    <Zap size={13} color="#f59e0b" />
                    <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>+{result.points} Puan</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => { setResult(null); setScanProgress(0); }} style={{
                  flex: 1, padding: '11px', borderRadius: 12, fontWeight: 900, fontSize: 13,
                  background: 'var(--card-bg)', color: 'var(--text-dark)',
                  border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <RotateCcw size={14} /> Tekrar Tara
                </button>
                <button onClick={claimReward} style={{
                  flex: 1, padding: '11px', borderRadius: 12, fontWeight: 900, fontSize: 13,
                  background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
                  border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
                  cursor: 'pointer',
                }}>
                  Talep Et +{result.points}
                </button>
              </div>
            </div>
          )}

          {!scanning && !result && (
            <button onClick={startScan} style={{
              width: '100%', padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 15,
              background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
              border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
            >
              <QrCode size={20} /> Taramayı Başlat
            </button>
          )}
        </div>

        {/* ── Manual code entry ── */}
        <div className="ns-bolt" style={{ ...card, padding: '18px 20px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 12px' }}>Kodu Manuel Gir</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="örn. STORE42-BONUS"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                background: 'var(--tab-bg)', color: 'var(--text-dark)',
                border: '2.5px solid var(--dark-border)', outline: 'none',
                fontFamily: 'monospace', letterSpacing: '0.06em',
              }}
            />
            <button onClick={handleManualSubmit} style={{
              padding: '12px 18px', borderRadius: 12, fontWeight: 900, fontSize: 13,
              background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
              cursor: 'pointer',
            }}>Gir</button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8, fontWeight: 700 }}>{error}</p>}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>Dene: STORE42-BONUS, EVENT2026-SPECIAL</p>
        </div>

        {/* ── Scan history ── */}
        {history.length > 0 && (
          <div>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 12px' }}>Son Taramalar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((h, i) => (
                <div key={i} className="ns-bolt" style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={18} color="#22c55e" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 2px' }}>{h.code}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{h.location} • {h.time}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Zap size={12} color="#f59e0b" />
                    <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>+{h.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes qrPulse {
          0%,100% { opacity:0.4; } 50% { opacity:1; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
