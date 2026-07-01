import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { getDashboard } from '../../services/dashboardService';

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Dashboard</h1>

      {isLoading && <p className="text-sm text-neutral-600">Carregando indicadores...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar dados. Tente novamente.</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Produtos ativos" value={data.activeProducts} />
          <StatCard label="Clientes cadastrados" value={data.totalCustomers} />
          <StatCard label="Pedidos registrados" value={data.totalOrders} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value.toLocaleString('pt-BR')}</p>
    </Card>
  );
}
