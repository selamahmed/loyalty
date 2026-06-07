import React, { useState } from 'react';
import { Package, Ticket, Tag, Gift, Check, Copy, Clock } from 'lucide-react';
import { inventory } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const tabs = [
  { id: 'all',    label: tr.inventory.allItems, icon: Package, emoji: '🗂️' },
  { id: 'coupon', label: tr.inventory.coupons,  icon: Tag,     emoji: '🏷️' },
  { id: 'ticket', label: tr.inventory.tickets,  icon: Ticket,  emoji: '🎫' },
  { id: 'reward', label: tr.inventory.rewards,  icon: Gift,    emoji: '🎁' },
];

const typeConfig: Record<string, { color: string; bg: string; accent: string; icon: React.FC<{ size?: number; color?: string }> }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  accent: '#3b82f6', icon: Tag },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  accent: '#f59e0b', icon: Ticket },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   accent: '#22c55e', icon: Gift },
};

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? inventory : inventory.filter(i => i.type === activeTab);
  const active = filtered.filter(i => !i.used);
  const used   = filtered.filter(i => i.used);

  const handleCopy = (code: string) => {
    playSound('success');
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>ENVANTER</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🗂️</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.inventory.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Kuponların, biletlerin ve ödüllerin</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { playSound('click'); setActiveTab(tab.id); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer',
                flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.1s',
                background: activeTab === tab.id ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: activeTab === tab.id ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: activeTab === tab.id ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Active items ── */}
        {active.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Aktif</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', fontSize: 11, fontWeight: 900 }}>{active.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map(item => {
                const config = typeConfig[item.type];
                const IconComp = config.icon;
                const expired = isExpired(item.expires);
                return (
                  <div key={item.id} style={{ ...card, padding: '16px 18px', opacity: expired ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 14, background: config.bg,
                        border: `2.5px solid ${config.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: `0 3px 0 ${config.accent}44`,
                      }}>
                        <IconComp size={22} color={config.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0, lineHeight: 1.2 }}>{item.title}</p>
                          {expired ? (
                            <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, color: '#ef4444', flexShrink: 0, textTransform: 'uppercase' }}>Süresi Doldu</span>
                          ) : (
                            <span style={{ padding: '2px 7px', borderRadius: 999, background: config.bg, border: `1.5px solid ${config.accent}`, fontSize: 9, fontWeight: 900, color: config.color, flexShrink: 0, textTransform: 'capitalize' }}>{item.type}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.4 }}>{item.description}</p>

                        {/* Code bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            flex: 1, padding: '9px 12px', background: 'var(--tab-bg)', borderRadius: 10,
                            border: '2px dashed var(--dark-border)', minWidth: 0,
                          }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.1em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(item.code)}
                            disabled={expired}
                            style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: copiedCode === item.code ? 'rgba(34,197,94,0.1)' : 'var(--tab-bg)',
                              border: `2px solid ${copiedCode === item.code ? '#22c55e' : 'var(--dark-border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: expired ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {copiedCode === item.code ? <Check size={16} color="#22c55e" /> : <Copy size={16} color="var(--text-muted)" />}
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                          <Clock size={10} color="var(--text-muted)" />
                          <span style={{ fontSize: 10, color: expired ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                            Son kullanım: {new Date(item.expires).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ ...card, border: '3px dashed var(--dark-border)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>📦</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>Henüz ürün yok</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Görevleri tamamla ve ödülleri kullan.</p>
          </div>
        )}

        {/* ── Used items ── */}
        {used.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Kullanılan</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)' }}>{used.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {used.map(item => {
                const config = typeConfig[item.type];
                const IconComp = config.icon;
                return (
                  <div key={item.id} style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: config.bg,
                      border: `2px solid ${config.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <IconComp size={16} color={config.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', margin: '0 0 2px' }}>{item.title}</p>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</span>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>Kullanıldı</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Inventory;
