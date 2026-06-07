import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface SystemSettings {
  id: string;
  exchange_rate: number;
  qr_points_value: number;
  game_multiplier: number;
  referral_bonus: number;
  daily_limit: number;
  money_to_points_rate: number;
}

const defaultSettings: SystemSettings = {
  id: '1',
  exchange_rate: 10,
  qr_points_value: 75,
  game_multiplier: 1.5,
  referral_bonus: 200,
  daily_limit: 1000,
  money_to_points_rate: 10,
};

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setSettings(defaultSettings);
    setFormData(defaultSettings);
    setLoading(false);
  };

  const handleChange = (field: keyof SystemSettings, value: string) => {
    const numValue = field === 'exchange_rate' || field === 'game_multiplier'
      ? parseFloat(value)
      : parseInt(value);

    setFormData(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? '' : numValue
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSettings(formData as SystemSettings);
    setMessage({ type: 'success', text: 'Settings updated successfully! (demo mode)' });
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  };

  const isModified = JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7B6EF6]/10 flex items-center justify-center">
            <Settings size={20} className="text-[#7B6EF6]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Sistem Ayarları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Puanlar ve ödülleri parametrelerini yapılandırın</p>
          </div>
        </div>

        {loading ? (
          <div className="card p-8 flex items-center justify-center gap-3">
            <Loader size={20} className="animate-spin text-[#7B6EF6]" />
            <span className="text-gray-600 dark:text-gray-400">Ayarlar yükleniyor...</span>
          </div>
        ) : (
          <>
            {message && (
              <div className={`card p-4 flex items-center gap-3 border-2 ${
                message.type === 'success'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                )}
                <p className={`text-sm font-600 ${
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {/* Exchange Rate */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-2">
                    Dönüşüm Oranı
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Harcanan 1 TL başına verilen puanlar (örn: 10 = 1 TL başına 10 puan)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.exchange_rate || ''}
                      onChange={e => handleChange('exchange_rate', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">puan/TL</span>
                  </div>
                </div>
              </div>

              {/* QR Points */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-2">
                    QR Tarama Temel Puanları
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    QR kodu her taramada verilen temel puanlar
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.qr_points_value || ''}
                      onChange={e => handleChange('qr_points_value', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">puan</span>
                  </div>
                </div>
              </div>

              {/* Game Multiplier */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-2">
                    Oyun Puanları Çarpanı
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Oyun kazançları için çarpan (örn: 1.5x = oyun puanlarında %50 bonus)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.game_multiplier || ''}
                      onChange={e => handleChange('game_multiplier', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">x</span>
                  </div>
                </div>
              </div>

              {/* Referral Bonus */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-2">
                    Referral Bonusu
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Yeni kullanıcı davet edildiğinde verilen bonus puanlar
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.referral_bonus || ''}
                      onChange={e => handleChange('referral_bonus', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">puan</span>
                  </div>
                </div>
              </div>

              {/* Daily Limit */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-2">
                    Günlük Puan Limiti
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Bir kullanıcının günde kazanabileceği maksimum puanlar
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.daily_limit || ''}
                      onChange={e => handleChange('daily_limit', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">puan/gün</span>
                  </div>
                </div>
              </div>

              {/* Money to Points Rate */}
              <div className="card p-5">
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-900 dark:text-white mb-3">
                    Para-Puan Dönüşüm Oranı
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Kaç puanın ne kadar paraya eşit olduğunu ayarlayın (örn: 10$ = 100 puan)
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Miktar ($)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10"
                        value={formData.money_to_points_rate || ''}
                        onChange={e => handleChange('money_to_points_rate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                      />
                    </div>
                    <div className="text-2xl font-black text-gray-400">=</div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Puanlar</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="100"
                        value={formData.money_to_points_rate ? (formData.money_to_points_rate * 10) : ''}
                        onChange={e => handleChange('money_to_points_rate', (parseInt(e.target.value) / 10).toString())}
                        className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                    Örnek: 1$ = 10 puan olarak ayarlarsanız, 10$ = 100 puan olur
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!isModified || saving}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-white transition-all ${
                  isModified && !saving
                    ? 'bg-[#7B6EF6] hover:bg-[#6B5EE6] border-2 border-black dark:border-gray-600 cursor-pointer shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-200 font-600 leading-relaxed">
                  Tüm değişiklikler hemen yürürlüğe girer. Kullanıcılar bir sonraki işlemlerinde güncellenmiş puan değerlerini görecekler. Önemli değişiklikler için bildirimler sistemi aracılığıyla kullanıcıları bilgilendirmeyi düşünün.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
