import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { deleteCustomer, listCustomers } from '../../services/customerService';
import { STATUS_OPTIONS, ORIGIN_OPTIONS } from '../../types/customer';
import type { Customer, CustomerOrigin, CustomerStatus } from '../../types/customer';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('');
  const [originFilter, setOriginFilter] = useState<CustomerOrigin | ''>('');
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, status: statusFilter || undefined, origin: originFilter || undefined }],
    queryFn: () =>
      listCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        origin: originFilter || undefined,
      }),
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
          {customers.length > 0 && (
            <Button variant="outline" onClick={() => exportCSV(customers)}>
              Exportar CSV
            </Button>
          )}
          <Link to="/admin/clientes/novo">
            <Button>Novo cliente</Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | '')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value as CustomerOrigin | '')}
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
          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <Table
              columns={columns}
              data={customers}
              emptyMessage="Nenhum cliente encontrado."
            />
          </div>
          {data && data.totalElements > 0 && (
            <p className="mt-3 text-xs text-neutral-600">
              {data.totalElements} cliente(s) no total
            </p>
          )}
        </>
      )}

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
