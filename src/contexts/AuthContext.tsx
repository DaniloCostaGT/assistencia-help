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
          alert('Sua conta está suspensa. Entre em contato com o suporte.');
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

    // Safety Timeout: Libera o carregamento em no máximo 3 segundos
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchOrganization(session.user.id);
        }
      } catch (err) {
        console.error('Erro na inicialização da sessão:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setOrganizationId(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchOrganization(session.user.id);
      } else {
        setOrganizationId(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      setUser(null);
      setSession(null);
      setOrganizationId(null);
      setLoading(false);
      // Redireciona para a raiz para limpar eventuais rotas
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