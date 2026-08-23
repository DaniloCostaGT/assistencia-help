import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setClients(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(
    async (client: Omit<Client, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('clients').insert(client).select().maybeSingle();
      if (error) throw new Error(error.message);
      if (data) setClients((prev) => [data, ...prev]);
      return data;
    },
    []
  );

  return { clients, loading, error, addClient, refetch: fetchClients };
}
