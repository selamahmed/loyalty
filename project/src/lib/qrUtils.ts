/* ─────────────────────────────────────────────
   QR UTILITIES  –  frontend-only, localStorage
───────────────────────────────────────────── */

export type QRStatus = 'pending' | 'used' | 'expired';

export interface CashierQRPayload {
  type: 'cashier_purchase';
  qr_id: string;
  amount: number;
  points: number;
  merchant_id: string;
  issued_at: string;
  expires_at: string;
  status: QRStatus;
  used_at?: string;
}

export interface InventoryQRPayload {
  type: 'item_redemption';
  qr_id: string;
  item_id: string;
  item_code: string;
  item_title: string;
  item_type: string;
  expires: string;
  issued_at: string;
}

export type ParsedQR = CashierQRPayload | InventoryQRPayload | { type: 'unknown'; raw: string };

const LS_KEY = 'loyalty_cashier_qrs';
const POINTS_PER_TL = 1;
const QR_TTL_MS = 5 * 60 * 1000; // 5 minutes

/* ── ID generator ── */
export function generateQRId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'QR-';
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/* ── Create cashier purchase QR payload ── */
export function createCashierQRPayload(amount: number): CashierQRPayload {
  const now = new Date();
  const exp = new Date(now.getTime() + QR_TTL_MS);
  return {
    type: 'cashier_purchase',
    qr_id: generateQRId(),
    amount,
    points: Math.round(amount * POINTS_PER_TL),
    merchant_id: 'merchant_001',
    issued_at: now.toISOString(),
    expires_at: exp.toISOString(),
    status: 'pending',
  };
}

/* ── Create inventory redemption QR payload ── */
export function createInventoryQRPayload(item: {
  id: string; code: string; title: string; type: string; expires: string;
}): InventoryQRPayload {
  return {
    type: 'item_redemption',
    qr_id: generateQRId(),
    item_id: item.id,
    item_code: item.code,
    item_title: item.title,
    item_type: item.type,
    expires: item.expires,
    issued_at: new Date().toISOString(),
  };
}

/* ── Parse scanned QR string ── */
export function parseQRPayload(raw: string): ParsedQR {
  const trimmed = raw.trim();
  try {
    const obj = JSON.parse(trimmed);
    if (obj?.type === 'cashier_purchase') return obj as CashierQRPayload;
    if (obj?.type === 'item_redemption')  return obj as InventoryQRPayload;
  } catch { /* not JSON */ }
  return { type: 'unknown', raw: trimmed };
}

export function isCashierQR(p: ParsedQR): p is CashierQRPayload {
  return p.type === 'cashier_purchase';
}
export function isInventoryQR(p: ParsedQR): p is InventoryQRPayload {
  return p.type === 'item_redemption';
}

/* ── Validity check ── */
export function isQRExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function msRemaining(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

/* ── localStorage persistence ── */
export function loadCashierQRs(): CashierQRPayload[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch { return []; }
}

export function saveCashierQR(qr: CashierQRPayload): void {
  const list = loadCashierQRs();
  localStorage.setItem(LS_KEY, JSON.stringify([qr, ...list]));
}

export function markCashierQRUsed(qr_id: string): void {
  const list = loadCashierQRs().map(q =>
    q.qr_id === qr_id ? { ...q, status: 'used' as QRStatus, used_at: new Date().toISOString() } : q
  );
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function getCashierQR(qr_id: string): CashierQRPayload | undefined {
  return loadCashierQRs().find(q => q.qr_id === qr_id);
}

/* ── Audit log ── */
export interface QRAuditEntry {
  id: string;
  ts: string;
  event: 'qr_generated' | 'qr_scanned' | 'qr_expired' | 'item_redeemed';
  qr_id: string;
  detail: string;
  points?: number;
}

const AUDIT_KEY = 'loyalty_qr_audit';

export function appendAuditLog(entry: Omit<QRAuditEntry, 'id' | 'ts'>): void {
  try {
    const log: QRAuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) ?? '[]');
    log.unshift({ ...entry, id: generateQRId(), ts: new Date().toISOString() });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, 200)));
  } catch { /* silent */ }
}

export function loadAuditLog(): QRAuditEntry[] {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? '[]'); }
  catch { return []; }
}
