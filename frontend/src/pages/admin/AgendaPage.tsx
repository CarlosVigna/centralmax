import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAgenda } from '../../services/interactionService';
import { Card } from '../../components/ui/Card';
import { INTERACTION_TYPE_LABELS } from '../../types/interaction';

type Period = 'today' | 'week' | 'overdue';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: 'Esta semana',
  overdue: 'Atrasados',
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

export function AgendaPage() {
  const [period, setPeriod] = useState<Period>('today');

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['agenda', period],
    queryFn: () => getAgenda(period),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Agenda de contatos</h1>

      {/* Period tabs */}
      <div className="mb-6 flex gap-1 border-b border-neutral-200">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px
              ${period === p
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Carregando agenda...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar agenda.</p>}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-neutral-400">
          {period === 'overdue'
            ? 'Nenhum contato atrasado.'
            : `Nenhum contato agendado para ${PERIOD_LABELS[period].toLowerCase()}.`}
        </p>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {INTERACTION_TYPE_LABELS[item.type]}
                      </span>
                      {item.scheduledAt && (
                        <span
                          className={`text-xs font-medium ${
                            period === 'overdue' ? 'text-danger' : 'text-secondary'
                          }`}
                        >
                          {formatDate(item.scheduledAt)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/admin/clientes/${item.customerId}`}
                      className="text-sm font-semibold text-neutral-900 hover:text-primary transition"
                    >
                      {item.customerName}
                    </Link>
                    {item.notes && (
                      <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/admin/clientes/${item.customerId}`}
                    className="mt-2 text-xs text-primary hover:underline sm:mt-0 whitespace-nowrap"
                  >
                    Ver cliente →
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
