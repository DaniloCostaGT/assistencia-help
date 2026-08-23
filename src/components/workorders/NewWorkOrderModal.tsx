import { FormEvent, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { EntryChecklist } from '@/components/workorders/EntryChecklist';
import { PatternLock } from '@/components/workorders/PatternLock';
import { Client, DEFAULT_CHECKLIST, WorkOrderChecklist } from '@/types';

interface NewWorkOrderModalProps {
  clients: Client[];
  onClose: () => void;
  onSubmit: (order: {
    client_id: string | null;
    device_model: string;
    imei_serial: string;
    reported_fault: string;
    estimated_price: number;
    checklist: WorkOrderChecklist;
    pattern_lock: number[] | null;
  }) => Promise<unknown>;
}

export function NewWorkOrderModal({ clients, onClose, onSubmit }: NewWorkOrderModalProps) {
  const [clientId, setClientId] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [imeiSerial, setImeiSerial] = useState('');
  const [reportedFault, setReportedFault] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [checklist, setChecklist] = useState<WorkOrderChecklist>(DEFAULT_CHECKLIST);
  const [hasPattern, setHasPattern] = useState(false);
  const [patternLock, setPatternLock] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim() || !reportedFault.trim()) {
      setError('Preencha o modelo do aparelho e o defeito relatado.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        client_id: clientId || null,
        device_model: deviceModel.trim(),
        imei_serial: imeiSerial.trim(),
        reported_fault: reportedFault.trim(),
        estimated_price: parseFloat(estimatedPrice) || 0,
        checklist,
        pattern_lock: hasPattern && patternLock.length > 0 ? patternLock : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a ordem de serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Nova Ordem de Serviço" onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cliente</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sem cadastro / Sem cliente selecionado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.whatsapp}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Modelo do Aparelho <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="Ex.: iPhone 11"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              IMEI / Número de Série
            </label>
            <input
              type="text"
              value={imeiSerial}
              onChange={(e) => setImeiSerial(e.target.value)}
              placeholder="Ex.: 356789102345678"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Preço Estimado (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Defeito Relatado <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reportedFault}
            onChange={(e) => setReportedFault(e.target.value)}
            rows={2}
            placeholder="O que o cliente diz estar com problema no aparelho"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Checklist de Entrada</p>
          <EntryChecklist checklist={checklist} onChange={setChecklist} />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={hasPattern}
              onChange={(e) => setHasPattern(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Lock size={14} /> O aparelho tem padrão de desbloqueio
            </span>
          </label>
          {hasPattern && (
            <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <PatternLock value={patternLock} onChange={setPatternLock} />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Criar Ordem de Serviço
          </button>
        </div>
      </form>
    </Modal>
  );
}
