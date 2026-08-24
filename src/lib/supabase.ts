import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export async function buscarAparelhos(termo: string) {
    if (!termo || termo.length < 2) return [];
    
    const { data, error } = await supabase
      .from('aparelhos')
      .select('id, marca, modelo')
      .or(`marca.ilike.%${termo}%,modelo.ilike.%${termo}%`)
      .limit(10);
  
    if (error) {
      console.error('Erro ao buscar aparelhos:', error);
      return [];
    }
  
    return data;
  }