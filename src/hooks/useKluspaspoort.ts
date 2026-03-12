import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface KluspaspoortEntry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  performed_by: string;
  handyman_name: string | null;
  date_performed: string;
  photos: string[];
  cost: number | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useKluspaspoort = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KluspaspoortEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await (supabase
      .from('kluspaspoort_entries' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('date_performed', { ascending: false }) as any);
    setEntries((data as KluspaspoortEntry[]) || []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (entry: Omit<KluspaspoortEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    const { data, error } = await (supabase
      .from('kluspaspoort_entries' as any)
      .insert({ ...entry, user_id: user.id })
      .select()
      .single() as any);
    if (!error && data) {
      setEntries(prev => [data as KluspaspoortEntry, ...prev]);
    }
    return { data, error };
  };

  const deleteEntry = async (id: string) => {
    const { error } = await (supabase
      .from('kluspaspoort_entries' as any)
      .delete()
      .eq('id', id) as any);
    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
    return { error };
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('kluspaspoort')
      .upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('kluspaspoort').getPublicUrl(path);
    return data.publicUrl;
  };

  return { entries, isLoading, addEntry, deleteEntry, uploadPhoto, refresh: fetchEntries };
};
