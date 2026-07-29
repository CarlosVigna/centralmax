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
import { Button } from '../../components/ui/Button';
import { getChannelProfitability, getCustomerReport, getSalesReport } from '../../services/reportService';
import type { ChannelProfitability, ChannelProfitabilityTotals } from '../../services/reportService';
import { listActiveSalesChannels } from '../../services/salesChannelService';
import type { SalesChannel } from '../../types/salesChannel';
import { printHeader, printFooter, printDocument } from '../../utils/printUtils';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const PIE_COLORS = ['#0f1f3d', '#f97316', '#16a34a', '#dc2626', '#7c3aed', '#0284c7', '#d97706', '#db2777', '#0f766e', '#9333ea'];

type Tab = 'vendas' | 'clientes' | 'canais';

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
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[] | null>(null);

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

  const { data: salesChannels = [] } = useQuery({
    queryKey: ['sales-channels'],
    queryFn: listActiveSalesChannels,
    enabled: tab === 'canais',
  });

  // Marca todos os canais como selecionados por padrão assim que a lista carrega
  const effectiveChannelIds = selectedChannelIds ?? salesChannels.map((c) => c.id);

  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['report-channel-profitability', start, end, effectiveChannelIds],
    queryFn: () => getChannelProfitability(start, end, effectiveChannelIds),
    enabled: tab === 'canais' && salesChannels.length > 0,
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
        {(['vendas', 'clientes', 'canais'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t === 'vendas' ? 'Vendas' : t === 'clientes' ? 'Clientes' : 'Rentabilidade por Canal'}
          </button>
        ))}
      </div>

      {tab === 'vendas' && (
        <SalesTab data={salesData} isLoading={salesLoading} />
      )}
      {tab === 'clientes' && (
        <CustomersTab data={customerData} isLoading={customerLoading} />
      )}
      {tab === 'canais' && (
        <ChannelProfitabilityTab
          data={channelData}
          isLoading={channelLoading}
          channels={salesChannels}
          selectedChannelIds={effectiveChannelIds}
          onToggleChannel={(id) =>
            setSelectedChannelIds((prev) => {
              const base = prev ?? salesChannels.map((c) => c.id);
              return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
            })
          }
        />
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
            <div className="overflow-x-auto">
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
            </div>
          )}
        </Card>

        {/* Pedidos por status */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-neutral-700">Pedidos por status</p>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem dados no período.</p>
          ) : (
            <div className="overflow-x-auto">
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
            </div>
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
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {originData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => Number(v)} />
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
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => Number(v)} />
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
          <div className="overflow-x-auto">
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
          </div>
        )}
      </Card>
    </div>
  );
}

function printChannelProfitability(
  period: string,
  channels: ChannelProfitability[],
  totals: ChannelProfitabilityTotals,
) {
  const content = `
    ${printHeader('Relatório de Rentabilidade por Canal', `Período: ${period}`)}

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
      <div style="background:#e8f5e9;padding:12px;border-radius:8px">
        <div style="font-size:11px;color:#666">Faturamento Bruto</div>
        <div style="font-size:18px;font-weight:700;color:#2e7d32">${fmtCurrency(totals.grossRevenue)}</div>
      </div>
      <div style="background:#ffebee;padding:12px;border-radius:8px">
        <div style="font-size:11px;color:#666">Total de Taxas</div>
        <div style="font-size:18px;font-weight:700;color:#c62828">${fmtCurrency(totals.totalFees)}</div>
      </div>
      <div style="background:#fff3e0;padding:12px;border-radius:8px">
        <div style="font-size:11px;color:#666">Comissões</div>
        <div style="font-size:18px;font-weight:700;color:#e65100">${fmtCurrency(totals.vendorCommissions)}</div>
      </div>
      <div style="background:#e3f2fd;padding:12px;border-radius:8px">
        <div style="font-size:11px;color:#666">Lucro Líquido</div>
        <div style="font-size:18px;font-weight:700;color:#1565c0">${fmtCurrency(totals.netProfit)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Canal</th>
          <th style="text-align:right">Pedidos</th>
          <th style="text-align:right">Faturamento</th>
          <th style="text-align:right">Taxas</th>
          <th style="text-align:right">Comissões</th>
          <th style="text-align:right">Lucro</th>
          <th style="text-align:right">Margem</th>
        </tr>
      </thead>
      <tbody>
        ${channels.map((c) => `
          <tr>
            <td><strong>${c.channelName}</strong></td>
            <td style="text-align:right">${c.totalOrders}</td>
            <td style="text-align:right">${fmtCurrency(c.grossRevenue)}</td>
            <td style="text-align:right;color:#c62828">-${fmtCurrency(c.totalFees)}</td>
            <td style="text-align:right;color:#e65100">-${fmtCurrency(c.vendorCommissions)}</td>
            <td style="text-align:right;color:#2e7d32;font-weight:700">${fmtCurrency(c.netProfit)}</td>
            <td style="text-align:right">
              <span class="badge ${c.profitMargin >= 70 ? 'badge-green' : 'badge-orange'}">${c.profitMargin.toFixed(1)}%</span>
            </td>
          </tr>
        `).join('')}
        <tr style="border-top:2px solid #0f1f3d;font-weight:700">
          <td>TOTAL</td>
          <td style="text-align:right">${totals.totalOrders}</td>
          <td style="text-align:right">${fmtCurrency(totals.grossRevenue)}</td>
          <td style="text-align:right;color:#c62828">-${fmtCurrency(totals.totalFees)}</td>
          <td style="text-align:right;color:#e65100">-${fmtCurrency(totals.vendorCommissions)}</td>
          <td style="text-align:right;color:#2e7d32">${fmtCurrency(totals.netProfit)}</td>
          <td style="text-align:right">${totals.profitMargin.toFixed(1)}%</td>
        </tr>
      </tbody>
    </table>
    ${printFooter()}
  `;
  printDocument(content, 'Rentabilidade por Canal');
}

function ChannelProfitabilityTab({
  data,
  isLoading,
  channels,
  selectedChannelIds,
  onToggleChannel,
}: {
  data: Awaited<ReturnType<typeof getChannelProfitability>> | undefined;
  isLoading: boolean;
  channels: SalesChannel[];
  selectedChannelIds: string[];
  onToggleChannel: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Multiselect de canais */}
      <Card>
        <p className="mb-2 text-sm font-semibold text-neutral-700">Canais</p>
        <div className="flex flex-wrap gap-3">
          {channels.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={selectedChannelIds.includes(c.id)}
                onChange={() => onToggleChannel(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : !data || data.channels.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados no período selecionado.</p>
      ) : (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => printChannelProfitability(data.period, data.channels, data.totals)}>
              🖨️ Imprimir Relatório
            </Button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card>
              <p className="text-xs font-medium text-neutral-500">Faturamento Bruto</p>
              <p className="mt-1 text-lg font-bold text-green-600">{fmtCurrency(data.totals.grossRevenue)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-neutral-500">Taxas de Plataforma</p>
              <p className="mt-1 text-lg font-bold text-danger">{fmtCurrency(data.totals.totalFees)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-neutral-500">Comissões</p>
              <p className="mt-1 text-lg font-bold text-orange-500">{fmtCurrency(data.totals.vendorCommissions)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-neutral-500">Lucro Líquido</p>
              <p className="mt-1 text-lg font-bold text-primary">{fmtCurrency(data.totals.netProfit)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-neutral-500">Margem Média</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">{data.totals.profitMargin.toFixed(1)}%</p>
            </Card>
          </div>

          {/* Gráfico de barras agrupadas */}
          <Card>
            <p className="mb-4 text-sm font-semibold text-neutral-700">Faturamento x Taxas x Lucro por canal</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.channels} margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="channelName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmtCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="grossRevenue" fill="#0f1f3d" radius={[4, 4, 0, 0]} name="Faturamento" />
                <Bar dataKey="totalFees" fill="#dc2626" radius={[4, 4, 0, 0]} name="Taxas" />
                <Bar dataKey="netProfit" fill="#16a34a" radius={[4, 4, 0, 0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Tabela */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs font-medium text-neutral-500">
                  <tr>
                    <th className="py-2 text-left">Canal</th>
                    <th className="py-2 text-right">Pedidos</th>
                    <th className="py-2 text-right">Faturamento</th>
                    <th className="py-2 text-right">Taxas</th>
                    <th className="py-2 text-right">Comissões</th>
                    <th className="py-2 text-right">Lucro</th>
                    <th className="py-2 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.channels.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 text-neutral-800">{c.channelName}</td>
                      <td className="py-2 text-right text-neutral-600">{c.totalOrders}</td>
                      <td className="py-2 text-right text-neutral-700">{fmtCurrency(c.grossRevenue)}</td>
                      <td className="py-2 text-right text-danger">-{fmtCurrency(c.totalFees)}</td>
                      <td className="py-2 text-right text-orange-600">-{fmtCurrency(c.vendorCommissions)}</td>
                      <td className="py-2 text-right font-semibold text-green-600">{fmtCurrency(c.netProfit)}</td>
                      <td className="py-2 text-right font-medium">{c.profitMargin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-300 font-bold">
                    <td className="py-2 text-neutral-900">TOTAL</td>
                    <td className="py-2 text-right text-neutral-900">{data.totals.totalOrders}</td>
                    <td className="py-2 text-right text-neutral-900">{fmtCurrency(data.totals.grossRevenue)}</td>
                    <td className="py-2 text-right text-danger">-{fmtCurrency(data.totals.totalFees)}</td>
                    <td className="py-2 text-right text-orange-600">-{fmtCurrency(data.totals.vendorCommissions)}</td>
                    <td className="py-2 text-right text-green-600">{fmtCurrency(data.totals.netProfit)}</td>
                    <td className="py-2 text-right text-neutral-900">{data.totals.profitMargin.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
