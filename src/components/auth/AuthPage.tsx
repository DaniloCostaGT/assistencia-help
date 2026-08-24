import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Wrench, Loader2 } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Dispara evento para atualização da rota SPA sem recarregar a janela
        window.dispatchEvent(new Event('popstate'));
      } else {
        if (!orgName.trim()) {
          throw new Error('Informe o nome da sua assistência.');
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: orgError } = await supabase.from('organizations').insert({
            name: orgName.trim(),
            owner_id: authData.user.id,
          });

          if (orgError) throw orgError;

          if (!authData.session) {
            setInfoMessage('Conta criada! Verifique seu e-mail para confirmar o cadastro ou desative a confirmação de e-mail no painel do Supabase.');
          } else {
            window.dispatchEvent(new Event('popstate'));
          }
        }
      }
    } catch (err: unknown) {
      console.error('Erro de autenticação:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'error_description' in err) {
        setError(String((err as { error_description: string }).error_description));
      } else {
        setError('Erro ao realizar autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl mb-3">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-bold">Assistência Help</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin ? 'Acesse o painel da sua loja' : 'Cadastre sua assistência técnica'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Assistência</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ex.: TechFix Celulares"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {infoMessage && (
            <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              {infoMessage}
            </p>
          )}

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isLogin ? 'Entrar no Sistema' : 'Criar Minha Conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setInfoMessage(null);
            }}
            className="text-blue-400 hover:underline font-semibold ml-1.5"
          >
            {isLogin ? 'Cadastrar Assistência' : 'Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  );
}