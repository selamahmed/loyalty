import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Plus, Trash2, X, Check, Copy, Edit2, Save, RefreshCw, ToggleLeft, ToggleRight, ShoppingCart, Clock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getQRCodes, createQRCode, toggleQRCode, deleteQRCode, getRedemptionsAdmin, updateRedemptionCode, createCashierQR, getCashierQRCodes } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeTable } from '../../hooks/useRealtime';
import {
  isQRExpired, msRemaining, appendAuditLog,
  type CashierQRPayload,
} from '../../lib/qrUtils';

type DBQRCode = { id: string; code: string; label: string | null; points: number; active: boolean; uses_count: number; max_uses: number | null; expires_at: string | null; created_at: string; store_id: string | null };

type InvItem = { id: string; title: string; description: string; points: number; category: string; image: string | null | undefined; code: string; type?: string; used?: boolean; expires?: string };
type TabType = 'purchase' | 'inventory' | 'store';
type JoinedReward = { title?: string | null; description?: string | null; category?: string | null; image?: string | null; points?: number | null };
type RedemptionAdminRow = Record<string, unknown> & { rewards?: JoinedReward | JoinedReward[] | null };

const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };
const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };

const QRImage: React.FC<{ data: string; size?: number }> = ({ data, size = 120 }) => (
  <div style={{ background: 'white', padding: 8, borderRadius: 12, border: '2px solid #e5e7eb', display: 'inline-block' }}>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}&margin=6`}
      alt="QR"
      style={{ width: size, height: size, display: 'block', borderRadius: 6 }}
    />
  </div>
);

/* ── Countdown display ── */
const Countdown: React.FC<{ expiresAt: string; onExpired?: () => void }> = ({ expiresAt, onExpired }) => {
  const [ms, setMs] = useState(msRemaining(expiresAt));
  useEffect(() => {
    const t = setInterval(() => {
      const rem = msRemaining(expiresAt);
      setMs(rem);
      if (rem <= 0) { clearInterval(t); onExpired?.(); }
    }, 500);
    return () => clearInterval(t);
  }, [expiresAt, onExpired]);

  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const pct  = Math.min(100, (ms / (5 * 60 * 1000)) * 100);
  const urgent = ms < 60000;

  if (ms <= 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
      <AlertCircle size={14} />
      <span style={{ fontWeight: 900, fontSize: 12 }}>Süresi Doldu</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: urgent ? '#ef4444' : '#22c55e' }}>
        <Clock size={13} />
        <span style={{ fontWeight: 900, fontSize: 13, fontFamily: 'monospace' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>kaldı</span>
      </div>
      <div style={{ height: 5, background: 'rgba(0,0,0,0.1)', borderRadius: 999, overflow: 'hidden', width: 100 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: urgent ? '#ef4444' : '#22c55e', borderRadius: 999, transition: 'width 0.5s linear' }} />
      </div>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge: React.FC<{ qr: CashierQRPayload }> = ({ qr }) => {
  if (qr.status === 'used') return (
    <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1.5px solid #22c55e', fontSize: 11, fontWeight: 900 }}>
      ✓ Kullanıldı
    </span>
  );
  if (qr.status === 'expired' || isQRExpired(qr.expires_at)) return (
    <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1.5px solid #9ca3af', fontSize: 11, fontWeight: 900 }}>
      Süresi Doldu
    </span>
  );
  return (
    <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1.5px solid #f59e0b', fontSize: 11, fontWeight: 900 }}>
      ⏳ Bekliyor
    </span>
  );
};

const CASHIER_QR_TTL_MS = 7 * 60 * 1000;
const CASHIER_POINTS_PER_TL = 10;

function generateCashierCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'QR-';
  for (let i = 0; i < 8; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function amountFromCashierLabel(label: string | null): number {
  const match = (label ?? '').match(/(?:TRY|₺)\s*([\d.]+)/i);
  return match ? Number(match[1]) : 0;
}

function rowToCashierQR(row: DBQRCode): CashierQRPayload {
  const used = !row.active || ((row.max_uses ?? 0) > 0 && (row.uses_count ?? 0) >= (row.max_uses ?? 0));
  const expired = row.expires_at ? isQRExpired(row.expires_at) : false;
  return {
    type: 'cashier_purchase',
    qr_id: row.code,
    amount: amountFromCashierLabel(row.label),
    points: row.points,
    merchant_id: row.store_id ?? '',
    issued_at: row.created_at,
    expires_at: row.expires_at ?? new Date(new Date(row.created_at).getTime() + CASHIER_QR_TTL_MS).toISOString(),
    status: used ? 'used' : expired ? 'expired' : 'pending',
  };
}

function isCashierQRRow(row: DBQRCode): boolean {
  return row.max_uses === 1 && Boolean(row.expires_at) && (row.label ?? '').toLowerCase().includes('cashier qr');
}

function generateInventoryCode(type: string): string {
  const prefix = (type || 'reward').slice(0, 4).toUpperCase();
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function normalizeJoinedReward(row: RedemptionAdminRow): JoinedReward {
  const reward = row.rewards;
  if (Array.isArray(reward)) return reward[0] ?? {};
  return reward ?? {};
}

const AdminQR: React.FC = () => {
  const { authUser } = useAuth();
  const [tab, setTab] = useState<TabType>('purchase');

  /* ── Cashier purchase QR state ── */
  const [amount, setAmount]       = useState('');
  const [activeQR, setActiveQR]   = useState<CashierQRPayload | null>(null);
  const [qrHistory, setQrHistory] = useState<CashierQRPayload[]>([]);
  const [generating, setGenerating] = useState(false);
  const [qrError, setQrError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState<CashierQRPayload | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Store QR state (Supabase) ── */
  const [codes, setCodes]         = useState<DBQRCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ label: '', points: 50, active: true, max_uses: '' });
  const [copied, setCopied]       = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  /* ── Inventory code state (Supabase redemptions) ── */
  const [invItems, setInvItems]   = useState<InvItem[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode]   = useState('');
  const [invSavingId, setInvSavingId] = useState<string | null>(null);
  const [invCopied, setInvCopied] = useState<string | null>(null);
  const [invPreview, setInvPreview] = useState<string | null>(null);

  const loadCashierHistory = useCallback(async () => {
    try {
      const rows = await getCashierQRCodes(20);
      const history = (rows as DBQRCode[]).map(rowToCashierQR);
      setQrHistory(history.slice(0, 10));
      setActiveQR(prev => {
        if (!prev) return prev;
        return history.find(qr => qr.qr_id === prev.qr_id) ?? prev;
      });
    } catch {
      setQrHistory([]);
    }
  }, []);

  useEffect(() => { if (tab === 'purchase') void loadCashierHistory(); }, [tab, loadCashierHistory]);
  useRealtimeTable('qr_codes', loadCashierHistory, tab === 'purchase');

  /* ── Load store QR codes from Supabase ── */
  const loadCodes = useCallback(async () => {
    setCodesLoading(true);
    try {
      const data = await getQRCodes();
      setCodes((data as DBQRCode[]).filter(qr => !isCashierQRRow(qr)));
    } catch { setCodes([]); } finally { setCodesLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'store') loadCodes(); }, [tab, loadCodes]);

  /* ── Realtime: refresh store codes on DB change ── */
  useRealtimeTable('qr_codes', loadCodes, tab === 'store');

  /* ── Load inventory codes (redemptions) from Supabase ── */
  const loadInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const data = await getRedemptionsAdmin(0, 100);
      setInvItems((data as RedemptionAdminRow[]).map((r) => {
        const reward = normalizeJoinedReward(r);
        return {
          id: String(r.id),
          title: reward.title ?? 'Ödül',
          description: reward.description ?? '',
          points: Number(r.points_spent ?? reward.points ?? 0),
          category: reward.category ?? '',
          image: reward.image ?? null,
          code: String(r.code ?? ''),
          used: Boolean(r.used),
          expires: r.expires_at ? String(r.expires_at) : undefined,
          type: reward.category ?? 'reward',
        };
      }));
    } catch { setInvItems([]); } finally { setInvLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'inventory') loadInventory(); }, [tab, loadInventory]);

  /* ── Realtime: refresh inventory on redemption change ── */
  useRealtimeTable('redemptions', loadInventory, tab === 'inventory');

  const parsedAmount = parseFloat(amount) || 0;
  const estimatedPoints = Math.round(parsedAmount * CASHIER_POINTS_PER_TL);

  const handleGenerate = async () => {
    if (parsedAmount <= 0) return;
    setGenerating(true);
    setQrError('');
    try {
      const expiresAt = new Date(Date.now() + CASHIER_QR_TTL_MS).toISOString();
      const row = await createCashierQR({
        code: generateCashierCode(),
        points: estimatedPoints,
        amount: parsedAmount,
        cashierUserId: authUser?.id ?? 'admin',
        expiresAt,
      });
      const qr = rowToCashierQR(row as DBQRCode);
      appendAuditLog({ event: 'qr_generated', qr_id: qr.qr_id, detail: `${qr.amount} TL purchase QR for ${qr.points} points`, points: qr.points });
      setActiveQR(qr);
      setAmount('');
      await loadCashierHistory();
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = setTimeout(() => {
        setActiveQR(prev => prev?.qr_id === qr.qr_id ? null : prev);
      }, CASHIER_QR_TTL_MS + 500);
    } catch (e) {
      console.error('[AdminQR] Could not create cashier QR:', e);
      setQrError((e as Error).message ?? 'Cashier QR could not be created.');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Store QR handlers (Supabase) ── */
  const genCode = () => `${(form.label || 'QR').slice(0, 6).replace(/\s/g, '').toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const handleCreate = async () => {
    setSaved(true);
    try {
      await createQRCode({
        code: genCode(),
        points: form.points,
        label: form.label || undefined,
        max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
      });
      await loadCodes();
    } catch (e) { console.error(e); }
    setTimeout(() => { setSaved(false); setShowModal(false); setForm({ label: '', points: 50, active: true, max_uses: '' }); }, 600);
  };
  const handleCopy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(code); setTimeout(() => setCopied(null), 2000); };
  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleQRCode(id, !currentActive);
      setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !currentActive } : c));
    } catch (e) { console.error(e); }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteQRCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  /* ── Inventory code handlers ── */
  const startEdit  = (item: InvItem) => { setEditingId(item.id); setEditCode(item.code); };
  const saveEdit = async (id: string) => {
    const nextCode = editCode.toUpperCase().trim();
    if (!nextCode) return;
    setInvSavingId(id);
    try {
      await updateRedemptionCode(id, nextCode);
      setInvItems(prev => prev.map(i => i.id === id ? { ...i, code: nextCode } : i));
      setEditingId(null);
      setEditCode('');
      await loadInventory();
    } catch (e) {
      console.error('[AdminQR] Could not update redemption code:', e);
    } finally {
      setInvSavingId(null);
    }
  };
  const regenCode = async (id: string, type: string) => {
    const nextCode = generateInventoryCode(type);
    setInvSavingId(id);
    try {
      await updateRedemptionCode(id, nextCode);
      setInvItems(prev => prev.map(i => i.id === id ? { ...i, code: nextCode } : i));
      await loadInventory();
    } catch (e) {
      console.error('[AdminQR] Could not regenerate redemption code:', e);
    } finally {
      setInvSavingId(null);
    }
  };
  const handleInvCopy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setInvCopied(code); setTimeout(() => setInvCopied(null), 2000); };

  const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

  const tabs: { id: TabType; label: string; desc: string }[] = [
    { id: 'purchase',  label: '🛒 Satın Alma QR',     desc: 'Kasiyere özel tek kullanımlık QR' },
    { id: 'inventory', label: '📦 Envanter Kodları',   desc: 'Ürün kodlarını görüntüle & düzenle' },
    { id: 'store',     label: '🏪 Mağaza QR Kodları',  desc: 'Kazanç QR kodlarını yönet' },
  ];

  return (
    <AdminLayout>
      {/* ── Store QR create modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className={`${card} max-w-sm w-full p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">QR Kod Oluştur</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-1">Etiket / Konum</label>
                <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="input-field" placeholder="örn. Mağaza #50 - Meşe Cad." />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Puan Ödülü</label>
                <input type="number" value={form.points} onChange={e => setForm({ ...form, points: +e.target.value })} className="input-field" min={1} />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Maks. Kullanım (boş = sınırsız)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} className="input-field" min={1} placeholder="Sınırsız" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">İptal</button>
              <button onClick={handleCreate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Oluşturuldu!</> : 'QR Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Preview modal ── */}
      {(previewCode || invPreview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => { setPreviewCode(null); setInvPreview(null); }}>
          <div className={`${card} p-6 flex flex-col items-center gap-4 max-w-xs w-full`} onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-base">QR Kod Önizleme</h3>
            <QRImage data={(previewCode || invPreview)!} size={200} />
            <p className="font-mono font-black text-sm tracking-widest text-center">{previewCode || invPreview}</p>
            <button onClick={() => { setPreviewCode(null); setInvPreview(null); }} className="btn-secondary w-full">Kapat</button>
          </div>
        </div>
      )}

      {/* ── Cashier QR enlarged preview modal ── */}
      {showPreviewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowPreviewModal(null)}>
          <div style={{ background: 'var(--card-bg,#1a1b2e)', border: '3px solid var(--dark-border,#2a2d50)', boxShadow: '0 8px 0 var(--dark-border,#000)', borderRadius: 24, padding: 28, maxWidth: 360, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={20} color="#a78bfa" />
              <span style={{ fontWeight: 900, fontSize: 16 }}>Satın Alma QR Kodu</span>
            </div>
            <QRImage data={JSON.stringify(showPreviewModal)} size={220} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', marginBottom: 4 }}>{showPreviewModal.qr_id}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', border: '1.5px solid #f59e0b', color: '#d97706', fontSize: 12, fontWeight: 900 }}>
                  {showPreviewModal.amount}₺
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(123,110,246,0.15)', border: '1.5px solid #7B6EF6', color: '#7B6EF6', fontSize: 12, fontWeight: 900 }}>
                  +{showPreviewModal.points} Puan
                </span>
              </div>
            </div>
            {showPreviewModal.status === 'pending' && !isQRExpired(showPreviewModal.expires_at) && (
              <Countdown expiresAt={showPreviewModal.expires_at} />
            )}
            <StatusBadge qr={showPreviewModal} />
            <button onClick={() => setShowPreviewModal(null)} className="btn-secondary w-full">Kapat</button>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-black dark:border-gray-600 shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]" style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)' }}>🔲</div>
            <div>
              <h1 className="text-2xl font-black">QR & Kod Yöneticisi</h1>
              <p className="text-xs text-gray-500">Satın alma QR'ı, mağaza kodları ve envanter</p>
            </div>
          </div>
          {tab === 'store' && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus size={14} /> QR Oluştur
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[130px] py-3 px-3 rounded-2xl border-2 border-black dark:border-gray-600 font-black text-sm transition-all shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151] text-left ${tab === t.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              <div>{t.label}</div>
              <div className="font-medium text-xs opacity-70 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ══ PURCHASE QR TAB ══ */}
        {tab === 'purchase' && (
          <div className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Oluşturulan',  val: qrHistory.length },
                { label: 'Kullanılan',   val: qrHistory.filter(q => q.status === 'used').length },
                { label: 'Bekleyen',     val: qrHistory.filter(q => q.status === 'pending' && !isQRExpired(q.expires_at)).length },
              ].map(s => (
                <div key={s.label} className={`${card} p-4 text-center`}>
                  <p className="font-black text-2xl">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Generator card */}
            <div className={`${card} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={18} className="text-purple-500" />
                <h2 className="font-black text-base">Satın Alma QR Oluştur</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">Kasiyere özel, tek kullanımlık (5 dk geçerli) QR kodu üret. Müşteri bunu tarayarak puan kazanır.</p>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block font-bold text-sm mb-1.5">Alışveriş Tutarı (₺)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-gray-400">₺</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                      className="input-field pl-7"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {parsedAmount > 0 && (
                    <p className="text-xs text-purple-500 font-bold mt-1">
                      → {estimatedPoints} puan kazanacak (1 TL = 10 puan)
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={parsedAmount <= 0 || generating}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ height: 44 }}>
                  {generating ? (
                    <><RefreshCw size={14} className="animate-spin" /> Oluşturuluyor...</>
                  ) : (
                    <><QrCode size={14} /> QR Oluştur</>
                  )}
                </button>
              </div>

              {qrError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl p-3 text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#ef4444' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{qrError}</span>
                </div>
              )}
            </div>

            {/* Active QR display */}
            {activeQR && (
              <div className={`${card} p-5 border-purple-500`} style={{ borderColor: '#a78bfa', boxShadow: '0 4px 0 #7c3aed' }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Zap size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Aktif QR Kodu</p>
                      <p className="text-xs text-gray-400 font-mono">{activeQR.qr_id}</p>
                    </div>
                  </div>
                  <StatusBadge qr={activeQR} />
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center">
                  {/* QR image */}
                  <div className="flex-shrink-0 cursor-pointer" onClick={() => setShowPreviewModal(activeQR)}>
                    <QRImage data={JSON.stringify(activeQR)} size={180} />
                    <p className="text-xs text-center text-gray-400 mt-1 font-medium">Büyütmek için tıkla</p>
                  </div>

                  {/* QR details */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid #f59e0b' }}>
                        <p className="text-xs text-amber-600 font-bold mb-0.5">Alışveriş Tutarı</p>
                        <p className="font-black text-xl text-amber-500">{activeQR.amount}₺</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(123,110,246,0.08)', border: '1.5px solid #7B6EF6' }}>
                        <p className="text-xs text-purple-600 font-bold mb-0.5">Puan Ödülü</p>
                        <p className="font-black text-xl text-purple-500">+{activeQR.points}</p>
                      </div>
                    </div>

                    <Countdown expiresAt={activeQR.expires_at} onExpired={() => setActiveQR(null)} />

                    {/* JSON payload display */}
                    <details className="rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.1)' }}>
                      <summary className="px-3 py-2 text-xs font-bold text-gray-400 cursor-pointer select-none" style={{ background: 'rgba(0,0,0,0.04)' }}>
                        JSON Payload Görüntüle
                      </summary>
                      <pre className="px-3 py-2 text-xs font-mono overflow-x-auto" style={{ maxHeight: 120, fontSize: 10, lineHeight: 1.5, background: 'rgba(0,0,0,0.02)' }}>
                        {JSON.stringify(activeQR, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(activeQR)).catch(() => {})}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2">
                    <Copy size={12} /> JSON Kopyala
                  </button>
                  <button onClick={() => { setActiveQR(null); }}
                    className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl border-2 border-black dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-800 shadow-[0_2px_0_#000] hover:bg-gray-100 dark:hover:bg-gray-700 font-bold">
                    <X size={12} /> Kapat
                  </button>
                </div>
              </div>
            )}

            {/* QR history */}
            {qrHistory.length > 0 && (
              <div>
                <h3 className="font-black text-sm mb-3 text-gray-400 uppercase tracking-wider">Son Oluşturulan QR'lar</h3>
                <div className="space-y-2">
                  {qrHistory.map(qr => (
                    <div key={qr.qr_id} className={`${card} p-3`}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setShowPreviewModal(qr)} className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify(qr))}&size=40x40&margin=2`}
                            alt="qr"
                            style={{ width: 36, height: 36 }}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-mono font-black text-xs tracking-wider truncate">{qr.qr_id}</p>
                            <StatusBadge qr={qr} />
                          </div>
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span className="font-bold text-amber-500">{qr.amount}₺</span>
                            <span className="font-bold text-purple-500">+{qr.points} puan</span>
                            <span>{new Date(qr.issued_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        {qr.status === 'pending' && !isQRExpired(qr.expires_at) && (
                          <Countdown expiresAt={qr.expires_at} />
                        )}
                        {qr.status === 'used' && (
                          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ INVENTORY CODES TAB ══ */}
        {tab === 'inventory' && (
          <div className="space-y-4">
            {invLoading && <div className="text-center py-6 text-gray-400 font-bold">Yükleniyor...</div>}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Toplam Ürün', val: invItems.length },
                { label: 'Aktif Kod',   val: invItems.filter(i => !i.used).length },
                { label: 'Kullanıldı',  val: invItems.filter(i => i.used).length },
              ].map(s => (
                <div key={s.label} className={`${card} p-4 text-center`}>
                  <p className="font-black text-2xl">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {invItems.map(item => {
                const color = typeColor[item.type ?? ''] || '#7B6EF6';
                const label = typeLabel[item.type ?? ''] || item.type || '';
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className={`${card} p-4`}>
                    <div className="flex items-start gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-black dark:border-gray-600" style={{ opacity: item.used ? 0.5 : 1 }} />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex-shrink-0 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl" style={{ background: `${color}18`, opacity: item.used ? 0.5 : 1 }}>
                          🎁
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-black text-sm" style={{ textDecoration: item.used ? 'line-through' : 'none', opacity: item.used ? 0.6 : 1 }}>{item.title}</p>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full border" style={{ color, borderColor: color, background: `${color}18` }}>{label}</span>
                          {item.used && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Kullanıldı</span>}
                        </div>
                        {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">{item.description}</p>}
                        <p className="text-xs text-gray-400 mb-2">
                          {item.points > 0 && <span className="font-bold text-amber-500 mr-2">{item.points.toLocaleString('tr-TR')} pts</span>}
                          Son kullanım: {item.expires ? new Date(item.expires).toLocaleDateString('tr-TR') : 'N/A'}
                        </p>
                        {isEditing ? (
                          <div className="flex gap-2 items-center">
                            <input value={editCode} onChange={e => setEditCode(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === 'Enter') void saveEdit(item.id); }}
                              className="input-field font-mono text-sm flex-1 py-2" style={{ letterSpacing: '0.08em' }} autoFocus disabled={invSavingId === item.id} />
                            <button onClick={() => void saveEdit(item.id)} disabled={invSavingId === item.id} className="p-2 rounded-xl bg-green-500 border-2 border-black shadow-[0_2px_0_#000] hover:shadow-none hover:translate-y-0.5 transition-all disabled:opacity-60"><Save size={14} className="text-white" /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-gray-600"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-sm font-black tracking-widest flex-1 min-w-0" style={{ background: `${color}14`, border: `2px dashed ${color}` }}>
                              <span className="truncate">{item.code}</span>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button onClick={() => handleInvCopy(item.code)} title="Kopyala" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-white dark:bg-gray-700 hover:shadow-none hover:translate-y-0.5 transition-all">
                                {invCopied === item.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                              </button>
                              <button onClick={() => setInvPreview(item.code)} title="QR Göster" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 hover:shadow-none hover:translate-y-0.5 transition-all">
                                <QrCode size={13} className="text-purple-600" />
                              </button>
                              {!item.used && (
                                <button onClick={() => startEdit(item)} title="Düzenle" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 hover:shadow-none hover:translate-y-0.5 transition-all">
                                  <Edit2 size={13} className="text-amber-600" />
                                </button>
                              )}
                              {!item.used && (
                                <button onClick={() => void regenCode(item.id, item.type ?? 'reward')} disabled={invSavingId === item.id} title="Kodu Yenile" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:shadow-none hover:translate-y-0.5 transition-all disabled:opacity-60">
                                  <RefreshCw size={13} className={`text-blue-600 ${invSavingId === item.id ? 'animate-spin' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STORE QR TAB ══ */}
        {tab === 'store' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Toplam Kod',  val: codes.length.toString() },
                { label: 'Aktif',       val: codes.filter(c => c.active).length.toString() },
                { label: 'Toplam Tara', val: codes.reduce((s, c) => s + (c.uses_count ?? 0), 0).toLocaleString() },
              ].map(s => (
                <div key={s.label} className={`${card} p-4 text-center`}>
                  <p className="font-black text-2xl">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {codesLoading ? (
              <div className="text-center py-10 text-gray-400 font-bold">Yükleniyor...</div>
            ) : codes.length === 0 ? (
              <div className={`${card} p-8 text-center text-gray-400`}>
                <QrCode size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">Henüz QR kodu yok</p>
                <p className="text-xs mt-1">+ Yeni QR Kod butonuna tıklayın</p>
              </div>
            ) : (
              <div className="space-y-3">
                {codes.map(qr => (
                  <div key={qr.id} className={`${card} p-4`}>
                    <div className="flex items-start gap-4">
                      <button onClick={() => setPreviewCode(qr.code)} title="QR Önizle" className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr.code)}&size=60x60&margin=4`} alt="qr" style={{ width: 50, height: 50 }} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-mono font-black text-sm tracking-wider truncate">{qr.code}</p>
                          <button onClick={() => handleCopy(qr.code)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                            {copied === qr.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{qr.label ?? '—'}</p>
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="font-bold text-amber-500">+{qr.points} puan</span>
                          <span className="text-gray-400">{(qr.uses_count ?? 0).toLocaleString()} tarama{qr.max_uses ? ` / ${qr.max_uses}` : ''}</span>
                          <button onClick={() => toggleActive(qr.id, qr.active)} className={`flex items-center gap-1 font-bold transition-colors ${qr.active ? 'text-green-500' : 'text-gray-400'}`}>
                            {qr.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {qr.active ? 'Aktif' : 'Pasif'}
                          </button>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(qr.id)} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQR;
