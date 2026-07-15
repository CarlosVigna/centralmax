import { useRef, useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { GlobalSearch } from '../ui/GlobalSearch';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { listRecentActivity } from '../../services/activityFeedService';
import { Button } from '../ui/Button';

const ADMIN_TITLES: Record<string, string> = {
  '/admin': 'Dashboard — MaxHub',
  '/admin/produtos': 'Produtos — MaxHub',
  '/admin/categorias': 'Categorias — MaxHub',
  '/admin/fornecedores': 'Fornecedores — MaxHub',
  '/admin/clientes': 'Clientes — MaxHub',
  '/admin/agenda': 'Agenda — MaxHub',
  '/admin/expedicao': 'Expedição — MaxHub',
  '/admin/financeiro': 'Financeiro — MaxHub',
  '/admin/pedidos': 'Pedidos — MaxHub',
  '/admin/romaneio': 'Romaneio — MaxHub',
  '/admin/rota-entrega': 'Rota de Entrega — MaxHub',
  '/admin/usuarios': 'Usuários — MaxHub',
  '/admin/relatorios': 'Relatórios — MaxHub',
  '/admin/previsao': 'Previsão Semanal — MaxHub',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const IconMenu = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const isAdmin = user?.role === 'ADMIN';
  const { data: recentActivity } = useQuery({
    queryKey: ['activity-feed-recent'],
    queryFn: () => listRecentActivity(5),
    enabled: isAdmin,
    staleTime: 60_000,
  });
  const [showBell, setShowBell] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const exact = ADMIN_TITLES[path];
    if (exact) {
      document.title = exact;
    } else if (path.startsWith('/admin/pedidos/')) {
      document.title = 'Pedido — MaxHub';
    } else if (path.startsWith('/admin/clientes/')) {
      document.title = 'Cliente — MaxHub';
    } else if (path.startsWith('/admin/produtos/')) {
      document.title = 'Produto — MaxHub';
    } else {
      document.title = 'MaxHub';
    }
  }, [location.pathname]);

  const badgeCount = (notifications?.newOrders ?? 0) + (notifications?.overdueContacts ?? 0) + (notifications?.schedulesToday ?? 0);

  useEffect(() => {
    if (!showBell) return;
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBell(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showBell]);

  // Fecha drawer ao redimensionar para desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-col md:w-60 shrink-0">
        <AdminSidebar />
      </div>

      {/* Drawer mobile — overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer mobile — painel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 md:hidden
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 280 }}
      >
        <AdminSidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            {/* Hamburguer mobile */}
            <button
              className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 transition md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <IconMenu />
            </button>
            <span className="text-sm text-neutral-600 hidden sm:block">{user?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Busca global */}
            <button
              onClick={() => window.dispatchEvent(new Event('globalSearch:open'))}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50
                px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition"
              title="Busca global (Ctrl+K)"
            >
              🔍 <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden sm:inline rounded border border-neutral-200 px-1 text-[10px]">Ctrl+K</kbd>
            </button>

            {/* Sino de notificações */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setShowBell((v) => !v)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full
                  text-neutral-600 hover:bg-neutral-100 transition"
                aria-label="Notificações"
              >
                <span className="text-lg">🔔</span>
                {badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center
                    justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>

              {showBell && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-neutral-200
                  bg-white shadow-xl max-h-[80vh] overflow-y-auto">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-900">Notificações</p>
                  </div>

                  {/* Pedidos novos */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Pedidos novos ({notifications?.newOrders ?? 0})
                    </p>
                    {!notifications?.recentOrders?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum pedido novo</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.recentOrders.map((order) => (
                          <li key={order.id} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-primary">{order.orderNumber}</p>
                              <p className="text-xs text-neutral-600">{order.customerName}</p>
                            </div>
                            <span className="whitespace-nowrap text-xs text-neutral-400">
                              {timeAgo(order.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/expedicao" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver todos os pedidos →
                    </Link>
                  </div>

                  {/* Contatos de hoje */}
                  <div className="border-t border-neutral-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Contatos de hoje ({notifications?.schedulesToday ?? 0})
                    </p>
                    {!notifications?.contactsToday?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum contato hoje</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.contactsToday.map((s) => (
                          <li key={s.scheduleId} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-neutral-800">{s.customerName}</p>
                              {s.reason && <p className="text-xs text-neutral-500">{s.reason}</p>}
                            </div>
                            {s.phone && (
                              <a href={`https://api.whatsapp.com/send?phone=${s.phone.replace(/\D/g, '').replace(/^(?!55)/, '55')}`}
                                target="_blank" rel="noreferrer"
                                className="whitespace-nowrap text-xs text-green-600 hover:underline">
                                💬
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/agenda?period=today" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver agenda completa →
                    </Link>
                  </div>

                  {/* Contatos em atraso */}
                  <div className="border-t border-neutral-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Contatos em atraso ({notifications?.overdueContacts ?? 0})
                    </p>
                    {!notifications?.overdueCustomers?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum contato em atraso</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.overdueCustomers.map((c) => (
                          <li key={c.id} className="flex items-start justify-between gap-2">
                            <p className="text-xs text-neutral-700">{c.name}</p>
                            <span className="whitespace-nowrap text-xs text-danger">
                              {formatDate(c.nextContactDate)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/agenda?period=overdue" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver agenda →
                    </Link>
                  </div>

                  {/* Feed de atividades — só ADMIN */}
                  {isAdmin && (
                    <div className="border-t border-neutral-100 px-4 py-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Atividades recentes
                      </p>
                      {!recentActivity?.length ? (
                        <p className="text-xs text-neutral-400">Nenhuma atividade</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {recentActivity.map((a) => (
                            <li key={a.id} className="text-xs text-neutral-700">
                              <span className="font-semibold">{a.userName}</span>
                              {' · '}{a.entityLabel ?? a.entityType}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link to="/admin/atividades" onClick={() => setShowBell(false)}
                        className="mt-2 block text-xs text-primary hover:underline">
                        Ver todas as atividades →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
          </div>
        </header>

        <main className="flex-1 bg-neutral-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
