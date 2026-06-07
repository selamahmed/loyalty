import React, { useState } from 'react';
import { Plus, CreditCard as Edit3, Trash2, X, Check, Calendar, Zap } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { seasonalEvents } from '../../data/mockData';
import { tr } from '../../lib/tr';

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState(seasonalEvents.map(e => ({ ...e })));
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof seasonalEvents[0] | null>(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', multiplier: '2x', active: false });
  const [saved, setSaved] = useState(false);

  const openNew = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', startDate: '', endDate: '', multiplier: '2x', active: false });
    setShowModal(true);
  };

  const openEdit = (ev: typeof seasonalEvents[0]) => {
    setEditingEvent(ev);
    setForm({ title: ev.title, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, multiplier: ev.multiplier, active: ev.active });
    setShowModal(true);
  };

  const handleSave = () => {
    setSaved(true);
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...form } : e));
    } else {
      setEvents(prev => [...prev, { ...form, id: Date.now().toString(), image: '', progress: 0, totalRewards: 0, unlockedRewards: 0, color: 'from-blue-400 to-cyan-300' }]);
    }
    setTimeout(() => { setSaved(false); setShowModal(false); }, 800);
  };

  return (
    <AdminLayout>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="animate-bounce-in card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-2">Event Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="e.g. Summer Splash" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-sm mb-2">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-2">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-sm mb-2">Points Multiplier</label>
                <select value={form.multiplier} onChange={e => setForm({...form, multiplier: e.target.value})} className="input-field">
                  <option value="1x">1x (Normal)</option>
                  <option value="1.5x">1.5x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                </select>
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
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Saved!</> : editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-3xl mx-auto overflow-x-hidden">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Events</h1>
          <button onClick={openNew} className="btn-primary flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm">
            <Plus size={12} className="sm:w-3.5 sm:h-3.5" /> Create Event
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="card p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${ev.color} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 border-2 border-black dark:border-gray-600`}>
                🎉
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5 sm:gap-2 mb-1 flex-wrap">
                  <p className="font-black text-sm sm:text-base text-gray-900 dark:text-white">{ev.title}</p>
                  {ev.active && <span className="badge bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs">Active</span>}
                  <span className="badge bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7] text-xs flex items-center gap-0.5"><Zap size={8} />{ev.multiplier}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1.5 sm:mb-2">{ev.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={10} />{ev.startDate} → {ev.endDate}</span>
                  <span>Progress: {ev.progress}%</span>
                </div>
                <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full" style={{ width: `${ev.progress}%` }} />
                </div>
              </div>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                <button onClick={() => openEdit(ev)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#7B6EF6] transition-colors">
                  <Edit3 size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
