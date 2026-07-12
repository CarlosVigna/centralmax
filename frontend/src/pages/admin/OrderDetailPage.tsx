import axios from 'axios';
import { useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { getOrder, updateOrderStatus, duplicateOrder, revertOrderStatus } from '../../services/orderService';
import {
  nextStatus,
  previousStatus,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
} from '../../types/order';
import type { FinancialStatus, OrderItemResponse } from '../../types/order';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function formatLocalDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildWhatsAppUrl(phone: string, order: {
  orderNumber: string;
  customerDisplayName: string;
  statusLabel: string;
  items: OrderItemResponse[];
  totalAmount: number;
}): string {
  const items = order.items
    .map((i) => `• ${i.productName} x${i.quantity} — ${formatCurrency(i.subtotal)}`)
    .join('\n');
  const msg =
    `Olá ${order.customerDisplayName}! 😊\n` +
    `Seu pedido *#${order.orderNumber}* está com status: *${order.statusLabel}*.\n\n` +
    `📦 Itens:\n${items}\n\n` +
    `*Total: ${formatCurrency(order.totalAmount)}*\n\n` +
    `Qualquer dúvida estamos à disposição!`;
  const clean = phone.replace(/\D/g, '');
  const br = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://api.whatsapp.com/send?phone=${br}&text=${encodeURIComponent(msg)}`;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [walkinPhone, setWalkinPhone] = useState('');
  const [trackingCopied, setTrackingCopied] = useState(false);

  const copyTrackingLink = useCallback((orderNumber: string) => {
    const url = `${window.location.origin}/rastrear?pedido=${orderNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setTrackingCopied(true);
      setTimeout(() => setTrackingCopied(false), 2000);
    });
  }, []);

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

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateOrder(id!),
    onSuccess: (newOrder) => navigate(`/admin/pedidos/${newOrder.id}`),
  });

  const [revertConfirm, setRevertConfirm] = useState(false);

  const revertMutation = useMutation({
    mutationFn: () => revertOrderStatus(id!),
    onSuccess: () => {
      setRevertConfirm(false);
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
      header: 'Desconto',
      render: (row: OrderItemResponse) =>
        row.discountPercent > 0 ? (
          <span className="text-green-600 text-sm">-{row.discountPercent}%</span>
        ) : (
          <span className="text-neutral-400">—</span>
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
  const prev = previousStatus(order.status);
  const canCancel = order.status !== 'CONCLUIDO' && order.status !== 'CANCELADO';
  const canEdit = order.status === 'NOVO' || order.status === 'CONFIRMADO';
  const canRevert = order.status !== 'NOVO' && order.status !== 'CANCELADO';
  const isWalkin = !order.customerId;
  const effectivePhone = order.customerDisplayPhone || (isWalkin ? walkinPhone : null);
  const hasPhone = Boolean(effectivePhone);

  return (
    <div id="order-print">
      <style>{`
        @media print {
          body > * { display: none !important; }
          #order-print, #order-print * { display: revert !important; }
          #order-print { padding: 16px; }
          button, a[role="button"], .no-print { display: none !important; }
        }
      `}</style>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Pedido {order.orderNumber}
        </h1>
        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{order.statusLabel}</Badge>

        <div className="ml-auto flex flex-wrap gap-2">
          {canEdit ? (
            <Link to={`/admin/pedidos/${order.id}/editar`}>
              <Button variant="outline" size="sm">Editar pedido</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled title="Só é possível editar pedidos com status NOVO ou CONFIRMADO">
              Editar pedido
            </Button>
          )}
          {hasPhone ? (
            <a
              href={buildWhatsAppUrl(effectivePhone!, order)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm">
                💬 WhatsApp
              </Button>
            </a>
          ) : isWalkin ? (
            <div className="flex items-center gap-1">
              <input
                type="tel"
                placeholder="Telefone para WhatsApp"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-primary-light"
              />
              {walkinPhone.trim() ? (
                <a href={buildWhatsAppUrl(walkinPhone.trim(), order)} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">💬</Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" disabled>💬</Button>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" disabled title="Cliente sem telefone cadastrado">
              💬 WhatsApp
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            🖨️ Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={duplicateMutation.isPending}
            onClick={() => duplicateMutation.mutate()}
          >
            Duplicar pedido
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyTrackingLink(order.orderNumber)}
          >
            {trackingCopied ? '✓ Copiado!' : '🔗 Link de rastreio'}
          </Button>
        </div>
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
          {order.customerId && (
            <Link
              to={`/admin/clientes/${order.customerId}`}
              className="mt-2 block text-xs text-primary hover:underline"
            >
              Ver cadastro do cliente →
            </Link>
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
              <dt className="text-neutral-600">Condição de pagamento</dt>
              <dd className="text-neutral-900">{order.paymentConditionLabel}</dd>
            </div>
            {order.nfNumber && (
              <div className="flex justify-between">
                <dt className="text-neutral-600">NF</dt>
                <dd className="font-medium text-neutral-900">{order.nfNumber}</dd>
              </div>
            )}
            {order.estimatedDeliveryDate && (
              <div className="flex justify-between">
                <dt className="text-neutral-600">Previsão entrega</dt>
                <dd className="text-neutral-900">{formatLocalDate(order.estimatedDeliveryDate)}</dd>
              </div>
            )}
            {order.dueDate && (
              <div className="flex justify-between">
                <dt className="text-neutral-600">Vencimento</dt>
                <dd className="text-neutral-900">{formatLocalDate(order.dueDate)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-600">Financeiro</dt>
              <dd>
                <FinancialStatusBadge status={order.financialStatus} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Total</dt>
              <dd className="text-lg font-bold text-neutral-900">
                {formatCurrency(order.totalAmount)}
              </dd>
            </div>
          </dl>
          {order.financialStatus !== 'SEM_TITULO' && (
            <Link
              to="/admin/financeiro"
              className="mt-3 block text-xs text-primary hover:underline"
            >
              Ver no financeiro →
            </Link>
          )}
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
        <Table columns={itemColumns} data={order.items} emptyMessage="Sem itens." />
        <div className="mt-4 flex justify-end border-t border-neutral-200 pt-4">
          <span className="text-lg font-bold text-neutral-900">
            Total: {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </Card>

      {(next || canCancel || canRevert) && (
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
          {canRevert && (
            <Button
              variant="outline"
              size="sm"
              disabled={revertMutation.isPending}
              onClick={() => setRevertConfirm(true)}
            >
              ← Voltar status
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

      {revertConfirm && prev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-neutral-900">Voltar status do pedido</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Deseja voltar o pedido de{' '}
              <strong>{STATUS_LABELS[order.status]}</strong> para{' '}
              <strong>{STATUS_LABELS[prev]}</strong>?
            </p>
            {revertMutation.isError && (
              <p className="mt-2 text-sm text-danger">
                {axios.isAxiosError(revertMutation.error)
                  ? (revertMutation.error as any)?.response?.data?.message ?? 'Erro ao reverter status.'
                  : 'Erro ao reverter status.'}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setRevertConfirm(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={revertMutation.isPending}
                onClick={() => revertMutation.mutate()}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialStatusBadge({ status }: { status: FinancialStatus }) {
  if (status === 'PAGO') {
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Pago</span>;
  }
  if (status === 'VENCIDO') {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Vencido</span>;
  }
  if (status === 'PENDENTE') {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Pendente</span>;
  }
  return <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">Sem título</span>;
}
