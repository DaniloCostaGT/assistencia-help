import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, FileText, ShieldAlert, Loader2, Search, ExternalLink, ArrowLeft } from 'lucide-react';

interface OrganizationAdmin {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  owner_email?: string;
  total_clients?: number;
  total_orders?: number;
  status?: 'active' | 'suspended';
}

export function AdminPage() {
  const [organizations, setOrganizations] = useState<OrganizationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalOrgs: 0, totalClients: 0, totalOrders: 0 });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Busca todas as organizações
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // 2. Busca contadores globais
      const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('work_orders').select('*', { count: 'exact', head: true });

      // 3. Agrupa contadores por loja
      const { data: clientsData } = await supabase.from('clients').select('tenant_id');
      const { data: ordersData } = await supabase.from('work_orders').select('tenant_id');

      const enrichedOrgs: OrganizationAdmin[] = (orgs || []).map((org) => {
        const clientCount = clientsData?.filter((c) => c.tenant_id === org.id).length || 0;
        const orderCount = ordersData?.filter((o) => o.tenant_id === org.id).length || 0;
        return {
          ...org,
          total_clients: clientCount,
          total_orders: orderCount,
          status: 'active',
        };
      });

      setOrganizations(enrichedOrgs);
      setStats({
        totalOrgs: orgs?.length || 0,
        totalClients: clientsCount || 0,
        totalOrders: ordersCount || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar dados administrativos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel do Fundador (SaaS Admin)</h1>
              <p className="text-sm text-slate-400">Gestão global de lojistas, limites e uso da plataforma</p>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-700 w-fit"
          >
            <ArrowLeft size={16} /> Voltar ao Sistema
          </a>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Building2 size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Assistências Ativas</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalOrgs}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Base Total de Clientes</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalClients}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FileText size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Ordens Emitidas no SaaS</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* Tabela com Filtro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Assistências Cadastradas</h2>

            <div className="relative min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Nome da Assistência</th>
                  <th className="py-4 px-6">Uso (Clientes / OS)</th>
                  <th className="py-4 px-6">Data de Cadastro</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white text-base">{org.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">ID: {org.id}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300">
                          👥 {org.total_clients} clientes
                        </span>
                        <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300">
                          📋 {org.total_orders} OS
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {new Date(org.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        title="Detalhes da conta"
                        onClick={() => alert(`ID da conta: ${org.id}\nProprietário ID: ${org.owner_id}`)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Nenhuma assistência encontrada para o filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}