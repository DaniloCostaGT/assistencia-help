import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  organizationId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganization = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, status')
        .eq('owner_id', userId)
        .maybeSingle();

      if (!error && data) {
        if (data.status === 'suspended') {
          alert('Sua conta está suspensa.');
          await supabase.auth.signOut();
          setOrganizationId(null);
          return;
        }
        setOrganizationId(data.id);
      } else {
        setOrganizationId(null);
      }
    } catch (err) {
      console.error('Erro ao buscar organização:', err);
      setOrganizationId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout de segurança: NUNCA deixa a tela travada no spinner por mais de 2.5s
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 2500);

    // Inicialização da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchOrganization(session.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Ouvinte de mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null);
        setUser(null);
        setOrganizationId(null);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession.user ?? null);

      if (currentSession.user) {
        await fetchOrganization(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    } finally {
      // Limpeza forçada local
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSession(null);
      setOrganizationId(null);
      setLoading(false);
      // Redireciona e força recarga da página limpa
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, organizationId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);