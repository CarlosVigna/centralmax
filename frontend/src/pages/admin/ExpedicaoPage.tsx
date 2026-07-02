import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoardOrders } from '../../services/expeditionService';
import { updateOrderStatus } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import type { OrderResponse, OrderStatus } from '../../types/order';
import { nextStatus } from '../../types/order';

const BOARD_COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'NOVO', label: 'Novo' },
  { status: 'CONFIRMADO', label: 'Confirmado' },
  { status: 'EM_SEPARACAO', label: 'Em Separação' },
  { status: 'SAIU_ENTREGA', label: 'Saiu p/ Entrega' },
  { status: 'ENTREGUE', label: 'Entregue' },
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? 's' : ''}`;
}

function secondsSince(ts: number): number {
  return Math.floor((Date.now() - ts) / 1000);
}

export function ExpedicaoPage() {
  const queryClient = useQueryClient();
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['board'],
    queryFn: getBoardOrders,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onSettled: () => setAdvancingId(null),
  });

  function handleAdvance(order: OrderResponse) {
    const next = nextStatus(order.status);
    if (!next || next === 'CONCLUIDO') return;
    setAdvancingId(order.id);
    advanceMutation.mutate({ id: order.id, status: next });
  }

  const columnMap = new Map<OrderStatus, OrderResponse[]>();
  for (const col of BOARD_COLUMNS) columnMap.set(col.status, []);
  for (const order of orders) {
    const col = columnMap.get(order.status);
    if (col) col.push(order);
  }

  const updatedSecondsAgo = dataUpdatedAt ? secondsSince(dataUpdatedAt) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Central de Expedição</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Visão operacional dos pedidos em andamento. Para histórico completo,{' '}
            <Link to="/admin/pedidos" className="text-primary hover:underline">acesse Pedidos</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Atualizado há {updatedSecondsAgo}s
          </span>
          <button
            onClick={() => refetch()}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium
              text-neutral-600 hover:bg-neutral-100 transition"
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Carregando board...</p>}
      {isError && (
        <p className="text-sm text-danger">Erro ao carregar pedidos. Tente novamente.</p>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map(({ status, label }) => {
          const columnOrders = columnMap.get(status) ?? [];
          return (
            <div
              key={status}
              className="flex w-64 flex-shrink-0 flex-col rounded-lg bg-neutral-200/70"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold text-neutral-700">{label}</span>
                <span className="rounded-full bg-neutral-300 px-2 py-0.5 text-xs font-bold text-neutral-600">
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 min-h-[80px]">
                {columnOrders.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-neutral-400">
                    Nenhum pedido aqui
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isAdvancing={advancingId === order.id}
                      onAdvance={() => handleAdvance(order)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: OrderResponse;
  isAdvancing: boolean;
  onAdvance: () => void;
}

function OrderCard({ order, isAdvancing, onAdvance }: OrderCardProps) {
  const next = nextStatus(order.status);
  const canAdvance = next !== null && next !== 'CONCLUIDO';

  return (
    <div
      className={`rounded-lg bg-white p-3 shadow-sm transition-all duration-200
        ${isAdvancing ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
    >
      <p className="text-sm font-bold text-primary">{order.orderNumber}</p>

      <p className="mt-0.5 truncate text-sm font-medium text-neutral-800">
        {order.customerDisplayName}
      </p>

      <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
        <span>{order.items.length} item(ns)</span>
        <span className="font-semibold text-neutral-700">
          {formatCurrency(order.totalAmount)}
        </span>
      </div>

      <p className="mt-1 text-xs text-neutral-400">{timeAgo(order.createdAt)}</p>

      <div className="mt-3 flex gap-2">
        {canAdvance && (
          <button
            onClick={onAdvance}
            disabled={isAdvancing}
            className="flex-1 rounded-md bg-secondary py-1.5 text-xs font-semibold text-white
              transition hover:opacity-90 disabled:opacity-50"
          >
            Avançar →
          </button>
        )}
        <Link
          to={`/admin/pedidos/${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-md border border-neutral-300 py-1.5 text-center text-xs
            font-medium text-neutral-600 transition hover:bg-neutral-50
            ${canAdvance ? 'flex-none px-2' : 'flex-1'}`}
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
