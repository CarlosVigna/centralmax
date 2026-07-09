import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { getAgendaSchedules, completeSchedule, cancelSchedule } from '../../services/contactScheduleService';
import type { ContactSchedule } from '../../types/contactSchedule';

type Period = 'today' | 'tomorrow' | 'week' | 'month' | 'overdue';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  tomorrow: 'Amanhã',
  week: 'Esta Semana',
  month: 'Mês',
  overdue: 'Em Atraso',
};

function formatLocalDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function daysFromToday(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function buildWhatsAppUrl(phone: string, customerName: string): string {
  const msg = `Olá ${customerName}! Passando para dar um retorno, estamos à disposição!`;
  const clean = phone.replace(/\D/g, '');
  const br = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://api.whatsapp.com/send?phone=${br}&text=${encodeURIComponent(msg)}`;
}

const STATUS_BADGE: Record<string, string> = {
  PROSPECT: 'bg-blue-100 text-blue-800',
  ATIVO: 'bg-green-100 text-green-800',
  INATIVO: 'bg-neutral-200 text-neutral-600',
};
const STATUS_LABEL: Record<string, string> = {
  PROSPECT: 'Prospect',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
};

function groupByDate(items: ContactSchedule[]): Record<string, ContactSchedule[]> {
  const groups: Record<string, ContactSchedule[]> = {};
  for (const item of items) {
    if (!groups[item.scheduledDate]) groups[item.scheduledDate] = [];
    groups[item.scheduledDate].push(item);
  }
  return groups;
}

export function AgendaPage() {
  const [searchParams] = useSearchParams();
  const initialPeriod = (searchParams.get('period') as Period) ?? 'today';
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const queryClient = useQueryClient();

  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['agenda', period],
    queryFn: () => getAgendaSchedules({ period }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      completeSchedule(id, { notes }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      setCompleteId(null);
      setCompleteNotes('');
      if (result.nextContactDate) {
        setSuccessMsg(`Contato registrado! Próximo agendado para ${formatLocalDate(result.nextContactDate)}`);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setSuccessMsg('Contato registrado com sucesso!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agenda'] }),
  });

  const overdueCount = period === 'overdue' ? items.length : 0;

  function renderItem(item: ContactSchedule) {
    const diff = daysFromToday(item.scheduledDate);
    return (
      <Card key={item.id}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1.5">
            {/* Header: name + status badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/admin/clientes/${item.customerId}`}
                className="text-sm font-semibold text-neutral-900 hover:text-primary transition"
              >
                {item.customerName}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[item.customerStatus] ?? 'bg-neutral-100 text-neutral-500'}`}>
                {STATUS_LABEL[item.customerStatus] ?? item.customerStatus}
              </span>
              {period === 'overdue' && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                  {Math.abs(diff)}d em atraso
                </span>
              )}
            </div>

            {/* Reason */}
            {item.reason && (
              <p className="text-sm text-neutral-600">{item.reason}</p>
            )}

            {/* Date */}
            <p className="text-xs text-neutral-400">
              {period === 'week' || period === 'month' ? `📅 ${formatLocalDate(item.scheduledDate)}` : ''}
              {item.customerPhone && (
                <span className="ml-2">{item.customerPhone}</span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {item.customerPhone ? (
              <a href={buildWhatsAppUrl(item.customerPhone, item.customerName)} target="_blank" rel="noreferrer">
                <Button size="sm" variant="ghost" title="WhatsApp">💬</Button>
              </a>
            ) : (
              <Button size="sm" variant="ghost" disabled title="Sem telefone">💬</Button>
            )}
            <Button
              size="sm"
              onClick={() => setCompleteId(item.id)}
            >
              Registrar
            </Button>
            <Link to={`/admin/clientes/${item.customerId}`}>
              <Button size="sm" variant="outline">Ver Cliente</Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(item.id)}
              className="text-neutral-400"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  function renderWeekOrMonth() {
    const groups = groupByDate(items);
    const dates = Object.keys(groups).sort();
    if (dates.length === 0) return (
      <p className="text-sm text-neutral-400">Nenhum contato agendado para este período.</p>
    );
    return (
      <div className="space-y-6">
        {dates.map((date) => (
          <div key={date}>
            <h3 className="mb-3 text-sm font-semibold text-neutral-500">
              {formatLocalDate(date)}
              <span className="ml-2 text-xs font-normal text-neutral-400">
                {groups[date].length} contato(s)
              </span>
            </h3>
            <div className="space-y-2">{groups[date].map(renderItem)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Agenda de Contatos</h1>

      {successMsg && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-neutral-200">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px flex items-center gap-1.5
              ${period === p
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
          >
            {PERIOD_LABELS[p]}
            {p === 'overdue' && overdueCount > 0 && (
              <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Carregando agenda...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar agenda.</p>}

      {!isLoading && !isError && (
        <>
          {(period === 'week' || period === 'month') ? renderWeekOrMonth() : (
            <>
              {items.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  {period === 'overdue'
                    ? 'Nenhum contato em atraso.'
                    : `Nenhum contato agendado para ${PERIOD_LABELS[period].toLowerCase()}.`}
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map(renderItem)}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal: Registrar Contato */}
      <Modal
        open={!!completeId}
        onClose={() => setCompleteId(null)}
        title="Registrar Contato"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Como foi o contato?"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteId(null)}>Cancelar</Button>
            <Button
              disabled={completeMutation.isPending}
              onClick={() => completeId && completeMutation.mutate({
                id: completeId,
                notes: completeNotes || undefined,
              })}
            >
              {completeMutation.isPending ? 'Salvando...' : 'Confirmar contato'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
