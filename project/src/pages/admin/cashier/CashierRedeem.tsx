import React, { useState, useRef, useEffect } from 'react';
import CashierLayout from './CashierLayout';
import { useInventory, InventoryItem } from '../../../context/InventoryContext';
import {
  Search, CheckCircle, XCircle, AlertCircle, Package,
  Tag, Ticket, Gift, RefreshCw, Clock, ChevronRight, History,
} from 'lucide-react';

/* ─── Types ─── */
type CheckStatus = 'idle' | 'found_valid' | 'found_expired' | 'found_used' | 'not_found';

interface RedeemRecord {
  code: string;
  title: string;
  image: string;
  ts: string;
  customerName?: string;
}

/* ─── Config ─── */
const typeConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Tag,    label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Ticket, label: 'Bilet', emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: Gift,   label: 'Ödül',  emoji: '🎁' },
};

/* ─── Mock history seed data ─── */
const SEED_HISTORY: RedeemRecord[] = [
  { code: 'ESPRESSO2024', title: 'Free Espresso Shot',  image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=100&q=80', ts: '14:32', customerName: 'Ayşe K.'    },
  { code: 'CAPPUCCINO42', title: 'Cappuccino Voucher',  image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100&q=80', ts: '13:15', customerName: 'Mehmet T.'  },
  { code: 'CROISSANT99',  title: 'Croissant Voucher',   image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100&q=80', ts: '11:48', customerName: 'Zeynep A.'  },
  { code: 'CAFE15OFF',    title: '%15 İndirim Kuponu',  image: '', ts: '10:22', customerName: 'Ali R.'      },
  { code: 'COLDBREW22',   title: 'Free Cold Brew',      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&q=80', ts: '09:05', customerName: 'Fatma S.'   },
];

function isExpired(expires: string) { return new Date(expires).getTime() < Date.now(); }
function daysLeft(expires: string)  { return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000)); }

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ─── Main component ─── */
const CashierRedeem: React.FC = () => {
  const { getByCode, markUsed } = useInventory();

  const [code, setCode]           = useState('');
  const [status, setStatus]       = useState<CheckStatus>('idle');
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone]           = useState(false);
  const [log, setLog]             = useState<RedeemRecord[]>(SEED_HISTORY);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleCheck = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const item = getByCode(trimmed);
    if (!item)                    { setStatus('not_found');    setFoundItem(null); return; }
    if (item.used)                { setStatus('found_used');   setFoundItem(item); return; }
    if (isExpired(item.expires))  { setStatus('found_expired'); setFoundItem(item); return; }
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
    setLog(p => [{ code: foundItem.code, title: foundItem.title, image: foundItem.image, ts, customerName: 'Müşteri' }, ...p]);
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
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ─── Page header ─── */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', padding: 'clamp(18px,4vw,26px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={26} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>KASA PANELİ</p>
              <p style={{ fontWeight: 900, fontSize: 20, color: 'white', margin: 0, lineHeight: 1.1 }}>Ürün Teslimi</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '3px 0 0', fontWeight: 600 }}>Müşterinin kodunu gir → onayla → teslim et</p>
            </div>
          </div>
        </div>

        {/* ─── Code input ─── */}
        <div style={{ ...card, padding: '20px' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>MÜŞTERİNİN KODU</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Örn: KPN-2024-ABC"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setFoundItem(null); setDone(false); }}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                style={{
                  width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                  borderRadius: 14, fontWeight: 900, fontSize: 15, outline: 'none',
                  background: 'var(--tab-bg)',
                  border: `2.5px solid ${status === 'found_valid' ? '#22c55e' : status === 'not_found' ? '#ef4444' : 'var(--dark-border)'}`,
                  boxShadow: `0px 4px 0px ${status === 'found_valid' ? '#16a34a' : status === 'not_found' ? '#dc2626' : 'var(--dark-border)'}`,
                  color: 'var(--text-dark)', fontFamily: 'monospace', letterSpacing: '0.08em',
                  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={!code.trim()}
              style={{
                padding: '13px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0,
                background: 'linear-gradient(180deg,#22c55e,#16a34a)',
                border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)',
                cursor: code.trim() ? 'pointer' : 'not-allowed', opacity: code.trim() ? 1 : 0.55,
                transition: 'all 0.1s',
              }}
            >
              Kontrol Et
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '10px 0 0', fontWeight: 600 }}>💡 Enter tuşuyla da sorgulayabilirsiniz</p>
        </div>

        {/* ─── NOT FOUND ─── */}
        {status === 'not_found' && (
          <div style={{ ...card, background: 'rgba(239,68,68,0.04)', border: '3px solid #ef4444', boxShadow: '0px 5px 0px #dc2626', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ef4444', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XCircle size={22} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 16, color: '#ef4444', margin: '0 0 4px' }}>Kod Bulunamadı</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                "<span style={{ fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>{code}</span>" sistemde kayıtlı değil.
              </p>
              <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 900, color: 'var(--text-dark)', background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', cursor: 'pointer' }}>
                <RefreshCw size={13} /> Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* ─── EXPIRED ─── */}
        {status === 'found_expired' && foundItem && (
          <div style={{ ...card, border: '3px solid #f59e0b', boxShadow: '0px 5px 0px #d97706', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(245,158,11,0.1)', borderBottom: '2px solid #f59e0b', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="#d97706" />
              <p style={{ fontWeight: 900, fontSize: 14, color: '#d97706', margin: 0 }}>⏰ Süre Dolmuş — Teslim Edilemez</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', border: '2.5px solid var(--dark-border)', flexShrink: 0, opacity: 0.5 }}>
                {foundItem.image ? <img src={foundItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cfg?.emoji}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 4px', textDecoration: 'line-through', opacity: 0.6 }}>{foundItem.title}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#f59e0b', margin: '0 0 4px', fontWeight: 700 }}>{foundItem.code}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Son kullanım: {new Date(foundItem.expires).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={handleReset} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 900, color: 'var(--text-dark)', background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <RefreshCw size={12} /> Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* ─── ALREADY USED ─── */}
        {status === 'found_used' && foundItem && (
          <div style={{ ...card, border: '3px solid #6b7280', boxShadow: '0px 5px 0px #4b5563', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(107,114,128,0.08)', borderBottom: '2px solid #6b7280', display: 'flex', alignItems: 'center', gap: 10 }}>
              <XCircle size={18} color="#6b7280" />
              <p style={{ fontWeight: 900, fontSize: 14, color: '#6b7280', margin: 0 }}>Zaten Kullanılmış — Geçersiz Kod</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', border: '2.5px solid var(--dark-border)', flexShrink: 0, opacity: 0.45 }}>
                {foundItem.image ? <img src={foundItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cfg?.emoji}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 4px', opacity: 0.5 }}>{foundItem.title}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#9ca3af', margin: '0 0 4px', fontWeight: 700 }}>{foundItem.code}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Bu kod daha önce kullanıldı.</p>
              </div>
              <button onClick={handleReset} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 900, color: 'var(--text-dark)', background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <RefreshCw size={12} /> Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* ─── VALID — confirm handover ─── */}
        {status === 'found_valid' && foundItem && !done && (
          <div style={{ ...card, border: '3px solid #22c55e', boxShadow: '0px 6px 0px #16a34a', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(34,197,94,0.1)', borderBottom: '2px solid #22c55e', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={18} color="#22c55e" />
              <p style={{ fontWeight: 900, fontSize: 14, color: '#16a34a', margin: 0 }}>✅ Kod Geçerli — Ürünü Teslim Edebilirsiniz</p>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 88, height: 88, borderRadius: 18, overflow: 'hidden', border: '3px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)', flexShrink: 0 }}>
                  {foundItem.image ? <img src={foundItem.image} alt={foundItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: cfg?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{cfg?.emoji}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 999, background: cfg?.color, color: 'white', fontSize: 11, fontWeight: 900 }}>{cfg?.label}</span>
                    {(foundItem.quantity ?? 1) > 1 && (
                      <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', fontSize: 11, fontWeight: 900, color: 'var(--text-dark)' }}>×{foundItem.quantity}</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.1 }}>{foundItem.title}</p>
                  {foundItem.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.4 }}>{foundItem.description}</p>}
                  <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: cfg?.color, margin: 0 }}>{foundItem.code}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.07)', border: '2px solid #22c55e', marginBottom: 16 }}>
                <Clock size={14} color="#22c55e" />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', margin: 0 }}>
                  Son kullanım: {new Date(foundItem.expires).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span style={{ fontWeight: 900, marginLeft: 8 }}>({daysLeft(foundItem.expires)} gün kaldı)</span>
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: 18, textAlign: 'center', background: 'linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.04))', border: '2.5px dashed #22c55e', marginBottom: 16 }}>
                <p style={{ fontSize: 40, margin: '0 0 8px' }}>🎁</p>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#16a34a', margin: '0 0 4px' }}>"{foundItem.title}" teslim edin</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Ürünü verdikten sonra aşağıdaki butona basın.</p>
              </div>

              <button
                onClick={handleConfirm}
                disabled={confirming}
                style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 900, fontSize: 16, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(180deg,#22c55e,#16a34a)', border: '3px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)', cursor: confirming ? 'not-allowed' : 'pointer', opacity: confirming ? 0.75 : 1, transition: 'all 0.1s' }}
              >
                {confirming ? <><RefreshCw size={20} className="animate-spin" /> İşleniyor…</> : <><CheckCircle size={22} /> Ürünü Teslim Ettim — Kapat</>}
              </button>
            </div>
          </div>
        )}

        {/* ─── SUCCESS ─── */}
        {status === 'found_valid' && done && (
          <div style={{ ...card, border: '3px solid #22c55e', boxShadow: '0px 6px 0px #16a34a', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '3px solid #22c55e', boxShadow: '0px 4px 0px #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={40} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 24, color: '#16a34a', margin: '0 0 6px' }}>Teslim Tamamlandı! 🎉</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Kod sistemde kullanıldı olarak işaretlendi.</p>
            </div>
            <button onClick={handleReset} style={{ padding: '13px 28px', borderRadius: 16, fontWeight: 900, fontSize: 14, color: 'white', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)', cursor: 'pointer' }}>
              <ChevronRight size={16} /> Yeni Kod Gir
            </button>
          </div>
        )}

        {/* ─── Delivery history ─── */}
        <div style={{ ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>KAYIT</p>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={16} color="#22c55e" />
                Teslim Geçmişi
                <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', border: '1.5px solid #22c55e', fontSize: 11, fontWeight: 900, color: '#16a34a' }}>{log.length}</span>
              </p>
            </div>
          </div>

          {log.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 36, margin: '0 0 8px' }}>📦</p>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 4px' }}>Henüz teslimat yok</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Bu oturumda yapılan teslimler burada görünecek</p>
            </div>
          ) : (
            <div>
              {log.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < log.length - 1 ? '1.5px dashed var(--divider-dash)' : 'none', transition: 'background 0.1s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '2.5px solid var(--dark-border)', flexShrink: 0, background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🎁</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>{r.code}</p>
                    {r.customerName && <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 600 }}>{r.customerName}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22c55e', fontSize: 11, fontWeight: 900, color: '#16a34a' }}>
                      ✓ Teslim
                    </span>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 600 }}>{r.ts}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </CashierLayout>
  );
};

export default CashierRedeem;

