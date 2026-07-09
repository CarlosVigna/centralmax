import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { getAgendaSchedules, completeSchedule, cancelSchedule } from '../../services/contactScheduleService';
import type { ContactSchedule, ContactResult } from '../../types/contactSchedule';
import { CONTACT_RESULT_OPTIONS } from '../../types/contactSchedule';

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

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
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

interface RegisterState {
  scheduleId: string;
  customerName: string;
  customerId: string;
}

export function AgendaPage() {
  const [searchParams] = useSearchParams();
  const initialPeriod = (searchParams.get('period') as Period) ?? 'today';
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const queryClient = useQueryClient();

  // Modal de registro
  const [registerState, setRegisterState] = useState<RegisterState | null>(null);
  const [contactResult, setContactResult] = useState<ContactResult | ''>('');
  const [contactNotes, setContactNotes] = useState('');
  const [rescheduleTo, setRescheduleTo] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState<{ id: string; name: string } | null>(null);

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['agenda', period],
    queryFn: () => getAgendaSchedules({ period }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, notes, result, rescheduledTo }: {
      id: string; notes?: string; result: ContactResult; rescheduledTo?: string;
    }) =>
      completeSchedule(id, { notes, result, rescheduledTo }),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      closeRegisterModal();

      // Toast de "Comprou"
      if (vars.result === 'COMPROU') {
        const item = items.find((i) => i.id === vars.id);
        if (item) {
          setShowCreateOrder({ id: item.customerId, name: item.customerName });
          setTimeout(() => setShowCreateOrder(null), 8000);
        }
      } else if (res.nextContactDate) {
        setSuccessMsg(`Contato registrado! Próximo agendado para ${formatLocalDate(res.nextContactDate)}`);
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

  function openRegister(item: ContactSchedule, defaultResult?: ContactResult) {
    setRegisterState({ scheduleId: item.id, customerName: item.customerName, customerId: item.customerId });
    setContactResult(defaultResult ?? '');
    setContactNotes('');
    setRescheduleTo('');
  }

  function closeRegisterModal() {
    setRegisterState(null);
    setContactResult('');
    setContactNotes('');
    setRescheduleTo('');
  }

  function handleConfirmRegister() {
    if (!registerState || !contactResult) return;
    completeMutation.mutate({
      id: registerState.scheduleId,
      notes: contactNotes || undefined,
      result: contactResult as ContactResult,
      rescheduledTo: (contactResult === 'REAGENDADO' || contactResult === 'LIGA_DEPOIS') && rescheduleTo
        ? rescheduleTo : undefined,
    });
  }

  const needsRescheduleDate = contactResult === 'REAGENDADO' || contactResult === 'LIGA_DEPOIS';
  const canConfirm = !!contactResult && (!needsRescheduleDate || !!rescheduleTo);

  const overdueCount = period === 'overdue' ? items.length : 0;

  function renderItem(item: ContactSchedule) {
    const diff = daysFromToday(item.scheduledDate);
    return (
      <Card key={item.id}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/admin/clientes/${item.customerId}`}
                className="text-sm font-semibold text-neutral-900 hover:text-primary transition">
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

            {item.reason && <p className="text-sm text-neutral-600">{item.reason}</p>}

            <p className="text-xs text-neutral-400">
              {(period === 'week' || period === 'month') ? `📅 ${formatLocalDate(item.scheduledDate)}` : ''}
              {item.customerPhone && <span className="ml-2">{item.customerPhone}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {item.customerPhone ? (
              <a href={buildWhatsAppUrl(item.customerPhone, item.customerName)} target="_blank" rel="noreferrer">
                <Button size="sm" variant="ghost" title="WhatsApp">💬</Button>
              </a>
            ) : (
              <Button size="sm" variant="ghost" disabled title="Sem telefone">💬</Button>
            )}
            <Button size="sm" onClick={() => openRegister(item)}>Registrar</Button>
            <Button size="sm" variant="outline"
              onClick={() => openRegister(item, 'REAGENDADO')}>Reagendar</Button>
            <Link to={`/admin/clientes/${item.customerId}`}>
              <Button size="sm" variant="ghost">Ver</Button>
            </Link>
            <Button
              size="sm" variant="ghost"
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

      {/* Toast de sucesso */}
      {successMsg && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Toast "Comprou" */}
      {showCreateOrder && (
        <div className="mb-4 flex items-center gap-3 rounded-md border border-green-300 bg-green-50 px-4 py-3">
          <span className="text-sm text-green-800 flex-1">
            🎉 Ótimo! Que tal já criar um pedido para <strong>{showCreateOrder.name}</strong>?
          </span>
          <Link to={`/admin/pedidos/novo?customerId=${showCreateOrder.id}`}>
            <Button size="sm">Criar Pedido</Button>
          </Link>
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
                <div className="space-y-3">{items.map(renderItem)}</div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal: Registrar Contato */}
      <Modal
        open={!!registerState}
        onClose={closeRegisterModal}
        title={`Registrar Contato${registerState ? ` — ${registerState.customerName}` : ''}`}
      >
        <div className="space-y-4">
          {/* Resultado (obrigatório) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Resultado do contato *
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CONTACT_RESULT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition
                    ${contactResult === opt.value
                      ? 'border-primary bg-primary/5 font-medium text-primary'
                      : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <input
                    type="radio"
                    name="contactResult"
                    value={opt.value}
                    checked={contactResult === opt.value}
                    onChange={() => setContactResult(opt.value)}
                    className="sr-only"
                  />
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data de reagendamento (condicional) */}
          {needsRescheduleDate && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Reagendar para *
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {[
                  { label: 'Amanhã', days: 1 },
                  { label: '3 dias', days: 3 },
                  { label: '1 semana', days: 7 },
                  { label: '15 dias', days: 15 },
                ].map((s) => (
                  <button
                    key={s.days}
                    type="button"
                    onClick={() => setRescheduleTo(addDays(s.days))}
                    className={`rounded-md border px-3 py-1 text-xs transition
                      ${rescheduleTo === addDays(s.days)
                        ? 'border-primary bg-primary text-white'
                        : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={rescheduleTo}
                onChange={(e) => setRescheduleTo(e.target.value)}
                min={addDays(1)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Como foi o contato?"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRegisterModal}>Cancelar</Button>
            <Button
              disabled={!canConfirm || completeMutation.isPending}
              onClick={handleConfirmRegister}
            >
              {completeMutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
