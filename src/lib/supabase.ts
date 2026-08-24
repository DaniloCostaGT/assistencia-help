import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRÍTICO: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configuradas!');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);

export const buscarAparelhos = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar aparelhos:', err);
    return [];
  }
};