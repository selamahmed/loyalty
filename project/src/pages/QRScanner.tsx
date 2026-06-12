import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, Camera, Check, Zap, RotateCcw, MapPin, X, FlipHorizontal, Keyboard, ShoppingCart, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import {
  parseQRPayload, isCashierQR, isInventoryQR,
  isQRExpired, msRemaining,
  type CashierQRPayload,
} from '../lib/qrUtils';
import { lookupStoreQR, recordQRScan, markCashierQRUsedDB } from '../services/admin';
import { activityLogService } from '../lib/activityLogger';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

type QRResult = { code: string; title: string; points: number; location: string; dbQrId?: string };

/* ── Cashier QR result card ── */
const CashierQRResult: React.FC<{
  payload: CashierQRPayload;
  onClaim: () => void;
  onReset: () => void;
}> = ({ payload, onClaim, onReset }) => {
  const [ms, setMs] = useState(msRemaining(payload.expires_at));
  useEffect(() => {
    const t = setInterval(() => setMs(msRemaining(payload.expires_at)), 500);
    return () => clearInterval(t);
  }, [payload.expires_at]);
  const expired = ms <= 0 || isQRExpired(payload.expires_at);
  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  if (payload.status === 'used') return (
    <div style={{ padding: 14, background: 'rgba(107,114,128,0.08)', borderRadius: 14, border: '2.5px solid #9ca3af', boxShadow: '0 4px 0 #6b7280', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={20} color="#6b7280" />
        <div>
          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>Bu QR Zaten Kullanıldı</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{payload.qr_id}</p>
        </div>
      </div>
      <button onClick={onReset} style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <RotateCcw size={14} /> Tekrar Tara
      </button>
    </div>
  );

  if (expired) return (
    <div style={{ padding: 14, background: 'rgba(239,68,68,0.08)', borderRadius: 14, border: '2.5px solid #ef4444', boxShadow: '0 4px 0 #dc2626', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={20} color="#ef4444" />
        <div>
          <p style={{ fontWeight: 900, fontSize: 14, color: '#ef4444', margin: '0 0 2px' }}>QR Kodunun Süresi Doldu</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Kasiyerden yeni QR talep edin</p>
        </div>
      </div>
      <button onClick={onReset} style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <RotateCcw size={14} /> Tekrar Tara
      </button>
    </div>
  );

  return (
    <div style={{ padding: 14, background: 'rgba(123,110,246,0.08)', borderRadius: 14, border: '2.5px solid #7B6EF6', boxShadow: '0 4px 0 #6d28d9', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--dark-border)' }}>
          <ShoppingCart size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>Satın Alma QR Kodu</p>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', margin: '0 0 6px', letterSpacing: '0.06em' }}>{payload.qr_id}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', border: '1.5px solid #f59e0b' }}>
              <ShoppingCart size={11} color="#f59e0b" />
              <span style={{ fontWeight: 900, fontSize: 12, color: '#d97706' }}>{payload.amount}₺</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22c55e' }}>
              <Zap size={11} color="#22c55e" />
              <span style={{ fontWeight: 900, fontSize: 13, color: '#16a34a' }}>+{payload.points} Puan</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: ms < 60000 ? '#ef4444' : '#22c55e' }}>
            <Clock size={12} />
            <span style={{ fontWeight: 900, fontSize: 12, fontFamily: 'monospace' }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} kaldı
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onReset} style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <RotateCcw size={14} /> Tekrar Tara
        </button>
        <button onClick={onClaim} style={{ flex: 2, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Zap size={14} /> +{payload.points} Puan Kazan
        </button>
      </div>
    </div>
  );
};

/* ── Inventory item QR popup ── */
const InventoryQRModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const { items } = useInventory();
  const activeItems = items.filter(i => !i.used);
  const typeColors: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };

  const selectedItem = selected ? activeItems.find(i => i.code === selected) : null;

  /* Fixed timestamp captured once when item is selected — prevents QR URL from
     changing on every render (which caused the regeneration loop bug). */
  const issuedAt = React.useMemo(() => new Date().toISOString(), [selected]);

  const getQRData = React.useCallback((item: typeof activeItems[0]) => {
    return JSON.stringify({
      type: 'item_redemption',
      item_id: item.id,
      item_code: item.code,
      item_title: item.title,
      item_type: item.type,
      expires: item.expires,
      issued_at: issuedAt,
    });
  }, [issuedAt]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', padding: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...card, width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 18, margin: 0 }}>Envanter QR Kodları</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '3px 0 0' }}>Bir ürün seç, QR kodunu kasada göster</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Item list */}
          {!selected && activeItems.map(item => (
            <button key={item.id} onClick={() => setSelected(item.code)}
              style={{ ...card, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'transform 0.1s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <img src={item.image} alt={item.title} style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--dark-border)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: typeColors[item.type] || '#7B6EF6', fontWeight: 700 }}>{item.code}</span>
              </div>
              <QrCode size={16} color="var(--text-muted)" />
            </button>
          ))}

          {/* QR display */}
          {selected && selectedItem && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ background: 'white', padding: 14, borderRadius: 20, border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(getQRData(selectedItem))}&size=240x240&margin=10`}
                  alt={`QR: ${selected}`}
                  style={{ width: 230, height: 230, display: 'block', borderRadius: 10 }}
                />
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 4px' }}>{selectedItem.title}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 900, color: 'var(--primary-blue)', margin: '0 0 6px', letterSpacing: '0.1em' }}>{selected}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px' }}>Kasada bu QR kodu tarat</p>
                {/* Expiry info */}
                {selectedItem.expires && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                    Son kullanım: {new Date(selectedItem.expires).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <button onClick={() => setSelected(null)} style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={13} /> Geri Dön
              </button>
            </div>
          )}

          {!selected && activeItems.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <QrCode size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, margin: 0 }}>Aktif envanter öğesi yok</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN SCANNER
═══════════════════════════════════════════════════ */
const QRScanner: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const { getByCode } = useInventory();
  const { authUser, profile } = useAuth();

  const [mode, setMode]         = useState<'idle' | 'camera' | 'fake' | 'manual'>('idle');
  const [cameraReady, setCameraReady] = useState(false);   // true once video is actually playing
  const [result, setResult]     = useState<QRResult | null>(null);
  const [cashierQRResult, setCashierQRResult] = useState<CashierQRPayload | null>(null);
  const [inventoryMatch, setInventoryMatch] = useState<ReturnType<typeof getByCode>>(undefined);
  const [scanProgress, setScanProgress] = useState(0);
  const [manualCode, setManualCode]     = useState('');
  const [error, setError]       = useState('');
  const [camError, setCamError] = useState('');
  const [facingMode, setFacingMode]     = useState<'environment' | 'user'>('environment');
  const [showInventoryQR, setShowInventoryQR] = useState(false);
  const [scanHistory, setScanHistory]   = useState<{ code: string; points: number; time: string; location: string; type: 'store' }[]>([]);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const scanningRef = useRef(false);

  // ─── Correct declaration order: stopCamera → handleDecodedQR → tickScan → startCamera ───
  // (avoids Rollup TDZ when useCallback deps are inlined during bundling)

  /* 1. stopCamera — no forward references */
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraReady(false);
    setMode('idle');
  }, []);

  /* 2. handleDecodedQR — no forward references */
  const handleDecodedQR = useCallback(async (raw: string) => {
    const parsed = parseQRPayload(raw);

    if (isCashierQR(parsed)) {
      setCashierQRResult(parsed);
      return;
    }

    if (isInventoryQR(parsed)) {
      const item = getByCode(parsed.item_code);
      if (item) { setInventoryMatch(item); return; }
    }

    const invItem = getByCode(raw.trim());
    if (invItem) { setInventoryMatch(invItem); return; }

    try {
      const dbQR = await lookupStoreQR(raw.trim());
      if (dbQR) {
        setResult({ code: dbQR.code, title: dbQR.label ?? 'Mağaza QR Kodu', points: dbQR.points, location: dbQR.store_id ? `Mağaza #${dbQR.store_id}` : 'Mağaza', dbQrId: dbQR.id });
        return;
      }
    } catch { /* ignore lookup errors */ }

    setResult({ code: raw.trim(), title: 'QR Kodu Okundu', points: 0, location: 'Bilinmeyen' });
  }, [getByCode]);

  /* 3a. Keep a ref to the latest handleDecodedQR so tickScan is never stale */
  const handleDecodedQRRef = useRef(handleDecodedQR);
  useEffect(() => { handleDecodedQRRef.current = handleDecodedQR; }, [handleDecodedQR]);

  /* 3b. tickScan — depends only on stopCamera (handleDecodedQR via ref) */
  const tickScan = useCallback(() => {
    if (!scanningRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) { rafRef.current = requestAnimationFrame(tickScan); return; }
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(tickScan); return; }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    import('jsqr').then(({ default: jsQR }) => {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code?.data) {
        stopCamera();
        void handleDecodedQRRef.current(code.data);
        return;
      }
      if (scanningRef.current) rafRef.current = requestAnimationFrame(tickScan);
    });
  }, [stopCamera]); // handleDecodedQR accessed via ref — no stale closure risk

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* ── Helper: attach stream to video and start playing ── */
  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) { stream.getTracks().forEach(t => t.stop()); setMode('idle'); return; }

    video.srcObject = stream;
    // Some browsers need a tiny delay after setting srcObject before play() works
    await new Promise(r => setTimeout(r, 50));

    try {
      await video.play();
    } catch (e) {
      // play() may throw on some browsers even when it actually starts — safe to ignore
      console.warn('[QRScanner] play():', e);
    }

    setCameraReady(true);
    scanningRef.current = true;
    tickScan();
  }, [tickScan]);

  /* 4. startCamera — depends on tickScan (now declared above) */
  const startCamera = useCallback(async () => {
    setCamError(''); setResult(null); setCashierQRResult(null); setError(''); setCameraReady(false);

    // Check browser support (requires HTTPS or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('__no_media_devices__');
      return;
    }

    // Pre-check permission — avoids silent denial on already-blocked sites
    try {
      const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (perm.state === 'denied') { setCamError('__denied__'); return; }
    } catch { /* permissions API not available — continue */ }

    // Show camera viewport immediately (with loading spinner) so the video element
    // is in the DOM and visible BEFORE we call getUserMedia + play()
    setMode('camera');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      await attachStream(stream);
    } catch (err: unknown) {
      const name = (err as { name?: string }).name;
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCamError('__denied__');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCamError('__not_found__');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setCamError('__in_use__');
      } else if (name === 'OverconstrainedError') {
        // Retry without constraints
        try {
          const s2 = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          await attachStream(s2);
          return;
        } catch { setCamError('__overconstrained__'); }
      } else {
        setCamError('__unknown__');
      }
      setMode('idle');
    }
  }, [facingMode, tickScan, attachStream]);

  // Keep a ref so flipCamera always calls the latest startCamera
  const startCameraRef = useRef(startCamera);
  useEffect(() => { startCameraRef.current = startCamera; }, [startCamera]);

  const flipCamera = () => {
    stopCamera();
    setFacingMode(prev => {
      const next = prev === 'environment' ? 'user' : 'environment';
      setTimeout(() => startCameraRef.current(), 300);
      return next;
    });
  };

  /* ── Demo scan (shows UI flow without a real QR) ── */
  const startFakeScan = () => {
    setMode('fake'); setResult(null); setCashierQRResult(null); setError(''); setScanProgress(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15 + 5;
      setScanProgress(Math.min(prog, 95));
      if (prog >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          setScanProgress(100);
          // Demo result — no DB record, points = 0 so claim button won't show
          setResult({ code: 'DEMO-QR', title: 'Demo Tarama', points: 0, location: 'Demo Modu' });
          setMode('idle');
        }, 500);
      }
    }, 150);
  };

  /* ── Claim store QR reward ── */
  const claimReward = async () => {
    if (!result || result.points === 0) return;
    try {
      if (result.dbQrId && authUser?.id) {
        await recordQRScan(authUser.id, result.dbQrId, result.points, result.title);
      } else {
        addPoints(result.points);
      }
      showRewardPopup({ type: 'reward', title: result.title, subtitle: `${result.location} adresinde QR kod taradın`, points: result.points });
      setScanHistory(prev => [{ code: result.code, points: result.points, time: 'Az önce', location: result.location, type: 'store' }, ...prev.slice(0, 9)]);
      // Audit log
      void activityLogService.logActivity({
        userId: authUser?.id,
        username: profile?.username ?? authUser?.email ?? 'User',
        email: authUser?.email ?? '',
        role: profile?.role ?? 'customer',
        action: `QR kod tarandı: ${result.title} → ${result.points} puan`,
        actionType: 'qr_scan',
        details: { code: result.code, title: result.title, location: result.location, qrId: result.dbQrId },
        amount: result.points,
      });
    } catch { addPoints(result.points); } // Fallback to local if DB fails
    setResult(null); setScanProgress(0);
  };

  /* ── Claim cashier purchase QR ── */
  const claimCashierQR = async () => {
    if (!cashierQRResult) return;
    if (cashierQRResult.status === 'used' || isQRExpired(cashierQRResult.expires_at)) return;
    try {
      if (authUser?.id) {
        // Try to find and mark QR as used in DB first
        try {
          const dbQR = await lookupStoreQR(cashierQRResult.qr_id);
          if (dbQR) {
            await markCashierQRUsedDB(dbQR.id);
            await recordQRScan(authUser.id, dbQR.id, cashierQRResult.points, `${cashierQRResult.amount}₺ alışveriş`);
          } else {
            addPoints(cashierQRResult.points);
          }
        } catch { addPoints(cashierQRResult.points); }
      } else {
        addPoints(cashierQRResult.points);
      }
      showRewardPopup({ type: 'reward', title: 'Alışveriş Puanı!', subtitle: `${cashierQRResult.amount}₺ alışverişten ${cashierQRResult.points} puan kazandın`, points: cashierQRResult.points });
      setScanHistory(prev => [{ code: cashierQRResult.qr_id, points: cashierQRResult.points, time: 'Az önce', location: `${cashierQRResult.amount}₺ Alışveriş`, type: 'store' }, ...prev.slice(0, 9)]);
      // Audit log
      void activityLogService.logActivity({
        userId: authUser?.id,
        username: profile?.username ?? authUser?.email ?? 'User',
        email: authUser?.email ?? '',
        role: profile?.role ?? 'customer',
        action: `Kasiyer QR kullanıldı: ${cashierQRResult.amount}₺ alışveriş → ${cashierQRResult.points} puan`,
        actionType: 'qr_scan',
        details: { qrId: cashierQRResult.qr_id, amount: cashierQRResult.amount, points: cashierQRResult.points },
        amount: cashierQRResult.points,
      });
    } catch (e) { console.error('[claimCashierQR]', e); }
    setCashierQRResult(null);
  };

  /* ── Manual entry ── */
  const handleManualSubmit = async () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    await handleDecodedQR(trimmed);
    setManualCode('');
    setError('');
    setMode('idle');
  };

  const reset = () => {
    setResult(null); setCashierQRResult(null); setScanProgress(0);
    setError(''); setMode('idle'); setInventoryMatch(undefined);
  };

  const hasResult = !!result || !!cashierQRResult;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {inventoryMatch && <InventoryDetailModal item={inventoryMatch} onClose={() => setInventoryMatch(undefined)} />}
      {showInventoryQR && <InventoryQRModal onClose={() => setShowInventoryQR(false)} />}

      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>QR TARA</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 max-w-lg mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📱</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>QR Tarayıcı</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Kod tara, anında puan kazan</p>
          </div>
        </div>

        {/* ── Camera viewport ── */}
        <div style={{ ...card, padding: 16 }}>
          {/* Video / placeholder area */}
          <div style={{ aspectRatio: '4/3', width: '100%', maxWidth: 360, margin: '0 auto 14px', background: '#0f172a', borderRadius: 18, overflow: 'hidden', position: 'relative', border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)' }}>

            {/* autoPlay is required on many mobile browsers; display is ALWAYS controlled here */}
            <video ref={videoRef} playsInline autoPlay muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: mode === 'camera' ? 'block' : 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Loading spinner — shown while waiting for stream to start */}
            {mode === 'camera' && !cameraReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(0,0,0,0.85)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid rgba(167,139,250,0.3)', borderTopColor: '#a78bfa', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700, margin: 0 }}>Kamera başlatılıyor…</p>
              </div>
            )}

            {mode === 'camera' && cameraReady && (
              <>
                {[{ top: 20, left: 20 }, { top: 20, right: 20 }, { bottom: 20, left: 20 }, { bottom: 20, right: 20 }].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', width: 30, height: 30, borderTop: i < 2 ? '4px solid #a78bfa' : 'none', borderBottom: i >= 2 ? '4px solid #a78bfa' : 'none', borderLeft: i % 2 === 0 ? '4px solid #a78bfa' : 'none', borderRight: i % 2 !== 0 ? '4px solid #a78bfa' : 'none', ...pos }} />
                ))}
                <div style={{ position: 'absolute', left: '10%', right: '10%', height: 3, background: 'linear-gradient(90deg,transparent,#a78bfa,transparent)', boxShadow: '0 0 14px #a78bfa', animation: 'scanLine 2s ease-in-out infinite' }} />
                <p style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 800 }}>QR kodu kareye hizala</p>
                <button onClick={flipCamera} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <FlipHorizontal size={18} color="white" />
                </button>
                <button onClick={stopCamera} style={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.7)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <X size={18} color="white" />
                </button>
              </>
            )}
            {/* Cancel button shown even while loading */}
            {mode === 'camera' && !cameraReady && (
              <button onClick={stopCamera} style={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.7)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                <X size={18} color="white" />
              </button>
            )}

            {mode === 'fake' && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent,rgba(123,110,246,0.18),transparent)', animation: 'qrPulse 1.5s ease-in-out infinite' }} />
                {[{ top: 24, left: 24 }, { top: 24, right: 24 }, { bottom: 24, left: 24 }, { bottom: 24, right: 24 }].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderTop: i < 2 ? '4px solid #a78bfa' : 'none', borderBottom: i >= 2 ? '4px solid #a78bfa' : 'none', borderLeft: i % 2 === 0 ? '4px solid #a78bfa' : 'none', borderRight: i % 2 !== 0 ? '4px solid #a78bfa' : 'none', ...pos }} />
                ))}
                <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#a78bfa,transparent)', boxShadow: '0 0 10px #a78bfa', top: `${scanProgress}%`, transition: 'top 0.15s linear' }} />
                <p style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>Demo tarama...</p>
              </>
            )}

            {/* Result found overlay */}
            {hasResult && mode === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: cashierQRResult ? 'linear-gradient(180deg,#a78bfa,#6d28d9)' : '#22c55e', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(123,110,246,0.5)' }}>
                  {cashierQRResult ? <ShoppingCart size={30} color="white" /> : <Check size={34} color="white" />}
                </div>
                <p style={{ color: 'white', fontWeight: 900, fontSize: 18, textAlign: 'center', margin: 0 }}>
                  {cashierQRResult ? 'Satın Alma QR!' : 'Kod Bulundu!'}
                </p>
              </div>
            )}

            {/* Idle placeholder */}
            {mode === 'idle' && !hasResult && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: 'rgba(255,255,255,0.35)' }}>
                <QrCode size={52} />
                <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', margin: 0, padding: '0 20px' }}>Kamerayı başlatmak için aşağıdaki butona bas</p>
              </div>
            )}
          </div>

          {/* Camera error */}
          {camError && (() => {
            const isBlock = camError === '__denied__';
            const isNoDevice = camError === '__not_found__';
            const isInUse = camError === '__in_use__';
            const isNoAPI = camError === '__no_media_devices__';
            return (
              <div style={{ marginBottom: 12, padding: '14px 16px', background: isBlock ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `2px solid ${isBlock ? '#ef4444' : '#f59e0b'}`, borderRadius: 14, fontSize: 12, fontWeight: 700 }}>
                <p style={{ color: isBlock ? '#ef4444' : '#d97706', fontWeight: 900, fontSize: 13, margin: '0 0 8px' }}>
                  {isBlock       ? '🚫 Kamera İzni Engellendi'
                  : isNoDevice   ? '📷 Kamera Bulunamadı'
                  : isInUse      ? '⚠️ Kamera Kullanımda'
                  : isNoAPI      ? '❌ Kamera Desteklenmiyor'
                  : '⚠️ Kamera Açılamadı'}
                </p>
                {isBlock && (
                  <ol style={{ margin: '0 0 10px', padding: '0 0 0 18px', color: 'var(--text-dark)', lineHeight: 1.8 }}>
                    <li>Tarayıcı adres çubuğundaki 🔒 / 📷 simgesine tıklayın</li>
                    <li><strong>"Kamera"</strong> iznini <strong>"İzin Ver"</strong> yapın</li>
                    <li>Sayfayı yenileyin (F5 veya Ctrl+R)</li>
                  </ol>
                )}
                {isNoDevice    && <p style={{ color: 'var(--text-dark)', margin: '0 0 10px' }}>Cihazınızda kamera bağlı değil veya sürücü eksik.</p>}
                {isInUse       && <p style={{ color: 'var(--text-dark)', margin: '0 0 10px' }}>Kamera başka bir uygulama veya sekme tarafından kullanılıyor. Diğer sekmeleri kapatın.</p>}
                {isNoAPI       && <p style={{ color: 'var(--text-dark)', margin: '0 0 10px' }}>Kamera API'si yalnızca HTTPS veya localhost üzerinde çalışır.</p>}
                {!isBlock && !isNoDevice && !isInUse && !isNoAPI && <p style={{ color: 'var(--text-dark)', margin: '0 0 10px' }}>Sayfayı yenileyin ve tarayıcı kamera iznini kontrol edin.</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setCamError(''); startCamera(); }}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>
                    🔄 Tekrar Dene
                  </button>
                  {isBlock && (
                    <button onClick={() => window.location.reload()}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: isBlock ? '#ef4444' : '#f59e0b', color: 'white', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>
                      🔃 Sayfayı Yenile
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Progress bar */}
          {mode === 'fake' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 10, background: 'var(--tab-bg)', borderRadius: 999, border: '2px solid var(--dark-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scanProgress}%`, background: 'linear-gradient(90deg,var(--gradient-start),var(--gradient-end))', borderRadius: 999, transition: 'width 0.15s linear' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>QR kod analiz ediliyor...</p>
            </div>
          )}

          {/* Cashier QR result */}
          {cashierQRResult && (
            <CashierQRResult
              payload={cashierQRResult}
              onClaim={claimCashierQR}
              onReset={reset}
            />
          )}

          {/* Store QR result */}
          {result && (
            <div style={{ padding: 14, background: 'rgba(34,197,94,0.08)', borderRadius: 14, border: '2.5px solid #22c55e', boxShadow: '0 4px 0 #16a34a', marginBottom: 12 }}>
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
                  {result.points > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', border: '2px solid #f59e0b' }}>
                      <Zap size={13} color="#f59e0b" />
                      <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>+{result.points} Puan</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={reset} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <RotateCcw size={14} /> Tekrar Tara
                </button>
                {result.points > 0 && (
                  <button onClick={claimReward} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}>
                    Talep Et +{result.points}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {mode === 'idle' && !hasResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={startCamera} style={{
                width: '100%', padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 15,
                background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
                border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}>
                <Camera size={20} /> Kamerayı Aç & Tara
              </button>
              <button onClick={startFakeScan} style={{ width: '100%', padding: 11, borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <QrCode size={16} /> Demo Tarama
              </button>
            </div>
          )}
        </div>

        {/* ── Inventory QR Button ── */}
        <button onClick={() => setShowInventoryQR(true)} style={{
          ...card, width: '100%', padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.1s',
          background: 'linear-gradient(135deg,rgba(123,110,246,0.08),rgba(79,142,247,0.08))',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(180deg,#7B6EF6,#4F8EF7)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
            🎁
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>Envanter QR Kodları</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Ürün kodunu QR'a çevir, kasada göster</p>
          </div>
          <QrCode size={20} color="var(--text-muted)" />
        </button>

        {/* ── Manual code entry ── */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Keyboard size={16} color="var(--text-muted)" />
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Manuel Kod Girişi</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Kod veya JSON yapıştır..."
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 12, fontFamily: 'monospace',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
                color: 'var(--text-dark)', outline: 'none',
              }}
            />
            <button onClick={handleManualSubmit} style={{ padding: '11px 16px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}>
              Gir
            </button>
          </div>
          {error && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{error}</p>
          )}
        </div>

        {/* ── Scan history ── */}
        {scanHistory.length > 0 && (
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Son Taramalar</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{scanHistory.length} işlem</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scanHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < scanHistory.length - 1 ? '1.5px dashed var(--dark-border)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(123,110,246,0.1)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <QrCode size={15} color="var(--primary-blue)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.code}</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MapPin size={9} color="var(--text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{h.location}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>· {h.time}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 13, color: '#22c55e', flexShrink: 0 }}>+{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 15%; }
          50%  { top: 80%; }
          100% { top: 15%; }
        }
        @keyframes qrPulse {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
