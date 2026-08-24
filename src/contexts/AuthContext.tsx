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

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setOrganizationId(null);
    setLoading(false);
  };

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
          await supabase.auth.signOut({ scope: 'local' });
          clearAuthState();
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

    // Trava de segurança: destrava o loading após 3.5s se a Promise do Supabase travar ou o cliente falhar
    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Verificação de sessão expirou (timeout). Exibindo login.');
        clearAuthState();
      }
    }, 3500);

    // 1. Carga inicial de sessão
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;

        if (error || !session) {
          clearAuthState();
          return;
        }

        setSession(session);
        setUser(session.user);

        fetchOrganization(session.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      })
      .catch((err) => {
        console.error('Erro ao verificar sessão:', err);
        if (isMounted) clearAuthState();
      })
      .finally(() => {
        clearTimeout(fallbackTimer);
      });

    // 2. Ouvinte de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        clearAuthState();
        return;
      }

      setSession(currentSession);
      setUser(currentSession.user);

      if (currentSession.user) {
        await fetchOrganization(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  // 3. Método de Logout Isolado
  const signOut = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Erro ao realizar logout no Supabase:', error);
    } finally {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();

      clearAuthState();
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, organizationId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);