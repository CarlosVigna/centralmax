import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { deleteCustomer, listCustomers, listReactivateCustomers } from '../../services/customerService';
import { STATUS_OPTIONS, ORIGIN_OPTIONS } from '../../types/customer';
import type { Customer, CustomerOrigin, CustomerStatus } from '../../types/customer';
import { Pagination } from '../../components/ui/Pagination';
import { useSearchParams } from 'react-router-dom';

function statusVariant(status: CustomerStatus): 'neutral' | 'success' | 'danger' {
  if (status === 'ATIVO') return 'success';
  if (status === 'INATIVO') return 'danger';
  return 'neutral';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function exportCSV(customers: Customer[]) {
  const headers = ['Nome', 'Email', 'Telefone', 'Tipo', 'Status', 'Origem', 'Cadastrado em'];
  const rows = customers.map((c) => [
    c.name,
    c.email ?? '',
    c.phone ?? '',
    c.customerType,
    c.statusLabel,
    c.originLabel,
    formatDate(c.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const month = new Date().toISOString().slice(0, 7).replace('-', '');
  a.href = url;
  a.download = `centralmax-clientes-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'reativar'>(
    searchParams.get('tab') === 'reativar' ? 'reativar' : 'all'
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('');
  const [originFilter, setOriginFilter] = useState<CustomerOrigin | ''>('');
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | ''>('true');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, status: statusFilter || undefined, origin: originFilter || undefined, active: activeFilter || undefined, page, size: pageSize }],
    queryFn: () =>
      listCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        origin: originFilter || undefined,
        active: activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'all',
  });

  const { data: reactivateList = [], isLoading: loadingReactivate } = useQuery({
    queryKey: ['customers-reactivate'],
    queryFn: listReactivateCustomers,
    enabled: activeTab === 'reativar',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setConfirmDelete(null);
    },
  });

  const customers = data?.content ?? [];

  const columns = [
    {
      header: 'Nome',
      render: (row: Customer) => (
        <Link to={`/admin/clientes/${row.id}`} className="font-medium text-neutral-900 hover:text-primary hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Telefone',
      render: (row: Customer) => (
        <span className="text-neutral-700">{row.phone ?? '—'}</span>
      ),
    },
    {
      header: 'Tipo/Status',
      render: (row: Customer) => (
        <Badge variant={statusVariant(row.status)}>{row.statusLabel}</Badge>
      ),
    },
    {
      header: 'Origem',
      render: (row: Customer) => (
        <span className="text-neutral-700">{row.originLabel}</span>
      ),
    },
    {
      header: 'Cadastro',
      render: (row: Customer) => (
        <span className="text-neutral-600">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Ações',
      render: (row: Customer) => (
        <div className="flex gap-2">
          <Link to={`/admin/clientes/${row.id}`}>
            <Button size="sm" variant="ghost">Ver</Button>
          </Link>
          <Link to={`/admin/clientes/${row.id}/editar`}>
            <Button size="sm" variant="outline">Editar</Button>
          </Link>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(row)}>
            Desativar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>
        <div className="flex gap-2">
          {activeTab === 'all' && customers.length > 0 && (
            <Button variant="outline" onClick={() => exportCSV(customers)}>
              Exportar CSV
            </Button>
          )}
          <Link to="/admin/clientes/novo">
            <Button>Novo cliente</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Todos os clientes
        </button>
        <button
          onClick={() => setActiveTab('reativar')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'reativar'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Para Reativar
          {reactivateList.length > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
              {reactivateList.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'reativar' ? (
        loadingReactivate ? (
          <p className="text-sm text-neutral-600">Carregando...</p>
        ) : reactivateList.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum cliente para reativar no momento.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-neutral-500 mb-3">
              Clientes ativos sem compra nos últimos 90 dias — {reactivateList.length} encontrado{reactivateList.length !== 1 ? 's' : ''}.
            </p>
            {reactivateList.map((c) => (
              <div key={c.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/admin/clientes/${c.id}`}
                      className="block text-sm font-semibold text-neutral-900 hover:text-primary truncate">
                      {c.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {c.phone ?? '—'}
                      {c.lastPurchaseDate
                        ? ` · Última compra: ${formatDate(c.lastPurchaseDate)}`
                        : ' · Nunca comprou'}
                    </p>
                  </div>
                  <Badge variant={statusVariant(c.status)}>{c.statusLabel}</Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/admin/clientes/${c.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                  {c.phone && (
                    <a
                      href={`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(c.name.split(' ')[0])}%2C%20tudo%20bem%3F%20Sentimos%20sua%20falta!%20Temos%20novidades%20para%20voc%C3%AA%20%F0%9F%98%8A`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline">WhatsApp</Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="max-w-sm"
            />
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as 'true' | 'false' | ''); setPage(0); }}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="true">Apenas ativos</option>
              <option value="false">Apenas inativos</option>
              <option value="">Todos</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as CustomerStatus | ''); setPage(0); }}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={originFilter}
              onChange={(e) => { setOriginFilter(e.target.value as CustomerOrigin | ''); setPage(0); }}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Todas as origens</option>
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="text-sm text-neutral-600">Carregando...</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 md:hidden">
                {customers.length === 0 ? (
                  <p className="text-sm text-neutral-400">Nenhum cliente encontrado.</p>
                ) : customers.map((c) => (
                  <div key={c.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/admin/clientes/${c.id}`}
                          className="block text-sm font-semibold text-neutral-900 hover:text-primary truncate">
                          {c.name}
                        </Link>
                        <p className="text-xs text-neutral-500">{c.phone ?? '—'} &middot; {c.originLabel}</p>
                      </div>
                      <Badge variant={statusVariant(c.status)}>{c.statusLabel}</Badge>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link to={`/admin/clientes/${c.id}`}>
                        <Button size="sm" variant="ghost">Ver</Button>
                      </Link>
                      <Link to={`/admin/clientes/${c.id}/editar`}>
                        <Button size="sm" variant="outline">Editar</Button>
                      </Link>
                      <Button size="sm" variant="danger" onClick={() => setConfirmDelete(c)}>Desativar</Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-lg border border-neutral-300 bg-white md:block">
                <Table
                  columns={columns}
                  data={customers}
                  emptyMessage="Nenhum cliente encontrado."
                />
              </div>
              {data && (
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  size={pageSize}
                  onPageChange={setPage}
                  onSizeChange={(s) => { setPageSize(s); setPage(0); }}
                />
              )}
            </>
          )}
        </>
      )}

      {/* FAB mobile */}
      <Link
        to="/admin/clientes/novo"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90 md:hidden"
        aria-label="Novo cliente"
      >
        <span className="text-2xl leading-none">+</span>
      </Link>

      {/* Modal de confirmação de desativação */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Desativar cliente"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar o cliente <strong>{confirmDelete?.name}</strong>? Ele não aparecerá mais nas listagens.
        </p>
        {deleteMutation.isError && (
          <p className="mb-4 text-sm text-danger">
            {axios.isAxiosError(deleteMutation.error)
              ? (deleteMutation.error.response?.data?.message ?? 'Erro ao desativar.')
              : 'Erro ao desativar.'}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
          >
            Desativar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
