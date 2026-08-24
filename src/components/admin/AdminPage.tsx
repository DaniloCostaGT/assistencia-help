import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, FileText, ShieldAlert, Loader2 } from 'lucide-react';

interface OrganizationAdmin {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  owner_email?: string;
  total_work_orders?: number;
}

export function AdminPage() {
  const [organizations, setOrganizations] = useState<OrganizationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
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

      setOrganizations(orgs || []);
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
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel de Controle SaaS (Admin)</h1>
            <p className="text-sm text-slate-400">Visão geral de clientes, assistências cadastradas e uso da plataforma</p>
          </div>
        </div>

        {/* Cards de Métricas Globais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Assistências Cadastradas</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalOrgs}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total de Clientes no SaaS</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalClients}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Ordens de Serviço Criadas</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* Tabela de Assistências */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold">Lojas / Clientes Cadastrados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Nome da Assistência</th>
                  <th className="py-3.5 px-6">ID da Organização</th>
                  <th className="py-3.5 px-6">Data de Cadastro</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{org.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{org.id}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    </td>
                  </tr>
                ))}
                {organizations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Nenhuma assistência cadastrada até o momento.
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