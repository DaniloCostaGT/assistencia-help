import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkOrder, WorkOrderStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useWorkOrders() {
  const { organizationId } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    if (!organizationId) {
      setWorkOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('work_orders')
      .select('*, client:clients(*)')
      .eq('tenant_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setWorkOrders((data as WorkOrder[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const addWorkOrder = useCallback(
    async (
      order: Pick<
        WorkOrder,
        'client_id' | 'device_model' | 'imei_serial' | 'reported_fault' | 'estimated_price' | 'checklist' | 'pattern_lock'
      >
    ) => {
      if (!organizationId) {
        throw new Error('Identificador da assistência não encontrado. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('work_orders')
        .insert({
          ...order,
          tenant_id: organizationId,
        })
        .select('*, client:clients(*)')
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (data) setWorkOrders((prev) => [data as WorkOrder, ...prev]);
      return data;
    },
    [organizationId]
  );

  const updateStatus = useCallback(
    async (id: string, status: WorkOrderStatus) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, client:clients(*)')
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (data) {
        setWorkOrders((prev) => prev.map((wo) => (wo.id === id ? (data as WorkOrder) : wo)));
      }
      return data;
    },
    []
  );

  return { workOrders, loading, error, addWorkOrder, updateStatus, refetch: fetchWorkOrders };
}