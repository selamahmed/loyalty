import { supabase } from '../lib/supabase';
import { getRecentPointsTransactions } from './admin';
import { createEvent, updateEvent, deleteEvent, getAllEvents } from './events';
import type { AppEvent } from './events';

/* ── Types ─────────────────────────────────────────────────── */

export type PointRule = {
  id: string;
  name: string;
  rule_type: string;
  value: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PointsTransactionRow = {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'earned' | 'spent' | 'adjusted' | 'expired';
  displayType: 'earned' | 'spent' | 'adjusted' | 'bonus' | 'expired';
  source: string;
  category: string | null;
  createdAt: string;
};

export type BonusCampaign = {
  id: string;
  name: string;
  description: string;
  bonusMultiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type PointsEconomyStats = {
  totalEarned: number;
  totalSpent: number;
  activeRules: number;
};

/* ── Helpers ───────────────────────────────────────────────── */

function parseMultiplier(mult: string | null | undefined): number {
  if (!mult) return 1;
  const n = parseFloat(String(mult).replace(/x/gi, '').trim());
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function formatMultiplier(n: number): string {
  return Number.isInteger(n) ? `${n}x` : `${n}x`;
}

function mapEventToCampaign(e: AppEvent): BonusCampaign {
  return {
    id:              e.id,
    name:            e.title,
    description:     e.description ?? '',
    bonusMultiplier: parseMultiplier(e.multiplier),
    startDate:       e.start_date,
    endDate:         e.end_date,
    isActive:        e.active,
  };
}

function mapTransaction(row: Record<string, unknown>): PointsTransactionRow {
  const type = row.type as PointsTransactionRow['type'];
  const category = (row.category as string | null) ?? null;
  const profiles = row.profiles as { username?: string | null; email?: string | null } | null;

  let displayType: PointsTransactionRow['displayType'] = type;
  if (type === 'earned' && (category === 'bonus' || category === 'referral')) {
    displayType = 'bonus';
  }

  return {
    id:          row.id as string,
    userId:      row.user_id as string,
    username:    profiles?.username ?? profiles?.email ?? (row.user_id as string).slice(0, 8),
    amount:      row.amount as number,
    type,
    displayType,
    source:      (row.description as string) || category || '—',
    category,
    createdAt:   row.created_at as string,
  };
}

/* ── Stats ─────────────────────────────────────────────────── */

export async function getPointsEconomyStats(): Promise<PointsEconomyStats> {
  const [earnedRes, spentRes, rulesRes] = await Promise.all([
    supabase.from('points_transactions').select('amount').eq('type', 'earned'),
    supabase.from('points_transactions').select('amount').eq('type', 'spent'),
    supabase.from('point_rules').select('id').eq('active', true),
  ]);

  if (earnedRes.error) throw earnedRes.error;
  if (spentRes.error) throw spentRes.error;
  if (rulesRes.error) throw rulesRes.error;

  return {
    totalEarned: (earnedRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0),
    totalSpent:  (spentRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0),
    activeRules: (rulesRes.data ?? []).length,
  };
}

/* ── Transactions ──────────────────────────────────────────── */

export async function getPointsEconomyTransactions(limit = 100): Promise<PointsTransactionRow[]> {
  const data = await getRecentPointsTransactions(limit);
  return data.map(r => mapTransaction(r as Record<string, unknown>));
}

/* ── Point rules ───────────────────────────────────────────── */

export async function getPointRules(): Promise<PointRule[]> {
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PointRule[];
}

export async function createPointRule(input: {
  name: string;
  rule_type: string;
  value: number;
}): Promise<PointRule> {
  const { data, error } = await supabase
    .from('point_rules')
    .insert({
      name:      input.name.trim(),
      rule_type: input.rule_type,
      value:     input.value,
      active:    true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PointRule;
}

export async function updatePointRule(
  id: string,
  updates: Partial<Pick<PointRule, 'name' | 'rule_type' | 'value' | 'active'>>,
): Promise<PointRule> {
  const { data, error } = await supabase
    .from('point_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PointRule;
}

export async function deletePointRule(id: string): Promise<void> {
  const { error } = await supabase.from('point_rules').delete().eq('id', id);
  if (error) throw error;
}

/* ── Bonus campaigns (stored in events table) ───────────────── */

export async function getBonusCampaigns(): Promise<BonusCampaign[]> {
  const events = await getAllEvents();
  return events
    .filter(e => e.multiplier && e.multiplier !== '1x')
    .map(mapEventToCampaign);
}

export async function createBonusCampaign(input: {
  name: string;
  description: string;
  bonusMultiplier: number;
  startDate: string;
  endDate: string;
}): Promise<BonusCampaign> {
  const event = await createEvent({
    title:       input.name.trim(),
    description: input.description.trim(),
    start_date:  new Date(input.startDate).toISOString(),
    end_date:    new Date(input.endDate).toISOString(),
    active:      true,
    multiplier:  formatMultiplier(input.bonusMultiplier),
    image:       null,
    color:       '#7B6EF6',
    emoji:       '⚡',
  });
  return mapEventToCampaign(event);
}

export async function toggleBonusCampaign(id: string, active: boolean): Promise<void> {
  await updateEvent(id, { active });
}

export async function deleteBonusCampaign(id: string): Promise<void> {
  await deleteEvent(id);
}
