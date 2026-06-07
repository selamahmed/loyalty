import React, { useState } from 'react';
import { Package, Ticket, Tag, Gift, Check, Copy, Clock } from 'lucide-react';
import { inventory } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const tabs = [
  { id: 'all', label: tr.inventory.allItems, icon: Package },
  { id: 'coupon', label: tr.inventory.coupons, icon: Tag },
  { id: 'ticket', label: tr.inventory.tickets, icon: Ticket },
  { id: 'reward', label: tr.inventory.rewards, icon: Gift },
];

const typeConfig: Record<string, { color: string; bg: string; icon: React.FC<{ size?: number }> }> = {
  coupon: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Tag },
  ticket: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Ticket },
  reward: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: Gift },
};

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? inventory : inventory.filter(i => i.type === activeTab);
  const active = filtered.filter(i => !i.used);
  const used = filtered.filter(i => i.used);

  const handleCopy = (code: string) => {
    playSound('success');
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.inventory.title}</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={12} className="sm:w-3.5 sm:h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active items */}
      {active.length > 0 ? (
        <div>
          <h2 className="font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">Aktif ({active.length})</h2>
          <div className="space-y-2 sm:space-y-3">
            {active.map(item => {
              const config = typeConfig[item.type];
              const IconComp = config.icon;
              const expired = isExpired(item.expires);

              return (
                <div key={item.id} className={`card p-3 sm:p-4 flex items-start gap-3 sm:gap-4 ${expired ? 'opacity-60' : ''}`}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComp size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      {expired ? (
                        <span className="badge bg-red-100 dark:bg-red-900/30 text-red-500 text-xs flex-shrink-0">Süresi Doldu</span>
                      ) : (
                        <span className={`badge ${config.bg} ${config.color} text-xs flex-shrink-0 capitalize`}>{item.type}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                      <div className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-wider">{item.code}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.code)}
                        disabled={expired}
                        className="p-2 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        {copiedCode === item.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock size={10} />
                      <span>Expires: {new Date(item.expires).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <Package size={36} className="sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-black text-lg sm:text-xl text-gray-500 dark:text-gray-400">Nothing here yet</h3>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-xs sm:text-sm">Complete missions and redeem rewards to fill your inventory.</p>
        </div>
      )}

      {/* Used items */}
      {used.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-500 dark:text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">Kullanılan ({used.length})</h2>
          <div className="space-y-2">
            {used.map(item => {
              const config = typeConfig[item.type];
              const IconComp = config.icon;
              return (
                <div key={item.id} className="card p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 opacity-50">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComp size={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-through">{item.title}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{item.code}</p>
                  </div>
                  <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs flex-shrink-0">Kullanılan</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
