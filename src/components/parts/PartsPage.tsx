import { useMemo, useState } from 'react';
import { ExternalLink, Package, Search, SlidersHorizontal } from 'lucide-react';
import { useSupplierQuotes } from '@/hooks/useSupplierQuotes';
import { QualityType } from '@/types';

const qualityClasses: Record<QualityType, string> = {
  Original: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Incell: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  OLED: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400',
  Compatible: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function PartsPage() {
  const { quotes, loading, error } = useSupplierQuotes();
  const [search, setSearch] = useState('');
  const [quality, setQuality] = useState('all');

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesSearch = !term || [quote.device_model, quote.part_name, quote.supplier_name].some((value) => value.toLowerCase().includes(term));
      const matchesQuality = quality === 'all' || quote.quality_type === quality;
      return matchesSearch && matchesQuality;
    });
  }, [quotes, search, quality]);

  const whatsappLink = (number: string, quote: (typeof quotes)[number]) => {
    const message = encodeURIComponent(`Olá ${quote.supplier_name}, gostaria de verificar a disponibilidade e o preço da peça ${quote.part_name} - ${quote.device_model}.`);
    return `https://wa.me/${number.replace(/\D/g, '')}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-white shadow-lg shadow-blue-600/15">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Rede de fornecedores</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Encontre a peça certa mais rápido</h2>
            <p className="text-blue-100 text-sm mt-2 max-w-xl">Compare as cotações atuais dos fornecedores por modelo, qualidade e disponibilidade antes de prometer um reparo.</p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"><Package size={24} /></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar modelo, peça ou fornecedor..." className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="relative sm:w-48">
          <SlidersHorizontal size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Todos os tipos de qualidade</option>
            <option value="Original">Original</option>
            <option value="Incell">Incell</option>
            <option value="OLED">OLED</option>
            <option value="Compatible">Compatível</option>
          </select>
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400">Não foi possível carregar as cotações: {error}</p>}
      {loading ? <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800"><div><h3 className="font-bold text-slate-900 dark:text-white">Cotações disponíveis</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filteredQuotes.length} resultado{filteredQuotes.length === 1 ? '' : 's'} encontrado{filteredQuotes.length === 1 ? '' : 's'}</p></div></div>
          {filteredQuotes.length === 0 ? <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Nenhuma cotação corresponde à sua busca.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><th className="px-5 py-3">Fornecedor</th><th className="px-5 py-3">Peça / Aparelho</th><th className="px-5 py-3">Qualidade</th><th className="px-5 py-3">Preço de custo</th><th className="px-5 py-3">Estoque</th><th className="px-5 py-3 text-right">Contato</th></tr></thead><tbody>{filteredQuotes.map((quote) => <tr key={quote.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="px-5 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{quote.supplier_name}</td><td className="px-5 py-4"><p className="font-medium text-slate-700 dark:text-slate-200">{quote.part_name}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{quote.device_model}</p></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${qualityClasses[quote.quality_type]}`}>{quote.quality_type}</span></td><td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{quote.cost_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${quote.in_stock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${quote.in_stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />{quote.in_stock ? 'Em estoque' : 'Sem estoque'}</span></td><td className="px-5 py-4 text-right"><a href={whatsappLink(quote.whatsapp, quote)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"><ExternalLink size={13} /> WhatsApp</a></td></tr>)}</tbody></table></div>}
        </div>
      )}
    </div>
  );
}
