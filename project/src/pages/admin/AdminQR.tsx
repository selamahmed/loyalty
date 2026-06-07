import React, { useState } from 'react';
import { QrCode, Plus, Trash2, X, Check, Copy } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { tr } from '../../lib/tr';

const qrCodes = [
  { id: '1', code: 'STORE42-BONUS', location: 'Store #42 - Main St', points: 75, scans: 234, active: true },
  { id: '2', code: 'EVENT2026-SPECIAL', location: 'Summer Event Booth', points: 150, scans: 89, active: true },
  { id: '3', code: 'PARTNER-CAFE', location: 'Coffee Corner', points: 50, scans: 412, active: true },
  { id: '4', code: 'PROMO-SALE', location: 'Online Exclusive', points: 100, scans: 156, active: false },
];

const AdminQR: React.FC = () => {
  const [codes, setCodes] = useState(qrCodes);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ location: '', points: 50, active: true });
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const generateCode = () => `${form.location.slice(0, 6).replace(/\s/g, '').toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const handleCreate = () => {
    setSaved(true);
    const code = generateCode();
    setCodes(prev => [{ id: Date.now().toString(), code, ...form, scans: 0 }, ...prev]);
    setTimeout(() => { setSaved(false); setShowModal(false); setForm({ location: '', points: 50, active: true }); }, 800);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AdminLayout>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="animate-bounce-in card max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">Create QR Code</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-2">Location / Label</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="e.g. Store #50 - Oak Ave" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-2">Points Reward</label>
                <input type="number" value={form.points} onChange={e => setForm({...form, points: +e.target.value})} className="input-field" min={1} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setForm({...form, active: !form.active})}
                  className={`w-5 h-5 rounded-md border-2 border-black dark:border-gray-500 flex items-center justify-center transition-colors ${form.active ? 'bg-green-500' : 'bg-white dark:bg-gray-700'}`}>
                  {form.active && <Check size={12} className="text-white" />}
                </button>
                <span className="font-medium text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Created!</> : 'Generate QR'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">QR Codes</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={14} /> Generate QR
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Codes', value: codes.length.toString() },
            { label: 'Active', value: codes.filter(c => c.active).length.toString() },
            { label: 'Total Scans', value: codes.reduce((s, c) => s + c.scans, 0).toLocaleString() },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="font-black text-2xl text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {codes.map(qr => (
            <div key={qr.id} className="card p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                <QrCode size={22} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono font-black text-gray-900 dark:text-white tracking-wider">{qr.code}</p>
                  <button onClick={() => handleCopy(qr.code)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                    {copied === qr.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{qr.location}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">+{qr.points} pts</span>
                  <span className="text-gray-400">{qr.scans.toLocaleString()} scans</span>
                  <span className={`font-bold ${qr.active ? 'text-green-500' : 'text-gray-400'}`}>{qr.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <button onClick={() => setCodes(prev => prev.filter(c => c.id !== qr.id))} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQR;
