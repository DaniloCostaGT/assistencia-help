import { Smartphone, Wifi, Camera, Fingerprint, Power, PowerOff, Zap, AlertTriangle } from 'lucide-react';
import { PowerStatus, WorkOrderChecklist } from '@/types';
import { useState } from 'react';

interface EntryChecklistProps {
  checklist: WorkOrderChecklist;
  onChange: (checklist: WorkOrderChecklist) => void;
}

const TOGGLE_ITEMS: { key: 'touchscreen' | 'wifi' | 'cameras' | 'biometrics'; label: string; icon: typeof Smartphone }[] = [
  { key: 'touchscreen', label: 'Touchscreen', icon: Smartphone },
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'cameras', label: 'Câmeras', icon: Camera },
  { key: 'biometrics', label: 'Biometria', icon: Fingerprint },
];

const POWER_OPTIONS: { key: PowerStatus; label: string; icon: typeof Power }[] = [
  { key: 'powers_on', label: 'Liga', icon: Power },
  { key: 'intermittent', label: 'Intermitente', icon: Zap },
  { key: 'does_not_power_on', label: 'Não Liga', icon: PowerOff },
];

export function EntryChecklist({ checklist, onChange }: EntryChecklistProps) {
  const [untestable, setUntestable] = useState(false);

  const toggle = (key: (typeof TOGGLE_ITEMS)[number]['key']) => {
    if (untestable) return;
    onChange({ ...checklist, [key]: !checklist[key] });
  };

  const handleUntestableToggle = (checked: boolean) => {
    setUntestable(checked);
    if (checked) {
      // Marca todos os testes como false (com defeito/não testado) e adiciona observação
      const aviso = "Aparelho com tela quebrada/sem imagem - Impossibilitado de testar outros componentes.";
      const notasAtuais = checklist.body_scratches ? `${checklist.body_scratches} | ${aviso}` : aviso;

      onChange({
        ...checklist,
        touchscreen: false,
        wifi: false,
        cameras: false,
        biometrics: false,
        body_scratches: notasAtuais,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão de Alerta para Aparelho Impossibilitado de Testar */}
      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={untestable}
          onChange={(e) => handleUntestableToggle(e.target.checked)}
          className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
        />
        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
          Tela quebrada / Sem imagem (Impossível testar funções no recebimento)
        </span>
      </label>

      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${untestable ? 'opacity-50 pointer-events-none' : ''}`}>
        {TOGGLE_ITEMS.map(({ key, label, icon: Icon }) => {
          const isOk = checklist[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              disabled={untestable}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150 ${
                isOk
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                  : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
              }`}
            >
              <Icon
                size={20}
                className={isOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isOk ? 'Funcionando' : 'Com defeito'}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Arranhões no Corpo / Notas Estéticas
        </label>
        <input
          type="text"
          value={checklist.body_scratches}
          onChange={(e) => onChange({ ...checklist, body_scratches: e.target.value })}
          placeholder="Ex.: Pequeno arranhão na tampa traseira, canto superior direito"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Estado de Energia</label>
        <div className="grid grid-cols-3 gap-2">
          {POWER_OPTIONS.map(({ key, label, icon: Icon }) => {
            const isActive = checklist.power_status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...checklist, power_status: key })}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}