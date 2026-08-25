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
  if (!query || query.trim().length < 2) return [];

  try {
    const { data, error } = await supabase
      .from('aparelhos')
      .select('id, marca, modelo')
      .or(`marca.ilike.%${query}%,modelo.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Erro no Supabase ao buscar aparelhos:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      marca: item.marca || '',
      modelo: item.modelo || '',
    }));
  } catch (err) {
    console.error('Erro na requisição de aparelhos:', err);
    return [];
  }
};