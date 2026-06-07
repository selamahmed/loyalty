import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, Check, Calendar, Trophy, Eye, Edit3,
  Power, Send, Image, ChevronDown, ChevronUp, Star, Gift, Clock, Zap
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useRewardEvents, RewardEvent, RankReward, getRankLabel } from '../../context/RewardEventsContext';

const EMOJI_OPTIONS = ['📱','🎧','🖱️','🎮','🕹️','💳','💡','🏆','🎁','💎','👟','👜','✈️','🍕','🎬','📷','⌚','💻','🖥️','🎵'];
const GRADIENT_OPTIONS = [
  { label: 'Sunset', value: 'from-orange-400 via-pink-400 to-purple-500' },
  { label: 'Ocean', value: 'from-blue-400 via-cyan-400 to-teal-400' },
  { label: 'Forest', value: 'from-green-400 via-emerald-400 to-teal-500' },
  { label: 'Fire', value: 'from-red-400 via-orange-400 to-yellow-400' },
  { label: 'Galaxy', value: 'from-purple-500 via-violet-500 to-indigo-500' },
  { label: 'Rose', value: 'from-rose-400 via-pink-400 to-fuchsia-400' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const blankReward = (rank: number): RankReward => ({
  rank,
  label: getRankLabel(rank),
  rewardName: '',
  rewardImage: '🏆',
  quantity: 1,
  pointsRequired: 1000,
});

const blankEvent = (): Omit<RewardEvent, 'id' | 'createdAt'> => ({
  title: '',
  description: '',
  banner: GRADIENT_OPTIONS[0].value,
  startDate: todayStr(),
  endDate: '',
  distributionDate: '',
  active: false,
  published: false,
  winnerCount: 3,
  rewards: [blankReward(1), blankReward(2), blankReward(3)],
});

type Tab = 'list' | 'form' | 'preview';

const AdminRewardEvents: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, toggleActive, togglePublished, isEventEnded, getWinners } = useRewardEvents();
  const [tab, setTab] = useState<Tab>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankEvent());
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedReward, setExpandedReward] = useState<number | null>(null);
  const [emojiPicker, setEmojiPicker] = useState<number | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(blankEvent());
    setTab('form');
  };

  const openEdit = (ev: RewardEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description,
      banner: ev.banner,
      startDate: ev.startDate,
      endDate: ev.endDate,
      distributionDate: ev.distributionDate,
      active: ev.active,
      published: ev.published,
      winnerCount: ev.winnerCount,
      rewards: ev.rewards.map(r => ({ ...r })),
    });
    setTab('form');
  };

  const syncRewards = (count: number) => {
    const updated = Array.from({ length: count }, (_, i) => {
      const existing = form.rewards.find(r => r.rank === i + 1);
      return existing ?? blankReward(i + 1);
    });
    setForm(f => ({ ...f, winnerCount: count, rewards: updated }));
  };

  const updateReward = (rank: number, patch: Partial<RankReward>) => {
    setForm(f => ({
      ...f,
      rewards: f.rewards.map(r => r.rank === rank ? { ...r, ...patch } : r),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.endDate) return;
    const now = new Date().toISOString().slice(0, 10);
    if (editingId) {
      updateEvent({ ...form, id: editingId, createdAt: now });
    } else {
      addEvent({ ...form, id: Date.now().toString(), createdAt: now });
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setTab('list');
    }, 900);
  };

  const handlePreview = () => setTab('preview');

  const medal = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  const previewEvent: RewardEvent = {
    ...form,
    id: editingId ?? '__preview__',
    createdAt: todayStr(),
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" />
              Reward Events
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage leaderboard reward events and prize distributions</p>
          </div>
          {tab === 'list' && (
            <button onClick={openNew} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
              <Plus size={14} /> New Event
            </button>
          )}
          {tab !== 'list' && (
            <button onClick={() => setTab('list')} className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        {/* ─── EVENT LIST ─── */}
        {tab === 'list' && (
          <div className="space-y-3">
            {events.length === 0 && (
              <div className="card p-10 text-center">
                <Trophy size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-bold text-gray-500 dark:text-gray-400">No reward events yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first leaderboard reward event</p>
              </div>
            )}
            {events.map(ev => {
              const ended = isEventEnded(ev);
              return (
                <div key={ev.id} className={`card p-4 border-2 ${ev.active ? 'border-[#7B6EF6] dark:border-[#4F8EF7]' : 'border-black dark:border-gray-700'}`}>
                  <div className="flex items-start gap-3">
                    {/* Banner swatch */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ev.banner} flex items-center justify-center text-2xl border-2 border-black dark:border-gray-600 flex-shrink-0`}>
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <p className="font-black text-base text-gray-900 dark:text-white">{ev.title}</p>
                        {ev.active && <span className="badge bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs">Active</span>}
                        {ev.published && <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">Published</span>}
                        {ended && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">Ended</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{ev.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={10} />{ev.startDate} → {ev.endDate}</span>
                        <span className="flex items-center gap-1"><Trophy size={10} />{ev.winnerCount} winners</span>
                        <span className="flex items-center gap-1"><Gift size={10} />{ev.rewards.length} prizes</span>
                      </div>
                      {/* Rewards preview */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {ev.rewards.slice(0, 3).map(r => (
                          <span key={r.rank} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                            {medal(r.rank)} {r.rewardName}
                          </span>
                        ))}
                        {ev.rewards.length > 3 && (
                          <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs text-gray-500">+{ev.rewards.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(ev)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#7B6EF6] transition-colors" title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => toggleActive(ev.id)} className={`p-1.5 rounded-xl transition-colors ${ev.active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title={ev.active ? 'Deactivate' : 'Activate'}>
                        <Power size={15} />
                      </button>
                      <button onClick={() => togglePublished(ev.id)} className={`p-1.5 rounded-xl transition-colors ${ev.published ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title={ev.published ? 'Unpublish' : 'Publish'}>
                        <Send size={15} />
                      </button>
                      {deleteConfirm === ev.id ? (
                        <div className="flex gap-0.5">
                          <button onClick={() => { deleteEvent(ev.id); setDeleteConfirm(null); }} className="p-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(ev.id)} className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Winners section if ended */}
                  {ended && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1"><Star size={11} fill="currentColor" /> Auto-distributed Winners</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {getWinners(ev).slice(0, 3).map(w => (
                          <div key={w.rank} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-2 border border-amber-200 dark:border-amber-800">
                            <span className="text-lg">{medal(w.rank)}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{w.username}</p>
                              <p className="text-[10px] text-gray-500">{w.reward.rewardName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FORM ─── */}
        {tab === 'form' && (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-base"><Zap size={16} className="text-[#7B6EF6]" /> Event Details</h2>

              <div>
                <label className="block font-bold text-sm mb-1.5">Event Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Summer Champions Cup" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} placeholder="Describe the event and how to participate..." />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1.5">Announcement Banner Style</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_OPTIONS.map(g => (
                    <button key={g.value} onClick={() => setForm(f => ({ ...f, banner: g.value }))} className={`h-10 rounded-xl bg-gradient-to-r ${g.value} border-2 transition-all ${form.banner === g.value ? 'border-black dark:border-white scale-105' : 'border-transparent'}`} title={g.label} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-sm mb-1.5">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1.5">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1.5 flex items-center gap-1"><Clock size={12} /> Auto-distribution Date</label>
                  <input type="date" value={form.distributionDate} onChange={e => setForm(f => ({ ...f, distributionDate: e.target.value }))} className="input-field" />
                </div>
              </div>
            </div>

            {/* Winner Count */}
            <div className="card p-5 space-y-4">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-base"><Trophy size={16} className="text-amber-500" /> Winners & Prizes</h2>
              <div>
                <label className="block font-bold text-sm mb-1.5">Number of Winners</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 5, 10].map(n => (
                    <button key={n} onClick={() => syncRewards(n)}
                      className={`w-12 h-10 rounded-xl font-black text-sm border-2 transition-all ${form.winnerCount === n ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50'}`}>
                      {n}
                    </button>
                  ))}
                  <input type="number" min={1} max={20} value={form.winnerCount}
                    onChange={e => syncRewards(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="w-20 input-field text-center font-black" />
                </div>
              </div>

              {/* Reward slots */}
              <div className="space-y-2">
                {form.rewards.map((reward, idx) => (
                  <div key={reward.rank} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedReward(expandedReward === idx ? null : idx)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <span className="text-xl">{medal(reward.rank)}</span>
                      <div className="flex-1 text-left">
                        <p className="font-black text-sm text-gray-900 dark:text-white">{reward.label}</p>
                        <p className="text-xs text-gray-500">{reward.rewardName || 'No reward assigned'}</p>
                      </div>
                      <span className="text-2xl mr-1">{reward.rewardImage}</span>
                      {expandedReward === idx ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                    </button>
                    {expandedReward === idx && (
                      <div className="p-4 space-y-3 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-xs mb-1.5">Reward Name *</label>
                            <input value={reward.rewardName} onChange={e => updateReward(reward.rank, { rewardName: e.target.value })} className="input-field text-sm" placeholder="e.g. iPhone 17 Pro Max" />
                          </div>
                          <div>
                            <label className="block font-bold text-xs mb-1.5">Quantity</label>
                            <input type="number" min={1} value={reward.quantity} onChange={e => updateReward(reward.rank, { quantity: Number(e.target.value) })} className="input-field text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1.5">Min Points Required</label>
                          <input type="number" min={0} step={100} value={reward.pointsRequired} onChange={e => updateReward(reward.rank, { pointsRequired: Number(e.target.value) })} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1.5 flex items-center gap-1"><Image size={11} /> Reward Icon (Emoji)</label>
                          <div className="relative">
                            <button onClick={() => setEmojiPicker(emojiPicker === idx ? null : idx)}
                              className="flex items-center gap-2 border-2 border-black dark:border-gray-600 rounded-xl px-3 py-2 text-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              {reward.rewardImage}
                              <span className="text-xs font-bold text-gray-500">Change</span>
                            </button>
                            {emojiPicker === idx && (
                              <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-1.5">
                                {EMOJI_OPTIONS.map(em => (
                                  <button key={em} onClick={() => { updateReward(reward.rank, { rewardImage: em }); setEmojiPicker(null); }}
                                    className="text-2xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    {em}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setTab('list')} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePreview} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Eye size={15} /> Preview
              </button>
              <button onClick={handleSave} disabled={!form.title.trim() || !form.endDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {saved ? <><Check size={15} /> Saved!</> : editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        )}

        {/* ─── PREVIEW ─── */}
        {tab === 'preview' && (
          <div className="space-y-5">
            <div className="card overflow-hidden border-2 border-black dark:border-gray-700">
              {/* Banner */}
              <div className={`relative bg-gradient-to-r ${previewEvent.banner} p-6 text-white`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-2">
                        <Trophy size={11} /> LEADERBOARD EVENT
                      </div>
                      <h2 className="text-2xl font-black mb-1">{previewEvent.title || 'Event Title'}</h2>
                      <p className="text-white/80 text-sm max-w-md">{previewEvent.description || 'Event description goes here.'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3">
                      <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-0.5">Ends In</p>
                      <p className="font-black text-xl">10d 4h 20m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                    <span className="flex items-center gap-1"><Calendar size={11} />{previewEvent.startDate} → {previewEvent.endDate}</span>
                    <span className="flex items-center gap-1"><Trophy size={11} />{previewEvent.winnerCount} winners</span>
                  </div>
                </div>
              </div>

              {/* Prize cards */}
              <div className="p-5">
                <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Gift size={16} className="text-purple-500" /> Prize Pool</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {previewEvent.rewards.slice(0, 3).map(r => (
                    <div key={r.rank}
                      className={`rounded-2xl p-4 border-2 text-center ${r.rank === 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : r.rank === 2 ? 'border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800' : 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'}`}>
                      <div className="text-4xl mb-2">{r.rewardImage}</div>
                      <div className={`inline-block text-sm font-black mb-1 ${r.rank === 1 ? 'text-amber-600' : r.rank === 2 ? 'text-gray-500' : 'text-orange-500'}`}>{r.label}</div>
                      <p className="font-black text-gray-900 dark:text-white text-sm">{r.rewardName || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {r.quantity}</p>
                    </div>
                  ))}
                </div>
                {previewEvent.rewards.length > 3 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {previewEvent.rewards.slice(3).map(r => (
                      <div key={r.rank} className="rounded-xl p-2 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <span className="text-lg">{r.rewardImage}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-500">{r.label}</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate">{r.rewardName || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setTab('form')} className="btn-secondary flex-1">← Edit</button>
              <button onClick={handleSave} disabled={!form.title.trim() || !form.endDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {saved ? <><Check size={15} /> Saved!</> : editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRewardEvents;
