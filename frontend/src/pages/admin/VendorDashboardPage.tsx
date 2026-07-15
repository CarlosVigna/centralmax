import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getVendorSummary } from '../../services/vendorReportService';
import { useAuth } from '../../hooks/useAuth';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function VendorDashboardPage() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-summary', year],
    queryFn: () => getVendorSummary(year),
  });

  const commission = user?.commissionPriceA ?? user?.commissionPriceC ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Meu Painel</h1>
        <p className="text-sm text-neutral-500">Olá, {user?.name}! Resumo das suas vendas em {year}.</p>
      </div>

      {commission !== null && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Sua comissão configurada: <strong>{commission}%</strong>
          {user?.territory && (
            <span className="ml-4">
              Território: <strong>{user.territory}</strong>
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-neutral-500">Carregando dados...</p>
      )}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pedidos {year}</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900">{data.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Faturamento {year}</p>
              <p className="mt-1 text-3xl font-bold text-primary">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Comissão estimada</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{formatCurrency(data.estimatedCommission)}</p>
            </div>
          </div>

          {data.topCustomers.length > 0 && (
            <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Top Clientes
              </h2>
              <ul className="divide-y divide-neutral-100">
                {data.topCustomers.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium text-neutral-800">{c.name}</span>
                    <span className="text-neutral-600">{formatCurrency(c.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to="/admin/pedidos/novo"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Novo pedido
            </Link>
            <Link
              to="/admin/clientes/novo"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              + Novo cliente
            </Link>
            <Link
              to="/admin/meus-relatorios"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Ver relatórios →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
