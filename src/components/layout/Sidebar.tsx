import {
  ClipboardList,
  Package,
  MessageCircleQuestion,
  Users,
  Wrench,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NavItem, TabKey } from '@/types/nav';

const NAV_ITEMS: NavItem[] = [
  { key: 'work-orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { key: 'parts', label: 'Comparar Peças', icon: Package },
  { key: 'faq', label: 'Guia de Objeções', icon: MessageCircleQuestion },
  { key: 'clients', label: 'Clientes', icon: Users },
];

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Wrench size={20} strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Assistência Help
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Console da Loja
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
