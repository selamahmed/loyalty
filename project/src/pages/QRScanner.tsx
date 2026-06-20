import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, Check, Zap, RotateCcw, MapPin, X, FlipHorizontal, Keyboard, ShoppingCart, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import StickerDecorImg from '../components/StickerDecorImg';
import { colorfulSticker } from '../lib/stickerCatalog';
import { pageGroup } from '../lib/pageStickers';
import { playSound } from '../lib/sounds';
import {
  parseQRPayload, isCashierQR, isInventoryQR,
  isStoreQR,
  isQRExpired, msRemaining,
  type CashierQRPayload,
} from '../lib/qrUtils';
import { claimQrScan } from '../services/earn';
import { lookupStoreQR } from '../services/admin';
import { activityLogService } from '../lib/activityLogger';
import StickerAccent from '../components/StickerAccent';

const inventoryLinkSticker = colorfulSticker('cardboardbox.svg');
const qrIdleSticker = colorfulSticker(pageGroup('qr'));

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

/* ═══════════════════════════════════════════════════
   MAIN SCANNER
═══════════════════════════════════════════════════ */
const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const { showRewardPopup } = useApp();
  const { getByCode, items } = useInventory();
  const { authUser, profile } = useAuth();

  const [mode, setMode]         = useState<'idle' | 'camera' | 'manual'>('idle');
  const [cameraReady, setCameraReady] = useState(false);   // true once video is actually playing
  const [result, setResult]     = useState<QRResult | null>(null);
  const [cashierQRResult, setCashierQRResult] = useState<CashierQRPayload | null>(null);
  const [inventoryMatch, setInventoryMatch] = useState<ReturnType<typeof getByCode>>(undefined);
  const [manualCode, setManualCode]     = useState('');
  const [error, setError]       = useState('');
  const [camError, setCamError] = useState('');
  const [facingMode, setFacingMode]     = useState<'environment' | 'user'>('environment');
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
    const trimmed = raw.trim();
    const parsed = parseQRPayload(trimmed);

    // ── Full JSON cashier QR (scanned from camera) ──
    if (isCashierQR(parsed)) {
      setCashierQRResult(parsed);
      return;
    }

    // ── Inventory QR ──
    if (isInventoryQR(parsed)) {
      const item = getByCode(parsed.item_code);
      if (item) { setInventoryMatch(item); return; }
    }

    const lookupCode = isStoreQR(parsed) ? parsed.code : trimmed;

    // ── Inventory code entered manually ──
    const invItem = getByCode(lookupCode);
    if (invItem) { setInventoryMatch(invItem); return; }

    // ── Look up in qr_codes table ──
    try {
      const dbQR = await lookupStoreQR(lookupCode);
      if (dbQR) {
        // Cashier-generated QR: single-use (max_uses=1) with expiry
        // Reconstruct the full CashierQRPayload so the user sees amount + countdown
        if (dbQR.max_uses === 1 && dbQR.expires_at) {
          const amountMatch = (dbQR.label ?? '').match(/(?:TRY|₺)\s*([\d.]+)/i);
          const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
          const isUsed = (dbQR.uses_count ?? 0) >= (dbQR.max_uses ?? 1);
          setCashierQRResult({
            type: 'cashier_purchase',
            qr_id: dbQR.code,
            amount,
            points: dbQR.points,
            merchant_id: dbQR.store_id ?? '',
            issued_at: dbQR.created_at ?? new Date().toISOString(),
            expires_at: dbQR.expires_at,
            status: isUsed ? 'used' : 'pending',
          });
          return;
        }
        // Regular multi-use store QR
        setResult({
          code: dbQR.code,
          title: dbQR.label ?? 'Mağaza QR Kodu',
          points: dbQR.points,
          location: dbQR.store_id ? `Mağaza #${dbQR.store_id}` : 'Mağaza',
          dbQrId: dbQR.id,
        });
        return;
      }
    } catch { /* ignore lookup errors */ }

    // ── Not found anywhere ──
    setResult({ code: lookupCode, title: 'QR Kodu Tanınmadı', points: 0, location: 'Bilinmeyen' });
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

  /* ── Claim store QR reward ── */
  const claimReward = async () => {
    if (!result || !authUser?.id) return;
    try {
      const earnResult = await claimQrScan(result.code);
      const claimedPoints = earnResult.qrPoints ?? earnResult.points;
      showRewardPopup({
        type: 'reward',
        title: result.title,
        subtitle: `${result.location} adresinde QR kod taradın`,
        points: claimedPoints,
      });
      setScanHistory(prev => [{
        code: result.code,
        points: claimedPoints,
        time: 'Az önce',
        location: result.location,
        type: 'store',
      }, ...prev.slice(0, 9)]);
      void activityLogService.logActivity({
        userId: authUser.id,
        username: profile?.username ?? authUser.email ?? 'User',
        email: authUser.email ?? '',
        role: profile?.role ?? 'customer',
        action: `QR kod tarandı: ${result.title} → ${claimedPoints} puan`,
        actionType: 'qr_scan',
        details: { code: result.code, title: result.title, location: result.location, qrPoints: claimedPoints },
        amount: claimedPoints,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'QR tarama başarısız');
    }
    setResult(null);
  };

  const claimCashierQR = async () => {
    if (!cashierQRResult || !authUser?.id) return;
    if (cashierQRResult.status === 'used' || isQRExpired(cashierQRResult.expires_at)) return;
    try {
      const earnResult = await claimQrScan(cashierQRResult.qr_id);
      const claimedPoints = earnResult.qrPoints ?? cashierQRResult.points;
      showRewardPopup({
        type: 'reward',
        title: 'Alışveriş Puanı!',
        subtitle: `${cashierQRResult.amount}₺ alışverişten ${claimedPoints} puan kazandın`,
        points: claimedPoints,
      });
      setScanHistory(prev => [{
        code: cashierQRResult.qr_id,
        points: claimedPoints,
        time: 'Az önce',
        location: `${cashierQRResult.amount}₺ Alışveriş`,
        type: 'store',
      }, ...prev.slice(0, 9)]);
      void activityLogService.logActivity({
        userId: authUser.id,
        username: profile?.username ?? authUser.email ?? 'User',
        email: authUser.email ?? '',
        role: profile?.role ?? 'customer',
        action: `Kasiyer QR kullanıldı: ${cashierQRResult.amount}₺ → ${claimedPoints} puan`,
        actionType: 'qr_scan',
        details: { qrId: cashierQRResult.qr_id, amount: cashierQRResult.amount, qrPoints: claimedPoints },
        amount: claimedPoints,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'QR kullanımı başarısız');
    }
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
    setResult(null); setCashierQRResult(null);
    setError(''); setMode('idle'); setInventoryMatch(undefined);
  };

  const hasResult = !!result || !!cashierQRResult;
  const activeInventoryCount = items.filter(
    i => !i.used && new Date(i.expires) >= new Date(),
  ).length;

  return (
    <div className="qr-auth-page" style={{ position: 'relative', minHeight: '100vh' }}>
      {inventoryMatch && <InventoryDetailModal item={inventoryMatch} onClose={() => setInventoryMatch(undefined)} />}

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
              <div className="qr-scanner-idle">
                {qrIdleSticker && (
                  <StickerDecorImg
                    src={qrIdleSticker.url}
                    width={168}
                    height={168}
                    loading="eager"
                    className="qr-scanner-idle__sticker"
                  />
                )}
                <p className="qr-scanner-idle__hint">Kamerayı başlatmak için aşağıdaki butona bas</p>
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
                transition: 'transform 0.1s, box-shadow 0.1s', position: 'relative',
              }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}>
                <Camera size={20} /> Kamerayı Aç & Tara
                <StickerAccent seed="qr-scan-btn" size={22} rotate={-8} style={{ position: 'absolute', top: -8, right: 10 }} />
              </button>
            </div>
          )}
        </div>

        {/* ── Inventory link ── */}
        <button
          type="button"
          onClick={() => { playSound('click'); navigate('/inventory'); }}
          className="press-card qr-inventory-link"
          aria-label={
            activeInventoryCount > 0
              ? `Envantere git, ${activeInventoryCount} aktif bilet`
              : 'Envantere git, biletlerini gör'
          }
        >
          <div className="qr-inventory-link__content">
            <div className="qr-inventory-link__heading">
              <p className="qr-inventory-link__title font-display">Envanter</p>
              {activeInventoryCount > 0 && (
                <span className="qr-inventory-link__badge">{activeInventoryCount}</span>
              )}
            </div>
            <div className="qr-inventory-link__footer">
              <p className="qr-inventory-link__subtitle">
                {activeInventoryCount > 0
                  ? 'Kasada göstermek için aç'
                  : 'Biletlerini gör, kasada göster'}
              </p>
              <span className="qr-inventory-link__cta" aria-hidden>
                Görüntüle
                <ChevronRight size={14} strokeWidth={2.75} />
              </span>
            </div>
          </div>
          <div className="qr-inventory-link__visual" aria-hidden>
            {inventoryLinkSticker && (
              <StickerDecorImg
                src={inventoryLinkSticker.url}
                width={172}
                height={172}
                loading="lazy"
                className="qr-inventory-link__sticker"
              />
            )}
          </div>
        </button>

        {/* ── Manual code entry ── */}
        <div className="qr-manual-entry">
          <div className="qr-manual-entry__header">
            <div className="qr-manual-entry__icon" aria-hidden>
              <Keyboard size={18} strokeWidth={2.5} />
            </div>
            <div className="qr-manual-entry__intro">
              <p className="qr-manual-entry__title">Manuel Kod Girişi</p>
              <p className="qr-manual-entry__subtitle">QR metni veya bilet kodunu yapıştır</p>
            </div>
          </div>
          <div className="qr-manual-entry__row">
            <input
              className="qr-manual-entry__input"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Kod gir"
              aria-label="Manuel kod girişi"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              className="press-card qr-manual-entry__submit"
              onClick={() => { playSound('click'); void handleManualSubmit(); }}
              disabled={!manualCode.trim()}
            >
              Gir
            </button>
          </div>
          <p className="qr-manual-entry__hint">Enter tuşu ile de gönderebilirsin</p>
          {error && (
            <p className="qr-manual-entry__error" role="alert">
              <AlertCircle size={14} strokeWidth={2.5} aria-hidden />
              {error}
            </p>
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
