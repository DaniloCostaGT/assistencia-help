import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useClients } from '@/hooks/useClients';
import { SummaryCards } from '@/components/workorders/SummaryCards';
import { WorkOrdersTable } from '@/components/workorders/WorkOrdersTable';
import { NewWorkOrderModal } from '@/components/workorders/NewWorkOrderModal';
import { WorkOrderDetailsModal } from '@/components/workorders/WorkOrderDetailsModal';
import { STATUS_FLOW } from '@/components/workorders/StatusBadge';
import { WorkOrder, WorkOrderStatus } from '@/types';

export function WorkOrdersPage() {
  const { workOrders, loading, error, addWorkOrder, updateStatus } = useWorkOrders();
  const { clients } = useClients();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (order: WorkOrder, status: WorkOrderStatus) => {
    setUpdating(true);
    try {
      const updated = await updateStatus(order.id, status);
      if (updated) setSelectedOrder(updated as WorkOrder);
    } catch {
      // surfaced via table refresh; no-op fallback
    } finally {
      setUpdating(false);
    }
  };

  const handleAdvance = (order: WorkOrder) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
    handleStatusChange(order, STATUS_FLOW[idx + 1]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:hidden">Visão Geral</h2>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] transition-all ml-auto"
        >
          <Plus size={16} /> Nova Ordem de Serviço
        </button>
      </div>

      <SummaryCards workOrders={workOrders} />

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3.5 py-2.5">
          Não foi possível carregar as ordens de serviço: {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <WorkOrdersTable workOrders={workOrders} onView={setSelectedOrder} onAdvance={handleAdvance} />
      )}

      {showNewModal && (
        <NewWorkOrderModal
          clients={clients}
          onClose={() => setShowNewModal(false)}
          onSubmit={addWorkOrder}
        />
      )}

      {selectedOrder && (
        <WorkOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => handleStatusChange(selectedOrder, status)}
          updating={updating}
        />
      )}
    </div>
  );
}
