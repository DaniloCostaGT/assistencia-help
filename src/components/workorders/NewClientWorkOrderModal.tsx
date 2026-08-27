import { FormEvent, useState, useEffect, useRef } from 'react';
import { Client, DEFAULT_CHECKLIST, WorkOrderChecklist } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { EntryChecklist } from '@/components/workorders/EntryChecklist';
import { PatternLock } from '@/components/workorders/PatternLock';
import { QuickClientModal } from '@/components/workorders/QuickClientModal';
import { Lock, Loader2, Clock, UserPlus } from 'lucide-react';
import { buscarAparelhos } from '@/lib/supabase';

interface Props {
  client: Client;
  onClose: () => void;
  onSubmit: (order: {
    client_id: string;
    device_model: string;
    imei_serial: string;
    reported_fault: string;
    estimated_price: number;
    checklist: WorkOrderChecklist;
    pattern_lock: number[] | null;
    entry_time: string;
  }) => Promise<unknown>;
}

function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export function NewClientWorkOrderModal({ client: initialClient, onClose, onSubmit }: Props) {
  const [currentClient, setCurrentClient] = useState<Client>(initialClient);
  const [deviceModel, setDeviceModel] = useState('');
  const [imei, setImei] = useState('');
  const [fault, setFault] = useState('');
  const [price, setPrice] = useState('');
  const [entryTime, setEntryTime] = useState(getCurrentDateTimeLocal());
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [hasPattern, setHasPattern] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de cadastro rápido de novo cliente
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);

  // Estados para autocompletar aparelhos
  const [sugestoesAparelhos, setSugestoesAparelhos] = useState<{ id: string; marca: string; modelo: string }[]>([]);
  const [mostrandoSugestoes, setMostrandoSugestoes] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMostrandoSugestoes(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeviceModelChange = async (val: string) => {
    setDeviceModel(val);
    if (val.trim().length >= 2) {
      const resultados = await buscarAparelhos(val);
      setSugestoesAparelhos(resultados);
      setMostrandoSugestoes(true);
    } else {
      setSugestoesAparelhos([]);
      setMostrandoSugestoes(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!deviceModel.trim() || !fault.trim()) {
      setError('Modelo do aparelho e defeito relatado são obrigatórios.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        client_id: currentClient.id,
        device_model: deviceModel.trim(),
        imei_serial: imei.trim(),
        reported_fault: fault.trim(),
        estimated_price: Number(price) || 0,
        checklist,
        pattern_lock: hasPattern && pattern.length ? pattern : null,
        entry_time: new Date(entryTime).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a ordem de serviço.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal title={`Nova Ordem de Serviço · ${currentClient.name}`} onClose={onClose} maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          {/* Cabeçalho de seleção do cliente */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cliente Selecionado</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentClient.name} <span className="text-slate-500 font-normal">({currentClient.whatsapp})</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickClientOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <UserPlus size={14} /> Cadastrar outro cliente
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Campo com Autocompletar */}
            <div ref={wrapperRef} className="relative">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Modelo do Aparelho *
                <input
                  value={deviceModel}
                  onChange={(e) => handleDeviceModelChange(e.target.value)}
                  onFocus={() => deviceModel.trim().length >= 2 && setMostrandoSugestoes(true)}
                  placeholder="Ex.: iPhone 11, Galaxy A54..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {/* Menu suspenso de sugestões */}
              {mostrandoSugestoes && sugestoesAparelhos.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1 text-sm">
                  {sugestoesAparelhos.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setDeviceModel(`${item.marca} ${item.modelo}`);
                        setMostrandoSugestoes(false);
                      }}
                      className="px-3.5 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/40 last:border-none transition-colors"
                    >
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.marca}</span> {item.modelo}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Preço Estimado
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-blue-500" /> Hora de Entrada
              </span>
              <input
                type="datetime-local"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              IMEI / Número de Série
              <input
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="Identificador do aparelho"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Defeito Relatado *
            <textarea
              rows={2}
              value={fault}
              onChange={(e) => setFault(e.target.value)}
              placeholder="O que precisa ser reparado?"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Checklist de Entrada</p>
            <EntryChecklist checklist={checklist} onChange={setChecklist} />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPattern}
              onChange={(e) => setHasPattern(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Lock size={14} /> O aparelho tem padrão de desbloqueio
          </label>

          {hasPattern && (
            <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <PatternLock value={pattern} onChange={setPattern} />
            </div>
          )}

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Criar Ordem de Serviço
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de cadastro rápido ativado pelo botão */}
      <QuickClientModal
        isOpen={isQuickClientOpen}
        onClose={() => setIsQuickClientOpen(false)}
        onClientCreated={(newClient) => {
          setCurrentClient(newClient as Client);
        }}
      />
    </>
  );
}