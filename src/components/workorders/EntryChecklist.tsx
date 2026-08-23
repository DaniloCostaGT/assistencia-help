import { Smartphone, Wifi, Camera, Fingerprint, Power, PowerOff, Zap } from 'lucide-react';
import { PowerStatus, WorkOrderChecklist } from '@/types';

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
  const toggle = (key: (typeof TOGGLE_ITEMS)[number]['key']) => {
    onChange({ ...checklist, [key]: !checklist[key] });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOGGLE_ITEMS.map(({ key, label, icon: Icon }) => {
          const isOk = checklist[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
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
