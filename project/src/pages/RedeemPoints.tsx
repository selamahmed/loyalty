import React, { useState } from 'react';
import { Star, Check, X, Gift, Tag, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

const conversionOptions = [
  { id: '1', label: '$5 Gift Card', points: 500, value: '$5.00', icon: '💳' },
  { id: '2', label: '$10 Gift Card', points: 1000, value: '$10.00', icon: '💳' },
  { id: '3', label: '$25 Gift Card', points: 2500, value: '$25.00', icon: '💳' },
  { id: '4', label: '10% Discount', points: 200, value: '10% OFF', icon: '🏷️' },
  { id: '5', label: '20% Discount', points: 400, value: '20% OFF', icon: '🏷️' },
  { id: '6', label: 'Free Delivery', points: 150, value: 'Free Ship', icon: '🚚' },
];

interface ConfirmModalProps {
  item: typeof conversionOptions[0];
  couponCode?: string;
  onConfirm: () => void;
  onClose: () => void;
  canAfford: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ item, couponCode, onConfirm, onClose, canAfford }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div className="animate-bounce-in card max-w-sm w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-lg text-gray-900 dark:text-white">Confirm Redemption</h3>
        <button onClick={onClose} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{item.icon}</div>
        <h4 className="font-black text-xl text-gray-900 dark:text-white">{item.label}</h4>
        <p className="text-[#7B6EF6] dark:text-[#4F8EF7] font-bold mt-1">{item.value}</p>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="font-black text-amber-600 dark:text-amber-400">{item.points.toLocaleString()} pts</span>
          </div>
        </div>
      </div>

      {!canAfford && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-700">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Insufficient points</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={!canAfford} className="btn-primary flex-1 disabled:opacity-50">Confirm</button>
      </div>
    </div>
  </div>
);

const SuccessModal: React.FC<{ item: typeof conversionOptions[0]; code: string; onClose: () => void }> = ({ item, code, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div className="animate-bounce-in card max-w-sm w-full p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500 border-2 border-black dark:border-gray-600 flex items-center justify-center mx-auto mb-4">
        <Check size={40} className="text-white" />
      </div>
      <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-2">Redeemed!</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Your {item.label} is ready to use.</p>

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 mb-6">
        <p className="text-xs text-gray-500 mb-1">Your Code</p>
        <p className="font-mono font-black text-2xl tracking-widest text-gray-900 dark:text-white">{code}</p>
      </div>

      <button onClick={onClose} className="btn-primary w-full">
        Done
      </button>
    </div>
  </div>
);

const RedeemPoints: React.FC = () => {
  const { points, spendPoints } = useApp();
  const [selected, setSelected] = useState<typeof conversionOptions[0] | null>(null);
  const [success, setSuccess] = useState<{ item: typeof conversionOptions[0]; code: string } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validCoupons: Record<string, { bonus: number; label: string }> = {
    'BONUS50': { bonus: 50, label: '50 Bonus Points' },
    'WELCOME100': { bonus: 100, label: '100 Welcome Bonus' },
    'SUMMER25': { bonus: 25, label: '25 Summer Bonus' },
  };

  const handleConfirm = () => {
    if (!selected) return;
    const ok = spendPoints(selected.points);
    if (ok) {
      const code = Math.random().toString(36).slice(2, 10).toUpperCase();
      setSuccess({ item: selected, code });
    }
    setSelected(null);
  };

  const handleCoupon = () => {
    const coupon = validCoupons[couponInput.trim().toUpperCase()];
    if (coupon) {
      setCouponMsg({ type: 'success', text: `+${coupon.bonus} points added! (${coupon.label})` });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid or expired coupon code.' });
    }
    setTimeout(() => setCouponMsg(null), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      {selected && (
        <ConfirmModal
          item={selected}
          onConfirm={handleConfirm}
          onClose={() => setSelected(null)}
          canAfford={points >= selected.points}
        />
      )}
      {success && (
        <SuccessModal
          item={success.item}
          code={success.code}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Redeem Points</h1>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700">
          <Star size={14} className="text-amber-500" fill="currentColor" />
          <span className="font-black text-amber-600 dark:text-amber-400">{points.toLocaleString()}</span>
        </div>
      </div>

      {/* Conversion rates */}
      <div>
        <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Convert Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conversionOptions.map(opt => {
            const canAfford = points >= opt.points;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt)}
                className={`card p-4 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${!canAfford ? 'opacity-60' : 'hover:scale-[1.01]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-sm text-[#7B6EF6] dark:text-[#4F8EF7] font-bold">{opt.value}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{opt.points.toLocaleString()} pts</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${canAfford ? 'text-green-500' : 'text-red-400'}`}>
                    {canAfford ? <Check size={12} /> : <AlertCircle size={12} />}
                    {canAfford ? 'Available' : 'Need more'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coupon code input */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={18} className="text-[#7B6EF6] dark:text-[#4F8EF7]" />
          <h3 className="font-black text-gray-900 dark:text-white">Redeem Coupon</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Enter a coupon code to get bonus points.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code..."
            value={couponInput}
            onChange={e => setCouponInput(e.target.value)}
            className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && handleCoupon()}
          />
          <button onClick={handleCoupon} className="btn-primary px-4">
            <ArrowRight size={16} />
          </button>
        </div>
        {couponMsg && (
          <div className={`mt-2 p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            couponMsg.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
          }`}>
            {couponMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
            {couponMsg.text}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">Try: BONUS50, WELCOME100, SUMMER25</p>
      </div>
    </div>
  );
};

export default RedeemPoints;
