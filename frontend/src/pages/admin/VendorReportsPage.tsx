import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVendorSummary } from '../../services/vendorReportService';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type Tab = 'vendas' | 'comissoes';

export function VendorReportsPage() {
  const [tab, setTab] = useState<Tab>('vendas');
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-summary', year],
    queryFn: () => getVendorSummary(year),
  });

  const chartData = data?.monthlyRevenue.map((m) => ({
    month: m.month.substring(0, 5),
    Faturamento: m.revenue,
    Comissão: m.commission,
  })) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Meus Relatórios</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          {[0, 1, 2].map((offset) => {
            const y = new Date().getFullYear() - offset;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      <div className="mb-4 flex gap-2 border-b border-neutral-200 pb-0">
        {(['vendas', 'comissoes'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? 'border-b-2 border-primary text-primary'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t === 'vendas' ? 'Minhas Vendas' : 'Minhas Comissões'}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-6 text-sm text-neutral-500">Carregando...</p>}

      {data && (
        <div className="mt-4">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pedidos</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{data.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Faturamento total</p>
              <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Comissão estimada</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(data.estimatedCommission)}</p>
            </div>
          </div>

          {tab === 'vendas' && (
            <>
              <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Faturamento Mensal
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="Faturamento" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {data.topCustomers.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Top Clientes
                  </h2>
                  <ul className="divide-y divide-neutral-100">
                    {data.topCustomers.map((c) => (
                      <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                        <div>
                          <p className="font-medium text-neutral-800">{c.name}</p>
                          <p className="text-xs text-neutral-400">{c.orderCount} pedido(s)</p>
                        </div>
                        <span className="font-semibold text-neutral-700">{formatCurrency(c.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === 'comissoes' && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Comissão Mensal Estimada
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="Comissão" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase text-neutral-500">
                    <th className="pb-2">Mês</th>
                    <th className="pb-2 text-right">Faturamento</th>
                    <th className="pb-2 text-right">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyRevenue.filter((m) => m.revenue > 0).map((m) => (
                    <tr key={m.month} className="border-b border-neutral-50">
                      <td className="py-1.5 text-neutral-700">{m.month}</td>
                      <td className="py-1.5 text-right text-neutral-600">{formatCurrency(m.revenue)}</td>
                      <td className="py-1.5 text-right font-semibold text-green-700">{formatCurrency(m.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
