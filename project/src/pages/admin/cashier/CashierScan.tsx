import React, { useState, useEffect, useCallback } from 'react';
import CashierLayout from './CashierLayout';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { adminAddPoints, createCashierQR, getQRCodeById } from '../../../services/admin';
import { activityLogService } from '../../../lib/activityLogger';
import { useRealtimeTable } from '../../../hooks/useRealtime';
import {
  QrCode, Search, CheckCircle, AlertCircle, RefreshCw,
  User, Star, Clock, XCircle, ChevronRight, Banknote, Zap, Loader2
} from 'lucide-react';
import NeoAvatar from '../../../components/NeoAvatar';

const ACCENT        = '#f59e0b';
const POINTS_PER_TL = 10;
const QR_TTL_SEC    = 7 * 60;

interface ActiveQR {
  id?: string;     // DB row id
  code: string;
  amount: number;
  points: number;
  issuedAt: number;
  expiresAt: number;
  status?: 'pending' | 'used';
}

interface GiftResult {
  customerName: string;
  customerId: string;
  points: number;
  timestamp: string;
}

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
  const { authUser } = useAuth();
  const [amount, setAmount]           = useState('');
  const [activeQR, setActiveQR]       = useState<ActiveQR | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired]         = useState(false);
  const [sessionLog, setSessionLog]   = useState<GiftResult[]>([]);
  const [sessionPts, setSessionPts]   = useState(0);
  const [generating, setGenerating]   = useState(false);
  const [genError, setGenError]       = useState('');

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

  const syncActiveQR = useCallback(async () => {
    if (!activeQR?.id) return;
    try {
      const row = await getQRCodeById(activeQR.id);
      if (!row) return;
      const used = !row.active || ((row.max_uses ?? 0) > 0 && (row.uses_count ?? 0) >= (row.max_uses ?? 0));
      if (used && activeQR.status !== 'used') {
        const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        setSessionLog(prev => [{
          customerName: 'QR Musterisi',
          customerId: row.id,
          points: row.points ?? activeQR.points,
          timestamp: ts,
        }, ...prev]);
        setSessionPts(prev => prev + (row.points ?? activeQR.points));
      }
      setActiveQR(prev => {
        if (!prev || prev.id !== row.id) return prev;
        return { ...prev, status: used ? 'used' : 'pending' };
      });
    } catch (e) {
      console.warn('[CashierScan] Could not refresh active QR:', e);
    }
  }, [activeQR?.id, activeQR?.points, activeQR?.status]);

  useRealtimeTable('qr_codes', () => { void syncActiveQR(); }, Boolean(activeQR?.id));

  const handleGenerate = async () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) return;
    setGenerating(true);
    setGenError('');
    const now        = Date.now();
    const code       = generateCode();
    const expiresAt  = new Date(now + QR_TTL_SEC * 1000).toISOString();
    const pointsVal  = Math.round(amtNum * POINTS_PER_TL);

    try {
      const row = await createCashierQR({
        code,
        points: pointsVal,
        amount: amtNum,
        cashierUserId: authUser?.id ?? 'cashier',
        expiresAt,
      });
      setActiveQR({
        id: row.id,
        code: row.code,
        amount: amtNum,
        points: row.points,
        issuedAt: new Date(row.created_at ?? now).getTime(),
        expiresAt: new Date(row.expires_at ?? expiresAt).getTime(),
        status: 'pending',
      });
      setExpired(false);
      setSecondsLeft(QR_TTL_SEC);
      setAmount('');
    } catch (e: unknown) {
      setGenError((e as Error).message ?? 'QR Supabase uzerine kaydedilemedi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveQR(null);
    setExpired(false);
    setSecondsLeft(0);
    setAmount('');
    setGenError('');
  };

  /* Build QR data URL */
  const qrPayload = activeQR
    ? encodeURIComponent(JSON.stringify({
        type: 'cashier_purchase',
        qr_id: activeQR.code,
        code: activeQR.code,
        amount: activeQR.amount,
        points: activeQR.points,
        issued_at: new Date(activeQR.issuedAt).toISOString(),
        expires_at: new Date(activeQR.expiresAt).toISOString(),
        status: activeQR.status ?? 'pending',
      }))
    : '';

  const pctBar = activeQR ? (secondsLeft / QR_TTL_SEC) * 100 : 0;
  const isUsed = activeQR?.status === 'used';
  const isWarn = secondsLeft <= 60 && !expired && !isUsed;

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

          {genError && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}>
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
              <span className="text-xs font-bold" style={{ color: '#ef4444' }}>{genError}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!amount || parseFloat(amount) <= 0 || generating}
            className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
            {generating ? 'Oluşturuluyor…' : 'QR Kod Oluştur'}
          </button>
        </div>
      )}

      {/* Active QR */}
      {activeQR && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `3px solid ${expired ? '#ef4444' : isUsed ? '#9ca3af' : isWarn ? '#f59e0b' : '#22c55e'}`, boxShadow: `0px 5px 0px ${expired ? '#dc2626' : isUsed ? '#6b7280' : isWarn ? '#d97706' : '#16a34a'}`, background: 'var(--card-bg)' }}>

          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '2.5px solid var(--dark-border)', background: expired ? 'rgba(239,68,68,0.06)' : isUsed ? 'rgba(107,114,128,0.08)' : 'rgba(34,197,94,0.05)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: expired ? '#ef4444' : isUsed ? '#9ca3af' : '#22c55e' }}>
                {expired || isUsed ? <XCircle size={16} color="white" /> : <QrCode size={16} color="white" />}
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

          <div className="h-2" style={{ background: 'var(--tab-bg)' }}>
            <div className="h-full transition-all duration-1000" style={{ width: `${pctBar}%`, background: expired ? '#ef4444' : isUsed ? '#9ca3af' : isWarn ? '#f59e0b' : '#22c55e' }} />
          </div>

          <div className="p-5 space-y-4">
            <div className="relative flex justify-center">
              <div className="relative" style={{ background: 'white', padding: 14, borderRadius: 18, border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrPayload}&size=240x240&margin=8`}
                  alt="QR Code"
                  style={{ width: 240, height: 240, display: 'block', borderRadius: 8, opacity: expired || isUsed ? 0.3 : 1 }}
                />
                {(expired || isUsed) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(239,68,68,0.7)', backdropFilter: 'blur(3px)' }}>
                    <XCircle size={48} color="white" strokeWidth={2} />
                    <p className="font-black text-white text-lg mt-2">SÜRESI DOLDU</p>
                  </div>
                )}
              </div>
            </div>

            {!expired && !isUsed && (
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

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
            >
              <RefreshCw size={16} /> {expired ? 'Yeni QR Oluştur' : 'İptal Et'}
            </button>
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
interface DBCustomer {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  phone?: string;
}

const ManualSearchTab: React.FC = () => {
  const { authUser, profile } = useAuth();
  const [query, setQuery]             = useState('');
  const [customers, setCustomers]     = useState<DBCustomer[]>([]);
  const [loading, setLoading]         = useState(false);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [amount, setAmount]           = useState('');
  const [customPts, setCustomPts]     = useState('');
  const [mode, setMode]               = useState<'amount' | 'manual'>('amount');
  const [gifting, setGifting]         = useState(false);
  const [result, setResult]           = useState<'success' | 'error' | null>(null);
  const [resultMsg, setResultMsg]     = useState('');
  const [log, setLog]                 = useState<GiftResult[]>([]);
  const [totalPts, setTotalPts]       = useState(0);

  const searchCustomers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      let dbQ = supabase
        .from('profiles')
        .select('id, username, email, avatar_url, total_points, level, phone')
        .order('username')
        .limit(30);

      if (q.trim()) {
        dbQ = dbQ.or(`username.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      const { data, error } = await dbQ;
      if (error) throw error;
      setCustomers((data ?? []) as DBCustomer[]);
    } catch (e: unknown) {
      console.error('[ManualSearchTab] search:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(query), 300);
    return () => clearTimeout(t);
  }, [query, searchCustomers]);

  const selected = customers.find(c => c.id === selectedId);

  const calcPoints = () => {
    if (mode === 'amount') return Math.round((parseFloat(amount) || 0) * POINTS_PER_TL);
    return parseInt(customPts, 10) || 0;
  };
  const ptsToGive = calcPoints();

  const handleGive = async () => {
    if (!selected || ptsToGive <= 0) {
      setResultMsg('Geçerli bir tutar ya da puan girin.');
      setResult('error');
      setTimeout(() => setResult(null), 2500);
      return;
    }
    setGifting(true);
    try {
      await adminAddPoints(selected.id, ptsToGive, 'Kasa manuel puan', 'cashier_manual');
      const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLog(p => [{ customerName: selected.username, customerId: selected.id, points: ptsToGive, timestamp: ts }, ...p]);
      setTotalPts(p => p + ptsToGive);
      setResult('success');
      setResultMsg(`${ptsToGive} puan ${selected.username} hesabına eklendi!`);
      // Audit log
      void activityLogService.logActivity({
        userId: authUser?.id,
        username: profile?.username ?? authUser?.email ?? 'Cashier',
        email: authUser?.email ?? '',
        role: profile?.role ?? 'cashier',
        action: `Manuel puan eklendi: ${ptsToGive} puan → ${selected.username}`,
        actionType: 'admin_action',
        details: { targetUserId: selected.id, targetUsername: selected.username, points: ptsToGive, source: mode === 'amount' ? `${amount} TL` : 'manual_pts' },
        amount: ptsToGive,
      });
      setTimeout(() => { setResult(null); setSelectedId(null); setAmount(''); setCustomPts(''); }, 2500);
    } catch (e: unknown) {
      setResultMsg((e as Error).message ?? 'Puan eklenemedi.');
      setResult('error');
      setTimeout(() => setResult(null), 3000);
    } finally {
      setGifting(false);
    }
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
        {loading && <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
        <input
          type="text"
          placeholder="İsim, e-posta veya telefon ara..."
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedId(null); }}
          className="w-full py-3 rounded-xl font-bold text-sm outline-none"
          style={{ paddingLeft: 42, paddingRight: 40, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', color: 'var(--text-dark)' }}
        />
      </div>

      {/* Customer list */}
      {!selectedId && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          {customers.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-black text-sm" style={{ color: 'var(--text-muted)' }}>{query ? 'Müşteri bulunamadı' : 'Aramaya başlayın'}</p>
            </div>
          ) : customers.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full flex items-center gap-3 px-5 py-3 transition-all text-left hover:opacity-80"
              style={{ borderBottom: i < customers.length - 1 ? '1px solid var(--dark-border)' : 'none' }}
            >
              <NeoAvatar src={c.avatar_url} name={c.username} email={c.email} size={40} shape="circle" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{c.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <span className="font-black text-xs" style={{ color: '#d97706' }}>{(c.total_points ?? 0).toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Seviye {c.level ?? 1}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {/* Selected customer panel */}
      {selected && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '2.5px solid #7B6EF6', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: '2px solid var(--dark-border)', background: 'rgba(123,110,246,0.05)' }}>
            <NeoAvatar src={selected.avatar_url} name={selected.username} email={selected.email} size={48} shape="circle" />
            <div className="flex-1 min-w-0">
              <p className="font-black" style={{ color: 'var(--text-dark)' }}>{selected.username}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.email} · Seviye {selected.level ?? 1}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b' }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span className="font-black text-sm" style={{ color: '#d97706' }}>{(selected.total_points ?? 0).toLocaleString('tr-TR')}</span>
            </div>
            <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
              <XCircle size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['amount', 'manual'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className="py-2.5 rounded-xl font-black text-sm transition-all"
                  style={{ background: mode === m ? 'linear-gradient(180deg,#7B6EF6,#5b4dd1)' : 'var(--tab-bg)', color: mode === m ? 'white' : 'var(--text-muted)', border: '2px solid var(--dark-border)', boxShadow: mode === m ? '0px 3px 0px var(--dark-border)' : 'none' }}>
                  {m === 'amount' ? '₺ Tutardan' : '# Manuel Puan'}
                </button>
              ))}
            </div>

            {mode === 'amount' ? (
              <div>
                <label className="text-xs font-black mb-1.5 block" style={{ color: 'var(--text-muted)' }}>HARCAMA TUTARI (₺)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black" style={{ color: 'var(--text-muted)' }}>₺</span>
                  <input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full py-3 rounded-xl font-black text-lg outline-none"
                    style={{ paddingLeft: 32, paddingRight: 16, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-black mb-1.5 block" style={{ color: 'var(--text-muted)' }}>VERİLECEK PUAN</label>
                <input type="number" min="1" step="1" placeholder="100" value={customPts}
                  onChange={e => setCustomPts(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl font-black text-lg outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
              </div>
            )}

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

            {result === 'success' && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                <CheckCircle size={18} style={{ color: '#22c55e' }} />
                <span className="font-black text-sm" style={{ color: '#22c55e' }}>✅ {resultMsg}</span>
              </div>
            )}
            {result === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}>
                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                <span className="font-black text-sm" style={{ color: '#ef4444' }}>{resultMsg}</span>
              </div>
            )}

            {!result && (
              <button onClick={handleGive} disabled={ptsToGive <= 0 || gifting}
                className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: `linear-gradient(180deg,${ACCENT},#d97706)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
                {gifting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {gifting ? 'Kaydediliyor…' : `${ptsToGive > 0 ? ptsToGive.toLocaleString('tr-TR') + ' ' : ''}Puan Ver`}
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

        <div className="p-5 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Banknote size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">Puan İşlemleri</p>
              <p className="text-white/70 text-sm mt-0.5">Tutar gir → QR oluştur  |  Müşteri ara → Puan ver</p>
            </div>
          </div>
        </div>

        <div className="relative flex p-1 rounded-2xl" style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)' }}>
          <div className="absolute top-1 bottom-1 rounded-xl tab-indicator transition-all"
            style={{ width: 'calc(50% - 4px)', left: tab === 'qr' ? 4 : 'calc(50% + 4px)', background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)' }} />
          <button onClick={() => setTab('qr')} className="relative z-10 flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: tab === 'qr' ? 'var(--text-dark)' : 'var(--text-muted)' }}>
            <QrCode size={15} /> Tutar & QR
          </button>
          <button onClick={() => setTab('manual')} className="relative z-10 flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: tab === 'manual' ? 'var(--text-dark)' : 'var(--text-muted)' }}>
            <User size={15} /> Manuel Arama
          </button>
        </div>

        {tab === 'qr' ? <AmountQRTab /> : <ManualSearchTab />}
      </div>
    </CashierLayout>
  );
};

export default CashierScan;
