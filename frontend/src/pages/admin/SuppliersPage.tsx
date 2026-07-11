import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import {
  activateSupplier,
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
  type SupplierRequest,
  type SupplierResponse,
} from '../../services/supplierService';

type ActiveFilter = 'active' | 'inactive' | 'all';

const PAGE_SIZE = 20;

export function SuppliersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierResponse | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<SupplierResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [page, setPage] = useState(0);

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: listSuppliers,
  });

  const { register, handleSubmit, reset, setValue, formState } = useForm<SupplierRequest>();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-suppliers'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, req }: { id?: string; req: SupplierRequest }) =>
      id ? updateSupplier(id, req) : createSupplier(req),
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => { invalidate(); setConfirmDeactivate(null); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateSupplier(id),
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '', contactName: '', email: '', phone: '', notes: '' });
    setModalOpen(true);
  }

  function openEdit(s: SupplierResponse) {
    setEditing(s);
    setValue('name', s.name);
    setValue('contactName', s.contactName ?? '');
    setValue('email', s.email ?? '');
    setValue('phone', s.phone ?? '');
    setValue('notes', s.notes ?? '');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset();
  }

  function onSubmit(values: SupplierRequest) {
    const req: SupplierRequest = {
      name: values.name,
      contactName: values.contactName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    };
    saveMutation.mutate({ id: editing?.id, req });
  }

  const filtered = data.filter((s) => {
    if (activeFilter === 'active') return s.active;
    if (activeFilter === 'inactive') return !s.active;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns = [
    {
      header: 'Nome',
      render: (row: SupplierResponse) => (
        <span className="font-medium text-neutral-900">{row.name}</span>
      ),
    },
    {
      header: 'Contato',
      render: (row: SupplierResponse) => (
        <span className="text-neutral-700">{row.contactName ?? '—'}</span>
      ),
    },
    {
      header: 'Email',
      render: (row: SupplierResponse) => (
        <span className="text-neutral-700">{row.email ?? '—'}</span>
      ),
    },
    {
      header: 'Telefone',
      render: (row: SupplierResponse) => (
        <span className="text-neutral-700">{row.phone ?? '—'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: SupplierResponse) =>
        row.active ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        ),
    },
    {
      header: 'Ações',
      render: (row: SupplierResponse) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Editar
          </Button>
          {row.active ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmDeactivate(row)}>
              Desativar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={activateMutation.isPending}
              onClick={() => activateMutation.mutate(row.id)}
            >
              Reativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Fornecedores</h1>
        <Button onClick={openCreate}>Novo fornecedor</Button>
      </div>

      <div className="mb-4">
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value as ActiveFilter); setPage(0); }}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="active">Apenas ativos</option>
          <option value="inactive">Apenas inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
          <Table columns={columns} data={paged} emptyMessage="Nenhum fornecedor cadastrado." />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={filtered.length}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal criar / editar */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome *"
            id="supplier-name"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={formState.errors.name?.message}
          />
          <Input
            label="Nome do contato"
            id="supplier-contact"
            {...register('contactName')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              id="supplier-email"
              type="email"
              {...register('email')}
            />
            <Input
              label="Telefone"
              id="supplier-phone"
              {...register('phone')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Observações
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          {saveMutation.isError && (
            <p className="text-sm text-danger">
              {axios.isAxiosError(saveMutation.error)
                ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar.')
                : 'Erro ao salvar.'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting || saveMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal desativar */}
      <Modal
        open={Boolean(confirmDeactivate)}
        onClose={() => setConfirmDeactivate(null)}
        title="Desativar fornecedor"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar o fornecedor <strong>{confirmDeactivate?.name}</strong>?
        </p>
        {deactivateMutation.isError && (
          <p className="mb-4 text-sm text-danger">Erro ao desativar. Tente novamente.</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={deactivateMutation.isPending}
            onClick={() => confirmDeactivate && deactivateMutation.mutate(confirmDeactivate.id)}
          >
            Desativar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
