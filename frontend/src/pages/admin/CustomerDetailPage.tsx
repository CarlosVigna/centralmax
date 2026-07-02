import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomer } from '../../services/customerService';
import {
  listInteractions,
  createInteraction,
  deleteInteraction,
} from '../../services/interactionService';
import { listOrders } from '../../services/orderService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { INTERACTION_TYPE_OPTIONS, INTERACTION_TYPE_LABELS } from '../../types/interaction';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../../types/order';
import type { InteractionRequest, InteractionType } from '../../types/interaction';
import type { OrderResponse } from '../../types/order';

type Tab = 'resumo' | 'pedidos' | 'historico';

const STATUS_COLORS: Record<string, string> = {
  PROSPECT: 'bg-blue-100 text-blue-800',
  ATIVO: 'bg-green-100 text-green-800',
  INATIVO: 'bg-neutral-200 text-neutral-600',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('resumo');
  const queryClient = useQueryClient();

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  });

  const { data: ordersPage, isLoading: loadingOrders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => listOrders({ customerId: id!, size: 50 }),
    enabled: !!id && activeTab === 'pedidos',
  });

  const { data: interactions = [], isLoading: loadingInteractions } = useQuery({
    queryKey: ['interactions', id],
    queryFn: () => listInteractions(id!),
    enabled: !!id && activeTab === 'historico',
  });

  const createMutation = useMutation({
    mutationFn: (req: InteractionRequest) => createInteraction(id!, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', id] });
      setFormType('LIGACAO');
      setFormNotes('');
      setFormScheduledAt('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (interactionId: string) => deleteInteraction(id!, interactionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interactions', id] }),
  });

  const [formType, setFormType] = useState<InteractionType>('LIGACAO');
  const [formNotes, setFormNotes] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      type: formType,
      notes: formNotes || undefined,
      scheduledAt: formScheduledAt ? new Date(formScheduledAt).toISOString() : null,
    });
  }

  if (loadingCustomer) {
    return <p className="text-sm text-neutral-600">Carregando cliente...</p>;
  }

  if (!customer) {
    return <p className="text-sm text-danger">Cliente não encontrado.</p>;
  }

  const orders: OrderResponse[] = ordersPage?.content ?? [];
  const totalGasto = orders.reduce((s, o) => s + o.totalAmount, 0);
  const lastOrder = orders[0];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/admin/clientes" className="mb-1 block text-sm text-primary hover:underline">
            ← Clientes
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{customer.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/pedidos/novo?customerId=${id}`}>
            <Button size="sm">Novo Pedido</Button>
          </Link>
          <Link to={`/admin/clientes/${id}/editar`}>
            <Button variant="outline" size="sm">Editar</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-neutral-200">
        {(['resumo', 'pedidos', 'historico'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px
              ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
          >
            {tab === 'resumo' ? 'Resumo' : tab === 'pedidos' ? 'Pedidos' : 'Histórico'}
          </button>
        ))}
      </div>

      {activeTab === 'resumo' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Dados do cliente
            </h2>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[customer.status] ?? ''}`}>
                  {customer.statusLabel}
                </span>
              </Row>
              <Row label="Tipo">{customer.customerType}</Row>
              <Row label="Origem">{customer.originLabel}</Row>
              <Row label="Telefone">{customer.phone ?? '—'}</Row>
              <Row label="E-mail">{customer.email ?? '—'}</Row>
              <Row label="CPF/CNPJ">{customer.document ?? '—'}</Row>
              <Row label="Cadastrado em">{formatDate(customer.createdAt)}</Row>
            </dl>
          </Card>

          {customer.notes && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Observações
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {customer.notes}
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {/* Summary card */}
          {orders.length > 0 && (
            <Card>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Pedidos</p>
                  <p className="text-2xl font-bold text-neutral-900">{orders.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Total gasto</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalGasto)}</p>
                </div>
                {lastOrder && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Última compra</p>
                    <p className="text-lg font-semibold text-neutral-700">
                      há {daysSince(lastOrder.createdAt)} dias
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {loadingOrders ? (
            <p className="text-sm text-neutral-600">Carregando pedidos...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum pedido encontrado para este cliente.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Nº Pedido</th>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-right">Itens</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono font-semibold text-primary">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{formatDateShort(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{order.items.length}</td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/pedidos/${order.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver pedido →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="space-y-6">
          {/* Formulário */}
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Registrar interação
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as InteractionType)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {INTERACTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Agendar para (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Anotação</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Descreva o contato ou anotação..."
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          </Card>

          {/* Lista */}
          {loadingInteractions ? (
            <p className="text-sm text-neutral-600">Carregando histórico...</p>
          ) : interactions.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhuma interação registrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {interactions.map((interaction) => (
                <li key={interaction.id}>
                  <Card>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {INTERACTION_TYPE_LABELS[interaction.type]}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {formatDate(interaction.createdAt)}
                          </span>
                          {interaction.scheduledAt && (
                            <span className="text-xs text-secondary">
                              Agendado: {formatDate(interaction.scheduledAt)}
                            </span>
                          )}
                        </div>
                        {interaction.notes && (
                          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {interaction.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(interaction.id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs text-neutral-400 hover:text-danger transition"
                        aria-label="Remover interação"
                      >
                        ✕
                      </button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-medium text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{children}</dd>
    </div>
  );
}
