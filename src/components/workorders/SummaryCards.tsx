import { ClipboardList, Clock, CheckCircle2, PackageCheck } from 'lucide-react';
import { WorkOrder } from '@/types';

interface SummaryCardsProps {
  workOrders: WorkOrder[];
}

export function SummaryCards({ workOrders }: SummaryCardsProps) {
  const total = workOrders.length;
  const pending = workOrders.filter((o) => o.status === 'pending').length;
  const approved = workOrders.filter((o) => o.status === 'approved').length;
  const completed = workOrders.filter((o) => o.status === 'delivered').length;

  const cards = [
    { label: 'Total de OS', value: total, icon: ClipboardList, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    { label: 'Pendentes', value: pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15' },
    { label: 'Aprovadas', value: approved, icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/15' },
    { label: 'Concluídas', value: completed, icon: PackageCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
            <Icon size={20} className={color} />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
