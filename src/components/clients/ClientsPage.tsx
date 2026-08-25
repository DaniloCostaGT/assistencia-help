import { FormEvent, useState } from 'react';
import { Loader2, MessageCircle, Plus, Search, UserPlus, Wrench } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types';

interface ClientsPageProps { onNewWorkOrder: (client: Client) => void; }

// Função utilitária para aplicar a máscara no padrão de telefone/WhatsApp brasileiro
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const truncated = numbers.slice(0, 11);

  if (truncated.length <= 2) {
    return truncated.length ? `(${truncated}` : '';
  }
  if (truncated.length <= 6) {
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
  }
  if (truncated.length <= 10) {
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`;
  }
  return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
}

export function ClientsPage({ onNewWorkOrder }: ClientsPageProps) {
  const { clients, loading, error, addClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', whatsapp: '', cpf: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.whatsapp} ${client.cpf}`.toLowerCase().includes(search.toLowerCase().trim())
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim()) {
      setFormError('Nome e WhatsApp são obrigatórios.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await addClient(form);
      setForm({ name: '', whatsapp: '', cpf: '', address: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Diretório de clientes</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Mantenha cada conversa pessoal</h2>
        </div>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Adicionar Cliente
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Novo cliente</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Salve os dados para um atendimento mais rápido.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome *
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              WhatsApp *
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
                maxLength={15}
                placeholder="(11) 99999-9999"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              CPF
              <input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Endereço
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, bairro"
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          {formError && <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />} Salvar Cliente
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clientes por nome, WhatsApp ou CPF..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400">
          Não foi possível carregar os clientes: {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClients.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center text-sm text-slate-500">
              Nenhum cliente encontrado. Adicione seu primeiro cliente acima.
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {client.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{client.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MessageCircle size={12} className="text-emerald-500" />
                      {client.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p>CPF: {client.cpf || 'Não informado'}</p>
                  <p className="truncate">{client.address || 'Sem endereço salvo'}</p>
                </div>

                <button
                  onClick={() => onNewWorkOrder(client)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                >
                  <Wrench size={14} /> Abrir Ordem de Serviço
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}