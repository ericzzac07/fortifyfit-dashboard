import { supabase } from './supabase';
import type { WeeklyKpi, IdeaBoxItem } from './types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== 'your-supabase-url';
};

// --- WeeklyKpi ---

export async function getWeeklyKpi(weekStart: string): Promise<WeeklyKpi | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from('weekly_kpi')
    .select('*')
    .eq('week_start', weekStart)
    .single();
  return data;
}

export async function upsertWeeklyKpi(kpi: WeeklyKpi): Promise<WeeklyKpi | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from('weekly_kpi')
    .upsert(kpi, { onConflict: 'week_start' })
    .select()
    .single();
  return data;
}

export async function getAllWeeklyKpi(): Promise<WeeklyKpi[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from('weekly_kpi')
    .select('*')
    .order('week_start', { ascending: true });
  return data || [];
}

// --- IdeaBox ---

export async function getIdeas(): Promise<IdeaBoxItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from('idea_box')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addIdea(idea: Omit<IdeaBoxItem, 'id' | 'created_at'>): Promise<IdeaBoxItem | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from('idea_box')
    .insert(idea)
    .select()
    .single();
  return data;
}
