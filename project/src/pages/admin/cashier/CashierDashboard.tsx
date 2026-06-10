import React, { useState } from 'react';
import CashierLayout from './CashierLayout';
import { ScanLine, Star, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const ACCENT = '#f59e0b';

const recentScans = [
  { name: 'Ayşe K.',    points: 150, time: '09:14', status: 'success' },
  { name: 'Mehmet T.', points: 300, time: '09:02', status: 'success' },
  { name: 'Zeynep A.', points: 150, time: '08:55', status: 'success' },
  { name: 'Ali R.',    points: 200, time: '08:41', status: 'success' },
  { name: 'Fatma S.', points: 150, time: '08:30', status: 'success' },
];

const CashierDashboard: React.FC = () => {
  const [manualPoints, setManualPoints] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [issued, setIssued] = useState(false);

  const handleIssue = () => {
    if (!manualPhone || !manualPoints) return;
    setIssued(true);
    setTimeout(() => { setIssued(false); setManualPhone(''); setManualPoints(''); }, 2500);
  };

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">

        {/* Welcome */}
        <div className="p-6 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #d97706 100%)`, border: '2.5px solid #1e1b4b', boxShadow: '0px 5px 0px #1e1b4b' }}>
          <p className="font-black text-2xl">Kasa Ekranı 🧾</p>
          <p className="text-white/80 text-sm mt-1">Müşterilere puan ver ve QR işlemlerini yönet</p>
        </div>

        {/* Today stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tarama',       value: '34',    icon: ScanLine, color: ACCENT   },
            { label: 'Verilen Puan', value: '5,120', icon: Star,     color: '#7B6EF6'},
            { label: 'Müşteri',      value: '34',    icon: Users,    color: '#22c55e'},
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl text-center"
              style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${s.color}18`, border: `2px solid ${s.color}` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-xl font-black" style={{ color: '#1e1b4b' }}>{s.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick QR action */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
          <p className="font-black mb-4" style={{ color: '#1e1b4b' }}>Hızlı Puan Ver</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black mb-1 block" style={{ color: '#6b7280' }}>MÜŞTERİ TELEFON / ID</label>
              <input
                type="text" placeholder="05xx xxx xx xx"
                value={manualPhone}
                onChange={e => setManualPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: '#fffbeb', border: '2px solid #1e1b4b', color: '#1e1b4b' }}
              />
            </div>
            <div>
              <label className="text-xs font-black mb-1 block" style={{ color: '#6b7280' }}>VERİLECEK PUAN</label>
              <input
                type="number" placeholder="150"
                value={manualPoints}
                onChange={e => setManualPoints(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: '#fffbeb', border: '2px solid #1e1b4b', color: '#1e1b4b' }}
              />
            </div>
            {issued ? (
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
                <CheckCircle size={18} style={{ color: '#22c55e' }} />
                <span className="font-black text-sm" style={{ color: '#22c55e' }}>Puan başarıyla verildi!</span>
              </div>
            ) : (
              <button onClick={handleIssue}
                className="w-full py-3 rounded-xl font-black text-white transition-all active:translate-y-0.5"
                style={{ background: ACCENT, border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
                Puan Ver
              </button>
            )}
          </div>
        </div>

        {/* QR scan shortcut */}
        <button className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid #1e1b4b', boxShadow: '0px 5px 0px #1e1b4b' }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <ScanLine size={28} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-white text-lg">QR Kod Tara</p>
            <p className="text-white/70 text-sm">Müşteri QR'ini okutarak puan işlemi yap</p>
          </div>
          <ArrowRight size={24} className="text-white/70" />
        </button>

        {/* Recent scans */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '2px solid #f3f4f6' }}>
            <Clock size={16} style={{ color: ACCENT }} />
            <p className="font-black" style={{ color: '#1e1b4b' }}>Son Taramalar</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: ACCENT }}>
                  {s.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm" style={{ color: '#1e1b4b' }}>{s.name}</p>
                  <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>{s.time}</p>
                </div>
                <span className="font-black text-sm" style={{ color: '#22c55e' }}>+{s.points} puan</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CashierLayout>
  );
};

export default CashierDashboard;
