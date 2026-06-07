import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'adjusted' | 'bonus';
  source: string;
  reason?: string;
  createdAt: string;
}

interface PointRule {
  id: string;
  name: string;
  type: string;
  value: number;
  isActive: boolean;
}

interface BonusCampaign {
  id: string;
  name: string;
  description: string;
  bonusMultiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const mockTransactions: Transaction[] = [
  { id: '1', userId: 'user-1', amount: 75, type: 'earned', source: 'QR Scan', createdAt: new Date().toLocaleDateString() },
  { id: '2', userId: 'user-1', amount: 300, type: 'spent', source: 'Reward Redemption', createdAt: new Date().toLocaleDateString() },
  { id: '3', userId: 'user-2', amount: 50, type: 'earned', source: 'Daily Login', createdAt: new Date(Date.now() - 86400000).toLocaleDateString() },
  { id: '4', userId: 'user-2', amount: 100, type: 'bonus', source: 'Referral Bonus', createdAt: new Date(Date.now() - 86400000).toLocaleDateString() },
  { id: '5', userId: 'user-3', amount: 450, type: 'spent', source: 'Reward Redemption', createdAt: new Date(Date.now() - 172800000).toLocaleDateString() },
  { id: '6', userId: 'user-3', amount: 25, type: 'earned', source: 'Achievement', createdAt: new Date(Date.now() - 172800000).toLocaleDateString() },
];

const mockRules: PointRule[] = [
  { id: '1', name: 'Daily Login Bonus', type: 'daily_login', value: 25, isActive: true },
  { id: '2', name: 'QR Code Scan', type: 'qr_scan', value: 75, isActive: true },
  { id: '3', name: 'Mission Completion', type: 'mission_complete', value: 50, isActive: true },
  { id: '4', name: 'Achievement Unlock', type: 'achievement', value: 100, isActive: true },
  { id: '5', name: 'Referral Bonus', type: 'referral', value: 200, isActive: false },
];

const mockCampaigns: BonusCampaign[] = [
  { id: '1', name: 'Weekend Double Points', description: 'Earn 2x points on all purchases during the weekend!', bonusMultiplier: 2.0, startDate: 'Jun 7, 2026', endDate: 'Jun 8, 2026', isActive: true },
  { id: '2', name: 'Summer Promo', description: 'Get 50% bonus points on all summer menu items', bonusMultiplier: 1.5, startDate: 'Jun 1, 2026', endDate: 'Aug 31, 2026', isActive: true },
];

const AdminPointsEconomy: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<PointRule[]>([]);
  const [campaigns, setCampaigns] = useState<BonusCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'rules' | 'campaigns'>('transactions');
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('daily_login');
  const [ruleValue, setRuleValue] = useState(0);

  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignMultiplier, setCampaignMultiplier] = useState(1.5);
  const [campaignStart, setCampaignStart] = useState('');
  const [campaignEnd, setCampaignEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setTransactions(mockTransactions);
    setRules(mockRules);
    setCampaigns(mockCampaigns);
    setLoading(false);
  };

  const createRule = async () => {
    if (!ruleName || ruleValue <= 0) {
      alert('Please fill all fields');
      return;
    }
    const newRule: PointRule = { id: Date.now().toString(), name: ruleName, type: ruleType, value: ruleValue, isActive: true };
    setRules([...rules, newRule]);
    alert('Rule created (demo mode)');
    setRuleName('');
    setRuleValue(0);
    setShowAddRule(false);
  };

  const deleteRule = async (ruleId: string) => {
    if (window.confirm('Delete this rule?')) {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const createCampaign = async () => {
    if (!campaignName || !campaignStart || !campaignEnd) {
      alert('Please fill all fields');
      return;
    }
    const newCampaign: BonusCampaign = {
      id: Date.now().toString(),
      name: campaignName,
      description: campaignDesc,
      bonusMultiplier: campaignMultiplier,
      startDate: campaignStart,
      endDate: campaignEnd,
      isActive: true,
    };
    setCampaigns([...campaigns, newCampaign]);
    alert('Campaign created (demo mode)');
    setCampaignName('');
    setCampaignDesc('');
    setShowAddCampaign(false);
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Points Economy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage all points transactions and earning rules</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <TrendingUp size={22} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <TrendingDown size={22} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {transactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Activity size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {rules.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b-2 border-black dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm whitespace-nowrap border-b-4 transition-all ${
            activeTab === 'transactions'
              ? 'border-[#7B6EF6] text-[#7B6EF6] dark:text-[#4F8EF7]'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm whitespace-nowrap border-b-4 transition-all ${
            activeTab === 'rules'
              ? 'border-[#7B6EF6] text-[#7B6EF6] dark:text-[#4F8EF7]'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-sm whitespace-nowrap border-b-4 transition-all ${
            activeTab === 'campaigns'
              ? 'border-[#7B6EF6] text-[#7B6EF6] dark:text-[#4F8EF7]'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Campaigns ({campaigns.length})
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b-2 border-black dark:border-gray-700">
                <th className="text-left py-3 px-4 font-black">User ID</th>
                <th className="text-left py-3 px-4 font-black">Amount</th>
                <th className="text-left py-3 px-4 font-black">Type</th>
                <th className="text-left py-3 px-4 font-black">Source</th>
                <th className="text-left py-3 px-4 font-black">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 font-mono text-sm">{t.userId.slice(0, 8)}...</td>
                  <td className={`py-3 px-4 font-bold ${t.type === 'earned' || t.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'earned' || t.type === 'bonus' ? '+' : '-'}{t.amount}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{t.source}</td>
                  <td className="py-3 px-4 text-sm">{t.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center gap-2 px-6 py-3 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl border-2 border-black hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add Rule
          </button>

          {showAddRule && (
            <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 space-y-4">
              <input
                type="text"
                placeholder="Rule name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily_login">Daily Login</option>
                <option value="qr_scan">QR Scan</option>
                <option value="mission_complete">Mission Complete</option>
                <option value="achievement">Achievement</option>
              </select>
              <input
                type="number"
                placeholder="Points value"
                value={ruleValue}
                onChange={(e) => setRuleValue(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={createRule}
                className="w-full py-2 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                Create Rule
              </button>
            </div>
          )}

          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{rule.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rule.type} • {rule.value} points • {rule.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-600">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddCampaign(!showAddCampaign)}
            className="flex items-center gap-2 px-6 py-3 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl border-2 border-black hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add Campaign
          </button>

          {showAddCampaign && (
            <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 space-y-4">
              <input
                type="text"
                placeholder="Campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Description"
                value={campaignDesc}
                onChange={(e) => setCampaignDesc(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20"
              />
              <input
                type="number"
                placeholder="Bonus multiplier (e.g., 1.5)"
                step="0.1"
                value={campaignMultiplier}
                onChange={(e) => setCampaignMultiplier(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={campaignStart}
                onChange={(e) => setCampaignStart(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={campaignEnd}
                onChange={(e) => setCampaignEnd(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={createCampaign}
                className="w-full py-2 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                Create Campaign
              </button>
            </div>
          )}

          <div className="space-y-3">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{campaign.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{campaign.description}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs">
                      <span className="text-amber-600 font-bold">Multiplier: {campaign.bonusMultiplier}x</span>
                      <span className="text-gray-600 dark:text-gray-400">{campaign.startDate} to {campaign.endDate}</span>
                      <span className={campaign.isActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminPointsEconomy;
