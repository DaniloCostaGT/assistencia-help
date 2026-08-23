import { Moon, Sun, Wrench } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 px-4 md:px-8 h-20">
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Wrench size={16} strokeWidth={2.25} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Assistência Help
          </span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
