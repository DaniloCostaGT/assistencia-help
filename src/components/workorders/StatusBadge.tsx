import { WorkOrderStatus } from '@/types';

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; classes: string }> = {
  pending: {
    label: 'Pendente',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  },
  evaluating: {
    label: 'Em Avaliação',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  },
  approved: {
    label: 'Aprovada',
    classes: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
  },
  ready: {
    label: 'Pronto',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  delivered: {
    label: 'Entregue',
    classes: 'bg-slate-200 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  },
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.classes}`}>
      {config.label}
    </span>
  );
}

export const STATUS_FLOW: WorkOrderStatus[] = ['pending', 'evaluating', 'approved', 'ready', 'delivered'];
export const STATUS_LABELS = STATUS_CONFIG;
