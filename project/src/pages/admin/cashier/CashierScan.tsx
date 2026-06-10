import React, { useState, useEffect, useCallback } from 'react';
import CashierLayout from './CashierLayout';
import {
  QrCode, Search, CheckCircle, AlertCircle, RefreshCw,
  User, Star, Clock, XCircle, ChevronRight, Banknote, Zap
} from 'lucide-react';

const ACCENT       = '#f59e0b';
const POINTS_PER_TL = 10;
const QR_TTL_SEC    = 7 * 60;

/* ─── Mock customers ─── */
const MOCK_CUSTOMERS = [
  { id: 'USR001', name: 'Ayşe Kaya',       points: 4250, level: 8,  phone: '0532 111 22 33', avatar: 'AK' },
  { id: 'USR002', name: 'Mehmet Türk',     points: 1820, level: 4,  phone: '0544 555 66 77', avatar: 'MT' },
  { id: 'USR003', name: 'Zeynep Arslan',   points: 960,  level: 2,  phone: '0551 999 00 11', avatar: 'ZA' },
  { id: 'USR004', name: 'Ali Rıza Demir',  points: 3100, level: 6,  phone: '0536 222 33 44', avatar: 'AD' },
  { id: 'USR005', name: 'Fatma Şahin',     points: 2450, level: 5,  phone: '0505 888 99 00', avatar: 'FŞ' },
  { id: 'USR006', name: 'Emre Çelik',      points: 890,  level: 3,  phone: '0543 777 88 99', avatar: 'EÇ' },
  { id: 'USR007', name: 'Selin Yılmaz',    points: 6700, level: 12, phone: '0533 444 55 66', avatar: 'SY' },
];

/* ─── Types ─── */
interface ActiveQR {
  code: string;
  amount: number;
  points: number;
  issuedAt: number;   // ms timestamp
  expiresAt: number;  // ms timestamp
}

interface GiftResult {
  customerName: string;
  customerId: string;
  points: number;
  timestamp: string;
}

/* ─── Helpers ─── */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'QR-';
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function fmtSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ─── QR section (amount → QR) ─── */
const AmountQRTab: React.FC = () => {
  const [amount, setAmount]         = useState('');
  const [activeQR, setActiveQR]     = useState<ActiveQR | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired]       = useState(false);
  const [sessionLog, setSessionLog] = useState<GiftResult[]>([]);
  const [sessionPts, setSessionPts] = useState(0);

  const pts = Math.round((parseFloat(amount) || 0) * POINTS_PER_TL);

  /* Countdown ticker */
  useEffect(() => {
    if (!activeQR) return;
    const tick = () => {
      const rem = Math.max(0, Math.floor((activeQR.expiresAt - Date.now()) / 1000));
      setSecondsLeft(rem);
      if (rem === 0) setExpired(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeQR]);

  const handleGenerate = () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) return;
    const now  = Date.now();
    const qr: ActiveQR = {
      code: generateCode(),
      amount: amtNum,
      points: Math.round(amtNum * POINTS_PER_TL),
      issuedAt: now,
      expiresAt: now + QR_TTL_SEC * 1000,
    };
    setActiveQR(qr);
    setExpired(false);
    setSecondsLeft(QR_TTL_SEC);
  };

  const handleReset = () => {
    setActiveQR(null);
    setExpired(false);
    setSecondsLeft(0);
    setAmount('');
  };

  /* Simulated "customer scanned" */
  const handleSimulateScan = useCallback(() => {
    if (!activeQR || expired) return;
    const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const result: GiftResult = { customerName: 'Müşteri (sim)', customerId: 'SIM', points: activeQR.points, timestamp: ts };
    setSessionLog(p => [result, ...p]);
    setSessionPts(p => p + activeQR.points);
    handleReset();
  }, [activeQR, expired]);

  /* Build QR data URL */
  const qrPayload = activeQR
    ? encodeURIComponent(JSON.stringify({
        type: 'cashier_purchase',
        code: activeQR.code,
        amount: activeQR.amount,
        points: activeQR.points,
        issued_at: new Date(activeQR.issuedAt).toISOString(),
        expires_at: new Date(activeQR.expiresAt).toISOString(),
      }))
    : '';

  const pctBar = activeQR ? (secondsLeft / QR_TTL_SEC) * 100 : 0;
  const isWarn = secondsLeft <= 60 && !expired;

  return (
    <div className="space-y-4">
      {/* Session stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
          <p className="text-2xl font-black" style={{ color: '#7B6EF6' }}>{sessionLog.length}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Oturum QR</p>
        </div>
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
          <p className="text-2xl font-black" style={{ color: ACCENT }}>{sessionPts.toLocaleString('tr-TR')}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Oturum Puan</p>
        </div>
      </div>

      {/* Amount input */}
      {!activeQR && (
        <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Harcama Tutarını Gir</p>
          <div>
            <label className="text-xs font-black mb-2 block" style={{ color: 'var(--text-muted)' }}>HARCAMA MİKTARI (₺)</label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg" style={{ color: 'var(--text-muted)' }}>₺</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  className="w-full py-3 pr-4 rounded-xl font-black text-xl outline-none"
                  style={{ paddingLeft: 36, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)' }}
                />
              </div>
            </div>
          </div>

          {/* Live points preview */}
          {pts > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid #f59e0b' }}>
              <span className="font-black text-sm" style={{ color: '#d97706' }}>Kazanılacak Puan</span>
              <div className="flex items-center gap-1.5">
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span className="font-black text-xl" style={{ color: '#d97706' }}>+{pts.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
          >
            <QrCode size={18} /> QR Kod Oluştur
          </button>
        </div>
      )}

      {/* Active QR */}
      {activeQR && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `3px solid ${expired ? '#ef4444' : isWarn ? '#f59e0b' : '#22c55e'}`, boxShadow: `0px 5px 0px ${expired ? '#dc2626' : isWarn ? '#d97706' : '#16a34a'}`, background: 'var(--card-bg)' }}>

          {/* QR header */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '2.5px solid var(--dark-border)', background: expired ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.05)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: expired ? '#ef4444' : '#22c55e' }}>
                {expired ? <XCircle size={16} color="white" /> : <QrCode size={16} color="white" />}
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{expired ? 'QR Süresi Doldu' : 'QR Aktif'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{activeQR.code}</p>
              </div>
            </div>
            <button onClick={handleReset} className="p-1.5 rounded-lg" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
              <XCircle size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Countdown bar */}
          <div className="h-2" style={{ background: 'var(--tab-bg)' }}>
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${pctBar}%`,
                background: expired ? '#ef4444' : isWarn ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>

          <div className="p-5 space-y-4">
            {/* QR image */}
            <div className="relative flex justify-center">
              <div className="relative" style={{ background: 'white', padding: 14, borderRadius: 18, border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrPayload}&size=240x240&margin=8`}
                  alt="QR Code"
                  style={{ width: 240, height: 240, display: 'block', borderRadius: 8, opacity: expired ? 0.3 : 1 }}
                />
                {expired && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(239,68,68,0.7)', backdropFilter: 'blur(3px)' }}>
                    <XCircle size={48} color="white" strokeWidth={2} />
                    <p className="font-black text-white text-lg mt-2">SÜRESI DOLDU</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timer */}
            {!expired && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: isWarn ? '#f59e0b' : '#22c55e' }} />
                  <span className="font-black text-2xl tabular-nums" style={{ color: isWarn ? '#f59e0b' : '#22c55e', fontFamily: 'monospace' }}>
                    {fmtSeconds(secondsLeft)}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {isWarn ? '⚠️ Süre bitiyor!' : 'Müşteri bu kodu telefonuyla tarsın'}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Harcama</p>
                <p className="font-black text-lg" style={{ color: 'var(--text-dark)' }}>₺{activeQR.amount.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b' }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: '#d97706' }}>Kazanılacak Puan</p>
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <p className="font-black text-lg" style={{ color: '#d97706' }}>+{activeQR.points.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {expired ? (
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
              >
                <RefreshCw size={16} /> Yeni QR Oluştur
              </button>
            ) : (
              <button
                onClick={handleSimulateScan}
                className="w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'var(--tab-bg)', border: '2.5px dashed var(--dark-border)', color: 'var(--text-muted)', fontSize: 12 }}
              >
                📱 Taramayı Simüle Et (demo)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session log */}
      {sessionLog.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '2px solid var(--dark-border)' }}>
            <Clock size={14} style={{ color: ACCENT }} />
            <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Oturum Kaydı ({sessionLog.length})</p>
          </div>
          {sessionLog.slice(0, 6).map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ background: '#22c55e', flexShrink: 0 }}>✓</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs" style={{ color: 'var(--text-dark)' }}>{r.customerName}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.timestamp}</p>
              </div>
              <span className="font-black text-sm" style={{ color: '#22c55e', flexShrink: 0 }}>+{r.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Manual search tab ─── */
const ManualSearchTab: React.FC = () => {
  const [query, setQuery]             = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [amount, setAmount]           = useState('');
  const [customPts, setCustomPts]     = useState('');
  const [mode, setMode]               = useState<'amount' | 'manual'>('amount');
  const [gifting, setGifting]         = useState(false);
  const [result, setResult]           = useState<'success' | 'error' | null>(null);
  const [log, setLog]                 = useState<GiftResult[]>([]);
  const [totalPts, setTotalPts]       = useState(0);

  const filtered = query.trim()
    ? MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.id.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_CUSTOMERS;

  const selected = MOCK_CUSTOMERS.find(c => c.id === selectedId);

  const calcPoints = () => {
    if (mode === 'amount') return Math.round((parseFloat(amount) || 0) * POINTS_PER_TL);
    return parseInt(customPts, 10) || 0;
  };
  const ptsToGive = calcPoints();

  const handleGive = async () => {
    if (!selected || ptsToGive <= 0) { setResult('error'); setTimeout(() => setResult(null), 2500); return; }
    setGifting(true);
    await new Promise(r => setTimeout(r, 700));
    const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setLog(p => [{ customerName: selected.name, customerId: selected.id, points: ptsToGive, timestamp: ts }, ...p]);
    setTotalPts(p => p + ptsToGive);
    setResult('success');
    setGifting(false);
    setTimeout(() => { setResult(null); setSelectedId(null); setAmount(''); setCustomPts(''); }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
          <p className="text-2xl font-black" style={{ color: '#7B6EF6' }}>{log.length}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Manuel İşlem</p>
        </div>
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
          <p className="text-2xl font-black" style={{ color: ACCENT }}>{totalPts.toLocaleString('tr-TR')}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Verilen Puan</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="İsim, telefon veya ID ara..."
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedId(null); }}
          className="w-full py-3 rounded-xl font-bold text-sm outline-none"
          style={{ paddingLeft: 42, paddingRight: 16, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', color: 'var(--text-dark)' }}
        />
      </div>

      {/* Customer list */}
      {!selectedId && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-black text-sm" style={{ color: 'var(--text-muted)' }}>Müşteri bulunamadı</p>
            </div>
          ) : filtered.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full flex items-center gap-3 px-5 py-3 transition-all text-left hover:opacity-80"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--dark-border)' : 'none' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)' }}>
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{c.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.phone} · {c.id}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <span className="font-black text-xs" style={{ color: '#d97706' }}>{c.points.toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Seviye {c.level}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {/* Selected customer panel */}
      {selected && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid #7B6EF6', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          {/* Customer header */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: '2px solid var(--dark-border)', background: 'rgba(123,110,246,0.05)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)', flexShrink: 0 }}>
              {selected.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black" style={{ color: 'var(--text-dark)' }}>{selected.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.phone} · Seviye {selected.level}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b' }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span className="font-black text-sm" style={{ color: '#d97706' }}>{selected.points.toLocaleString('tr-TR')}</span>
            </div>
            <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
              <XCircle size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Mode selector */}
            <div className="grid grid-cols-2 gap-2">
              {(['amount', 'manual'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="py-2.5 rounded-xl font-black text-sm transition-all"
                  style={{
                    background: mode === m ? 'linear-gradient(180deg,#7B6EF6,#5b4dd1)' : 'var(--tab-bg)',
                    color: mode === m ? 'white' : 'var(--text-muted)',
                    border: `2px solid ${mode === m ? 'var(--dark-border)' : 'var(--dark-border)'}`,
                    boxShadow: mode === m ? '0px 3px 0px var(--dark-border)' : 'none',
                  }}
                >
                  {m === 'amount' ? '₺ Tutardan' : '# Manuel Puan'}
                </button>
              ))}
            </div>

            {/* Input */}
            {mode === 'amount' ? (
              <div>
                <label className="text-xs font-black mb-1.5 block" style={{ color: 'var(--text-muted)' }}>HARCAMA TUTARI (₺)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black" style={{ color: 'var(--text-muted)' }}>₺</span>
                  <input
                    type="number" min="0.01" step="0.01" placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full py-3 rounded-xl font-black text-lg outline-none"
                    style={{ paddingLeft: 32, paddingRight: 16, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-black mb-1.5 block" style={{ color: 'var(--text-muted)' }}>VERİLECEK PUAN</label>
                <input
                  type="number" min="1" step="1" placeholder="100"
                  value={customPts}
                  onChange={e => setCustomPts(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl font-black text-lg outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
                />
              </div>
            )}

            {/* Points preview */}
            {ptsToGive > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid #f59e0b' }}>
                <span className="font-black text-sm" style={{ color: '#d97706' }}>Verilecek Puan</span>
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span className="font-black text-xl" style={{ color: '#d97706' }}>+{ptsToGive.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            )}

            {/* Result */}
            {result === 'success' && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                <CheckCircle size={18} style={{ color: '#22c55e' }} />
                <span className="font-black text-sm" style={{ color: '#22c55e' }}>✅ {ptsToGive} puan {selected.name} hesabına eklendi!</span>
              </div>
            )}
            {result === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}>
                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                <span className="font-black text-sm" style={{ color: '#ef4444' }}>Geçerli bir tutar ya da puan girin.</span>
              </div>
            )}

            {!result && (
              <button
                onClick={handleGive}
                disabled={ptsToGive <= 0 || gifting}
                className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: `linear-gradient(180deg,${ACCENT},#d97706)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
              >
                {gifting ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                {gifting ? 'İşleniyor…' : `${ptsToGive > 0 ? ptsToGive.toLocaleString('tr-TR') + ' ' : ''}Puan Ver`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '2px solid var(--dark-border)' }}>
            <Clock size={14} style={{ color: ACCENT }} />
            <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Oturum Kaydı ({log.length})</p>
          </div>
          {log.slice(0, 6).map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs" style={{ color: 'var(--text-dark)' }}>{r.customerName}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.timestamp}</p>
              </div>
              <span className="font-black text-xs" style={{ color: '#22c55e' }}>+{r.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main page ─── */
const CashierScan: React.FC = () => {
  const [tab, setTab] = useState<'qr' | 'manual'>('qr');

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Banknote size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">Puan İşlemleri</p>
              <p className="text-white/70 text-sm mt-0.5">Tutar gir → QR oluştur  |  Müşteri ara → Manuel ver</p>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div className="relative flex p-1 rounded-2xl" style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)' }}>
          <div
            className="absolute top-1 bottom-1 rounded-xl tab-indicator transition-all"
            style={{
              width: 'calc(50% - 4px)',
              left: tab === 'qr' ? 4 : 'calc(50% + 4px)',
              background: 'var(--card-bg)',
              border: '2px solid var(--dark-border)',
              boxShadow: '0px 2px 0px var(--dark-border)',
            }}
          />
          <button
            onClick={() => setTab('qr')}
            className="relative z-10 flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: tab === 'qr' ? 'var(--text-dark)' : 'var(--text-muted)' }}
          >
            <QrCode size={15} /> Tutar & QR
          </button>
          <button
            onClick={() => setTab('manual')}
            className="relative z-10 flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: tab === 'manual' ? 'var(--text-dark)' : 'var(--text-muted)' }}
          >
            <User size={15} /> Manuel Arama
          </button>
        </div>

        {/* Tab content */}
        {tab === 'qr' ? <AmountQRTab /> : <ManualSearchTab />}
      </div>
    </CashierLayout>
  );
};

export default CashierScan;
