import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { getCustomerReport, getSalesReport } from '../../services/reportService';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const PIE_COLORS = ['#0f1f3d', '#f97316', '#16a34a', '#dc2626', '#7c3aed', '#0284c7', '#d97706', '#db2777', '#0f766e', '#9333ea'];

type Tab = 'vendas' | 'clientes';

type PeriodPreset = 'mes_atual' | 'ultimos_30' | 'este_ano' | 'personalizado';

function getPresetDates(preset: PeriodPreset): { start: string; end: string } {
  const now = new Date();
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  if (preset === 'mes_atual') {
    return {
      start: toISO(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (preset === 'ultimos_30') {
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    return { start: toISO(s), end: toISO(now) };
  }
  if (preset === 'este_ano') {
    return {
      start: toISO(new Date(now.getFullYear(), 0, 1)),
      end: toISO(new Date(now.getFullYear(), 11, 31)),
    };
  }
  return { start: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), end: toISO(now) };
}

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>('vendas');
  const [preset, setPreset] = useState<PeriodPreset>('mes_atual');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { start, end } =
    preset === 'personalizado' && customStart && customEnd
      ? { start: customStart, end: customEnd }
      : getPresetDates(preset);

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', start, end],
    queryFn: () => getSalesReport(start, end),
    enabled: tab === 'vendas',
  });

  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['report-customers', start, end],
    queryFn: () => getCustomerReport(start, end),
    enabled: tab === 'clientes',
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Relatórios</h1>

      {/* Period selector */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        {(['mes_atual', 'ultimos_30', 'este_ano', 'personalizado'] as PeriodPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              preset === p
                ? 'bg-primary text-white'
                : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {p === 'mes_atual' ? 'Este mês' : p === 'ultimos_30' ? 'Últimos 30 dias' : p === 'este_ano' ? 'Este ano' : 'Personalizado'}
          </button>
        ))}
        {preset === 'personalizado' && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-2 text-sm"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-2 text-sm"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0 rounded-lg border border-neutral-200 bg-neutral-50 p-1 w-fit">
        {(['vendas', 'clientes'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t === 'vendas' ? 'Vendas' : 'Clientes'}
          </button>
        ))}
      </div>

      {tab === 'vendas' && (
        <SalesTab data={salesData} isLoading={salesLoading} />
      )}
      {tab === 'clientes' && (
        <CustomersTab data={customerData} isLoading={customerLoading} />
      )}
    </div>
  );
}

function exportSalesCSV(data: Awaited<ReturnType<typeof getSalesReport>>) {
  const rows: string[][] = [];
  rows.push(['# Receita por dia']);
  rows.push(['Data', 'Receita (R$)']);
  for (const d of data.revenueByDay) rows.push([d.date, String(Number(d.revenue).toFixed(2))]);
  rows.push([]);
  rows.push(['# Top produtos']);
  rows.push(['Produto', 'Qtd', 'Receita (R$)']);
  for (const p of data.topProducts)
    rows.push([p.productName, String(p.quantity), String(Number(p.revenue).toFixed(2))]);
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const month = new Date().toISOString().slice(0, 7).replace('-', '');
  a.href = url;
  a.download = `centralmax-vendas-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SalesTab({
  data,
  isLoading,
}: {
  data: Awaited<ReturnType<typeof getSalesReport>> | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-sm text-neutral-600">Carregando...</p>;
  if (!data) return null;

  const statusLabels: Record<string, string> = {
    NOVO: 'Novo', CONFIRMADO: 'Confirmado', EM_SEPARACAO: 'Em Separação',
    SAIU_ENTREGA: 'Saiu p/ Entrega', ENTREGUE: 'Entregue',
    CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado',
  };

  const byDayFormatted = data.revenueByDay.map((d) => ({
    ...d,
    dateLabel: new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    revenue: Number(d.revenue),
  }));

  const statusEntries = Object.entries(data.ordersByStatus).map(([k, v]) => ({
    status: statusLabels[k] ?? k,
    count: Number(v),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => exportSalesCSV(data)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium
            text-neutral-700 hover:bg-neutral-50 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-neutral-500">Total de Pedidos</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">{data.totalOrders}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-neutral-500">Receita Total</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{fmtCurrency(Number(data.totalRevenue))}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-neutral-500">Ticket Médio</p>
          <p className="mt-1 text-2xl font-bold text-primary">{fmtCurrency(Number(data.averageOrderValue))}</p>
        </Card>
      </div>

      {/* Bar chart: receita por dia */}
      {byDayFormatted.length > 0 && (
        <Card>
          <p className="mb-4 text-sm font-semibold text-neutral-700">Receita por dia</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDayFormatted} margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmtCurrency(Number(v))} labelFormatter={(l) => `Dia: ${l}`} />
              <Bar dataKey="revenue" fill="#0f1f3d" radius={[4, 4, 0, 0]} name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 produtos */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-neutral-700">Top 5 produtos mais vendidos</p>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem dados no período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs font-medium text-neutral-500">
                <tr>
                  <th className="py-2 text-left">Produto</th>
                  <th className="py-2 text-right">Qtd</th>
                  <th className="py-2 text-right">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 text-neutral-800">{p.productName}</td>
                    <td className="py-2 text-right text-neutral-600">{p.quantity}</td>
                    <td className="py-2 text-right font-medium text-green-600">{fmtCurrency(Number(p.revenue))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Pedidos por status */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-neutral-700">Pedidos por status</p>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem dados no período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs font-medium text-neutral-500">
                <tr>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-right">Pedidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {statusEntries.map((s, i) => (
                  <tr key={i}>
                    <td className="py-2 text-neutral-800">{s.status}</td>
                    <td className="py-2 text-right font-medium">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

function CustomersTab({
  data,
  isLoading,
}: {
  data: Awaited<ReturnType<typeof getCustomerReport>> | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-sm text-neutral-600">Carregando...</p>;
  if (!data) return null;

  const originLabels: Record<string, string> = {
    LANDING: 'Landing', WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook', MERCADO_LIVRE: 'Mercado Livre', SHOPEE: 'Shopee',
    TIKTOK: 'TikTok', VISITA: 'Visita', INDICACAO: 'Indicação', TELEFONE: 'Telefone',
  };

  const statusLabels: Record<string, string> = {
    PROSPECT: 'Prospect', ATIVO: 'Ativo', INATIVO: 'Inativo',
  };

  const originData = Object.entries(data.byOrigin).map(([k, v]) => ({
    name: originLabels[k] ?? k,
    value: Number(v),
  }));

  const statusData = Object.entries(data.byStatus).map(([k, v]) => ({
    name: statusLabels[k] ?? k,
    value: Number(v),
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-neutral-500">Total de Clientes</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">{data.totalCustomers}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-neutral-500">Novos no Período</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{data.newCustomers}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie: por origem */}
        <Card>
          <p className="mb-4 text-sm font-semibold text-neutral-700">Clientes por origem</p>
          {originData.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={originData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {originData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie: por status */}
        <Card>
          <p className="mb-4 text-sm font-semibold text-neutral-700">Clientes por status</p>
          {statusData.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Top 5 clientes */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Top 5 clientes</p>
        {data.topCustomers.length === 0 ? (
          <p className="text-sm text-neutral-500">Sem dados no período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs font-medium text-neutral-500">
              <tr>
                <th className="py-2 text-left">Cliente</th>
                <th className="py-2 text-right">Pedidos</th>
                <th className="py-2 text-right">Total gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.topCustomers.map((c, i) => (
                <tr key={i}>
                  <td className="py-2 text-neutral-800">{c.customerName}</td>
                  <td className="py-2 text-right text-neutral-600">{c.totalOrders}</td>
                  <td className="py-2 text-right font-medium text-green-600">
                    {fmtCurrency(Number(c.totalSpent))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
