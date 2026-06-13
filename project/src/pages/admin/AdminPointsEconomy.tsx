import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, TrendingDown, TrendingUp, Activity, Check, X,
  ToggleLeft, ToggleRight, Zap, ChevronDown, ChevronUp, RefreshCw, Loader,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useRealtimeTable } from '../../hooks/useRealtime';
import {
  getPointsEconomyStats,
  getPointsEconomyTransactions,
  getPointRules,
  createPointRule,
  updatePointRule,
  deletePointRule,
  getBonusCampaigns,
  createBonusCampaign,
  toggleBonusCampaign,
  deleteBonusCampaign,
  type PointsTransactionRow,
  type PointRule,
  type BonusCampaign,
  type PointsEconomyStats,
} from '../../services/pointsEconomy';

const typeLabels: Record<string, string> = {
  earned:   'Kazanıldı',
  spent:    'Harcandı',
  adjusted: 'Düzeltildi',
  bonus:    'Bonus',
  expired:  'Süresi Doldu',
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  earned:   { bg: 'rgba(34,197,94,0.12)',   text: '#16a34a', border: '#22c55e' },
  spent:    { bg: 'rgba(239,68,68,0.10)',   text: '#dc2626', border: '#ef4444' },
  adjusted: { bg: 'rgba(59,130,246,0.10)',  text: '#2563eb', border: '#3b82f6' },
  bonus:    { bg: 'rgba(245,158,11,0.12)',  text: '#d97706', border: '#f59e0b' },
  expired:  { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', border: '#9ca3af' },
};

const ruleTypeLabels: Record<string, string> = {
  daily_login:      'Günlük Giriş',
  qr_scan:          'QR Tarama',
  mission_complete: 'Görev Tamamlama',
  achievement:      'Başarı',
  referral:         'Referans',
  custom:           'Özel',
};

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0 4px 0 var(--dark-border)',
  borderRadius: 20,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EmptyState: React.FC<{ emoji: string; title: string; sub?: string }> = ({ emoji, title, sub }) => (
  <div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
    <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
    <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>{title}</p>
    {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
  </div>
);

const AdminPointsEconomy: React.FC = () => {
  const [transactions, setTransactions] = useState<PointsTransactionRow[]>([]);
  const [rules, setRules]               = useState<PointRule[]>([]);
  const [campaigns, setCampaigns]       = useState<BonusCampaign[]>([]);
  const [stats, setStats]               = useState<PointsEconomyStats>({ totalEarned: 0, totalSpent: 0, activeRules: 0 });
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeTab, setActiveTab]       = useState<'transactions' | 'rules' | 'campaigns'>('transactions');

  const [showAddRule, setShowAddRule]         = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [toast, setToast]                     = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete]     = useState<{ id: string; kind: 'rule' | 'campaign'; name: string } | null>(null);
  const [workingId, setWorkingId]             = useState<string | null>(null);
  const [savingForm, setSavingForm]           = useState(false);

  const [ruleName, setRuleName]   = useState('');
  const [ruleType, setRuleType]   = useState('daily_login');
  const [ruleValue, setRuleValue] = useState(0);

  const [campaignName, setCampaignName]             = useState('');
  const [campaignDesc, setCampaignDesc]             = useState('');
  const [campaignMultiplier, setCampaignMultiplier] = useState(1.5);
  const [campaignStart, setCampaignStart]           = useState('');
  const [campaignEnd, setCampaignEnd]               = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [txRes, rulesRes, campaignsRes, statsRes] = await Promise.all([
        getPointsEconomyTransactions(100),
        getPointRules(),
        getBonusCampaigns(),
        getPointsEconomyStats(),
      ]);
      setTransactions(txRes);
      setRules(rulesRes);
      setCampaigns(campaignsRes);
      setStats(statsRes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Veriler yüklenemedi';
      showToast(msg, false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useRealtimeTable('points_transactions', () => loadAll(true));
  useRealtimeTable('point_rules', () => loadAll(true));
  useRealtimeTable('events', () => loadAll(true));

  const createRule = async () => {
    if (!ruleName.trim()) { showToast('Kural adı boş olamaz.', false); return; }
    if (ruleValue <= 0)   { showToast('Puan değeri 0\'dan büyük olmalı.', false); return; }
    setSavingForm(true);
    try {
      await createPointRule({ name: ruleName.trim(), rule_type: ruleType, value: ruleValue });
      showToast('Kural başarıyla oluşturuldu.');
      setRuleName(''); setRuleValue(0); setShowAddRule(false);
      await loadAll(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Kural kaydedilemedi.', false);
    } finally {
      setSavingForm(false);
    }
  };

  const toggleRule = async (rule: PointRule) => {
    setWorkingId(rule.id);
    try {
      await updatePointRule(rule.id, { active: !rule.active });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
      setStats(s => ({ ...s, activeRules: s.activeRules + (rule.active ? -1 : 1) }));
    } catch {
      showToast('Kural güncellenemedi.', false);
    } finally {
      setWorkingId(null);
    }
  };

  const createCampaign = async () => {
    if (!campaignName.trim()) { showToast('Kampanya adı boş olamaz.', false); return; }
    if (!campaignStart || !campaignEnd) { showToast('Lütfen başlangıç ve bitiş tarihini girin.', false); return; }
    if (new Date(campaignEnd) <= new Date(campaignStart)) {
      showToast('Bitiş tarihi başlangıçtan sonra olmalı.', false);
      return;
    }
    setSavingForm(true);
    try {
      await createBonusCampaign({
        name: campaignName.trim(),
        description: campaignDesc,
        bonusMultiplier: campaignMultiplier,
        startDate: campaignStart,
        endDate: campaignEnd,
      });
      showToast('Kampanya başarıyla oluşturuldu.');
      setCampaignName(''); setCampaignDesc(''); setCampaignStart(''); setCampaignEnd('');
      setShowAddCampaign(false);
      await loadAll(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Kampanya kaydedilemedi.', false);
    } finally {
      setSavingForm(false);
    }
  };

  const toggleCampaign = async (c: BonusCampaign) => {
    setWorkingId(c.id);
    try {
      await toggleBonusCampaign(c.id, !c.isActive);
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      showToast('Kampanya güncellenemedi.', false);
    } finally {
      setWorkingId(null);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setWorkingId(confirmDelete.id);
    try {
      if (confirmDelete.kind === 'rule') {
        await deletePointRule(confirmDelete.id);
        setRules(prev => prev.filter(r => r.id !== confirmDelete.id));
      } else {
        await deleteBonusCampaign(confirmDelete.id);
        setCampaigns(prev => prev.filter(c => c.id !== confirmDelete.id));
      }
      showToast('Silme işlemi tamamlandı.');
      setConfirmDelete(null);
      await loadAll(true);
    } catch {
      showToast('Silinemedi.', false);
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={44} color="#7B6EF6" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
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
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 200,
          padding: '12px 20px', borderRadius: 16,
          background: toast.ok ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)',
          color: 'white', fontWeight: 900, fontSize: 14,
          border: `2px solid ${toast.ok ? '#16a34a' : '#dc2626'}`,
          boxShadow: `0 4px 0 ${toast.ok ? '#15803d' : '#b91c1c'}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.ok ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...card, maxWidth: 380, width: '100%', padding: 24 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 10px' }}>Silmeyi Onayla</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-dark)' }}>{confirmDelete.name}</strong> öğesini silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(null)} disabled={!!workingId} style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer' }}>
                İptal
              </button>
              <button type="button" onClick={executeDelete} disabled={!!workingId} style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: '#ef4444', color: 'white', border: '2.5px solid #dc2626', boxShadow: '0 3px 0 #b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {workingId ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚡</div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>Puan Ekonomisi</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 600 }}>Tüm puan işlemlerini ve kazanç kurallarını yönet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={refreshing}
            style={{
              padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12,
              background: 'var(--card-bg)', color: 'var(--text-dark)',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined} />
            Yenile
          </button>
        </div>

        {/* Stats — from full DB aggregates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Toplam Kazanılan', val: stats.totalEarned.toLocaleString('tr-TR'), icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
            { label: 'Toplam Harcanan',  val: stats.totalSpent.toLocaleString('tr-TR'),  icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
            { label: 'Aktif Kurallar',   val: String(stats.activeRules),                  icon: Activity, color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)' },
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
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 18px', fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
              background: 'none', borderBottom: activeTab === t.id ? '3px solid #7B6EF6' : '3px solid transparent',
              marginBottom: -3, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              color: activeTab === t.id ? '#7B6EF6' : 'var(--text-muted)',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRANSACTIONS ── */}
        {activeTab === 'transactions' && (
          transactions.length === 0 ? (
            <EmptyState emoji="📊" title="Henüz işlem yok" sub="Kullanıcılar puan kazandığında veya harcadığında burada görünür." />
          ) : (
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
                      const positive = t.displayType === 'earned' || t.displayType === 'bonus';
                      const tc = typeColors[t.displayType] ?? typeColors.adjusted;
                      return (
                        <tr key={t.id} style={{ borderBottom: '2px solid var(--dark-border)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: 13, color: 'var(--text-dark)' }}>{t.username}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 900, fontSize: 14, color: positive ? '#16a34a' : '#dc2626' }}>
                            {positive ? '+' : '-'}{t.amount.toLocaleString('tr-TR')}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 999, background: tc.bg, border: `1.5px solid ${tc.border}`, color: tc.text, fontSize: 11, fontWeight: 900 }}>
                              {typeLabels[t.displayType] ?? t.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.source}>{t.source}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(t.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ── RULES ── */}
        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button type="button" onClick={() => setShowAddRule(v => !v)} style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 14, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={15} />
              {showAddRule ? 'Formu Kapat' : 'Yeni Kural Ekle'}
              {showAddRule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAddRule && (
              <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Yeni Kazanç Kuralı</h3>
                <input type="text" placeholder="Kural adı (örn. Günlük Giriş Bonusu)" value={ruleName} onChange={e => setRuleName(e.target.value)} className="input-field" />
                <select value={ruleType} onChange={e => setRuleType(e.target.value)} className="input-field">
                  {Object.entries(ruleTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <input type="number" placeholder="Puan değeri" value={ruleValue || ''} onChange={e => setRuleValue(parseInt(e.target.value, 10) || 0)} min={1} className="input-field" />
                <button type="button" onClick={createRule} disabled={savingForm} style={{ padding: '11px', borderRadius: 13, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: savingForm ? 0.7 : 1 }}>
                  {savingForm ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                  Kuralı Kaydet
                </button>
              </div>
            )}

            {rules.length === 0 ? (
              <EmptyState emoji="⚡" title="Kural bulunamadı" sub="Supabase'de point_rules tablosunu oluşturmak için patch SQL'i çalıştırın." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map(rule => (
                  <div key={rule.id} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: workingId === rule.id ? 0.6 : 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: rule.active ? 'rgba(123,110,246,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${rule.active ? '#7B6EF6' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={18} color={rule.active ? '#7B6EF6' : '#9ca3af'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                        {ruleTypeLabels[rule.rule_type] || rule.rule_type} • <strong style={{ color: 'var(--text-dark)' }}>{rule.value} puan</strong> • {rule.active ? <span style={{ color: '#16a34a', fontWeight: 900 }}>Aktif</span> : <span style={{ color: '#ef4444', fontWeight: 900 }}>Pasif</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button type="button" onClick={() => toggleRule(rule)} disabled={workingId === rule.id} title={rule.active ? 'Devre dışı bırak' : 'Etkinleştir'} style={{ width: 34, height: 34, borderRadius: 10, background: rule.active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${rule.active ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {workingId === rule.id ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : rule.active ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#9ca3af" />}
                      </button>
                      <button type="button" onClick={() => setConfirmDelete({ id: rule.id, kind: 'rule', name: rule.name })} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.10)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {activeTab === 'campaigns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button type="button" onClick={() => setShowAddCampaign(v => !v)} style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 14, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={15} />
              {showAddCampaign ? 'Formu Kapat' : 'Yeni Kampanya Ekle'}
              {showAddCampaign ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAddCampaign && (
              <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Yeni Bonus Kampanyası</h3>
                <input type="text" placeholder="Kampanya adı" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="input-field" />
                <textarea placeholder="Açıklama" value={campaignDesc} onChange={e => setCampaignDesc(e.target.value)} className="input-field" style={{ resize: 'none', height: 72 }} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Çarpan</label>
                    <input type="number" step="0.1" min="1" value={campaignMultiplier} onChange={e => setCampaignMultiplier(parseFloat(e.target.value) || 1)} className="input-field" />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Başlangıç</label>
                    <input type="date" value={campaignStart} onChange={e => setCampaignStart(e.target.value)} className="input-field" />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ display: 'block', fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bitiş</label>
                    <input type="date" value={campaignEnd} onChange={e => setCampaignEnd(e.target.value)} className="input-field" />
                  </div>
                </div>
                <button type="button" onClick={createCampaign} disabled={savingForm} style={{ padding: '11px', borderRadius: 13, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: savingForm ? 0.7 : 1 }}>
                  {savingForm ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                  Kampanyayı Kaydet
                </button>
              </div>
            )}

            {campaigns.length === 0 ? (
              <EmptyState emoji="🎪" title="Kampanya yok" sub="Çarpanlı bonus kampanyası ekleyin — events tablosuna kaydedilir." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {campaigns.map(c => (
                  <div key={c.id} style={{ ...card, padding: '16px 18px', opacity: workingId === c.id ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
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
                            {fmtShortDate(c.startDate)} – {fmtShortDate(c.endDate)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button type="button" onClick={() => toggleCampaign(c)} disabled={workingId === c.id} style={{ width: 34, height: 34, borderRadius: 10, background: c.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `2px solid ${c.isActive ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {workingId === c.id ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : c.isActive ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#9ca3af" />}
                        </button>
                        <button type="button" onClick={() => setConfirmDelete({ id: c.id, kind: 'campaign', name: c.name })} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.10)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default AdminPointsEconomy;
