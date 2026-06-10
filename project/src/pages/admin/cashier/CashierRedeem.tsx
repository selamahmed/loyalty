import React, { useState, useRef, useEffect } from 'react';
import CashierLayout from './CashierLayout';
import { useInventory, InventoryItem } from '../../../context/InventoryContext';
import {
  Search, CheckCircle, XCircle, AlertCircle, Package,
  Tag, Ticket, Gift, RefreshCw, Clock, ChevronRight,
} from 'lucide-react';

/* ─── Types ─── */
type CheckStatus = 'idle' | 'found_valid' | 'found_expired' | 'found_used' | 'not_found';

interface RedeemRecord {
  code: string;
  title: string;
  image: string;
  ts: string;
}

/* ─── Config ─── */
const typeConfig: Record<string, { color: string; bg: string; icon: React.FC<{ size?: number; color?: string }>; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Tag,    label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Ticket, label: 'Bilet', emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: Gift,   label: 'Ödül',  emoji: '🎁' },
};

function isExpired(expires: string) {
  return new Date(expires).getTime() < Date.now();
}

function daysLeft(expires: string) {
  return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000));
}

/* ─── Main component ─── */
const CashierRedeem: React.FC = () => {
  const { getByCode, markUsed } = useInventory();

  const [code, setCode]           = useState('');
  const [status, setStatus]       = useState<CheckStatus>('idle');
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone]           = useState(false);
  const [log, setLog]             = useState<RedeemRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-focus input on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleCheck = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const item = getByCode(trimmed);
    if (!item) { setStatus('not_found'); setFoundItem(null); return; }

    if (item.used)          { setStatus('found_used');    setFoundItem(item); return; }
    if (isExpired(item.expires)) { setStatus('found_expired'); setFoundItem(item); return; }

    setStatus('found_valid');
    setFoundItem(item);
    setDone(false);
  };

  const handleConfirm = async () => {
    if (!foundItem) return;
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    markUsed(foundItem.id);
    const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setLog(p => [{ code: foundItem.code, title: foundItem.title, image: foundItem.image, ts }, ...p]);
    setConfirming(false);
    setDone(true);
  };

  const handleReset = () => {
    setCode('');
    setStatus('idle');
    setFoundItem(null);
    setDone(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cfg = foundItem ? (typeConfig[foundItem.type] || typeConfig.reward) : null;

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

        {/* ─── Page header ─── */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={26} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl leading-tight">Ürün Teslimi</p>
              <p className="text-white/75 text-sm mt-0.5">
                Müşterinin gösterdiği kodu gir → onayla → ürünü teslim et
              </p>
            </div>
          </div>
        </div>

        {/* ─── Code input ─── */}
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>

          <label className="text-xs font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
            Müşterinin Kodu
          </label>

          {/* Input row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Örn: KPN-2024-ABC"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setFoundItem(null); setDone(false); }}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                className="w-full py-3.5 rounded-xl font-black text-base outline-none tracking-widest"
                style={{
                  paddingLeft: 42, paddingRight: 16,
                  background: 'var(--tab-bg)',
                  border: `2.5px solid ${status === 'found_valid' ? '#22c55e' : status === 'not_found' ? '#ef4444' : 'var(--dark-border)'}`,
                  boxShadow: `0px 3px 0px ${status === 'found_valid' ? '#16a34a' : status === 'not_found' ? '#dc2626' : 'var(--dark-border)'}`,
                  color: 'var(--text-dark)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={!code.trim()}
              className="px-5 py-3 rounded-xl font-black text-white flex-shrink-0 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'linear-gradient(180deg,#22c55e,#16a34a)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
            >
              Kontrol Et
            </button>
          </div>

          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            💡 Enter tuşuna basarak da sorgulayabilirsiniz
          </p>
        </div>

        {/* ─── Result: NOT FOUND ─── */}
        {status === 'not_found' && (
          <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(239,68,68,0.06)', border: '3px solid #ef4444', boxShadow: '0px 5px 0px #dc2626' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#ef4444' }}>
              <XCircle size={22} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg" style={{ color: '#ef4444' }}>Kod Bulunamadı</p>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                "<span className="font-black" style={{ color: '#ef4444', fontFamily: 'monospace' }}>{code}</span>" sistemde kayıtlı değil. Kodu doğru girdiğinizden emin olun.
              </p>
              <button onClick={handleReset} className="mt-3 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-[0.97]"
                style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', color: 'var(--text-dark)' }}>
                <RefreshCw size={14} /> Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* ─── Result: EXPIRED ─── */}
        {status === 'found_expired' && foundItem && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '3px solid #f59e0b', boxShadow: '0px 5px 0px #d97706' }}>
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.1)', borderBottom: '2px solid #f59e0b' }}>
              <AlertCircle size={20} color="#d97706" />
              <p className="font-black" style={{ color: '#d97706' }}>⏰ Süre Dolmuş</p>
            </div>
            <div className="p-5 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2.5px solid var(--dark-border)' }}>
                {foundItem.image
                  ? <img src={foundItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cfg?.emoji}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-base" style={{ color: 'var(--text-dark)', textDecoration: 'line-through', opacity: 0.6 }}>{foundItem.title}</p>
                <p className="font-mono text-sm font-bold mt-0.5" style={{ color: '#f59e0b' }}>{foundItem.code}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                  Son kullanım: {new Date(foundItem.expires).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '2px solid #f59e0b', background: 'rgba(245,158,11,0.04)' }}>
              <p className="text-sm font-bold" style={{ color: '#d97706' }}>Bu ürünün süresi dolmuş, teslim edilemez.</p>
              <button onClick={handleReset} className="px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2"
                style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', color: 'var(--text-dark)' }}>
                <RefreshCw size={13} /> Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* ─── Result: ALREADY USED ─── */}
        {status === 'found_used' && foundItem && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '3px solid #6b7280', boxShadow: '0px 5px 0px #4b5563' }}>
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(107,114,128,0.08)', borderBottom: '2px solid #6b7280' }}>
              <XCircle size={20} color="#6b7280" />
              <p className="font-black" style={{ color: '#6b7280' }}>Zaten Kullanılmış</p>
            </div>
            <div className="p-5 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2.5px solid var(--dark-border)', opacity: 0.5 }}>
                {foundItem.image
                  ? <img src={foundItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cfg?.emoji}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-base" style={{ color: 'var(--text-dark)', opacity: 0.5 }}>{foundItem.title}</p>
                <p className="font-mono text-sm font-bold mt-0.5" style={{ color: '#9ca3af' }}>{foundItem.code}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Bu kod daha önce kullanıldı.</p>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '2px solid #6b7280', background: 'rgba(107,114,128,0.04)' }}>
              <p className="text-sm font-bold" style={{ color: '#6b7280' }}>Bu kod geçersiz — ürün zaten teslim edildi.</p>
              <button onClick={handleReset} className="px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2"
                style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', color: 'var(--text-dark)' }}>
                <RefreshCw size={13} /> Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* ─── Result: VALID — confirm hand-over ─── */}
        {status === 'found_valid' && foundItem && !done && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '3px solid #22c55e', boxShadow: '0px 6px 0px #16a34a', background: 'var(--card-bg)' }}>

            {/* Green "valid" banner */}
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.1)', borderBottom: '2px solid #22c55e' }}>
              <CheckCircle size={20} color="#22c55e" />
              <p className="font-black" style={{ color: '#16a34a' }}>✅ Kod Geçerli — Ürünü Teslim Edebilirsiniz</p>
            </div>

            {/* Item detail */}
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                {/* Photo */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '3px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
                  {foundItem.image
                    ? <img src={foundItem.image} alt={foundItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: cfg?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{cfg?.emoji}</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-white text-xs font-black" style={{ background: cfg?.color }}>
                      {cfg?.label}
                    </span>
                    {(foundItem.quantity ?? 1) > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black" style={{ background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', color: 'var(--text-dark)' }}>
                        ×{foundItem.quantity}
                      </span>
                    )}
                  </div>
                  <p className="font-black text-lg leading-tight" style={{ color: 'var(--text-dark)' }}>{foundItem.title}</p>
                  {foundItem.description && (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{foundItem.description}</p>
                  )}
                  <p className="font-mono text-sm font-bold" style={{ color: cfg?.color }}>{foundItem.code}</p>
                </div>
              </div>

              {/* Expiry info */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.07)', border: '2px solid #22c55e' }}>
                <Clock size={15} color="#22c55e" />
                <p className="text-sm font-bold" style={{ color: '#16a34a' }}>
                  Son kullanım: {new Date(foundItem.expires).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="ml-2 font-black">({daysLeft(foundItem.expires)} gün kaldı)</span>
                </p>
              </div>

              {/* ⬇ THE HANDOVER INSTRUCTION ⬇ */}
              <div className="p-4 rounded-2xl text-center space-y-2"
                style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.05))', border: '2.5px dashed #22c55e' }}>
                <p style={{ fontSize: 38 }}>🎁</p>
                <p className="font-black text-xl" style={{ color: '#16a34a' }}>
                  Müşteriye "{foundItem.title}" teslim edin
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Ürünü verdikten sonra aşağıdaki butona basın — kod kullanıldı olarak işaretlenir.
                </p>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ background: 'linear-gradient(180deg,#22c55e,#16a34a)', border: '3px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)' }}
              >
                {confirming
                  ? <><RefreshCw size={20} className="animate-spin" /> İşleniyor…</>
                  : <><CheckCircle size={22} /> Ürünü Teslim Ettim — Kapat</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ─── SUCCESS: done ─── */}
        {status === 'found_valid' && done && (
          <div className="rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--card-bg)', border: '3px solid #22c55e', boxShadow: '0px 6px 0px #16a34a' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '3px solid #22c55e', boxShadow: '0px 4px 0px #16a34a' }}>
              <CheckCircle size={40} color="#22c55e" />
            </div>
            <div>
              <p className="font-black text-2xl" style={{ color: '#16a34a' }}>Teslim Tamamlandı!</p>
              <p className="text-base font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                Kod sistemde kullanıldı olarak işaretlendi.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-8 py-3.5 rounded-2xl font-black text-white text-base flex items-center gap-2 transition-all active:scale-[0.97]"
              style={{ background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}
            >
              <ChevronRight size={18} /> Yeni Kod Gir
            </button>
          </div>
        )}

        {/* ─── Session log ─── */}
        {log.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '2px solid var(--dark-border)' }}>
              <Package size={15} color="#22c55e" />
              <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Oturum Teslim Kaydı ({log.length})</p>
            </div>
            {log.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: i < log.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--dark-border)' }}>
                  {r.image
                    ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎁</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs truncate" style={{ color: 'var(--text-dark)' }}>{r.title}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.code}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>✓ Teslim</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.ts}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </CashierLayout>
  );
};

export default CashierRedeem;
