import React, { useState, useRef, useEffect } from 'react';
import CashierLayout from './CashierLayout';
import {
  ScanLine, CheckCircle, AlertCircle, Camera, CameraOff,
  User, Star, Clock, RefreshCw, XCircle, Zap
} from 'lucide-react';

const ACCENT = '#f59e0b';

type ScanResult = {
  id: string;
  customerName: string;
  customerId: string;
  pointsAwarded: number;
  timestamp: string;
  status: 'success' | 'error';
  message: string;
};

const MOCK_CUSTOMERS: Record<string, { name: string; points: number; level: number }> = {
  'USR001': { name: 'Ayşe Kaya',       points: 4250, level: 8 },
  'USR002': { name: 'Mehmet Türk',     points: 1820, level: 4 },
  'USR003': { name: 'Zeynep Arslan',   points: 960,  level: 2 },
  'USR004': { name: 'Ali Rıza Demir',  points: 3100, level: 6 },
  'USR005': { name: 'Fatma Şahin',     points: 2450, level: 5 },
};

const PRESET_POINTS = [50, 75, 100, 150, 200, 300];

const CashierScan: React.FC = () => {
  const [manualId, setManualId] = useState('');
  const [pointsToAward, setPointsToAward] = useState(100);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [sessionLog, setSessionLog] = useState<ScanResult[]>([]);
  const [sessionPoints, setSessionPoints] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processCustomer = (id: string, pts: number) => {
    const customer = MOCK_CUSTOMERS[id.toUpperCase().trim()];
    const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (customer) {
      const result: ScanResult = {
        id: Date.now().toString(),
        customerName: customer.name,
        customerId: id.toUpperCase().trim(),
        pointsAwarded: pts,
        timestamp: ts,
        status: 'success',
        message: `${customer.name} hesabına ${pts} puan eklendi`,
      };
      setLastResult(result);
      setSessionLog(prev => [result, ...prev]);
      setSessionPoints(p => p + pts);
    } else {
      const result: ScanResult = {
        id: Date.now().toString(),
        customerName: 'Bilinmeyen',
        customerId: id,
        pointsAwarded: 0,
        timestamp: ts,
        status: 'error',
        message: 'Müşteri bulunamadı. ID kontrol edin.',
      };
      setLastResult(result);
      setSessionLog(prev => [result, ...prev]);
    }
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) return;
    setScanning(true);
    setTimeout(() => {
      processCustomer(manualId.trim(), pointsToAward);
      setManualId('');
      setScanning(false);
    }, 600);
  };

  const simulateQRScan = () => {
    setScanning(true);
    const ids = Object.keys(MOCK_CUSTOMERS);
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    setTimeout(() => {
      processCustomer(randomId, pointsToAward);
      setScanning(false);
    }, 1200);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const clearResult = () => setLastResult(null);

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ScanLine size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">QR Tara & Puan Ver</p>
              <p className="text-white/70 text-sm mt-0.5">Müşteri QR kodunu okut veya ID gir</p>
            </div>
          </div>
        </div>

        {/* Session stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            <p className="text-2xl font-black" style={{ color: '#7B6EF6' }}>{sessionLog.length}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Bu Oturum Tarama</p>
          </div>
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            <p className="text-2xl font-black" style={{ color: ACCENT }}>{sessionPoints.toLocaleString('tr-TR')}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Bu Oturum Puan</p>
          </div>
        </div>

        {/* Points preset selector */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <p className="font-black text-sm mb-3" style={{ color: 'var(--text-dark)' }}>Verilecek Puan Miktarı</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {PRESET_POINTS.map(p => (
              <button key={p}
                onClick={() => setPointsToAward(p)}
                className="py-2.5 rounded-xl font-black text-sm transition-all active:scale-95"
                style={{
                  background: pointsToAward === p ? ACCENT : 'var(--tab-bg)',
                  color: pointsToAward === p ? 'white' : 'var(--text-muted)',
                  border: `2px solid ${pointsToAward === p ? 'var(--dark-border)' : 'var(--dark-border)'}`,
                  boxShadow: pointsToAward === p ? '0px 3px 0px var(--dark-border)' : 'none',
                }}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>Özel:</span>
            <input
              type="number"
              min={1}
              value={pointsToAward}
              onChange={e => setPointsToAward(Math.max(1, Number(e.target.value)))}
              className="flex-1 px-3 py-2 rounded-xl font-black text-sm outline-none"
              style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
            />
            <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>puan</span>
          </div>
        </div>

        {/* Camera QR area */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Kamera ile QR Tara</p>
            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
              style={{
                background: cameraActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                color: cameraActive ? '#ef4444' : '#22c55e',
                border: `2px solid ${cameraActive ? '#ef4444' : '#22c55e'}`,
              }}>
              {cameraActive ? <><CameraOff size={13} /> Kapat</> : <><Camera size={13} /> Başlat</>}
            </button>
          </div>

          {cameraActive ? (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1', background: '#000' }}>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-2xl" style={{ border: '3px solid #7B6EF6', boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <button onClick={simulateQRScan} disabled={scanning}
                  className="px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                  style={{ background: '#7B6EF6', border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: scanning ? 0.7 : 1 }}>
                  {scanning ? 'Taranıyor…' : '📷 Simüle Tara'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl"
              style={{ background: 'var(--tab-bg)', border: '2px dashed var(--dark-border)' }}>
              <Camera size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
              <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Kamera kapalı</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Başlat butonuna tıklayın</p>
            </div>
          )}
        </div>

        {/* Manual ID entry */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <p className="font-black text-sm mb-3" style={{ color: 'var(--text-dark)' }}>Manuel ID Girişi</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Müşteri ID (ör. USR001)"
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm outline-none"
              style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
            />
            <button onClick={handleManualSubmit} disabled={!manualId.trim() || scanning}
              className="px-5 py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95 flex items-center gap-1.5"
              style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: (!manualId.trim() || scanning) ? 0.6 : 1 }}>
              {scanning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {scanning ? '' : 'Ver'}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Demo ID'ler: USR001, USR002, USR003, USR004, USR005</p>
        </div>

        {/* Last scan result */}
        {lastResult && (
          <div className="p-5 rounded-2xl relative"
            style={{
              background: lastResult.status === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `2.5px solid ${lastResult.status === 'success' ? '#22c55e' : '#ef4444'}`,
              boxShadow: `0px 4px 0px ${lastResult.status === 'success' ? '#22c55e' : '#ef4444'}`,
            }}>
            <button onClick={clearResult} className="absolute top-3 right-3" style={{ color: 'var(--text-muted)' }}>
              <XCircle size={16} />
            </button>
            <div className="flex items-center gap-3">
              {lastResult.status === 'success'
                ? <CheckCircle size={28} style={{ color: '#22c55e', flexShrink: 0 }} />
                : <AlertCircle size={28} style={{ color: '#ef4444', flexShrink: 0 }} />
              }
              <div>
                <p className="font-black text-sm" style={{ color: lastResult.status === 'success' ? '#22c55e' : '#ef4444' }}>
                  {lastResult.status === 'success' ? '✅ Başarılı!' : '❌ Hata!'}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{lastResult.message}</p>
                {lastResult.status === 'success' && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs font-black" style={{ color: 'var(--text-dark)' }}>
                      <User size={11} /> {lastResult.customerName}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black" style={{ color: ACCENT }}>
                      <Star size={11} /> +{lastResult.pointsAwarded} puan
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={11} /> {lastResult.timestamp}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Session log */}
        {sessionLog.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
              <Clock size={16} style={{ color: ACCENT }} />
              <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Oturum Günlüğü ({sessionLog.length})</p>
            </div>
            <div>
              {sessionLog.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs truncate" style={{ color: 'var(--text-dark)' }}>{r.customerName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.timestamp}</p>
                  </div>
                  <span className="font-black text-xs flex-shrink-0"
                    style={{ color: r.status === 'success' ? '#22c55e' : '#ef4444' }}>
                    {r.status === 'success' ? `+${r.pointsAwarded}` : 'Hata'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </CashierLayout>
  );
};

export default CashierScan;
