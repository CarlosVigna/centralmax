import { useQuery } from '@tanstack/react-query';
import { getWeeklyForecast } from '../../services/reportService';

const TREND_CONFIG = {
  UP:     { label: '▲ Alta',   cls: 'bg-green-100 text-green-700' },
  DOWN:   { label: '▼ Baixa',  cls: 'bg-red-100 text-red-700' },
  STABLE: { label: '→ Estável', cls: 'bg-neutral-100 text-neutral-600' },
} as const;

export function WeeklyForecastPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weekly-forecast'],
    queryFn: getWeeklyForecast,
    staleTime: 1000 * 60 * 15,
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Previsão de Compra Semanal</h1>
          {data && (
            <p className="mt-1 text-sm text-neutral-500">Período: {data.period}</p>
          )}
        </div>
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Carregando previsão...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar previsão.</p>}

      {data && data.items.length === 0 && (
        <p className="text-sm text-neutral-500">
          Nenhum dado disponível. Complete pedidos com status CONCLUIDO para gerar previsão.
        </p>
      )}

      {data && data.items.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-neutral-300 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Média/dia</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Mês anterior</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Previsão 7 dias</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">Tendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.items.map((item, i) => {
                  const trend = TREND_CONFIG[item.trend] ?? TREND_CONFIG.STABLE;
                  return (
                    <tr key={item.productId} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{item.productName}</td>
                      <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{item.sku || '—'}</td>
                      <td className="px-4 py-3 text-right text-neutral-700">{item.avgDailyQty.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-neutral-700">{item.lastMonthQty}</td>
                      <td className="px-4 py-3 text-right font-semibold text-neutral-900">{item.forecastQty}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trend.cls}`}>
                          {trend.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-2 md:hidden">
            {data.items.map((item, i) => {
              const trend = TREND_CONFIG[item.trend] ?? TREND_CONFIG.STABLE;
              return (
                <div key={item.productId} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {i + 1}. {item.productName}
                      </p>
                      {item.sku && <p className="text-xs font-mono text-neutral-400">{item.sku}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trend.cls}`}>
                      {trend.label}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-neutral-600">
                    <span>Média/dia: <strong>{item.avgDailyQty.toFixed(1)}</strong></span>
                    <span>Último mês: <strong>{item.lastMonthQty}</strong></span>
                    <span>Previsão 7d: <strong className="text-neutral-900">{item.forecastQty}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
