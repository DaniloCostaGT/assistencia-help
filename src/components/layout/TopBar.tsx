import { useState } from 'react';
import { Moon, Sun, Wrench, LogOut, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Limpa dados salvos localmente
      localStorage.clear();
      sessionStorage.clear();
      
      // Chama a função de logout do contexto
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      // Força o navegador a recarregar na página raiz limpando o estado do React
      window.location.href = '/';
    }
  };

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

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
              {user.email}
            </span>
          )}

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sair da conta"
            className="flex h-9 items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </span>
          </button>
        </div>
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