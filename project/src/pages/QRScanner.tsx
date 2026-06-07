import React, { useState, useEffect } from 'react';
import { QrCode, Camera, Check, X, Zap, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

const fakeQRResults = [
  { code: 'STORE42-BONUS', title: 'Store Visit Bonus!', points: 75, location: 'Store #42 - Main St' },
  { code: 'EVENT2026-SPECIAL', title: 'Event Special Code!', points: 150, location: 'Summer Event Booth' },
  { code: 'PARTNER-CAFE', title: 'Partner Cafe Visit!', points: 50, location: 'Coffee Corner' },
  { code: 'PROMO-SALE', title: 'Sale Promo Code!', points: 100, location: 'Online Exclusive' },
];

const QRScanner: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<typeof fakeQRResults[0] | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ code: string; points: number; time: string }[]>([
    { code: 'STORE18-DAILY', points: 75, time: '2 days ago' },
    { code: 'EVENT2025-X', points: 100, time: '5 days ago' },
  ]);

  const startScan = () => {
    setScanning(true);
    setResult(null);
    setError('');
    setScanProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15 + 5;
      setScanProgress(Math.min(prog, 95));
      if (prog >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          setScanProgress(100);
          const r = fakeQRResults[Math.floor(Math.random() * fakeQRResults.length)];
          setResult(r);
          setScanning(false);
        }, 500);
      }
    }, 150);
  };

  const claimReward = () => {
    if (!result) return;
    addPoints(result.points);
    showRewardPopup({
      type: 'reward',
      title: result.title,
      subtitle: `You scanned a QR code at ${result.location}`,
      points: result.points,
    });
    setHistory(prev => [{ code: result.code, points: result.points, time: 'Just now' }, ...prev]);
    setResult(null);
    setScanProgress(0);
  };

  const handleManualSubmit = () => {
    const found = fakeQRResults.find(r => r.code === manualCode.trim().toUpperCase());
    if (found) {
      setResult(found);
      setError('');
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">QR Scanner</h1>

      {/* Scanner viewport */}
      <div className="card p-6">
        <div className="relative aspect-square w-full max-w-xs mx-auto bg-gray-900 dark:bg-black rounded-3xl overflow-hidden border-2 border-black dark:border-gray-600">
          {/* Camera simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanning ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7B6EF6]/20 dark:via-[#4F8EF7]/20 to-transparent animate-pulse" />
                <div className="w-48 h-48 border-2 border-[#7B6EF6] dark:border-[#4F8EF7] relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#7B6EF6] dark:border-[#4F8EF7]" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#7B6EF6] dark:border-[#4F8EF7]" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#7B6EF6] dark:border-[#4F8EF7]" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#7B6EF6] dark:border-[#4F8EF7]" />
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-[#7B6EF6] dark:bg-[#4F8EF7] shadow-[0_0_8px_#7B6EF6]"
                    style={{
                      top: `${scanProgress}%`,
                      transition: 'top 0.15s linear',
                    }}
                  />
                </div>
                <p className="absolute bottom-4 text-white/80 text-sm">Scanning...</p>
              </>
            ) : result ? (
              <div className="flex flex-col items-center gap-3 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <Check size={32} className="text-white" />
                </div>
                <p className="text-white font-black text-xl">Code Found!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/60">
                <Camera size={48} />
                <p className="text-sm">Tap to start scanning</p>
              </div>
            )}
          </div>
        </div>

        {/* Scan progress bar */}
        {(scanning || scanProgress > 0) && !result && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full transition-all"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">Analyzing QR code...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-green-700 dark:text-green-400">{result.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.location}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="font-black text-amber-600 dark:text-amber-400">+{result.points} Points</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setResult(null); setScanProgress(0); }} className="btn-secondary flex-1 text-sm py-2">
                <RotateCcw size={14} className="inline mr-1" /> Scan Again
              </button>
              <button onClick={claimReward} className="btn-primary flex-1 text-sm py-2">
                Claim +{result.points} pts
              </button>
            </div>
          </div>
        )}

        {!scanning && !result && (
          <button onClick={startScan} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            <QrCode size={20} /> Start Scanning
          </button>
        )}
      </div>

      {/* Manual code entry */}
      <div className="card p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Enter Code Manually</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. STORE42-BONUS"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
          />
          <button onClick={handleManualSubmit} className="btn-primary px-4">Check</button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <p className="text-xs text-gray-400 mt-2">Try: STORE42-BONUS, EVENT2026-SPECIAL</p>
      </div>

      {/* Scan history */}
      {history.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recent Scans</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check size={14} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{h.code}</p>
                  <p className="text-xs text-gray-400">{h.time}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-amber-500" />
                  <span className="font-bold text-sm text-amber-600 dark:text-amber-400">+{h.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
