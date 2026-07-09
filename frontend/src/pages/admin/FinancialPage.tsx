import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import {
  createFinancialEntry,
  deleteFinancialEntry,
  getFinancialSummary,
  listFinancialEntries,
  payFinancialEntry,
  updateFinancialEntry,
} from '../../services/financialService';
import type {
  FinancialEntryRequest,
  FinancialEntryResponse,
  FinancialEntryStatus,
  FinancialEntryType,
  FinancialFilters,
} from '../../types/financial';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};

export function FinancialPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<FinancialFilters>({ page: 0, size: 20 });
  const [draftFilters, setDraftFilters] = useState<FinancialFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialEntryResponse | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => getFinancialSummary(),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['financial', filters],
    queryFn: () => listFinancialEntries(filters),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinancialEntryRequest>();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['financial'] });
    qc.invalidateQueries({ queryKey: ['financial-summary'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: createFinancialEntry,
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinancialEntryRequest }) =>
      updateFinancialEntry(id, data),
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const payMutation = useMutation({
    mutationFn: payFinancialEntry,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFinancialEntry,
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    reset({
      type: 'RECEITA',
      description: '',
      amount: undefined,
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setModalOpen(true);
  }

  function openEdit(entry: FinancialEntryResponse) {
    setEditing(entry);
    reset({
      type: entry.type,
      description: entry.description,
      amount: entry.amount,
      dueDate: entry.dueDate,
      notes: entry.notes ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function onSubmit(data: FinancialEntryRequest) {
    const payload = { ...data, amount: Number(data.amount) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function applyFilters() {
    setFilters({ ...draftFilters, page: 0, size: 20 });
  }

  function clearFilters() {
    setDraftFilters({});
    setFilters({ page: 0, size: 20 });
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Novo Lançamento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <SummaryCard
          label="Saldo do Mês"
          value={summary?.saldoMes ?? 0}
          accent={summary && summary.saldoMes >= 0 ? 'green' : 'red'}
        />
        <SummaryCard label="A Receber" value={summary?.aReceber ?? 0} accent="blue" />
        <SummaryCard label="Receitas (mês)" value={summary?.receitas ?? 0} accent="green" />
        <SummaryCard label="Despesas (mês)" value={summary?.despesas ?? 0} accent="red" />
        <SummaryCard label="Vencidos" value={summary?.vencidos ?? 0} accent="red" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Tipo</label>
            <select
              value={draftFilters.type ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  type: (e.target.value as FinancialEntryType) || undefined,
                }))
              }
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Status</label>
            <select
              value={draftFilters.status ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  status: (e.target.value as FinancialEntryStatus) || undefined,
                }))
              }
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="VENCIDO">Vencido</option>
              <option value="PAGO">Pago</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">De</label>
            <input
              type="date"
              value={draftFilters.startDate ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, startDate: e.target.value || undefined }))
              }
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Até</label>
            <input
              type="date"
              value={draftFilters.endDate ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, endDate: e.target.value || undefined }))
              }
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={applyFilters}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Filtrar
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Limpar
          </button>
        </div>
      </Card>

      {/* Mobile view */}
      <div className="mt-4 md:hidden">
        {isLoading ? (
          <p className="text-sm text-neutral-600">Carregando...</p>
        ) : !entries?.content.length ? (
          <p className="text-sm text-neutral-600">Nenhum lançamento encontrado.</p>
        ) : (
          <div className="space-y-2">
            {entries.content.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">{entry.description}</p>
                  <span className={`text-sm font-semibold ${entry.type === 'RECEITA' ? 'text-green-600' : 'text-danger'}`}>
                    {entry.type === 'DESPESA' ? '−' : '+'}{fmtCurrency(entry.amount)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Venc. {fmtDate(entry.dueDate)} &middot; {entry.statusLabel}
                </p>
                <div className="flex gap-1.5">
                  {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && (
                    <button
                      onClick={() => payMutation.mutate(entry.id)}
                      disabled={payMutation.isPending}
                      className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      Receber
                    </button>
                  )}
                  {entry.status !== 'PAGO' && entry.status !== 'VENCIDO' && (
                    <button onClick={() => openEdit(entry)}
                      className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200">
                      Editar
                    </button>
                  )}
                  {entry.status !== 'PAGO' && (
                    <button
                      onClick={() => { if (confirm('Excluir lançamento?')) deleteMutation.mutate(entry.id); }}
                      disabled={deleteMutation.isPending}
                      className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-danger hover:bg-red-100 disabled:opacity-50">
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        {isLoading ? (
          <p className="p-6 text-sm text-neutral-600">Carregando...</p>
        ) : !entries?.content.length ? (
          <p className="p-6 text-sm text-neutral-600">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pedido</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {entries.content.map((entry) => (
                <tr key={entry.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{entry.description}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={entry.type} label={entry.typeLabel} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{fmtDate(entry.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className={entry.type === 'RECEITA' ? 'text-green-600' : 'text-danger'}>
                      {entry.type === 'DESPESA' ? '- ' : ''}
                      {fmtCurrency(entry.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.status} label={entry.statusLabel} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {entry.orderNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && (
                        <button
                          onClick={() => payMutation.mutate(entry.id)}
                          disabled={payMutation.isPending}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          Receber
                        </button>
                      )}
                      {entry.status !== 'PAGO' && entry.status !== 'VENCIDO' && (
                        <button
                          onClick={() => openEdit(entry)}
                          className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                        >
                          Editar
                        </button>
                      )}
                      {entry.status !== 'PAGO' && (
                        <button
                          onClick={() => {
                            if (confirm('Excluir lançamento?')) deleteMutation.mutate(entry.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-danger hover:bg-red-100 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {entries && entries.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
            <p className="text-xs text-neutral-500">
              {entries.totalElements} lançamentos
            </p>
            <div className="flex gap-2">
              <button
                disabled={entries.page === 0}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="rounded border border-neutral-300 px-3 py-1 text-xs disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2 py-1 text-xs text-neutral-600">
                {entries.page + 1} / {entries.totalPages}
              </span>
              <button
                disabled={entries.page + 1 >= entries.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
                className="rounded border border-neutral-300 px-3 py-1 text-xs disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              {editing ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo</label>
                <select
                  {...register('type', { required: true })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Descrição
                </label>
                <input
                  {...register('description', { required: 'Descrição obrigatória' })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Ex: Fornecedor XYZ"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('amount', {
                      required: 'Valor obrigatório',
                      valueAsNumber: true,
                      min: { value: 0.01, message: 'Valor mínimo R$ 0,01' },
                    })}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Data obrigatória' })}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-xs text-danger">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  {isMutating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'green' | 'red' | 'blue';
}) {
  const colorClass =
    accent === 'green'
      ? 'text-green-600'
      : accent === 'red'
        ? 'text-danger'
        : 'text-primary';
  return (
    <Card>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${colorClass}`}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
    </Card>
  );
}

function TypeBadge({ type, label }: { type: FinancialEntryType; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        type === 'RECEITA'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-danger'
      }`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status, label }: { status: FinancialEntryStatus; label: string }) {
  const cls =
    status === 'PAGO'
      ? 'bg-green-100 text-green-700'
      : status === 'VENCIDO'
        ? 'bg-red-100 text-red-700'
        : status === 'CANCELADO'
          ? 'bg-neutral-100 text-neutral-500'
          : 'bg-amber-100 text-amber-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  );
}
