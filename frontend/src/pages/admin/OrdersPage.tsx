import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  deleteOrder,
  duplicateOrder,
  listOrders,
  updateOrderStatus,
} from '../../services/orderService';
import {
  nextStatus,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
} from '../../types/order';
import type { OrderResponse, OrderStatus } from '../../types/order';

const TAB_FILTERS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Novos', value: 'NOVO' },
  { label: 'Confirmados', value: 'CONFIRMADO' },
  { label: 'Em Separação', value: 'EM_SEPARACAO' },
  { label: 'Saíram p/ Entrega', value: 'SAIU_ENTREGA' },
  { label: 'Entregues', value: 'ENTREGUE' },
  { label: 'Concluídos', value: 'CONCLUIDO' },
  { label: 'Cancelados', value: 'CANCELADO' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildWhatsAppUrl(phone: string, order: OrderResponse): string {
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

function FinancialBadge({ status }: { status: string }) {
  if (status === 'PAGO') return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Pago</span>;
  if (status === 'VENCIDO') return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Vencido</span>;
  if (status === 'PENDENTE') return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Pendente</span>;
  return <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">Sem título</span>;
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus | ''>('');
  const [confirmCancel, setConfirmCancel] = useState<OrderResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { status: activeTab || undefined, search: search || undefined }],
    queryFn: () =>
      listOrders({
        status: activeTab || undefined,
        search: search || undefined,
        size: 50,
      }),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, 'CANCELADO'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setConfirmCancel(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateOrder(id),
    onSuccess: (newOrder) => navigate(`/admin/pedidos/${newOrder.id}`),
  });

  const orders = data?.content ?? [];

  const columns = [
    {
      header: 'Nº Pedido',
      render: (row: OrderResponse) => (
        <Link
          to={`/admin/pedidos/${row.id}`}
          className="font-mono text-sm font-semibold text-primary hover:underline"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      header: 'Cliente',
      render: (row: OrderResponse) => (
        <span className="text-neutral-900">{row.customerDisplayName}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: OrderResponse) => (
        <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{row.statusLabel}</Badge>
      ),
    },
    {
      header: 'Financeiro',
      render: (row: OrderResponse) => <FinancialBadge status={row.financialStatus} />,
    },
    {
      header: 'Total',
      render: (row: OrderResponse) => (
        <span className="font-medium text-neutral-900">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Data',
      render: (row: OrderResponse) => (
        <span className="text-neutral-600">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Ações',
      render: (row: OrderResponse) => {
        const next = nextStatus(row.status);
        const canCancel = row.status !== 'CONCLUIDO' && row.status !== 'CANCELADO';
        const canDelete = row.status === 'NOVO' || row.status === 'CANCELADO';
        const canEdit = row.status === 'NOVO' || row.status === 'CONFIRMADO';
        const hasPhone = Boolean(row.customerDisplayPhone);
        return (
          <div className="flex flex-wrap gap-1.5">
            <Link to={`/admin/pedidos/${row.id}`}>
              <Button size="sm" variant="ghost">Ver</Button>
            </Link>
            {canEdit ? (
              <Link to={`/admin/pedidos/${row.id}/editar`}>
                <Button size="sm" variant="ghost">Editar</Button>
              </Link>
            ) : (
              <Button size="sm" variant="ghost" disabled title="Só é possível editar pedidos NOVO ou CONFIRMADO">Editar</Button>
            )}
            {hasPhone ? (
              <a href={buildWhatsAppUrl(row.customerDisplayPhone!, row)} target="_blank" rel="noreferrer">
                <Button size="sm" variant="ghost">💬</Button>
              </a>
            ) : (
              <Button size="sm" variant="ghost" disabled title="Sem telefone">💬</Button>
            )}
            {next && (
              <Button
                size="sm"
                variant="outline"
                disabled={advanceMutation.isPending}
                onClick={() => advanceMutation.mutate({ id: row.id, status: next })}
              >
                {STATUS_LABELS[next]}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={duplicateMutation.isPending}
              onClick={() => duplicateMutation.mutate(row.id)}
            >
              Duplicar
            </Button>
            {canCancel && (
              <Button size="sm" variant="danger" onClick={() => setConfirmCancel(row)}>
                Cancelar
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(row.id)}
              >
                Excluir
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pedidos</h1>
          <Link to="/admin/expedicao" className="text-xs text-primary hover:underline">
            Ver board de expedição →
          </Link>
        </div>
        <Link to="/admin/pedidos/novo">
          <Button>Novo pedido</Button>
        </Link>
      </div>

      {/* Tabs de status */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-neutral-200 pb-2">
        {TAB_FILTERS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-primary text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por nº pedido ou nome do cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <Table columns={columns} data={orders} emptyMessage="Nenhum pedido encontrado." />
          </div>
          {data && data.totalElements > 0 && (
            <p className="mt-3 text-xs text-neutral-600">
              {data.totalElements} pedido(s) no total
            </p>
          )}
        </>
      )}

      {/* Modal cancelar */}
      <Modal
        open={Boolean(confirmCancel)}
        onClose={() => setConfirmCancel(null)}
        title="Cancelar pedido"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja cancelar o pedido{' '}
          <strong>{confirmCancel?.orderNumber}</strong> de{' '}
          <strong>{confirmCancel?.customerDisplayName}</strong>?
        </p>
        {cancelMutation.isError && (
          <p className="mb-4 text-sm text-danger">
            {axios.isAxiosError(cancelMutation.error)
              ? (cancelMutation.error.response?.data?.message ?? 'Erro ao cancelar.')
              : 'Erro ao cancelar.'}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmCancel(null)}>
            Voltar
          </Button>
          <Button
            variant="danger"
            disabled={cancelMutation.isPending}
            onClick={() => confirmCancel && cancelMutation.mutate(confirmCancel.id)}
          >
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
