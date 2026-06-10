import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierLayout from './CashierLayout';
import { ScanLine, Star, Users, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const ACCENT = '#f59e0b';

const initialScans = [
  { id: 1, name: 'Ayşe K.',    points: 150, time: '09:14', status: 'success' },
  { id: 2, name: 'Mehmet T.', points: 300, time: '09:02', status: 'success' },
  { id: 3, name: 'Zeynep A.', points: 150, time: '08:55', status: 'success' },
  { id: 4, name: 'Ali R.',    points: 200, time: '08:41', status: 'success' },
  { id: 5, name: 'Fatma S.', points: 150, time: '08:30', status: 'success' },
];

const CashierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [manualPoints, setManualPoints] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [issueState, setIssueState] = useState<'idle' | 'success' | 'error'>('idle');
  const [recentScans, setRecentScans] = useState(initialScans);
  const [totalToday, setTotalToday] = useState({ scans: 34, points: 5120, customers: 34 });

  const handleIssue = () => {
    if (!manualPhone.trim() || !manualPoints || Number(manualPoints) <= 0) {
      setIssueState('error');
      setTimeout(() => setIssueState('idle'), 2500);
      return;
    }
    const pts = Number(manualPoints);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setRecentScans(prev => [
      { id: Date.now(), name: manualPhone, points: pts, time: timeStr, status: 'success' },
      ...prev.slice(0, 9),
    ]);
    setTotalToday(t => ({ scans: t.scans + 1, points: t.points + pts, customers: t.customers + 1 }));
    setIssueState('success');
    setTimeout(() => { setIssueState('idle'); setManualPhone(''); setManualPoints(''); }, 2500);
  };

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">

        {/* Welcome banner */}
        <div className="p-6 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #d97706 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <p className="font-black text-2xl">Kasa Ekranı 🧾</p>
          <p className="text-white/80 text-sm mt-1">Müşterilere puan ver ve QR işlemlerini yönet</p>
        </div>

        {/* Today stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tarama',       value: totalToday.scans.toString(),                    icon: ScanLine, color: ACCENT    },
            { label: 'Verilen Puan', value: totalToday.points.toLocaleString('tr-TR'),       icon: Star,     color: '#7B6EF6' },
            { label: 'Müşteri',      value: totalToday.customers.toString(),                 icon: Users,    color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${s.color}18`, border: `2px solid ${s.color}` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-xl font-black" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick issue form */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <p className="font-black mb-4" style={{ color: 'var(--text-dark)' }}>Hızlı Puan Ver</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black mb-1 block" style={{ color: 'var(--text-muted)' }}>MÜŞTERİ TELEFON / ID</label>
              <input
                type="text"
                placeholder="05xx xxx xx xx"
                value={manualPhone}
                onChange={e => setManualPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleIssue()}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none transition-colors"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
              />
            </div>
            <div>
              <label className="text-xs font-black mb-1 block" style={{ color: 'var(--text-muted)' }}>VERİLECEK PUAN</label>
              <input
                type="number"
                placeholder="150"
                min={1}
                value={manualPoints}
                onChange={e => setManualPoints(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleIssue()}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none transition-colors"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
              />
            </div>

            {issueState === 'success' ? (
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                <CheckCircle size={18} style={{ color: '#22c55e' }} />
                <span className="font-black text-sm" style={{ color: '#22c55e' }}>Puan başarıyla verildi!</span>
              </div>
            ) : issueState === 'error' ? (
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}>
                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                <span className="font-black text-sm" style={{ color: '#ef4444' }}>Telefon/ID ve geçerli puan girin.</span>
              </div>
            ) : (
              <button onClick={handleIssue}
                className="w-full py-3 rounded-xl font-black text-white transition-all active:translate-y-0.5 hover:opacity-90"
                style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
                Puan Ver
              </button>
            )}
          </div>
        </div>

        {/* QR scan shortcut */}
        <button
          onClick={() => navigate('/cashier/scan')}
          className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ScanLine size={28} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-white text-lg">QR Kod Tara</p>
            <p className="text-white/70 text-sm">Müşteri QR'ini okutarak puan işlemi yap</p>
          </div>
          <ArrowRight size={24} className="text-white/70 flex-shrink-0" />
        </button>

        {/* Recent scans */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: ACCENT }} />
              <p className="font-black" style={{ color: 'var(--text-dark)' }}>Son Taramalar</p>
            </div>
            <button onClick={() => navigate('/cashier/history')}
              className="text-xs font-black flex items-center gap-1"
              style={{ color: ACCENT }}>
              Tümü <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentScans.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: ACCENT }}>
                  {(s.name[0] ?? '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate" style={{ color: 'var(--text-dark)' }}>{s.name}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.time}</p>
                </div>
                <span className="font-black text-sm flex-shrink-0" style={{ color: '#22c55e' }}>+{s.points} puan</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CashierLayout>
  );
};

export default CashierDashboard;
