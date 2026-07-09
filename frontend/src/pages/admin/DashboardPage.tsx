import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { getDashboard } from '../../services/dashboardService';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Dashboard</h1>

      {isLoading && <p className="text-sm text-neutral-600">Carregando indicadores...</p>}
      {isError && <p className="text-sm text-danger">Erro ao carregar dados. Tente novamente.</p>}

      {data && (
        <div className="space-y-8">
          {/* ── Seção 1: Operação ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Operação
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ClickableCard
                label="Aguardando confirmação"
                value={data.ordersToConfirm}
                accent={data.ordersToConfirm > 0 ? 'orange' : 'gray'}
                onClick={() => navigate('/admin/pedidos?status=NOVO')}
              />
              <ClickableCard
                label="Em separação"
                value={data.ordersToSeparate}
                accent={data.ordersToSeparate > 0 ? 'orange' : 'gray'}
                onClick={() => navigate('/admin/pedidos?status=EM_SEPARACAO')}
              />
              <ClickableCard
                label="Saíram p/ entrega"
                value={data.ordersOutForDelivery}
                accent="blue"
                onClick={() => navigate('/admin/expedicao')}
              />
              <ClickableCard
                label="Pedidos hoje"
                value={data.ordersToday}
                accent="gray"
                onClick={() => navigate('/admin/pedidos')}
              />
            </div>
          </section>

          {/* ── Seção 2: Financeiro ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Financeiro
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <ClickableCard
                label="Saldo do mês"
                value={data.saldoMes}
                accent={data.saldoMes >= 0 ? 'green' : 'red'}
                currency
                onClick={() => navigate('/admin/financeiro')}
              />
              <ClickableCard
                label="A receber"
                value={data.aReceber}
                accent="blue"
                currency
                onClick={() => navigate('/admin/financeiro?status=PENDENTE&type=RECEITA')}
              />
              <ClickableCard
                label="Receber hoje"
                value={data.receivableToday}
                accent={data.receivableToday > 0 ? 'orange' : 'gray'}
                currency
                onClick={() => navigate('/admin/financeiro?status=PENDENTE&type=RECEITA')}
              />
              <ClickableCard
                label="Recebido hoje"
                value={data.receivedToday}
                accent="green"
                currency
                onClick={() => navigate('/admin/financeiro?status=PAGO&type=RECEITA')}
              />
              <ClickableCard
                label="Títulos vencidos"
                value={data.overdueFinancial}
                accent={data.overdueFinancial > 0 ? 'red' : 'gray'}
                onClick={() => navigate('/admin/financeiro?status=VENCIDO')}
              />
            </div>
          </section>

          {/* ── Seção 3: CRM / Cadastros ── */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              CRM &amp; Cadastros
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ClickableCard
                label="Contatos hoje"
                value={data.contactsToday}
                accent="green"
                onClick={() => navigate('/admin/agenda')}
              />
              <ClickableCard
                label="Contatos atrasados"
                value={data.overdueContacts}
                accent={data.overdueContacts > 0 ? 'red' : 'gray'}
                onClick={() => navigate('/admin/agenda')}
              />
              <ClickableCard
                label="Clientes"
                value={data.totalCustomers}
                accent="gray"
                onClick={() => navigate('/admin/clientes')}
              />
              <ClickableCard
                label="Produtos ativos"
                value={data.activeProducts}
                accent="gray"
                onClick={() => navigate('/admin/produtos')}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type Accent = 'orange' | 'blue' | 'gray' | 'green' | 'red';

function ClickableCard({
  label,
  value,
  accent,
  currency,
  onClick,
}: {
  label: string;
  value: number;
  accent?: Accent;
  currency?: boolean;
  onClick?: () => void;
}) {
  const accentClass = resolveAccent(accent);
  const display = currency ? fmtCurrency(value) : value.toLocaleString('pt-BR');

  return (
    <Card
      className={`cursor-pointer transition hover:shadow-md hover:border-primary/30 ${onClick ? 'active:scale-[0.98]' : ''}`}
      onClick={onClick}
    >
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-2 font-bold ${currency ? 'text-xl' : 'text-3xl'} ${accentClass}`}>
        {display}
      </p>
    </Card>
  );
}

function resolveAccent(accent?: Accent) {
  return accent === 'orange'
    ? 'text-secondary'
    : accent === 'blue'
      ? 'text-primary'
      : accent === 'green'
        ? 'text-green-600'
        : accent === 'red'
          ? 'text-danger'
          : 'text-neutral-900';
}
