import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  return (
    <div className="space-y-8">
      {/* Header pessoal */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {greeting()}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{capitalize(todayLabel())} &middot; Aqui está o seu dia:</p>
      </div>

      {isLoading && <p className="text-sm text-neutral-500">Carregando indicadores...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar dados. Tente novamente.</p>}

      {data && (
        <>
          {/* ── Cards de ação do dia ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Tarefas do Dia
            </h2>
            <div className="space-y-2">
              <ActionItem
                emoji="📅"
                label="clientes para ligar hoje"
                count={data.schedulesToday}
                onClick={() => navigate('/admin/agenda?period=today')}
              />
              <ActionItem
                emoji="📦"
                label="pedidos para separar"
                count={data.ordersToSeparate}
                onClick={() => navigate('/admin/pedidos?status=EM_SEPARACAO')}
              />
              <ActionItem
                emoji="🚚"
                label="entregas saíram hoje"
                count={data.ordersOutForDelivery}
                onClick={() => navigate('/admin/expedicao')}
              />
              <ActionItem
                emoji="💬"
                label="pedidos aguardando confirmação"
                count={data.ordersToConfirm}
                onClick={() => navigate('/admin/pedidos?status=NOVO')}
              />
              <ActionItem
                emoji="💰"
                label="a receber hoje"
                count={data.receivableToday}
                isCurrency
                onClick={() => navigate('/admin/financeiro?status=PENDENTE&type=RECEITA')}
              />
              <ActionItem
                emoji="⚠️"
                label="contatos em atraso"
                count={data.overdueSchedules}
                danger
                onClick={() => navigate('/admin/agenda?period=overdue')}
              />
            </div>
          </section>

          {/* ── Resumo do mês ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Resumo do Mês
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniCard
                label="Pedidos realizados"
                value={data.ordersToday.toLocaleString('pt-BR')}
                onClick={() => navigate('/admin/pedidos')}
              />
              <MiniCard
                label="Faturamento"
                value={fmtCurrency(data.saldoMes)}
                colored={data.saldoMes >= 0 ? 'green' : 'red'}
                onClick={() => navigate('/admin/financeiro')}
              />
              <MiniCard
                label="A receber"
                value={fmtCurrency(data.aReceber)}
                colored="blue"
                onClick={() => navigate('/admin/financeiro?status=PENDENTE&type=RECEITA')}
              />
              <MiniCard
                label="Títulos vencidos"
                value={data.overdueFinancial.toLocaleString('pt-BR')}
                colored={data.overdueFinancial > 0 ? 'red' : undefined}
                onClick={() => navigate('/admin/financeiro?status=VENCIDO')}
              />
            </div>
          </section>

          {/* ── Contas a Pagar ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Contas a Pagar
            </h2>
            <div className="space-y-2">
              <ActionItem
                emoji="💸"
                label="a pagar hoje"
                count={data.billsDueToday}
                isCurrency
                danger
                onClick={() => navigate('/admin/financeiro?type=DESPESA&status=PENDENTE')}
              />
              <ActionItem
                emoji="📅"
                label="vencem esta semana"
                count={data.billsDueThisWeek}
                isCurrency
                onClick={() => navigate('/admin/financeiro?type=DESPESA&status=PENDENTE')}
              />
              <ActionItem
                emoji="🔴"
                label="contas vencidas"
                count={data.overdueBills}
                isCurrency
                danger
                onClick={() => navigate('/admin/financeiro?type=DESPESA&status=VENCIDO')}
              />
            </div>
          </section>

          {/* ── CRM ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              CRM
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniCard label="Clientes" value={data.totalCustomers.toLocaleString('pt-BR')}
                onClick={() => navigate('/admin/clientes')} />
              <MiniCard label="Contatos amanhã" value={data.schedulesTomorrow.toLocaleString('pt-BR')}
                onClick={() => navigate('/admin/agenda?period=tomorrow')} />
              <MiniCard label="Recebido hoje" value={fmtCurrency(data.receivedToday)} colored="green"
                onClick={() => navigate('/admin/financeiro?status=PAGO&type=RECEITA')} />
              <MiniCard label="Pedidos hoje" value={data.ordersToday.toLocaleString('pt-BR')}
                onClick={() => navigate('/admin/pedidos')} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ActionItem({
  emoji, label, count, isCurrency, danger, onClick,
}: {
  emoji: string;
  label: string;
  count: number;
  isCurrency?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  const hasValue = count > 0;
  const display = isCurrency ? fmtCurrency(count) : count.toLocaleString('pt-BR');

  return (
    <button
      onClick={hasValue ? onClick : undefined}
      disabled={!hasValue}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition
        ${hasValue
          ? danger
            ? 'bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer'
            : 'bg-white border border-neutral-200 hover:border-primary/30 hover:shadow-sm cursor-pointer'
          : 'bg-neutral-50 border border-neutral-100 cursor-default'
        }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className={`flex-1 text-sm font-medium ${hasValue ? (danger ? 'text-red-800' : 'text-neutral-900') : 'text-neutral-400'}`}>
        {hasValue ? (
          <>
            <span className={`font-bold ${danger ? 'text-red-700' : 'text-primary'}`}>
              {display}
            </span>
            {' '}{label}
          </>
        ) : (
          <>0 {label}</>
        )}
      </span>
      {hasValue && (
        <span className="text-neutral-400 text-xs">→</span>
      )}
    </button>
  );
}

function MiniCard({
  label, value, colored, onClick,
}: {
  label: string;
  value: string;
  colored?: 'green' | 'blue' | 'red';
  onClick: () => void;
}) {
  const colorClass = colored === 'green' ? 'text-green-600'
    : colored === 'blue' ? 'text-primary'
    : colored === 'red' ? 'text-danger'
    : 'text-neutral-900';

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1 rounded-xl bg-white border border-neutral-200
        px-4 py-3 text-left transition hover:border-primary/30 hover:shadow-sm cursor-pointer w-full"
    >
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </button>
  );
}
