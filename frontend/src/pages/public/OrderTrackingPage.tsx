import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackOrder } from '../../services/orderService';

const STATUS_ICONS: Record<string, string> = {
  NOVO: '📋',
  CONFIRMADO: '✅',
  EM_SEPARACAO: '📦',
  SAIU_ENTREGA: '🚚',
  ENTREGUE: '🏠',
  CONCLUIDO: '🎉',
  CANCELADO: '❌',
};

export function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('pedido') ?? '');
  const [queried, setQueried] = useState(searchParams.get('pedido') ?? '');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tracking', queried],
    queryFn: () => trackOrder(queried),
    enabled: Boolean(queried),
    retry: false,
  });

  function handleSearch() {
    const num = input.trim();
    if (!num) return;
    setQueried(num);
    setSearchParams({ pedido: num });
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Rastrear Pedido</h1>
          <p className="mt-2 text-neutral-500">Digite o número do seu pedido para acompanhar o status.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: PED-000042"
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Pedido não encontrado. Verifique o número e tente novamente.
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Pedido</p>
                  <p className="mt-0.5 text-2xl font-bold text-neutral-900">{data.orderNumber}</p>
                  <p className="mt-1 text-sm text-neutral-600">{data.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Status</p>
                  <p className="mt-0.5 text-lg font-semibold text-neutral-800">
                    {STATUS_ICONS[data.status] ?? '📋'} {data.statusLabel}
                  </p>
                  {data.estimatedDeliveryDate && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Previsão: {(() => { const [y, m, d] = data.estimatedDeliveryDate.split('-'); return `${d}/${m}/${y}`; })()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {data.timeline.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Histórico
                </h2>
                <ol className="relative border-l border-neutral-200 ml-3 space-y-4">
                  {data.timeline.map((entry, i) => (
                    <li key={i} className="ml-5">
                      <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs">
                        {STATUS_ICONS[entry.status] ?? '●'}
                      </span>
                      <p className="text-sm font-medium text-neutral-800">{entry.label}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(entry.date).toLocaleString('pt-BR')}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Items */}
            {data.items.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Itens do pedido
                </h2>
                <ul className="divide-y divide-neutral-100">
                  {data.items.map((item, i) => (
                    <li key={i} className="flex justify-between py-2 text-sm">
                      <span className="text-neutral-800">{item.productName}</span>
                      <span className="font-medium text-neutral-600">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
