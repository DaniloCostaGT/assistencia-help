import { Smartphone, Wifi, Camera, Fingerprint, Hash, User, DollarSign, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PatternLock } from '@/components/workorders/PatternLock';
import { StatusBadge, STATUS_FLOW, STATUS_LABELS } from '@/components/workorders/StatusBadge';
import { WorkOrder, WorkOrderStatus } from '@/types';

interface WorkOrderDetailsModalProps {
  order: WorkOrder;
  onClose: () => void;
  onStatusChange: (status: WorkOrderStatus) => void;
  updating: boolean;
}

const CHECK_ITEMS: { key: 'touchscreen' | 'wifi' | 'cameras' | 'biometrics'; label: string; icon: typeof Smartphone }[] = [
  { key: 'touchscreen', label: 'Touchscreen', icon: Smartphone },
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'cameras', label: 'Câmeras', icon: Camera },
  { key: 'biometrics', label: 'Biometria', icon: Fingerprint },
];

const POWER_LABELS: Record<string, string> = {
  powers_on: 'Liga',
  intermittent: 'Intermitente',
  does_not_power_on: 'Não Liga',
};

export function WorkOrderDetailsModal({ order, onClose, onStatusChange, updating }: WorkOrderDetailsModalProps) {
  return (
    <Modal title={order.device_model} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Calendar size={14} /> {new Date(order.created_at).toLocaleString()}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2.5">
            <User size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Cliente</p>
              <p className="font-medium text-slate-900 dark:text-white">{order.client?.name ?? 'Sem cadastro'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Hash size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">IMEI / Número de Série</p>
              <p className="font-medium text-slate-900 dark:text-white">{order.imei_serial || 'Não informado'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 sm:col-span-2">
            <DollarSign size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Preço Estimado</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {order.estimated_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
            Defeito Relatado
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3.5 py-2.5">
            {order.reported_fault}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            Checklist de Entrada
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {CHECK_ITEMS.map(({ key, label, icon: Icon }) => {
              const isOk = order.checklist?.[key];
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 ${
                    isOk
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
                  }`}
                >
                  <Icon size={16} className={isOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400 text-xs block">Estado de Energia</span>
              {POWER_LABELS[order.checklist?.power_status] ?? 'Não informado'}
            </p>
            <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400 text-xs block">Arranhões no Corpo</span>
              {order.checklist?.body_scratches || 'Nenhum registrado'}
            </p>
          </div>
        </div>

        {order.pattern_lock && order.pattern_lock.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              Padrão de Desbloqueio
            </p>
            <div className="flex justify-center">
              <PatternLock value={order.pattern_lock} readOnly size={160} />
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            Atualizar Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map((status) => (
              <button
                key={status}
                disabled={updating}
                onClick={() => onStatusChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                  order.status === status
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {STATUS_LABELS[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
