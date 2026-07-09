import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { getPurchaseList } from '../../services/romaneioService';
import type { OrderStatus } from '../../types/order';

const STATUS_OPTS: { value: OrderStatus; label: string }[] = [
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'EM_SEPARACAO', label: 'Em Separação' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

export function RomaneioPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    'CONFIRMADO',
    'EM_SEPARACAO',
  ]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [fetch, setFetch] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['purchase-list', selectedStatuses],
    queryFn: () => getPurchaseList(selectedStatuses),
    enabled: fetch,
  });

  function toggleStatus(s: OrderStatus) {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    setFetch(false);
  }

  function toggleExpand(productId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    if (!data) return;
    const rows = [
      ['SKU', 'Produto', 'Qtd Total', 'Pedidos'],
      ...data.items.map((item) => [
        item.sku ?? '',
        item.productName,
        String(item.totalQuantity),
        item.orders.map((o) => `${o.orderNumber}(${o.customerName}×${o.quantity})`).join('; '),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `romaneio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Romaneio de Compras</h1>
          <p className="text-sm text-neutral-500">Lista consolidada de itens para separação</p>
        </div>
        <div className="flex gap-2">
          {data && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                Imprimir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-neutral-700">Status:</span>
        {STATUS_OPTS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedStatuses.includes(opt.value)}
              onChange={() => toggleStatus(opt.value)}
            />
            {opt.label}
          </label>
        ))}
        <Button
          size="sm"
          disabled={selectedStatuses.length === 0 || isFetching}
          onClick={() => setFetch(true)}
        >
          {isFetching ? 'Gerando...' : 'Gerar Romaneio'}
        </Button>
      </div>

      {isError && (
        <p className="mb-4 text-sm text-danger">Erro ao carregar romaneio.</p>
      )}

      {data && (
        <>
          <p className="mb-3 text-xs text-neutral-500">
            Gerado em {formatDate(data.generatedAt)} · {data.orders.length} pedido(s) ·{' '}
            {data.items.length} produto(s) distintos
          </p>

          {data.items.length === 0 ? (
            <p className="text-sm text-neutral-600">Nenhum item encontrado para os filtros selecionados.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white print:border-none">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-neutral-600">SKU</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Produto</th>
                    <th className="px-3 py-2 font-medium text-neutral-600 text-right">Qtd Total</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Pedidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.items.map((item) => (
                    <>
                      <tr
                        key={item.productId}
                        className="cursor-pointer hover:bg-neutral-50"
                        onClick={() => toggleExpand(item.productId)}
                      >
                        <td className="px-3 py-2 font-mono text-xs text-neutral-500">
                          {item.sku ?? '—'}
                        </td>
                        <td className="px-3 py-2 font-medium text-neutral-900">
                          <span className="mr-1 text-neutral-400">
                            {expanded.has(item.productId) ? '▾' : '▸'}
                          </span>
                          {item.productName}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-neutral-900">
                          {item.totalQuantity}
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-500">
                          {item.orders.length} pedido(s)
                        </td>
                      </tr>
                      {expanded.has(item.productId) &&
                        item.orders.map((ref) => (
                          <tr
                            key={`${item.productId}-${ref.orderNumber}`}
                            className="bg-neutral-50"
                          >
                            <td />
                            <td className="px-6 py-1.5 text-xs text-neutral-600 italic">
                              #{ref.orderNumber} — {ref.customerName}
                            </td>
                            <td className="px-3 py-1.5 text-right text-xs text-neutral-600">
                              {ref.quantity}
                            </td>
                            <td />
                          </tr>
                        ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
