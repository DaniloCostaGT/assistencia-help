import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useClients() {
  const { user, organizationId: contextOrgId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para garantir a obtenção do ID da organização/tenant
  const getOrFetchOrganizationId = async (): Promise<string | null> => {
    if (contextOrgId) return contextOrgId;
    if (!user) return null;

    // Tenta buscar no banco a organização do usuário logado
    let { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (org) return org.id;

    // Se a organização não existir na tabela, cria uma automaticamente
    const defaultName = `Assistência de ${user.email?.split('@')[0] || 'Técnico'}`;
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: defaultName,
        owner_id: user.id,
      })
      .select('id')
      .single();

    if (createError || !newOrg) return null;
    return newOrg.id;
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const orgId = await getOrFetchOrganizationId();

      if (!orgId) {
        setClients([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('tenant_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setClients(data ?? []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  }, [user, contextOrgId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(
    async (client: Omit<Client, 'id' | 'created_at'>) => {
      const orgId = await getOrFetchOrganizationId();

      if (!orgId) {
        throw new Error('Identificador da assistência não encontrado. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          tenant_id: orgId,
        })
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (data) setClients((prev) => [data, ...prev]);
      return data;
    },
    [user, contextOrgId]
  );

  return { clients, loading, error, addClient, refetch: fetchClients };
}