import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, FileText, ShieldAlert, Loader2, Search, ArrowLeft, Trash2, CalendarPlus, Power } from 'lucide-react';

interface OrganizationAdmin {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  status: 'active' | 'trial' | 'suspended';
  trial_ends_at: string | null;
  total_clients?: number;
  total_orders?: number;
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
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('work_orders').select('*', { count: 'exact', head: true });

      const { data: clientsData } = await supabase.from('clients').select('tenant_id');
      const { data: ordersData } = await supabase.from('work_orders').select('tenant_id');

      const enrichedOrgs: OrganizationAdmin[] = (orgs || []).map((org) => {
        const clientCount = clientsData?.filter((c) => c.tenant_id === org.id).length || 0;
        const orderCount = ordersData?.filter((o) => o.tenant_id === org.id).length || 0;
        return {
          ...org,
          status: org.status || 'active',
          trial_ends_at: org.trial_ends_at,
          total_clients: clientCount,
          total_orders: orderCount,
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

  // Altera status (Ativo, Suspender, Trial)
  const handleUpdateStatus = async (orgId: string, newStatus: 'active' | 'trial' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus })
        .eq('id', orgId);

      if (error) throw error;
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Adiciona +30 dias de validade
  const handleAddDays = async (orgId: string, currentTrialEnds: string | null) => {
    try {
      const baseDate = currentTrialEnds ? new Date(currentTrialEnds) : new Date();
      baseDate.setDate(baseDate.getDate() + 30);

      const { error } = await supabase
        .from('organizations')
        .update({ trial_ends_at: baseDate.toISOString(), status: 'active' })
        .eq('id', orgId);

      if (error) throw error;
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, trial_ends_at: baseDate.toISOString(), status: 'active' } : o))
      );
      alert('Mais 30 dias adicionados com sucesso!');
    } catch (err: any) {
      alert('Erro ao estender prazo: ' + err.message);
    }
  };

  // Exclusão completa da conta
  const handleDeleteOrganization = async (orgId: string, name: string) => {
    const confirmDelete = confirm(`ATENÇÃO: Deseja apagar permanentemente a loja "${name}" e todos os seus clientes e OSs?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.rpc('delete_organization_cascade', { org_id: orgId });
      if (error) throw error;

      setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
      alert(`Loja "${name}" removida com sucesso.`);
    } catch (err: any) {
      alert('Erro ao excluir conta: ' + err.message);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel do Fundador (SaaS Admin)</h1>
              <p className="text-sm text-slate-400">Controle total de licenças, acessos e remoção de contas</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-700 w-fit cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar ao Sistema
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Building2 size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Assistências Ativas</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalOrgs}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Base Total de Clientes</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalClients}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FileText size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Ordens Emitidas no SaaS</p>
              <h3 className="text-3xl font-bold mt-0.5">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* Tabela com Filtro e Ações */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Gerenciar Assinantes</h2>

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
                  <th className="py-4 px-6">Uso</th>
                  <th className="py-4 px-6">Validade / Licença</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ações de Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrgs.map((org) => {
                  const daysLeft = org.trial_ends_at
                    ? Math.ceil((new Date(org.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    : null;

                  return (
                    <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white text-base">{org.name}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">ID: {org.id}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
                            👥 {org.total_clients}
                          </span>
                          <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
                            📋 {org.total_orders}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {daysLeft !== null ? (
                          <span className={`text-xs font-semibold ${daysLeft > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirado'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Ilimitado</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {org.status === 'active' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Ativo
                          </span>
                        )}
                        {org.status === 'suspended' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Bloqueado
                          </span>
                        )}
                        {org.status === 'trial' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Testes
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Adicionar +30 dias de uso"
                            onClick={() => handleAddDays(org.id, org.trial_ends_at)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <CalendarPlus size={16} />
                          </button>

                          <button
                            title={org.status === 'suspended' ? 'Ativar Conta' : 'Bloquear Conta'}
                            onClick={() => handleUpdateStatus(org.id, org.status === 'suspended' ? 'active' : 'suspended')}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Power size={16} />
                          </button>

                          <button
                            title="Excluir Conta Permanentemente"
                            onClick={() => handleDeleteOrganization(org.id, org.name)}
                            className="p-2 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Nenhuma assistência encontrada.
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