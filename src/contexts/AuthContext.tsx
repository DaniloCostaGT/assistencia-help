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
          await supabase.auth.signOut();
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

    // Obtém sessão inicial tratando falhas de credencial/token
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
      });

    // Escuta mudanças de estado no Supabase Auth
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
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      clearAuthState();
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