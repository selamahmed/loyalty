import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import CashierLayout from './CashierLayout';
import { getRedemptionByCode, markRedemptionUsedByCode } from '../../../services/redemptions';
import { activityLogService } from '../../../lib/activityLogger';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeTable } from '../../../hooks/useRealtime';
import { parseQRPayload, isInventoryQR, isStoreQR } from '../../../lib/qrUtils';
import { normalizeRedemptionCode } from '../../../lib/redemptionCode';
import {
  Search, CheckCircle, XCircle, AlertCircle, Package,
  Tag, Ticket, Gift, RefreshCw, Clock, History, Loader2,
  Camera, Keyboard, ScanLine, StopCircle,
} from 'lucide-react';

type CheckStatus = 'idle' | 'found_valid' | 'found_expired' | 'found_used' | 'not_found' | 'loading';

interface RedeemRecord {
  code: string;
  title: string;
  image?: string | null;
  ts: string;
  customerName?: string;
}

const typeConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Tag,    label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Ticket, label: 'Bilet', emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: Gift,   label: 'Ödül',  emoji: '🎁' },
};

function daysLeft(expires: string) { return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000)); }

function extractRedemptionCode(raw: string): string {
  const parsed = parseQRPayload(raw);
  if (isInventoryQR(parsed)) return normalizeRedemptionCode(parsed.item_code);
  if (isStoreQR(parsed)) return normalizeRedemptionCode(parsed.code);
  return normalizeRedemptionCode('raw' in parsed ? parsed.raw : raw);
}

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

type DBRedemption = Awaited<ReturnType<typeof getRedemptionByCode>>;

const CashierRedeem: React.FC = () => {
  const { authUser, profile } = useAuth();
  const [code, setCode]           = useState('');
  const [status, setStatus]       = useState<CheckStatus>('idle');
  const [foundItem, setFoundItem] = useState<DBRedemption>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [done, setDone]           = useState(false);
  const [log, setLog]             = useState<RedeemRecord[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scanningRef = useRef(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const stopScanner = useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setScannerActive(false);
  }, []);

  const lookupCode = useCallback(async (rawCode: string) => {
    const trimmed = extractRedemptionCode(rawCode);
    if (!trimmed) return;
    setCode(trimmed);
    setStatus('loading');
    setFoundItem(null);
    setDone(false);
    setConfirmError('');
    try {
      const item = await getRedemptionByCode(trimmed);
      if (!item) { setStatus('not_found'); return; }
      if (item.used) { setStatus('found_used'); setFoundItem(item); return; }
      if (item.expires_at && new Date(item.expires_at).getTime() < Date.now()) {
        setStatus('found_expired'); setFoundItem(item); return;
      }
      setStatus('found_valid');
      setFoundItem(item);
      setDone(false);
    } catch (e: unknown) {
      console.error('[CashierRedeem] lookup:', e);
      setStatus('not_found');
    }
  }, []);

  const handleCheck = useCallback(async () => {
    await lookupCode(code);
  }, [code, lookupCode]);

  const scanFrame = useCallback(() => {
    if (!scanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });

    if (qr?.data) {
      stopScanner();
      setScannerOpen(false);
      void lookupCode(qr.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [lookupCode, stopScanner]);

  const startScanner = useCallback(async () => {
    setScannerOpen(true);
    setScannerError('');
    setStatus('idle');
    setFoundItem(null);
    setDone(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Bu cihazda kamera desteği bulunamadı. Kodu manuel girebilirsiniz.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      scanningRef.current = true;
      setScannerActive(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setScannerError('Kamera izni alınamadı. Tarayıcı izinlerini kontrol edin veya kodu manuel girin.');
      setScannerActive(false);
    }
  }, [scanFrame]);

  const closeScanner = useCallback(() => {
    stopScanner();
    setScannerOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [stopScanner]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  useRealtimeTable('redemptions', () => {
    if (code.trim()) void handleCheck();
  }, Boolean(code.trim()));

  const handleConfirm = async () => {
    if (!foundItem) return;
    setConfirming(true);
    setConfirmError('');
    try {
      await markRedemptionUsedByCode(foundItem.code);
      const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const rewardData = (foundItem as { rewards?: { title: string; image?: string } }).rewards;
      const customerData = (foundItem as { profiles?: { username: string; email: string } }).profiles;
      setLog(p => [{
        code: foundItem.code,
        title: rewardData?.title ?? foundItem.code,
        image: rewardData?.image,
        ts,
        customerName: customerData?.username ?? 'Müşteri',
      }, ...p]);
      // Audit log
      void activityLogService.logActivity({
        userId: authUser?.id,
        username: profile?.username ?? authUser?.email ?? 'Cashier',
        email: authUser?.email ?? '',
        role: profile?.role ?? 'cashier',
        action: `Ödül kodu kullanıldı: ${foundItem.code} — Müşteri: ${customerData?.username ?? 'Bilinmiyor'}`,
        actionType: 'points_spent',
        details: {
          redemptionId: foundItem.id,
          code: foundItem.code,
          rewardTitle: rewardData?.title,
          customerEmail: customerData?.email,
          pointsSpent: foundItem.points_spent,
        },
        amount: foundItem.points_spent,
      });
      setDone(true);
    } catch (e: unknown) {
      console.error('[CashierRedeem] confirm:', e);
      setConfirmError(e instanceof Error ? e.message : 'Bilet işlenemedi. Tekrar deneyin.');
    } finally {
      setConfirming(false);
    }
  };

  const handleReset = () => {
    stopScanner();
    setScannerOpen(false);
    setCode(''); setStatus('idle'); setFoundItem(null); setDone(false); setConfirmError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const rewardData = foundItem && (foundItem as { rewards?: { title: string; image?: string; category?: string } }).rewards;
  const profileData = foundItem && (foundItem as { profiles?: { username: string; email: string } }).profiles;
  const typeKey = (rewardData as { category?: string } | undefined)?.category ?? 'reward';
  const cfg = typeConfig[typeKey] ?? typeConfig.reward;
  const TypeIcon = cfg.icon;

  return (
    <CashierLayout>
      {scannerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...card, width: 'min(520px,100%)', padding: 16, background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(180deg,#22c55e,#16a34a)', border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 var(--dark-border)' }}>
                  <ScanLine size={20} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, color: 'var(--text-dark)', fontSize: 15 }}>Bilet QR Tara</p>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>Müşterinin envanter QR kodunu kameraya gösterin</p>
                </div>
              </div>
              <button onClick={closeScanner} style={{ width: 40, height: 40, borderRadius: 14, border: '2.5px solid var(--dark-border)', background: 'var(--tab-bg)', color: 'var(--text-dark)', boxShadow: '0 3px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <StopCircle size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '3px solid var(--dark-border)', background: '#050816', aspectRatio: '4 / 3', boxShadow: 'inset 0 0 0 2px rgba(34,197,94,0.22)' }}>
              <video ref={videoRef} playsInline muted autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover', display: scannerActive ? 'block' : 'none' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', inset: 28, border: '3px solid #22c55e', borderRadius: 18, boxShadow: '0 0 0 999px rgba(0,0,0,0.28)' }} />
              <div style={{ position: 'absolute', left: 42, right: 42, top: '50%', height: 3, borderRadius: 999, background: 'linear-gradient(90deg,transparent,#22c55e,transparent)', animation: scannerActive ? 'scanSweep 1.8s ease-in-out infinite' : 'none' }} />
              {!scannerActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'white', padding: 24, textAlign: 'center' }}>
                  <Loader2 size={28} className="animate-spin" />
                  <p style={{ margin: 0, fontWeight: 900 }}>{scannerError || 'Kamera başlatılıyor...'}</p>
                </div>
              )}
            </div>

            {scannerError && (
              <div style={{ padding: 12, borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', color: '#ef4444', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{scannerError}</span>
              </div>
            )}

            <button onClick={closeScanner} style={{ padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Keyboard size={16} /> Manuel Koda Dön
            </button>
          </div>
          <style>{`@keyframes scanSweep { 0%,100% { transform: translateY(-92px); opacity: .25; } 50% { transform: translateY(92px); opacity: 1; } }`}</style>
        </div>
      )}

      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#22c55e,#16a34a)', padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>KASA İŞLEMLERİ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>Ödül İşlet 🎁</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 600 }}>Müşterinin ödül kodunu girin ve onaylayın</p>
          </div>
        </div>

        {/* Code entry */}
        <div style={{ ...card, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 3px' }}>Ödül / Kupon Kodu Girin</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>QR tara veya kodu manuel yaz</p>
            </div>
            <button
              onClick={() => void startScanner()}
              style={{
                padding: '10px 14px', borderRadius: 14, fontWeight: 900, fontSize: 13,
                background: 'linear-gradient(180deg,#8b5cf6,#7c3aed)', color: 'white',
                border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Camera size={15} /> QR Tara
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                value={code}
                onChange={e => { setCode(e.target.value); setStatus('idle'); setFoundItem(null); setDone(false); }}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                placeholder="K3M9P2"
                style={{
                  width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                  borderRadius: 14, fontFamily: 'monospace', fontSize: 15, fontWeight: 900,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
                  color: 'var(--text-dark)', outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={!code.trim() || status === 'loading'}
              style={{
                padding: '0 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
                background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: 'white',
                border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: !code.trim() || status === 'loading' ? 0.5 : 1,
              }}
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {status === 'loading' ? '' : 'Sorgula'}
            </button>
          </div>
        </div>

        {/* Result */}
        {foundItem && status === 'found_valid' && !done && (
          <div style={{ ...card, padding: 22, border: '3px solid #22c55e', boxShadow: '0 5px 0 #16a34a' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: cfg.bg, border: `2.5px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {rewardData?.image
                  ? <img src={rewardData.image} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} />
                  : <TypeIcon size={26} style={{ color: cfg.color }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: cfg.bg, border: `1.5px solid ${cfg.color}`, marginBottom: 6 }}>
                  <span style={{ fontSize: 12 }}>{cfg.emoji}</span>
                  <span style={{ fontWeight: 900, fontSize: 11, color: cfg.color }}>{cfg.label}</span>
                </div>
                <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 4px' }}>{rewardData?.title ?? foundItem.code}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: 'var(--primary-blue)', margin: '0 0 4px', letterSpacing: '0.08em' }}>{foundItem.code}</p>
                {profileData && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 2px' }}>👤 {profileData.username} · {profileData.email}</p>
                )}
                {foundItem.expires_at && (
                  <p style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, margin: 0 }}>
                    ✅ Geçerli — {daysLeft(foundItem.expires_at)} gün kaldı
                  </p>
                )}
              </div>
            </div>
            {confirmError && (
              <div style={{ padding: 12, borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', color: '#ef4444', fontSize: 12, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{confirmError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleReset} style={{ flex: 1, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <XCircle size={15} /> İptal
              </button>
              <button onClick={handleConfirm} disabled={confirming} style={{ flex: 2, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: confirming ? 0.7 : 1 }}>
                {confirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {confirming ? 'İşleniyor…' : 'Ödülü İşlet ✓'}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {done && foundItem && (
          <div style={{ ...card, padding: 28, textAlign: 'center', border: '3px solid #22c55e', boxShadow: '0 5px 0 #16a34a' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)' }}>
              <CheckCircle size={32} color="white" />
            </div>
            <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--text-dark)', margin: '0 0 6px' }}>Ödül Başarıyla İşlendi!</p>
            <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 900, color: 'var(--text-muted)', margin: '0 0 20px', letterSpacing: '0.06em' }}>{foundItem.code}</p>
            <button onClick={handleReset} style={{ padding: '13px 28px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
              <RefreshCw size={15} /> Yeni İşlem
            </button>
          </div>
        )}

        {/* Error states */}
        {status === 'not_found' && (
          <div style={{ ...card, padding: 22, border: '3px solid #ef4444', boxShadow: '0 5px 0 #dc2626', textAlign: 'center' }}>
            <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 900, fontSize: 16, color: '#ef4444', margin: '0 0 6px' }}>Kod Bulunamadı</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Bu koda ait ödül sistemde kayıtlı değil.</p>
            <button onClick={handleReset} style={{ padding: '11px 22px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Tekrar Dene
            </button>
          </div>
        )}

        {status === 'found_used' && foundItem && (
          <div style={{ ...card, padding: 22, border: '3px solid #9ca3af', boxShadow: '0 5px 0 #6b7280', textAlign: 'center' }}>
            <XCircle size={36} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-muted)', margin: '0 0 6px' }}>Bu Kod Daha Önce Kullanıldı</p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>{foundItem.code}</p>
            <button onClick={handleReset} style={{ padding: '11px 22px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Yeni Sorgulama
            </button>
          </div>
        )}

        {status === 'found_expired' && foundItem && (
          <div style={{ ...card, padding: 22, border: '3px solid #f59e0b', boxShadow: '0 5px 0 #d97706', textAlign: 'center' }}>
            <Clock size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 900, fontSize: 16, color: '#d97706', margin: '0 0 6px' }}>This ticket has expired and can no longer be used.</p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>{foundItem.code}</p>
            <button onClick={handleReset} style={{ padding: '11px 22px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Yeni Sorgulama
            </button>
          </div>
        )}

        {/* Redemption log */}
        {log.length > 0 && (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '2px solid var(--dark-border)' }}>
              <History size={16} color="#22c55e" />
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Bugünkü İşlemler ({log.length})</p>
            </div>
            {log.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < log.length - 1 ? '1.5px dashed var(--dark-border)' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="var(--text-muted)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--primary-blue)', margin: 0, fontWeight: 700 }}>{r.code}</p>
                    {r.customerName && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {r.customerName}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 2px' }}>{r.ts}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', border: '1.5px solid #22c55e' }}>
                    <CheckCircle size={10} color="#22c55e" />
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#16a34a' }}>İşlendi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CashierLayout>
  );
};

export default CashierRedeem;
