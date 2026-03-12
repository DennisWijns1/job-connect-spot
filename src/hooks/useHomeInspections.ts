import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface HomeInspection {
  id: string;
  user_id: string;
  type: string;
  custom_label: string | null;
  date_performed: string;
  next_due: string;
  interval_years: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const INSPECTION_TYPES = [
  { value: 'gasketel', label: '🔥 Gasketel', interval: 1 },
  { value: 'schoorsteen', label: '🏠 Schoorsteen/Schouw', interval: 1 },
  { value: 'elektrisch', label: '⚡ Elektrische keuring', interval: 25 },
  { value: 'stookolietank', label: '🛢️ Stookolietank', interval: 3 },
  { value: 'rookmelders', label: '🔔 Rookmelders', interval: 1 },
  { value: 'brandblusser', label: '🧯 Brandblusser', interval: 2 },
  { value: 'septische_put', label: '🚰 Septische put', interval: 2 },
  { value: 'lift', label: '🛗 Lift', interval: 1 },
  { value: 'aangepast', label: '📋 Aangepaste keuring', interval: 1 },
] as const;

export function getInspectionStatus(nextDue: string): 'ok' | 'warning' | 'expired' {
  const now = new Date();
  const due = new Date(nextDue);
  const twoMonthsBefore = new Date(due);
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);

  if (now > due) return 'expired';
  if (now >= twoMonthsBefore) return 'warning';
  return 'ok';
}

export const useHomeInspections = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<HomeInspection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInspections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase.from('home_inspections' as any).select('*') as any)
      .eq('user_id', user.id)
      .order('next_due', { ascending: true });
    if (data) setInspections(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInspections(); }, [fetchInspections]);

  const addInspection = async (inspection: Omit<HomeInspection, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    if (!user) return null;
    const status = getInspectionStatus(inspection.next_due);
    const { data, error } = await (supabase.from('home_inspections' as any) as any).insert({
      ...inspection,
      user_id: user.id,
      status,
    }).select().single();
    if (!error && data) {
      setInspections(prev => [...prev, data].sort((a: any, b: any) => new Date(a.next_due).getTime() - new Date(b.next_due).getTime()));
    }
    return { data, error };
  };

  const deleteInspection = async (id: string) => {
    const { error } = await (supabase.from('home_inspections' as any) as any).delete().eq('id', id);
    if (!error) setInspections(prev => prev.filter(i => i.id !== id));
    return { error };
  };

  return { inspections, loading, addInspection, deleteInspection, refetch: fetchInspections };
};
