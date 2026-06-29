import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScanLine, Camera, X, Check, RotateCcw, Keyboard, AlertCircle,
  Package, Tag, Ticket, Gift, Clock, History, Zap, FlipHorizontal, Barcode
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import type { InventoryItem } from '../../context/InventoryContext';
import { getRedemptionByCode, markRedemptionUsed } from '../../services/redemptions';

/* ─────────────────────────── types ─────────────────────────── */
interface RedemptionEntry {
  id: string;
  item: InventoryItem;
  scannedValue: string;
  scanType: 'barcode' | 'qr' | 'manual';
  redeemedAt: string;
}

/* ─────────────────────────── helpers ─────────────────────────── */
const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };
const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };
const typeIcon: Record<string, React.ElementType> = { coupon: Tag, ticket: Ticket, reward: Gift };

function now() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function isExpired(d: string) { return new Date(d) < new Date(); }

/* ─────────────────────────── component ─────────────────────────── */
const AdminCheckout: React.FC = () => {
  /* scan state */
  const [mode, setMode] = useState<'idle' | 'camera' | 'manual'>('idle');
  const [scanType, setScanType] = useState<'both' | 'barcode' | 'qr'>('both');
  const [rawValue, setRawValue] = useState('');
  const [match, setMatch] = useState<InventoryItem | null>(null);
  const [matchScanType, setMatchScanType] = useState<'barcode' | 'qr' | 'manual'>('manual');
  const [error, setError] = useState('');
  const [redeemed, setRedeemed] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [history, setHistory] = useState<RedemptionEntry[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState('');

  /* camera refs */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const scanningRef = useRef(false);

  /* ── resolve a scanned value → fetch redemption from Supabase ── */
  const resolve = useCallback(async (value: string, detectedType: 'barcode' | 'qr' | 'manual') => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setResolving(true);
    try {
      const redemption = await getRedemptionByCode(trimmed);
      if (redemption) {
        const inv: InventoryItem = {
          id: redemption.id,
          title: (redemption as Record<string, unknown>).rewards ? ((redemption as Record<string, unknown>).rewards as Record<string, unknown>).title as string ?? 'Ödül' : 'Ödül',
          type: 'reward',
          code: redemption.code,
          barcode: '',
          createdAt: redemption.created_at ?? '',
          expires: redemption.expires_at ?? '',
          used: redemption.used,
          points: redemption.points_spent,
          image: '',
          description: '',
          quantity: 1,
        };
        setMatch(inv);
        setMatchScanType(detectedType);
        setError('');
      } else {
        setError(`"${trimmed}" için kayıt bulunamadı.`);
        setMatch(null);
      }
    } catch {
      setError('Veritabanı hatası. Lütfen tekrar deneyin.');
      setMatch(null);
    } finally {
      setResolving(false);
    }
    setRawValue(trimmed);
  }, []);

  /* ── per-frame QR + barcode decode ── */
  const tick = useCallback(() => {
    if (!scanningRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    /* jsQR for QR codes */
    if (scanType !== 'barcode') {
      import('jsqr').then(({ default: jsQR }) => {
        const qr = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (qr?.data) {
          stopCamera();
          resolve(qr.data, 'qr');
          return;
        }
      });
    }

    /* ZXing for 1D barcodes */
    if (scanType !== 'qr') {
      import('@zxing/browser').then(({ BrowserMultiFormatReader }) => {
        const reader = new BrowserMultiFormatReader();
        try {
          const result = reader.decodeFromCanvas(canvas);
          if (result?.getText()) {
            stopCamera();
            resolve(result.getText(), 'barcode');
            return;
          }
        } catch {
          /* no decode — keep scanning */
        }
      });
    }

    if (scanningRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [scanType, resolve]);

  /* ── start camera ── */
  const startCamera = useCallback(async () => {
    setCameraError(''); setError(''); setMatch(null); setRedeemed(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('camera');
      scanningRef.current = true;
      tick();
    } catch {
      setCameraError('Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.');
    }
  }, [facingMode, tick]);

  /* ── stop camera ── */
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setMode('idle');
  }, []);

  useEffect(() => () => stopCamera(), []);

  const flipCamera = () => {
    stopCamera();
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
    setTimeout(startCamera, 200);
  };

  /* ── manual submit ── */
  const handleManual = async () => {
    if (!manualInput.trim()) return;
    setMode('idle');
    await resolve(manualInput.toUpperCase(), 'manual');
  };

  /* ── redeem ── */
  const handleRedeem = async () => {
    if (!match) return;
    try {
      await markRedemptionUsed(match.id);
      setHistory(h => [{
        id: Date.now().toString(),
        item: match,
        scannedValue: rawValue,
        scanType: matchScanType,
        redeemedAt: now(),
      }, ...h]);
      setRedeemed(true);
      setTimeout(() => { setMatch(null); setRedeemed(false); setRawValue(''); setManualInput(''); }, 2500);
    } catch {
      setError('Kullanım işareti başarısız. Lütfen tekrar deneyin.');
    }
  };

  /* ── reset ── */
  const reset = () => {
    stopCamera();
    setMatch(null); setError(''); setRawValue(''); setRedeemed(false); setManualInput('');
  };

  const ItemIcon = match ? (typeIcon[match.type ?? 'reward'] ?? Package) : Package;
  const todayRedeemed = history.length;

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">🏪</span> Kasa Tarayıcı
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Barkod veya QR kodu tarat, anında kullandı işaretle</p>
          </div>
          <div className={`${card} px-4 py-3 text-center`}>
            <p className="font-black text-2xl text-[#7B6EF6]">{todayRedeemed}</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Bu oturumda kullanıldı</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Scanner ── */}
          <div className="space-y-4">

            {/* Scan mode selector */}
            <div className={`${card} p-4`}>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Tarama Modu</p>
              <div className="flex gap-2">
                {([
                  { id: 'both',    label: 'Her İkisi',   emoji: '🔍' },
                  { id: 'barcode', label: 'Barkod (1D)', emoji: '📦' },
                  { id: 'qr',     label: 'QR Kod',      emoji: '📱' },
                ] as const).map(s => (
                  <button key={s.id} onClick={() => setScanType(s.id)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 font-bold text-xs transition-all active:translate-y-[2px] active:shadow-none"
                    style={{ borderColor: scanType === s.id ? '#7B6EF6' : '#000', background: scanType === s.id ? 'rgba(123,110,246,0.12)' : 'transparent', color: scanType === s.id ? '#7B6EF6' : undefined, boxShadow: scanType === s.id ? '0 3px 0 #7B6EF6' : '0 3px 0 #000' }}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera viewport */}
            <div className={`${card} p-4`}>
              {/* Video area */}
              <div className="relative rounded-xl overflow-hidden border-2 border-black dark:border-gray-600 bg-gray-900"
                style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: mode === 'camera' ? 'block' : 'none' }} />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera scanning overlay */}
                {mode === 'camera' && (
                  <>
                    {/* Corner guides */}
                    {[
                      { top: 16, left: 16 },
                      { top: 16, right: 16 },
                      { bottom: 16, left: 16 },
                      { bottom: 16, right: 16 },
                    ].map((pos, i) => (
                      <div key={i} style={{
                        position: 'absolute', width: 32, height: 32,
                        borderTop:    i < 2 ? '4px solid #7B6EF6' : 'none',
                        borderBottom: i >= 2 ? '4px solid #7B6EF6' : 'none',
                        borderLeft:   i % 2 === 0 ? '4px solid #7B6EF6' : 'none',
                        borderRight:  i % 2 !== 0 ? '4px solid #7B6EF6' : 'none',
                        ...pos,
                      }} />
                    ))}
                    {/* Animated scan line */}
                    <div style={{
                      position: 'absolute', left: '8%', right: '8%', height: 3,
                      background: 'linear-gradient(90deg,transparent,#7B6EF6,transparent)',
                      boxShadow: '0 0 16px #7B6EF6',
                      animation: 'checkoutScan 2s ease-in-out infinite',
                    }} />
                    {/* Labels */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {scanType === 'barcode' ? '📦 Barkod taranıyor...' : scanType === 'qr' ? '📱 QR kod taranıyor...' : '🔍 Barkod / QR taranıyor...'}
                      </span>
                    </div>
                    {/* Controls */}
                    <button onClick={stopCamera} className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-red-500/80 backdrop-blur flex items-center justify-center border border-white/30">
                      <X size={16} className="text-white" />
                    </button>
                    <button onClick={flipCamera} className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/50 backdrop-blur flex items-center justify-center border border-white/30">
                      <FlipHorizontal size={16} className="text-white" />
                    </button>
                  </>
                )}

                {/* Idle placeholder */}
                {mode === 'idle' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                      <ScanLine size={40} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">Kamerayı başlat</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <AlertCircle size={32} className="text-red-400" />
                    <p className="text-red-400 text-xs font-bold">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* Start / stop button */}
              <button
                onClick={mode === 'camera' ? stopCamera : startCamera}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black font-black text-sm text-white transition-all active:translate-y-[3px] active:shadow-none"
                style={{ background: mode === 'camera' ? '#ef4444' : 'linear-gradient(180deg,#7B6EF6,#4F8EF7)', boxShadow: mode === 'camera' ? '0 4px 0 #dc2626' : '0 4px 0 #000' }}
              >
                {mode === 'camera'
                  ? <><X size={16} /> Kamerayı Durdur</>
                  : <><Camera size={16} /> Kamerayı Başlat</>
                }
              </button>
            </div>

            {/* Manual entry */}
            <div className={`${card} p-4`}>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Keyboard size={12} /> Manuel Giriş
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Barkod / QR kod / kupon kodu..."
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManual()}
                  className="flex-1 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                />
                <button onClick={handleManual}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-black font-black text-sm text-white shadow-[0_3px_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
                  style={{ background: 'linear-gradient(180deg,#7B6EF6,#4F8EF7)' }}
                >
                  <ScanLine size={14} /> Ara
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                Barkod numarası (ör. <code className="font-mono">8690637000010</code>) veya kupon kodu
              </p>
            </div>
          </div>

          {/* ── Right: Result + history ── */}
          <div className="space-y-4">

            {/* Result card */}
            {redeemed ? (
              <div className={`${card} p-6 flex flex-col items-center gap-4 text-center`}
                style={{ borderColor: '#22c55e', boxShadow: '0 4px 0 #16a34a' }}>
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-4 border-green-500">
                  <Check size={40} className="text-green-500" />
                </div>
                <div>
                  <p className="font-black text-xl text-green-600 dark:text-green-400">Kullanıldı! ✅</p>
                  <p className="text-gray-500 text-sm mt-1">Öğe başarıyla kullanıldı olarak işaretlendi.</p>
                </div>
              </div>
            ) : match ? (
              <div className={`${card} p-5 space-y-4`}
                style={{ borderColor: typeColor[match.type], boxShadow: `0 4px 0 ${typeColor[match.type]}` }}>
                {/* Match header */}
                <div className="flex items-start gap-3">
                  {match.image && (
                    <img src={match.image} alt={match.title}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-black flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-black text-base text-gray-900 dark:text-white">{match.title}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black"
                        style={{ background: typeColor[match.type] + '18', color: typeColor[match.type], border: `1.5px solid ${typeColor[match.type]}` }}>
                        {typeLabel[match.type]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{match.description}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Kod', val: match.code, mono: true },
                    { label: 'Barkod', val: match.barcode || '—', mono: true },
                    { label: 'Adet', val: String(match.quantity ?? 1) },
                    { label: 'Puan Değeri', val: `${match.points} puan` },
                  ].map(d => (
                    <div key={d.label} className="rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151]">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">{d.label}</p>
                      <p className={`font-black text-sm text-gray-900 dark:text-white ${d.mono ? 'font-mono' : ''}`}>{d.val}</p>
                    </div>
                  ))}
                </div>

                {/* Expiry warning */}
                {isExpired(match.expires) ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-400">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold">Bu öğenin süresi dolmuş! Kullanım geçersiz olabilir.</p>
                  </div>
                ) : match.used ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-400">
                    <AlertCircle size={16} className="text-gray-500 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-bold">Bu öğe zaten kullanılmış.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-400">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-green-700 dark:text-green-400 text-xs font-bold">
                      Geçerli — Son kullanım: {new Date(match.expires).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}

                {/* Scan origin badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold">Bulunan yol:</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black border-2 border-black"
                    style={{ background: matchScanType === 'barcode' ? 'rgba(245,158,11,0.1)' : matchScanType === 'qr' ? 'rgba(123,110,246,0.1)' : 'rgba(107,114,128,0.1)', color: matchScanType === 'barcode' ? '#f59e0b' : matchScanType === 'qr' ? '#7B6EF6' : '#6b7280' }}>
                    {matchScanType === 'barcode' ? '📦 Barkod' : matchScanType === 'qr' ? '📱 QR Kod' : '⌨️ Manuel'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={reset}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 font-bold text-sm shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151] active:translate-y-[3px] active:shadow-none transition-all">
                    <RotateCcw size={14} /> Yeni Tarama
                  </button>
                  {!match.used && !isExpired(match.expires) && (
                    <button onClick={handleRedeem}
                      className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-black font-black text-sm text-white shadow-[0_3px_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
                      style={{ background: 'linear-gradient(180deg,#22c55e,#16a34a)' }}>
                      <Check size={16} /> Kullanıldı Olarak İşaretle
                    </button>
                  )}
                </div>
              </div>
            ) : resolving ? (
              <div className={`${card} p-8 flex flex-col items-center gap-3 text-center`}>
                <div className="w-10 h-10 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-gray-400 text-sm">Kayıt aranıyor...</p>
              </div>
            ) : error ? (
              <div className={`${card} p-5 flex flex-col items-center gap-3 text-center`}
                style={{ borderColor: '#ef4444', boxShadow: '0 4px 0 #dc2626' }}>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <div>
                  <p className="font-black text-red-600 dark:text-red-400">Öğe Bulunamadı</p>
                  <p className="text-gray-500 text-xs mt-1">{error}</p>
                </div>
                <button onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black font-bold text-sm shadow-[0_3px_0_#000] active:translate-y-[2px] active:shadow-none">
                  <RotateCcw size={13} /> Tekrar Dene
                </button>
              </div>
            ) : (
              /* Idle state — prompt to scan */
              <div className={`${card} p-5 text-center`}>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <Package size={28} className="text-gray-400" />
                </div>
                <p className="font-bold text-gray-400 text-sm">
                  Müşteri barkodunu veya QR kodunu tarayın
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Veya manuel olarak kod girin
                </p>
              </div>
            )}

            {/* Redemption history */}
            <div className={`${card} p-4`}>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History size={12} /> Son Kullanımlar ({history.length})
              </p>
              {history.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-600 text-xs py-4 font-medium">
                  Henüz bu oturumda kullanım yok.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map(h => {
                    const Ico = typeIcon[h.item.type] ?? Package;
                    return (
                      <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: typeColor[h.item.type] + '18' }}>
                          <Ico size={14} color={typeColor[h.item.type]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-gray-900 dark:text-white truncate">{h.item.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={9} /> {h.redeemedAt} ·{' '}
                            <span style={{ color: h.scanType === 'barcode' ? '#f59e0b' : h.scanType === 'qr' ? '#7B6EF6' : '#6b7280' }}>
                              {h.scanType === 'barcode' ? 'Barkod' : h.scanType === 'qr' ? 'QR' : 'Manuel'}
                            </span>
                          </p>
                        </div>
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                          <Check size={12} className="text-green-500" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes checkoutScan {
          0%   { top: 10%; }
          50%  { top: 80%; }
          100% { top: 10%; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminCheckout;
