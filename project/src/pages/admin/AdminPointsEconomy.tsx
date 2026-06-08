import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Activity, Check, X, ToggleLeft, ToggleRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';
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
  { id: '1', userId: 'kullanici-1', amount: 75,  type: 'earned',   source: 'QR Tarama',         createdAt: new Date().toLocaleDateString('tr-TR') },
  { id: '2', userId: 'kullanici-1', amount: 300, type: 'spent',    source: 'Ödül Kullanımı',     createdAt: new Date().toLocaleDateString('tr-TR') },
  { id: '3', userId: 'kullanici-2', amount: 50,  type: 'earned',   source: 'Günlük Giriş',       createdAt: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR') },
  { id: '4', userId: 'kullanici-2', amount: 100, type: 'bonus',    source: 'Arkadaş Referansı',  createdAt: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR') },
  { id: '5', userId: 'kullanici-3', amount: 450, type: 'spent',    source: 'Ödül Kullanımı',     createdAt: new Date(Date.now() - 172800000).toLocaleDateString('tr-TR') },
  { id: '6', userId: 'kullanici-3', amount: 25,  type: 'earned',   source: 'Başarı Kilidi',      createdAt: new Date(Date.now() - 172800000).toLocaleDateString('tr-TR') },
];

const mockRules: PointRule[] = [
  { id: '1', name: 'Günlük Giriş Bonusu',   type: 'daily_login',       value: 25,  isActive: true  },
  { id: '2', name: 'QR Kod Tarama',         type: 'qr_scan',           value: 75,  isActive: true  },
  { id: '3', name: 'Görev Tamamlama',       type: 'mission_complete',  value: 50,  isActive: true  },
  { id: '4', name: 'Başarı Kilidi Açma',    type: 'achievement',       value: 100, isActive: true  },
  { id: '5', name: 'Arkadaş Referansı',     type: 'referral',          value: 200, isActive: false },
];

const mockCampaigns: BonusCampaign[] = [
  { id: '1', name: 'Hafta Sonu Çift Puan',   description: 'Hafta sonu tüm alışverişlerde 2x puan kazanın!',            bonusMultiplier: 2.0, startDate: '7 Haz 2026',  endDate: '8 Haz 2026',   isActive: true  },
  { id: '2', name: 'Yaz Promosyonu',         description: 'Tüm yaz menü ürünlerinde %50 bonus puan kazanın',           bonusMultiplier: 1.5, startDate: '1 Haz 2026',  endDate: '31 Ağu 2026', isActive: true  },
];

const typeLabels: Record<string, string> = {
  earned:   'Kazanıldı',
  spent:    'Harcandı',
  adjusted: 'Düzeltildi',
  bonus:    'Bonus',
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  earned:   { bg: 'rgba(34,197,94,0.12)',   text: '#16a34a', border: '#22c55e' },
  spent:    { bg: 'rgba(239,68,68,0.10)',   text: '#dc2626', border: '#ef4444' },
  adjusted: { bg: 'rgba(59,130,246,0.10)',  text: '#2563eb', border: '#3b82f6' },
  bonus:    { bg: 'rgba(245,158,11,0.12)',  text: '#d97706', border: '#f59e0b' },
};

const ruleTypeLabels: Record<string, string> = {
  daily_login:      'Günlük Giriş',
  qr_scan:          'QR Tarama',
  mission_complete: 'Görev Tamamlama',
  achievement:      'Başarı',
  referral:         'Referans',
};

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0 4px 0 var(--dark-border)',
  borderRadius: 20,
};

const AdminPointsEconomy: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules]               = useState<PointRule[]>([]);
  const [campaigns, setCampaigns]       = useState<BonusCampaign[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<'transactions' | 'rules' | 'campaigns'>('transactions');

  const [showAddRule, setShowAddRule]         = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [toast, setToast]                     = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete]     = useState<{ id: string; kind: 'rule' | 'campaign'; name: string } | null>(null);

  const [ruleName, setRuleName]           = useState('');
  const [ruleType, setRuleType]           = useState('daily_login');
  const [ruleValue, setRuleValue]         = useState(0);

  const [campaignName, setCampaignName]         = useState('');
  const [campaignDesc, setCampaignDesc]         = useState('');
  const [campaignMultiplier, setCampaignMultiplier] = useState(1.5);
  const [campaignStart, setCampaignStart]       = useState('');
  const [campaignEnd, setCampaignEnd]           = useState('');

  useEffect(() => {
    setTransactions(mockTransactions);
    setRules(mockRules);
    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const createRule = () => {
    if (!ruleName.trim()) { showToast('Kural adı boş olamaz.', false); return; }
    if (ruleValue <= 0)   { showToast('Puan değeri 0\'dan büyük olmalı.', false); return; }
    const newRule: PointRule = { id: Date.now().toString(), name: ruleName.trim(), type: ruleType, value: ruleValue, isActive: true };
    setRules(prev => [...prev, newRule]);
    showToast('Kural başarıyla oluşturuldu.');
    setRuleName(''); setRuleValue(0); setShowAddRule(false);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === 'rule')     setRules(prev => prev.filter(r => r.id !== confirmDelete.id));
    if (confirmDelete.kind === 'campaign') setCampaigns(prev => prev.filter(c => c.id !== confirmDelete.id));
    showToast('Silme işlemi tamamlandı.');
    setConfirmDelete(null);
  };

  const createCampaign = () => {
    if (!campaignName.trim())  { showToast('Kampanya adı boş olamaz.', false); return; }
    if (!campaignStart || !campaignEnd) { showToast('Lütfen başlangıç ve bitiş tarihini girin.', false); return; }
    const fmt = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    const newCampaign: BonusCampaign = {
      id: Date.now().toString(),
      name: campaignName.trim(),
      description: campaignDesc,
      bonusMultiplier: campaignMultiplier,
      startDate: fmt(campaignStart),
      endDate: fmt(campaignEnd),
      isActive: true,
    };
    setCampaigns(prev => [...prev, newCampaign]);
    showToast('Kampanya başarıyla oluşturuldu.');
    setCampaignName(''); setCampaignDesc(''); setShowAddCampaign(false);
  };

  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const totalEarned = transactions.filter(t => t.type === 'earned' || t.type === 'bonus').reduce((s, t) => s + t.amount, 0);
  const totalSpent  = transactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const activeRules = rules.filter(r => r.isActive).length;

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #7B6EF6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Yükleniyor...</p>
        </div>
      </div>
    </AdminLayout>
  );

  const tabs = [
    { id: 'transactions' as const, label: `İşlemler (${transactions.length})` },
    { id: 'rules'        as const, label: `Kurallar (${rules.length})`        },
    { id: 'campaigns'    as const, label: `Kampanyalar (${campaigns.length})`  },
  ];

  return (
    <AdminLayout>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 200,
          padding: '12px 20px', borderRadius: 16,
          background: toast.ok ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)',
          color: 'white', fontWeight: 900, fontSize: 14,
          border: `2px solid ${toast.ok ? '#16a34a' : '#dc2626'}`,
          boxShadow: `0 4px 0 ${toast.ok ? '#15803d' : '#b91c1c'}`,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideDown 0.25s ease-out',
        }}>
          {toast.ok ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...card, maxWidth: 380, width: '100%', padding: 24 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 10px' }}>Silmeyi Onayla</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-dark)' }}>{confirmDelete.name}</strong> öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer' }}>
                İptal
              </button>
              <button onClick={executeDelete} style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: '#ef4444', color: 'white', border: '2.5px solid #dc2626', boxShadow: '0 3px 0 #b91c1c', cursor: 'pointer' }}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚡</div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>Puan Ekonomisi</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 600 }}>Tüm puan işlemlerini ve kazanç kurallarını yönet</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Toplam Kazanılan', val: totalEarned.toLocaleString('tr-TR'), icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
            { label: 'Toplam Harcanan',  val: totalSpent.toLocaleString('tr-TR'),  icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
            { label: 'Aktif Kurallar',   val: String(activeRules),                  icon: Activity, color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: s.bg, border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: '0 0 1px', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '3px solid var(--dark-border)', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 18px', fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
              background: 'none', borderBottom: activeTab === t.id ? '3px solid #7B6EF6' : '3px solid transparent',
              marginBottom: -3, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              color: activeTab === t.id ? '#7B6EF6' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRANSACTIONS ── */}
        {activeTab === 'transactions' && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '3px solid var(--dark-border)' }}>
                    {['Kullanıcı', 'Miktar', 'Tür', 'Kaynak', 'Tarih'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => {
                    const positive = t.type === 'earned' || t.type === 'bonus';
                    const tc = typeColors[t.type];
                    return (
                      <tr key={t.id} style={{ borderBottom: '2px solid var(--dark-border)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>{t.userId}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 900, fontSize: 14, color: positive ? '#16a34a' : '#dc2626' }}>
                          {positive ? '+' : '-'}{t.amount}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: tc.bg, border: `1.5px solid ${tc.border}`, color: tc.text, fontSize: 11, fontWeight: 900 }}>
                            {typeLabels[t.type]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{t.source}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{t.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RULES ── */}
        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button onClick={() => setShowAddRule(v => !v)} style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 14, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={15} />
              {showAddRule ? 'Formu Kapat' : 'Yeni Kural Ekle'}
              {showAddRule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAddRule && (
              <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Yeni Kazanç Kuralı</h3>
                <input
                  type="text"
                  placeholder="Kural adı (örn. Günlük Giriş Bonusu)"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="input-field"
                />
                <select value={ruleType} onChange={e => setRuleType(e.target.value)} className="input-field">
                  {Object.entries(ruleTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Puan değeri"
                  value={ruleValue || ''}
                  onChange={e => setRuleValue(parseInt(e.target.value) || 0)}
                  min={1}
                  className="input-field"
                />
                <button onClick={createRule} style={{ padding: '11px', borderRadius: 13, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}>
                  Kuralı Kaydet
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: rule.isActive ? 'rgba(123,110,246,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${rule.isActive ? '#7B6EF6' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={18} color={rule.isActive ? '#7B6EF6' : '#9ca3af'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      {ruleTypeLabels[rule.type] || rule.type} • <strong style={{ color: 'var(--text-dark)' }}>{rule.value} puan</strong> • {rule.isActive ? <span style={{ color: '#16a34a', fontWeight: 900 }}>Aktif</span> : <span style={{ color: '#ef4444', fontWeight: 900 }}>Pasif</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => toggleRule(rule.id)} title={rule.isActive ? 'Devre dışı bırak' : 'Etkinleştir'} style={{ width: 34, height: 34, borderRadius: 10, background: rule.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${rule.isActive ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {rule.isActive ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#9ca3af" />}
                    </button>
                    <button onClick={() => setConfirmDelete({ id: rule.id, kind: 'rule', name: rule.name })} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.10)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {activeTab === 'campaigns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button onClick={() => setShowAddCampaign(v => !v)} style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 14, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={15} />
              {showAddCampaign ? 'Formu Kapat' : 'Yeni Kampanya Ekle'}
              {showAddCampaign ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAddCampaign && (
              <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Yeni Bonus Kampanyası</h3>
                <input type="text" placeholder="Kampanya adı" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="input-field" />
                <textarea placeholder="Açıklama" value={campaignDesc} onChange={e => setCampaignDesc(e.target.value)} className="input-field" style={{ resize: 'none', height: 72 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Çarpan</label>
                    <input type="number" step="0.1" min="1" value={campaignMultiplier} onChange={e => setCampaignMultiplier(parseFloat(e.target.value) || 1)} className="input-field" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Başlangıç</label>
                    <input type="date" value={campaignStart} onChange={e => setCampaignStart(e.target.value)} className="input-field" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bitiş</label>
                    <input type="date" value={campaignEnd} onChange={e => setCampaignEnd(e.target.value)} className="input-field" />
                  </div>
                </div>
                <button onClick={createCampaign} style={{ padding: '11px', borderRadius: 13, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer' }}>
                  Kampanyayı Kaydet
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {campaigns.map(c => (
                <div key={c.id} style={{ ...card, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{c.name}</p>
                        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 900, background: c.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', color: c.isActive ? '#16a34a' : '#9ca3af', border: `1.5px solid ${c.isActive ? '#22c55e' : '#9ca3af'}` }}>
                          {c.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      {c.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.4 }}>{c.description}</p>}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 900, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1.5px solid #f59e0b' }}>
                          ×{c.bonusMultiplier} Çarpan
                        </span>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '1.5px solid var(--dark-border)' }}>
                          {c.startDate} – {c.endDate}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => toggleCampaign(c.id)} title={c.isActive ? 'Devre dışı bırak' : 'Etkinleştir'} style={{ width: 34, height: 34, borderRadius: 10, background: c.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${c.isActive ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {c.isActive ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#9ca3af" />}
                      </button>
                      <button onClick={() => setConfirmDelete({ id: c.id, kind: 'campaign', name: c.name })} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.10)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminPointsEconomy;
