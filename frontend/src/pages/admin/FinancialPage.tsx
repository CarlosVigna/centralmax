import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/ui/Pagination';
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

const RECEITA_CATEGORIES = ['Venda', 'Outros'];
const DESPESA_CATEGORIES = [
  'Compra de Estoque', 'Frete', 'Aluguel', 'Comissão',
  'Marketing', 'Manutenção', 'Impostos', 'Outros',
];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};

const today = new Date().toISOString().split('T')[0];
const isPast = (dueDate: string | null | undefined, status: string) =>
  !!dueDate && status !== 'PAGO' && status !== 'CANCELADO' && dueDate < today;

export function FinancialPage() {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<FinancialFilters>(() => ({
    page: 0,
    size: 20,
    type: (searchParams.get('type') as FinancialEntryType) || undefined,
    status: (searchParams.get('status') as FinancialEntryStatus) || undefined,
  }));

  const [draftFilters, setDraftFilters] = useState<FinancialFilters>(() => ({
    type: (searchParams.get('type') as FinancialEntryType) || undefined,
    status: (searchParams.get('status') as FinancialEntryStatus) || undefined,
  }));

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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FinancialEntryRequest>({ defaultValues: { type: 'RECEITA' } });

  const watchedType = watch('type');
  const categories = watchedType === 'RECEITA' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['financial'] });
    qc.invalidateQueries({ queryKey: ['financial-summary'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({ mutationFn: createFinancialEntry, onSuccess: () => { invalidate(); closeModal(); } });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinancialEntryRequest }) => updateFinancialEntry(id, data),
    onSuccess: () => { invalidate(); closeModal(); },
  });
  const payMutation = useMutation({ mutationFn: payFinancialEntry, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deleteFinancialEntry, onSuccess: invalidate });

  function openCreate() {
    setEditing(null);
    reset({ type: 'RECEITA', category: '', description: '', amount: undefined, dueDate: today, notes: '' });
    setModalOpen(true);
  }

  function openEdit(entry: FinancialEntryResponse) {
    setEditing(entry);
    reset({
      type: entry.type,
      category: entry.category ?? '',
      description: entry.description,
      amount: entry.amount,
      dueDate: entry.dueDate,
      notes: entry.notes ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); }

  function onSubmit(data: FinancialEntryRequest) {
    const payload = { ...data, amount: Number(data.amount) };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  }

  function applyFilters() { setFilters({ ...draftFilters, page: 0, size: filters.size ?? 20 }); }
  function clearFilters() { setDraftFilters({}); setFilters({ page: 0, size: filters.size ?? 20 }); }

  const isMutating = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const saldoPositivo = (summary?.saldoMes ?? 0) >= 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
        <button onClick={openCreate} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          + Novo Lançamento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard
          label="Saldo do Mês"
          value={summary?.saldoMes ?? 0}
          accent={saldoPositivo ? 'green' : 'red'}
          highlight
        />
        <SummaryCard label="Receitas (mês)" value={summary?.receitas ?? 0} accent="green" />
        <SummaryCard label="Despesas (mês)" value={summary?.despesas ?? 0} accent="red" />
        <SummaryCard label="A Receber" value={summary?.receitasPendentes ?? summary?.aReceber ?? 0} accent="blue" />
        <SummaryCard label="A Pagar" value={summary?.despesasPendentes ?? 0} accent="orange" />
        <SummaryCard label="Vencidos" value={summary?.vencidos ?? 0} accent="red" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Tipo</label>
            <select
              value={draftFilters.type ?? ''}
              onChange={(e) => setDraftFilters((f) => ({ ...f, type: (e.target.value as FinancialEntryType) || undefined }))}
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
              onChange={(e) => setDraftFilters((f) => ({ ...f, status: (e.target.value as FinancialEntryStatus) || undefined }))}
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
            <input type="date" value={draftFilters.startDate ?? ''}
              onChange={(e) => setDraftFilters((f) => ({ ...f, startDate: e.target.value || undefined }))}
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Até</label>
            <input type="date" value={draftFilters.endDate ?? ''}
              onChange={(e) => setDraftFilters((f) => ({ ...f, endDate: e.target.value || undefined }))}
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm" />
          </div>
          <button onClick={applyFilters} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
            Filtrar
          </button>
          <button onClick={clearFilters} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50">
            Limpar
          </button>
        </div>
      </Card>

      {/* Mobile view */}
      <div className="mt-4 md:hidden">
        {isLoading ? (
          <p className="text-sm text-neutral-600">Carregando...</p>
        ) : !entries?.content?.length ? (
          <p className="text-sm text-neutral-600">Nenhum lançamento encontrado.</p>
        ) : (
          <div className="space-y-2">
            {(entries.content ?? []).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{entry.description}</p>
                    {entry.category && <p className="text-xs text-neutral-400">{entry.category}</p>}
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${entry.type === 'RECEITA' ? 'text-green-600' : 'text-danger'}`}>
                    {entry.type === 'DESPESA' ? '−' : '+'}{fmtCurrency(entry.amount)}
                  </span>
                </div>
                <p className={`text-xs ${isPast(entry.dueDate, entry.status) ? 'text-danger font-medium' : 'text-neutral-500'}`}>
                  Venc. {fmtDate(entry.dueDate)} · {entry.statusLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && (
                    <button onClick={() => payMutation.mutate(entry.id)} disabled={payMutation.isPending}
                      className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50">
                      Receber
                    </button>
                  )}
                  {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && entry.customerPhone && (
                    <a href={buildWhatsAppUrl(entry)} target="_blank" rel="noopener noreferrer"
                      className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                      WhatsApp
                    </a>
                  )}
                  {entry.status !== 'PAGO' && (
                    <button onClick={() => openEdit(entry)}
                      className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200">
                      Editar
                    </button>
                  )}
                  {entry.status !== 'PAGO' && (
                    <button onClick={() => { if (confirm('Excluir lançamento?')) deleteMutation.mutate(entry.id); }}
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
        {entries && (
          <Pagination page={entries.page} totalPages={entries.totalPages} totalElements={entries.totalElements}
            size={filters.size ?? 20} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            onSizeChange={(s) => setFilters((f) => ({ ...f, size: s, page: 0 }))} />
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white md:block">
        {isLoading ? (
          <p className="p-6 text-sm text-neutral-600">Carregando...</p>
        ) : !entries?.content?.length ? (
          <p className="p-6 text-sm text-neutral-600">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pedido</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(entries.content ?? []).map((entry) => (
                <tr key={entry.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{entry.description}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{entry.category ?? '��'}</td>
                  <td className="px-4 py-3"><TypeBadge type={entry.type} label={entry.typeLabel} /></td>
                  <td className={`px-4 py-3 text-sm ${isPast(entry.dueDate, entry.status) ? 'font-semibold text-danger' : 'text-neutral-600'}`}>
                    {fmtDate(entry.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className={entry.type === 'RECEITA' ? 'text-green-600' : 'text-danger'}>
                      {entry.type === 'DESPESA' ? '− ' : ''}{fmtCurrency(entry.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} label={entry.statusLabel} /></td>
                  <td className="px-4 py-3 text-neutral-500">{entry.orderNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && (
                        <button onClick={() => payMutation.mutate(entry.id)} disabled={payMutation.isPending}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50">
                          Receber
                        </button>
                      )}
                      {(entry.status === 'PENDENTE' || entry.status === 'VENCIDO') && entry.customerPhone && (
                        <a href={buildWhatsAppUrl(entry)} target="_blank" rel="noopener noreferrer"
                          className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                          WhatsApp
                        </a>
                      )}
                      {entry.status !== 'PAGO' && (
                        <button onClick={() => openEdit(entry)}
                          className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200">
                          Editar
                        </button>
                      )}
                      {entry.status !== 'PAGO' && (
                        <button onClick={() => { if (confirm('Excluir lançamento?')) deleteMutation.mutate(entry.id); }}
                          disabled={deleteMutation.isPending}
                          className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-danger hover:bg-red-100 disabled:opacity-50">
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
        {entries && (
          <Pagination page={entries.page} totalPages={entries.totalPages} totalElements={entries.totalElements}
            size={filters.size ?? 20} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            onSizeChange={(s) => setFilters((f) => ({ ...f, size: s, page: 0 }))} />
        )}
      </div>

      {/* Modal criar / editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              {editing ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Tipo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo</label>
                <select
                  {...register('type', { required: true })}
                  onChange={(e) => {
                    setValue('type', e.target.value as FinancialEntryType, { shouldValidate: true });
                    setValue('category', '');
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria</label>
                <select
                  {...register('category')}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
                <input
                  {...register('description', { required: 'Descrição obrigatória' })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Ex: Fornecedor XYZ"
                />
                {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
              </div>

              {/* Valor + Vencimento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Valor (R$)</label>
                  <input type="number" step="0.01" min="0.01"
                    {...register('amount', {
                      required: 'Valor obrigatório',
                      valueAsNumber: true,
                      min: { value: 0.01, message: 'Valor mínimo R$ 0,01' },
                    })}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Vencimento</label>
                  <input type="date"
                    {...register('dueDate', { required: 'Data obrigatória' })}
                    className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  />
                  {errors.dueDate && <p className="mt-1 text-xs text-danger">{errors.dueDate.message}</p>}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Observações</label>
                <textarea {...register('notes')} rows={2} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
              </div>

              {(createMutation.isError || updateMutation.isError) && (
                <p className="text-xs text-danger">Erro ao salvar. Tente novamente.</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isMutating}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60">
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

function buildWhatsAppUrl(entry: FinancialEntryResponse): string {
  const phone = entry.customerPhone!.replace(/\D/g, '');
  const firstName = (entry.customerName ?? 'Cliente').split(' ')[0];
  const amount = fmtCurrency(entry.amount);
  const due = fmtDate(entry.dueDate);
  const msg = `Olá ${firstName}, tudo bem?\n\nPassando para avisar que temos um título em aberto no valor de *${amount}* com vencimento em *${due}*.\n\nPodemos verificar a situação? Qualquer dúvida, estou à disposição! 😊`;
  return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
}

function SummaryCard({ label, value, accent, highlight }: {
  label: string;
  value: number;
  accent: 'green' | 'red' | 'blue' | 'orange';
  highlight?: boolean;
}) {
  const textClass = accent === 'green' ? 'text-green-600'
    : accent === 'red' ? 'text-danger'
    : accent === 'orange' ? 'text-orange-500'
    : 'text-primary';
  const bgClass = highlight
    ? (accent === 'green' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
    : '';
  return (
    <Card className={bgClass}>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${textClass}`}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
    </Card>
  );
}

function TypeBadge({ type, label }: { type: FinancialEntryType; label: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
      type === 'RECEITA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-danger'
    }`}>
      {label}
    </span>
  );
}

function StatusBadge({ status, label }: { status: FinancialEntryStatus; label: string }) {
  const cls = status === 'PAGO' ? 'bg-green-100 text-green-700'
    : status === 'VENCIDO' ? 'bg-red-100 text-red-700 animate-pulse'
    : status === 'CANCELADO' ? 'bg-neutral-100 text-neutral-500'
    : 'bg-amber-100 text-amber-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  );
}
