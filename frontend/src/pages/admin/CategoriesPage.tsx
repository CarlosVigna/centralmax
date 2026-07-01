import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  createCategory,
  deleteCategory,
  listAllCategories,
  updateCategory,
} from '../../services/categoryService';
import type { CategoryFull } from '../../types/product';

interface CategoryFormValues {
  name: string;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryFull | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CategoryFull | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: listAllCategories,
  });

  const { register, handleSubmit, reset, formState, setValue } = useForm<CategoryFormValues>();

  const saveMutation = useMutation({
    mutationFn: ({ id, name }: { id?: string; name: string }) =>
      id ? updateCategory(id, name) : createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setConfirmDelete(null);
    },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '' });
    setModalOpen(true);
  }

  function openEdit(category: CategoryFull) {
    setEditing(category);
    setValue('name', category.name);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
    reset();
  }

  function onSubmit(values: CategoryFormValues) {
    saveMutation.mutate({ id: editing?.id, name: values.name });
  }

  const columns = [
    {
      header: 'Nome',
      render: (row: CategoryFull) => (
        <span className="font-medium text-neutral-900">{row.name}</span>
      ),
    },
    {
      header: 'Slug',
      render: (row: CategoryFull) => (
        <span className="font-mono text-xs text-neutral-600">{row.slug}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: CategoryFull) =>
        row.active ? (
          <Badge variant="success">Ativa</Badge>
        ) : (
          <Badge variant="neutral">Inativa</Badge>
        ),
    },
    {
      header: 'Ações',
      render: (row: CategoryFull) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Editar
          </Button>
          {row.active && (
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(row)}>
              Desativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Categorias</h1>
        <Button onClick={openCreate}>Nova categoria</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
          <Table columns={columns} data={data} emptyMessage="Nenhuma categoria cadastrada." />
        </div>
      )}

      {/* Modal de criação / edição */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome"
            id="category-name"
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 80, message: 'Máximo 80 caracteres' },
            })}
            error={formState.errors.name?.message}
          />
          {saveMutation.isError && (
            <p className="text-sm text-danger">
              {axios.isAxiosError(saveMutation.error)
                ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar. Tente novamente.')
                : 'Erro ao salvar. Tente novamente.'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting || saveMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmação de desativação */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Desativar categoria"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar a categoria <strong>{confirmDelete?.name}</strong>? Ela não aparecerá mais no catálogo público.
        </p>
        {deleteMutation.isError && (
          <p className="mb-4 text-sm text-danger">Erro ao desativar. Tente novamente.</p>
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
