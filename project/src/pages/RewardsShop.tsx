import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, ShoppingCart, X, Check, ArrowRight, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { getRewards } from '../services/rewards';
import { purchaseReward } from '../services/redemptions';
import type { Reward } from '../services/rewards';
import { playSound } from '../lib/sounds';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { WinningParticles } from '../components/WinningParticles';
import PageMainSticker from '../components/PageMainSticker';
import { activityLogService } from '../lib/activityLogger';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Buy modal ── */
interface BuyModalProps {
  reward: Reward;
  onConfirm: () => void;
  onClose: () => void;
  canAfford: boolean;
  submitting?: boolean;
  error?: string | null;
}

interface CelebrationState {
  title: string;
  code: string;
  points: number;
}

const BuyModal: React.FC<BuyModalProps> = ({ reward, onConfirm, onClose, canAfford, submitting = false, error }) => (
  <div
    className="shop-buy-modal-overlay"
    style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="shop-buy-modal" style={{ ...card, maxWidth: 380, width: '100%', padding: 24, animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
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
      <div className="shop-buy-modal__media" style={{ height: 160, borderRadius: 14, overflow: 'hidden', border: '3px solid var(--dark-border)', marginBottom: 16, boxShadow: '0 4px 0 var(--dark-border)' }}>
        {reward.image ? (
          <img src={reward.image} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎁</div>
        )}
      </div>

      <h4 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 5px' }}>{reward.title}</h4>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.55 }}>{reward.description}</p>

      {/* Ticket notice */}
      <div className="shop-buy-modal__notice" style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.07)', border: '2px solid #22c55e', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={14} color="#16a34a" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Bilet olarak envanterine eklenir</span>
      </div>

      {/* Cost */}
      <div className="shop-buy-modal__cost" style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '2.5px solid #f59e0b', borderRadius: 14, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      {error && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.45 }}>
          {error}
        </p>
      )}

      <div className="shop-buy-modal__actions" style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}
        >
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={!canAfford || submitting}
          style={{
            flex: 2, padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14,
            background: canAfford && !submitting ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
            color: canAfford && !submitting ? 'white' : 'var(--text-muted)',
            border: '3px solid var(--dark-border)',
            boxShadow: canAfford && !submitting ? '0 4px 0 var(--dark-border)' : 'none',
            cursor: canAfford && !submitting ? 'pointer' : 'not-allowed',
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
  const { points, spendPoints, showRewardPopup, soundEnabled } = useApp();
  const { authUser, profile, refreshProfile } = useAuth();
  const { reload: reloadInventory } = useInventory();
  const [search, setSearch]             = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [celebration, setCelebration]   = useState<CelebrationState | null>(null);
  const [rewards, setRewards]           = useState<Reward[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [buyLoading, setBuyLoading]     = useState(false);
  const [buyError, setBuyError]         = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getRewards().then(setRewards).catch(() => setRewards([])).finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return rewards.filter(r => !q || [r.title, r.description, r.category].some(value => (value ?? '').toLowerCase().includes(q)));
  }, [rewards, debouncedSearch]);

  const affordableCount = useMemo(() => filtered.filter(r => points >= r.points).length, [filtered, points]);
  const limitedCount = useMemo(() => filtered.filter(r => r.limited).length, [filtered]);

  const playClick = () => { if (soundEnabled) playSound('click'); };

  const handleBuy = async () => {
    if (!selectedReward || !authUser?.id || buyLoading) return;
    setBuyLoading(true);
    setBuyError(null);
    try {
      const redemption = await purchaseReward(selectedReward.id);
      spendPoints(selectedReward.points);
      await Promise.all([reloadInventory(), refreshProfile()]);
      setSuccess(selectedReward.title);
      setCelebration({
        title: selectedReward.title,
        code: redemption.code,
        points: selectedReward.points,
      });
      setShowParticles(false);
      window.setTimeout(() => setShowParticles(true), 20);
      if (soundEnabled) {
        playSound('redeem');
        window.setTimeout(() => playSound('reward'), 180);
        window.setTimeout(() => playSound('success'), 420);
      }
      showRewardPopup({
        type: 'redeem',
        title: 'Bilet hazır!',
        subtitle: `${selectedReward.title} envanterine eklendi. Kod: ${redemption.code}`,
      });
      // Audit log
      void activityLogService.logActivity({
        userId: authUser.id,
        username: profile?.username ?? authUser.email ?? 'User',
        email: authUser.email ?? '',
        role: profile?.role ?? 'customer',
        action: `Ödül satın alındı: ${selectedReward.title} (${selectedReward.points} puan)`,
        actionType: 'points_spent',
        details: {
          rewardId: selectedReward.id,
          rewardTitle: selectedReward.title,
          rewardCategory: selectedReward.category,
          pointsSpent: selectedReward.points,
          redemptionCode: redemption.code,
        },
        amount: selectedReward.points,
      });
      setSelectedReward(null);
      setTimeout(() => {
        setShowParticles(false);
        setSuccess(null);
        setCelebration(null);
      }, 3600);
    } catch (err) {
      console.error('Purchase failed:', err);
      if (soundEnabled) playSound('error');
      setBuyError((err as Error).message ?? 'Ödül satın alınamadı.');
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <div className="shop-auth-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="shop-ghost-watermark" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>MAĞAZA</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🛍️" />
      <WinningParticles trigger={showParticles} emoji="🎟️" count={72} intensity="mega" />
      {celebration && (
        <div className="redeem-celebration" aria-live="polite">
          <div className="redeem-celebration__halo" />
          <div className="redeem-celebration__ticket">
            <span className="redeem-celebration__emoji">🎟️</span>
            <div>
              <p className="redeem-celebration__eyebrow">Ticket unlocked</p>
              <h3>{celebration.title}</h3>
              <p className="redeem-celebration__code">{celebration.code}</p>
            </div>
            <span className="redeem-celebration__spark">✨</span>
          </div>
          <div className="redeem-celebration__coins">
            <span>-{celebration.points.toLocaleString()} pts</span>
            <span>Envantere eklendi</span>
          </div>
        </div>
      )}
        {selectedReward && (
        <BuyModal
          reward={selectedReward}
          onConfirm={() => void handleBuy()}
          onClose={() => {
            if (buyLoading) return;
            setBuyError(null);
            setSelectedReward(null);
          }}
          canAfford={points >= selectedReward.points}
          submitting={buyLoading}
          error={buyError}
        />
      )}

      <div
        className="page-enter shop-auth-content"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 768, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
      >

        {/* ── Page header ── */}
        <div className="shop-page-header" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>🛍️</div>
          <div className="shop-page-header__copy">
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, color: 'var(--text-dark)', lineHeight: 1.1 }}>Ürün Mağazası</h1>
            <p className="shop-page-header__subtitle">Puanlarını bilete çevir, kasada QR ile kullan.</p>
          </div>
          <div className="shop-page-header__points">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{points.toLocaleString()} pts</span>
          </div>
        </div>

        <div
          className="sticker-hero sticker-hero--balance shop-balance-card"
          style={{
            border: '3px solid var(--dark-border)',
            boxShadow: '0px 6px 0px var(--dark-border)',
            borderRadius: 20,
            position: 'relative',
            background: 'linear-gradient(135deg,#ec4899 0%,#f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '18px 20px',
            minHeight: 96,
            overflow: 'visible',
          }}
        >
          <div
            className="sticker-hero--balance__content"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
              zIndex: 2,
            }}
          >
            <Star size={26} fill="white" color="white" style={{ flexShrink: 0 }} />
            <div>
              <p className="shop-balance-card__label">Mevcut Puan</p>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>
                {points.toLocaleString()} <span style={{ fontSize: 14, opacity: 0.8, fontWeight: 700 }}>pts</span>
              </p>
            </div>
          </div>
          <PageMainSticker page="shop" variant="hero-inline" />
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
        <div className="shop-search" style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Ürün ara"
            style={{
              width: '100%', padding: search ? '13px 44px 13px 44px' : '13px 16px 13px 44px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              background: 'var(--card-bg)', color: 'var(--text-dark)',
              border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
          {search && (
            <button
              className="shop-search__clear"
              onClick={() => setSearch('')}
              aria-label="Aramayı temizle"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Results label ── */}
        <div className="shop-results-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, margin: 0 }}>
            <span style={{ fontWeight: 900, color: 'var(--text-dark)' }}>{filtered.length}</span> ürün gösteriliyor
          </p>
          <div className="shop-results-bar__chips">
            <span>{affordableCount} alınabilir</span>
            {limitedCount > 0 && <span>{limitedCount} sınırlı</span>}
          </div>
        </div>

        {/* ── Products grid ── */}
        {isLoading ? (
          <div style={{ ...card, padding: '56px 24px', textAlign: 'center' }}>
            <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: '56px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>🔍</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>Ürün bulunamadı</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Farklı bir arama dene</p>
          </div>
        ) : (
          <div className="shop-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
            {filtered.map((reward, index) => {
              const canAfford = points >= reward.points;
              return (
                <div
                  key={reward.id}
                  onClick={() => { playClick(); setBuyError(null); setSelectedReward(reward); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playClick();
                      setBuyError(null);
                      setSelectedReward(reward);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${reward.title}, ${reward.points.toLocaleString()} puan`}
                  className={`press-card shop-product-card ${canAfford ? 'shop-product-card--available' : 'shop-product-card--locked'}`}
                  style={{
                    ...card, overflow: 'hidden', cursor: 'pointer',
                    animation: `shopFadeIn 0.3s ease-out ${index * 0.03}s both`,
                  }}
                >
                  {/* Product image */}
                  <div className="shop-product-card__media" style={{ position: 'relative', height: 130, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)' }}>
                    {reward.image ? (
                      <img src={reward.image} alt={reward.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎁</div>
                    )}
                    {reward.limited && (
                      <span className="shop-product-card__badge">SINIRLI</span>
                    )}
                    {!canAfford && (
                      <div className="shop-product-card__lock">
                        <span>Yetersiz Puan</span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="shop-product-card__body" style={{ padding: '12px 14px 14px' }}>
                    <p className="shop-product-card__title" style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.25 }}>{reward.title}</p>
                    <p className="shop-product-card__desc" style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reward.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>{reward.points.toLocaleString()}</span>
                      </div>
                      <div className="shop-product-card__cta" style={{
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
