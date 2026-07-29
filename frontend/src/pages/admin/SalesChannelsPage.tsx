import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  createSalesChannel,
  deleteSalesChannel,
  listAllSalesChannels,
  updateSalesChannel,
} from '../../services/salesChannelService';
import { FEE_BASE_OPTIONS, SHIPPING_RESPONSIBILITY_OPTIONS } from '../../types/salesChannel';
import type { SalesChannel, SalesChannelRequest } from '../../types/salesChannel';

export function SalesChannelsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SalesChannel | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SalesChannel | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-sales-channels'],
    queryFn: listAllSalesChannels,
  });

  const { register, handleSubmit, reset, formState } = useForm<SalesChannelRequest>({
    defaultValues: {
      fixedFee: 0,
      variableFeePercent: 0,
      feeBase: 'TOTAL',
      shippingResponsibility: 'CLIENT',
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-sales-channels'] });
    queryClient.invalidateQueries({ queryKey: ['sales-channels'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, request }: { id?: string; request: SalesChannelRequest }) =>
      id ? updateSalesChannel(id, request) : createSalesChannel(request),
    onSuccess: () => {
      invalidate();
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSalesChannel(id),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
    },
  });

  function openCreate() {
    setEditing(null);
    reset({
      name: '',
      fixedFee: 0,
      variableFeePercent: 0,
      feeBase: 'TOTAL',
      shippingResponsibility: 'CLIENT',
      notes: '',
    });
    setModalOpen(true);
  }

  function openEdit(channel: SalesChannel) {
    setEditing(channel);
    reset({
      name: channel.name,
      fixedFee: channel.fixedFee,
      variableFeePercent: channel.variableFeePercent,
      feeBase: channel.feeBase,
      shippingResponsibility: channel.shippingResponsibility,
      notes: channel.notes ?? '',
    });
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
    reset();
  }

  function onSubmit(values: SalesChannelRequest) {
    saveMutation.mutate({
      id: editing?.id,
      request: {
        ...values,
        fixedFee: Number(values.fixedFee),
        variableFeePercent: Number(values.variableFeePercent),
        notes: values.notes || undefined,
      },
    });
  }

  const columns = [
    {
      header: 'Nome',
      render: (row: SalesChannel) => (
        <span className="font-medium text-neutral-900">{row.name}</span>
      ),
    },
    {
      header: 'Taxa Fixa',
      render: (row: SalesChannel) => (
        <span className="text-neutral-700">{formatCurrency(row.fixedFee)}</span>
      ),
    },
    {
      header: 'Taxa Variável %',
      render: (row: SalesChannel) => (
        <span className="text-neutral-700">{row.variableFeePercent}%</span>
      ),
    },
    {
      header: 'Base',
      render: (row: SalesChannel) => (
        <span className="text-xs text-neutral-600">{row.feeBaseLabel}</span>
      ),
    },
    {
      header: 'Frete',
      render: (row: SalesChannel) => (
        <span className="text-xs text-neutral-600">{row.shippingResponsibilityLabel}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: SalesChannel) =>
        row.active ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        ),
    },
    {
      header: 'Ações',
      render: (row: SalesChannel) => (
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
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Canais de Venda</h1>
          <p className="text-sm text-neutral-500">
            Taxas cobradas por cada canal e responsabilidade pelo frete
          </p>
        </div>
        <Button onClick={openCreate}>Novo canal</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
          <Table columns={columns} data={data} emptyMessage="Nenhum canal de venda cadastrado." />
        </div>
      )}

      {/* Modal de criação / edição */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? 'Editar canal de venda' : 'Novo canal de venda'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome"
            id="channel-name"
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
            })}
            error={formState.errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Taxa fixa (R$)"
              id="channel-fixed-fee"
              type="number"
              step="0.01"
              min={0}
              {...register('fixedFee', {
                required: 'Obrigatório',
                valueAsNumber: true,
                min: { value: 0, message: 'Não pode ser negativo' },
              })}
              error={formState.errors.fixedFee?.message}
            />
            <Input
              label="Taxa variável (%)"
              id="channel-variable-fee"
              type="number"
              step="0.01"
              min={0}
              max={100}
              {...register('variableFeePercent', {
                required: 'Obrigatório',
                valueAsNumber: true,
                min: { value: 0, message: 'Não pode ser negativo' },
                max: { value: 100, message: 'Máximo 100%' },
              })}
              error={formState.errors.variableFeePercent?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-900" htmlFor="channel-fee-base">
                Base de cálculo
              </label>
              <select
                id="channel-fee-base"
                {...register('feeBase', { required: true })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                {FEE_BASE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-900" htmlFor="channel-shipping">
                Frete por conta de
              </label>
              <select
                id="channel-shipping"
                {...register('shippingResponsibility')}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                {SHIPPING_RESPONSIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-900" htmlFor="channel-notes">
              Observações
            </label>
            <textarea
              id="channel-notes"
              rows={2}
              {...register('notes')}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>

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
        title="Desativar canal de venda"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar o canal <strong>{confirmDelete?.name}</strong>? Ele não aparecerá mais na criação de pedidos.
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
