import { Eye, ArrowRight, Smartphone } from 'lucide-react';
import { StatusBadge, STATUS_FLOW } from '@/components/workorders/StatusBadge';
import { WorkOrder } from '@/types';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onView: (order: WorkOrder) => void;
  onAdvance: (order: WorkOrder) => void;
}

function nextStatusLabel(order: WorkOrder) {
  const idx = STATUS_FLOW.indexOf(order.status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function WorkOrdersTable({ workOrders, onView, onAdvance }: WorkOrdersTableProps) {
  if (workOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
        <Smartphone size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma ordem de serviço ainda. Crie uma para começar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">Aparelho</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Defeito</th>
              <th className="px-5 py-3">Preço</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((order) => {
              const next = nextStatusLabel(order);
              return (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{order.device_model}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{order.client?.name ?? 'Sem cadastro'}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                    {order.reported_fault}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {order.estimated_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {next && (
                        <button
                          onClick={() => onAdvance(order)}
                          title={`Avançar para ${next}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => onView(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <Eye size={13} /> Ver
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {workOrders.map((order) => {
          const next = nextStatusLabel(order);
          return (
            <div key={order.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{order.device_model}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{order.client?.name ?? 'Sem cadastro'}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{order.reported_fault}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {order.estimated_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <div className="flex items-center gap-2">
                  {next && (
                    <button
                      onClick={() => onAdvance(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      <ArrowRight size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => onView(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <Eye size={13} /> Ver
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
