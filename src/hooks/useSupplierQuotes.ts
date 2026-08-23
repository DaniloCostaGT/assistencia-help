import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SupplierQuote } from '@/types';

export function useSupplierQuotes() {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('supplier_quotes')
      .select('*')
      .order('device_model', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setQuotes(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { quotes, loading, error, refetch: fetchQuotes };
}
