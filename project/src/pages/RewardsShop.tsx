import React, { useState } from 'react';
import { Search, Star, ShoppingCart, X, Check, ArrowRight, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useInventory } from '../context/InventoryContext';
import { rewards } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { WinningParticles } from '../components/WinningParticles';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const categories = [
  { id: 'all',      label: 'Tümü',        emoji: '🛍️' },
  { id: 'coffee',   label: 'Kahve',       emoji: '☕' },
  { id: 'hot',      label: 'Sıcak İçecek', emoji: '🫖' },
  { id: 'drinks',   label: 'Soğuk İçecek', emoji: '🥤' },
  { id: 'pastries', label: 'Pastane',     emoji: '🥐' },
  { id: 'food',     label: 'Yemek',       emoji: '🍔' },
];

/* ── Buy modal ── */
interface BuyModalProps {
  reward: typeof rewards[0];
  onConfirm: () => void;
  onClose: () => void;
  canAfford: boolean;
}

const BuyModal: React.FC<BuyModalProps> = ({ reward, onConfirm, onClose, canAfford }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div style={{ ...card, maxWidth: 380, width: '100%', padding: 24, animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>SATIN ALMA</p>
          <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: 0 }}>Onayla</h3>
        </div>
        <button
          onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* Product image */}
      <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', border: '3px solid var(--dark-border)', marginBottom: 16, boxShadow: '0 4px 0 var(--dark-border)' }}>
        <img src={reward.image} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <h4 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 5px' }}>{reward.title}</h4>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.55 }}>{reward.description}</p>

      {/* Ticket notice */}
      <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.07)', border: '2px solid #22c55e', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={14} color="#16a34a" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Bilet olarak envanterine eklenir</span>
      </div>

      {/* Cost */}
      <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '2.5px solid #f59e0b', borderRadius: 14, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#d97706' }}>Puan Maliyeti</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Star size={16} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontWeight: 900, fontSize: 17, color: '#d97706' }}>{reward.points.toLocaleString()}</span>
        </div>
      </div>

      {!canAfford && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', fontWeight: 700, margin: '0 0 12px' }}>
          ⚠️ Yeterli puanın yok. Daha fazla puan kazan!
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}
        >
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={!canAfford}
          style={{
            flex: 2, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14,
            background: canAfford ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
            color: canAfford ? 'white' : 'var(--text-muted)',
            border: '3px solid var(--dark-border)',
            boxShadow: canAfford ? '0 4px 0 var(--dark-border)' : 'none',
            cursor: canAfford ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <ShoppingCart size={15} /> Satın Al
        </button>
      </div>
    </div>
  </div>
);

/* ── Main page ── */
const RewardsShop: React.FC = () => {
  const { points, spendPoints, showRewardPopup } = useApp();
  const { addItem } = useInventory();
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState('all');
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const filtered = rewards.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === 'all' || r.category === category;
    return matchSearch && matchCat;
  });

  const handleBuy = () => {
    if (!selectedReward) return;
    const spent = spendPoints(selectedReward.points);
    if (!spent) return;

    const expiryDate = selectedReward.expiresAt
      ? selectedReward.expiresAt
      : new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

    addItem({
      type: 'ticket',
      title: selectedReward.title,
      description: selectedReward.description,
      expires: expiryDate,
      code: `TKT-${selectedReward.id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      used: false,
      quantity: 1,
      image: selectedReward.image,
      points: selectedReward.points,
      barcode: `BC${Date.now()}`,
    });

    showRewardPopup({ type: 'reward', title: '🎉 Satın Alındı!', subtitle: `${selectedReward.title} envanterinize eklendi`, points: selectedReward.points });
    playSound('level-up');
    setShowParticles(true);
    setSuccess(selectedReward.title);
    setSelectedReward(null);
    setTimeout(() => { setShowParticles(false); setSuccess(null); }, 3000);
  };

  const canAffordCount = rewards.filter(r => points >= r.points).length;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>MAĞAZA</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🛍️" />
      {selectedReward && (
        <BuyModal
          reward={selectedReward}
          onConfirm={handleBuy}
          onClose={() => setSelectedReward(null)}
          canAfford={points >= selectedReward.points}
        />
      )}

      <div
        className="page-enter"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 768, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
      >

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>🛍️</div>
          <div>
            <p className="section-label">ÖDÜL MAĞAZASI</p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, color: 'var(--text-dark)', lineHeight: 1.1 }}>Ürün Mağazası</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Puanlarınla ürün satın al</p>
          </div>
        </div>

        {/* ── Balance banner ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)',
          padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -25, right: -25, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <Star size={32} fill="white" color="white" />
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Mevcut Bakiye</p>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 30, margin: 0, lineHeight: 1 }}>{points.toLocaleString()} <span style={{ fontSize: 14, opacity: 0.75, fontWeight: 700 }}>pts</span></p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 900, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ALINA BİLİR</p>
            <p style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1 }}>{canAffordCount}</p>
          </div>
        </div>

        {/* ── Success toast ── */}
        {success && (
          <div style={{ ...card, border: '3px solid #22c55e', boxShadow: '0 6px 0 #16a34a', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,0.06)', animation: 'modalPop 0.2s ease-out' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#22c55e', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>🎉 {success} satın alındı!</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Bilet envanterinize eklendi</p>
            </div>
          </div>
        )}

        {/* ── Search ── */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              background: 'var(--card-bg)', color: 'var(--text-dark)',
              border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
        </div>

        {/* ── Categories ── */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { playSound('click'); setCategory(cat.id); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 12, fontWeight: 900, fontSize: 12,
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.12s',
                background: category === cat.id ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: category === cat.id ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: category === cat.id ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Results label ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, margin: 0 }}>
            <span style={{ fontWeight: 900, color: 'var(--text-dark)' }}>{filtered.length}</span> ürün gösteriliyor
          </p>
          {search && (
            <button onClick={() => setSearch('')} style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Temizle ✕
            </button>
          )}
        </div>

        {/* ── Products grid ── */}
        {filtered.length === 0 ? (
          <div style={{ ...card, padding: '56px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>🔍</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>Ürün bulunamadı</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Farklı bir arama veya kategori dene</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
            {filtered.map((reward, index) => {
              const canAfford = points >= reward.points;
              return (
                <div
                  key={reward.id}
                  onClick={() => { playSound('click'); setSelectedReward(reward); }}
                  className="press-card"
                  style={{
                    ...card, overflow: 'hidden', cursor: 'pointer',
                    animation: `shopFadeIn 0.3s ease-out ${index * 0.03}s both`,
                    opacity: canAfford ? 1 : 0.7,
                  }}
                >
                  {/* Product image */}
                  <div style={{ position: 'relative', height: 130, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)' }}>
                    <img src={reward.image} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {reward.limited && (
                      <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 999, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SINIRLI</span>
                    )}
                    {!canAfford && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: 'white', padding: '4px 10px', background: 'rgba(0,0,0,0.55)', borderRadius: 999 }}>Yetersiz Puan</span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ padding: '12px 14px 14px' }}>
                    <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.25 }}>{reward.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reward.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>{reward.points.toLocaleString()}</span>
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: canAfford ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
                        border: '2px solid var(--dark-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ArrowRight size={13} color={canAfford ? 'white' : 'var(--text-muted)'} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shopFadeIn { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modalPop   { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default RewardsShop;
