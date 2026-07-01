import { Link } from 'react-router-dom';
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
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Produtos ativos" value={data.activeProducts} />
            <StatCard label="Clientes cadastrados" value={data.totalCustomers} />
            <StatCard label="Pedidos registrados" value={data.totalOrders} />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard
              label="Pedidos pendentes"
              value={data.pendingOrders}
              accent="orange"
            />
            <StatCard
              label="Saíram p/ entrega"
              value={data.ordersOutForDelivery}
              accent="blue"
            />
            <StatCard
              label="Pedidos hoje"
              value={data.ordersToday}
              accent="gray"
            />
            <LinkStatCard
              label="Em Expedição"
              value={data.pendingOrders + data.ordersOutForDelivery}
              accent="orange"
              href="/admin/expedicao"
              linkLabel="Ver board →"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Contatos hoje"
              value={data.contactsToday}
              accent="green"
            />
            <StatCard
              label="Contatos atrasados"
              value={data.overdueContacts}
              accent="red"
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'orange' | 'blue' | 'gray' | 'green' | 'red';
}) {
  const accentClass = resolveAccent(accent);
  return (
    <Card>
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accentClass}`}>
        {value.toLocaleString('pt-BR')}
      </p>
    </Card>
  );
}

function LinkStatCard({
  label,
  value,
  accent,
  href,
  linkLabel,
}: {
  label: string;
  value: number;
  accent?: 'orange' | 'blue' | 'gray' | 'green' | 'red';
  href: string;
  linkLabel: string;
}) {
  const accentClass = resolveAccent(accent);
  return (
    <Card>
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accentClass}`}>
        {value.toLocaleString('pt-BR')}
      </p>
      <Link to={href} className="mt-2 block text-xs text-primary hover:underline">
        {linkLabel}
      </Link>
    </Card>
  );
}

function resolveAccent(accent?: 'orange' | 'blue' | 'gray' | 'green' | 'red') {
  return accent === 'orange'
    ? 'text-secondary'
    : accent === 'blue'
      ? 'text-primary-light'
      : accent === 'green'
        ? 'text-green-600'
        : accent === 'red'
          ? 'text-danger'
          : 'text-neutral-900';
}
