import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useClients() {
  const { organizationId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!organizationId) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setClients(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(
    async (client: Omit<Client, 'id' | 'created_at'>) => {
      if (!organizationId) {
        throw new Error('Identificador da assistência não encontrado. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          tenant_id: organizationId,
        })
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (data) setClients((prev) => [data, ...prev]);
      return data;
    },
    [organizationId]
  );

  return { clients, loading, error, addClient, refetch: fetchClients };
}