import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { WorkOrdersPage } from '@/components/workorders/WorkOrdersPage';
import { PartsPage } from '@/components/parts/PartsPage';
import { FaqPage } from '@/components/faq/FaqPage';
import { ClientsPage } from '@/components/clients/ClientsPage';
import { AdminPage } from '@/components/admin/AdminPage';
import { NewClientWorkOrderModal } from '@/components/workorders/NewClientWorkOrderModal';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { Client } from '@/types';
import { TabKey } from '@/types/nav';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'danilo25.costa@hotmail.com';

const TAB_CONTENT: Record<TabKey, { title: string; subtitle: string }> = {
  'work-orders': { title: 'Ordens de Serviço', subtitle: 'Acompanhe os reparos do recebimento à entrega.' },
  parts: { title: 'Comparar Peças', subtitle: 'Compare cotações de fornecedores antes de aprovar o reparo.' },
  faq: { title: 'Guia de Objeções', subtitle: 'Respostas práticas para conversas mais claras com o cliente.' },
  clients: { title: 'Clientes', subtitle: 'Gerencie clientes e abra reparos mais rápido.' },
};

function MainContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('work-orders');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { addWorkOrder } = useWorkOrders();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-xs text-slate-400">Carregando sessão...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (currentPath === '/admin') {
    const isUserAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (isUserAdmin) {
      return <AdminPage />;
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <p className="text-rose-400 font-medium mb-4">Acesso restrito para {user.email}.</p>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          Voltar para o Painel
        </button>
      </div>
    );
  }

  const current = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="md:pl-64 min-h-screen">
        <TopBar title={current.title} subtitle={current.subtitle} />
        <main className="px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-[1600px] mx-auto">
          {activeTab === 'work-orders' && <WorkOrdersPage />}
          {activeTab === 'parts' && <PartsPage />}
          {activeTab === 'faq' && <FaqPage />}
          {activeTab === 'clients' && <ClientsPage onNewWorkOrder={setSelectedClient} />}
        </main>
      </div>
      {selectedClient && (
        <NewClientWorkOrderModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSubmit={addWorkOrder}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}