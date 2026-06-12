import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type AppEvent = Database['public']['Tables']['events']['Row'];

export async function getActiveEvents(): Promise<AppEvent[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllEvents(): Promise<AppEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(event: Omit<AppEvent, 'id' | 'created_at'>): Promise<AppEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: Partial<AppEvent>): Promise<AppEvent> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
