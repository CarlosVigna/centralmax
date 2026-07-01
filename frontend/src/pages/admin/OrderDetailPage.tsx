import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { getOrder, updateOrderStatus } from '../../services/orderService';
import {
  nextStatus,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
} from '../../types/order';
import type { OrderItemResponse } from '../../types/order';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  });

  const advanceMutation = useMutation({
    mutationFn: (status: Parameters<typeof updateOrderStatus>[1]) =>
      updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => updateOrderStatus(id!, 'CANCELADO'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const itemColumns = [
    {
      header: 'Produto',
      render: (row: OrderItemResponse) => (
        <span className="font-medium text-neutral-900">{row.productName}</span>
      ),
    },
    {
      header: 'Qtd',
      render: (row: OrderItemResponse) => (
        <span className="text-neutral-700">{row.quantity}</span>
      ),
    },
    {
      header: 'Preço unit.',
      render: (row: OrderItemResponse) => (
        <span className="text-neutral-700">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      header: 'Subtotal',
      render: (row: OrderItemResponse) => (
        <span className="font-medium text-neutral-900">{formatCurrency(row.subtotal)}</span>
      ),
    },
  ];

  if (isLoading) {
    return <p className="text-sm text-neutral-600">Carregando pedido...</p>;
  }

  if (isError || !order) {
    return (
      <div>
        <p className="text-sm text-danger">Pedido não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/pedidos')}>
          Voltar
        </Button>
      </div>
    );
  }

  const next = nextStatus(order.status);
  const canCancel = order.status !== 'CONCLUIDO' && order.status !== 'CANCELADO';

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Pedido {order.orderNumber}
        </h1>
        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{order.statusLabel}</Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Cliente
          </h2>
          <p className="font-medium text-neutral-900">{order.customerDisplayName}</p>
          {order.customerDisplayPhone && (
            <p className="mt-1 text-sm text-neutral-600">{order.customerDisplayPhone}</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Informações
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Criado em</dt>
              <dd className="text-neutral-900">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Última atualização</dt>
              <dd className="text-neutral-900">{formatDate(order.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Total</dt>
              <dd className="text-lg font-bold text-neutral-900">
                {formatCurrency(order.totalAmount)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {order.notes && (
        <Card className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Observações
          </h2>
          <p className="text-sm text-neutral-700">{order.notes}</p>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Itens do pedido
        </h2>
        <Table
          columns={itemColumns}
          data={order.items}
          emptyMessage="Sem itens."
        />
        <div className="mt-4 flex justify-end border-t border-neutral-200 pt-4">
          <span className="text-lg font-bold text-neutral-900">
            Total: {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </Card>

      {/* Ações de status */}
      {(next || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {next && (
            <Button
              disabled={advanceMutation.isPending}
              onClick={() => advanceMutation.mutate(next)}
            >
              Avançar para {STATUS_LABELS[next]}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancelar pedido
            </Button>
          )}
          {(advanceMutation.isError || cancelMutation.isError) && (
            <p className="self-center text-sm text-danger">
              {axios.isAxiosError(advanceMutation.error ?? cancelMutation.error)
                ? ((advanceMutation.error ?? cancelMutation.error) as any)
                    ?.response?.data?.message ?? 'Erro ao atualizar status.'
                : 'Erro ao atualizar status.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
