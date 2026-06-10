import React, { useState, useEffect } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { QrCode, RefreshCw, Copy, CheckCircle, Clock, ScanLine, AlertCircle, Zap } from 'lucide-react';

const ACCENT = '#22c55e';

type Tab = 'generate' | 'scan' | 'history';

interface QREntry {
  id: string;
  type: string;
  value: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  customerName?: string;
}

const HISTORY: QREntry[] = [
  { id: 'QR001', type: 'purchase', value: '₺150 Alışveriş',    createdAt: '09:14', expiresAt: '09:19', used: true,  customerName: 'Ayşe K.' },
  { id: 'QR002', type: 'checkin',  value: 'Mağaza Check-in',    createdAt: '09:02', expiresAt: '09:07', used: true,  customerName: 'Mehmet T.' },
  { id: 'QR003', type: 'purchase', value: '₺75 Alışveriş',     createdAt: '08:55', expiresAt: '09:00', used: true,  customerName: 'Zeynep A.' },
  { id: 'QR004', type: 'gift',     value: '100 Puan Hediye',    createdAt: '08:30', expiresAt: '08:35', used: false, customerName: undefined },
];

const QR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMWUxYjRiIiByeD0iNCIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSIgcng9IjIiLz48cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFlMWI0YiIgcng9IjIiLz48cmVjdCB4PSI5MCIgeT0iMTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzFlMWI0YiIgcng9IjQiLz48cmVjdCB4PSIxMDAiIHk9IjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IndoaXRlIiByeD0iMiIvPjxyZWN0IHg9IjEwNSIgeT0iMjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFlMWI0YiIgcng9IjIiLz48cmVjdCB4PSIxMCIgeT0iOTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzFlMWI0YiIgcng9IjQiLz48cmVjdCB4PSIyMCIgeT0iMTAwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IndoaXRlIiByeD0iMiIvPjxyZWN0IHg9IjI1IiB5PSIxMDUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFlMWI0YiIgcng9IjIiLz48cmVjdCB4PSI3MCIgeT0iNzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWI0YiIvPjxyZWN0IHg9IjkwIiB5PSI3MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iMTEwIiB5PSI3MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iMTMwIiB5PSI3MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iNzAiIHk9IjkwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxZTFiNGIiLz48cmVjdCB4PSI5MCIgeT0iOTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWI0YiIvPjxyZWN0IHg9IjcwIiB5PSIxMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWI0YiIvPjxyZWN0IHg9IjExMCIgeT0iMTEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxZTFiNGIiLz48cmVjdCB4PSIxMzAiIHk9IjExMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iNzAiIHk9IjEzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iOTAiIHk9IjEzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxYjRiIi8+PHJlY3QgeD0iMTEwIiB5PSIxMzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWI0YiIvPjwvc3ZnPg==';

const StoreAdminQR: React.FC = () => {
  const [tab, setTab] = useState<Tab>('generate');
  const [qrType, setQrType] = useState<'purchase' | 'checkin' | 'gift'>('purchase');
  const [amount, setAmount] = useState('150');
  const [giftPoints, setGiftPoints] = useState('100');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [manualId, setManualId] = useState('');
  const [scanResult, setScanResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!generated) return;
    setTimeLeft(300);
    const id = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(id); setGenerated(false); return 0; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [generated]);

  const generate = () => { if (!amount && qrType === 'purchase') return; setGenerated(true); };
  const copyCode = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleScan = () => {
    if (!manualId.trim()) return;
    setTimeout(() => {
      setScanResult({ ok: true, msg: `QR ${manualId} başarıyla işlendi — 75 puan eklendi` });
      setManualId('');
    }, 600);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'generate', label: 'QR Oluştur',  icon: QrCode    },
    { key: 'scan',     label: 'QR Tara',     icon: ScanLine  },
    { key: 'history',  label: 'Geçmiş',      icon: Clock     },
  ];

  return (
    <StoreAdminLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #16a34a 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <QrCode size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">QR İşlemleri</p>
              <p className="text-white/70 text-sm">QR oluştur, tara ve geçmişi incele</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-sm transition-all"
              style={{
                background: tab === t.key ? ACCENT : 'var(--card-bg)',
                color: tab === t.key ? 'white' : 'var(--text-muted)',
                border: '2px solid var(--dark-border)',
                boxShadow: tab === t.key ? '0px 3px 0px var(--dark-border)' : 'none',
              }}>
              <t.icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Generate tab */}
        {tab === 'generate' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
              <p className="font-black text-sm mb-3" style={{ color: 'var(--text-dark)' }}>QR Türü</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([
                  { key: 'purchase', emoji: '🛍️', label: 'Alışveriş' },
                  { key: 'checkin',  emoji: '📍', label: 'Check-in'  },
                  { key: 'gift',     emoji: '🎁', label: 'Hediye'    },
                ] as const).map(t => (
                  <button key={t.key} onClick={() => { setQrType(t.key); setGenerated(false); }}
                    className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all"
                    style={{
                      background: qrType === t.key ? `${ACCENT}15` : 'var(--tab-bg)',
                      border: `2px solid ${qrType === t.key ? ACCENT : 'var(--dark-border)'}`,
                    }}>
                    <span className="text-xl">{t.emoji}</span>
                    <span className="font-black text-xs" style={{ color: qrType === t.key ? ACCENT : 'var(--text-muted)' }}>{t.label}</span>
                  </button>
                ))}
              </div>

              {qrType === 'purchase' && (
                <div className="mb-4">
                  <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>TUTAR (₺)</label>
                  <input type="number" min={1} value={amount} onChange={e => { setAmount(e.target.value); setGenerated(false); }}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                    style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
                </div>
              )}
              {qrType === 'gift' && (
                <div className="mb-4">
                  <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>HEDİYE PUAN</label>
                  <input type="number" min={1} value={giftPoints} onChange={e => { setGiftPoints(e.target.value); setGenerated(false); }}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                    style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
                </div>
              )}

              <button onClick={generate}
                className="w-full py-3 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
                <Zap size={16} /> QR Oluştur
              </button>
            </div>

            {generated && (
              <div className="p-6 rounded-2xl text-center"
                style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
                <div className="mx-auto w-36 h-36 rounded-2xl overflow-hidden mb-4"
                  style={{ border: '3px solid var(--dark-border)' }}>
                  <img src={QR_PLACEHOLDER} alt="QR" className="w-full h-full" />
                </div>
                <p className="font-black text-sm mb-1" style={{ color: 'var(--text-dark)' }}>
                  {qrType === 'purchase' ? `₺${amount} Alışveriş QR` : qrType === 'checkin' ? 'Mağaza Check-in QR' : `${giftPoints} Puan Hediye QR`}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock size={14} style={{ color: timeLeft < 60 ? '#ef4444' : ACCENT }} />
                  <span className="font-black text-sm" style={{ color: timeLeft < 60 ? '#ef4444' : ACCENT }}>{fmt(timeLeft)} kaldı</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyCode}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                    style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
                    {copied ? <><CheckCircle size={14} style={{ color: ACCENT }} /> Kopyalandı!</> : <><Copy size={14} /> Kodu Kopyala</>}
                  </button>
                  <button onClick={generate}
                    className="px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-1.5"
                    style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
                    <RefreshCw size={13} /> Yenile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan tab */}
        {tab === 'scan' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
              <p className="font-black text-sm mb-3" style={{ color: 'var(--text-dark)' }}>Manuel QR Kodu Gir</p>
              <div className="flex gap-2">
                <input type="text" placeholder="QR kod değeri" value={manualId} onChange={e => { setManualId(e.target.value); setScanResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
                <button onClick={handleScan} disabled={!manualId.trim()}
                  className="px-5 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                  style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: !manualId.trim() ? 0.6 : 1 }}>
                  <ScanLine size={16} />
                </button>
              </div>
              {scanResult && (
                <div className="mt-3 p-3 rounded-xl flex items-center gap-2"
                  style={{ background: scanResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `2px solid ${scanResult.ok ? ACCENT : '#ef4444'}` }}>
                  {scanResult.ok ? <CheckCircle size={16} style={{ color: ACCENT }} /> : <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                  <span className="font-black text-sm" style={{ color: scanResult.ok ? ACCENT : '#ef4444' }}>{scanResult.msg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            {HISTORY.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-black/5"
                style={{ borderBottom: i < HISTORY.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: entry.used ? 'var(--tab-bg)' : `${ACCENT}15`, border: '2px solid var(--dark-border)' }}>
                  {entry.type === 'purchase' ? '🛍️' : entry.type === 'checkin' ? '📍' : '🎁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{entry.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {entry.customerName ? `${entry.customerName} · ` : ''}{entry.createdAt} → {entry.expiresAt}
                  </p>
                </div>
                <span className="font-black text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: entry.used ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                    color: entry.used ? ACCENT : '#f59e0b',
                    border: `1.5px solid ${entry.used ? ACCENT : '#f59e0b'}`,
                  }}>
                  {entry.used ? 'Kullanıldı' : 'Bekliyor'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminQR;
