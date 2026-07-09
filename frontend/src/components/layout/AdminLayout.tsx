import { useRef, useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { GlobalSearch } from '../ui/GlobalSearch';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../ui/Button';

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

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const badgeCount = (notifications?.newOrders ?? 0) + (notifications?.overdueContacts ?? 0) + (notifications?.schedulesToday ?? 0);

  // Close dropdown on outside click
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-300 bg-white px-6 py-4">
          <span className="text-sm text-neutral-600">{user?.name}</span>

          <div className="flex items-center gap-3">
            {/* Global search trigger */}
            <button
              onClick={() => window.dispatchEvent(new Event('globalSearch:open'))}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50
                px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition"
              title="Busca global (Ctrl+K)"
            >
              🔍 <span className="hidden sm:inline">Buscar</span>
              <kbd className="rounded border border-neutral-200 px-1 text-[10px]">Ctrl+K</kbd>
            </button>

            {/* Notification bell */}
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
                  bg-white shadow-xl">
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
                              <p className="text-xs font-semibold text-primary">
                                {order.orderNumber}
                              </p>
                              <p className="text-xs text-neutral-600">{order.customerName}</p>
                            </div>
                            <span className="whitespace-nowrap text-xs text-neutral-400">
                              {timeAgo(order.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/admin/expedicao"
                      onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline"
                    >
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
                              <a
                                href={`https://api.whatsapp.com/send?phone=${s.phone.replace(/\D/g, '').replace(/^(?!55)/, '55')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="whitespace-nowrap text-xs text-green-600 hover:underline"
                              >
                                💬
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/admin/agenda?period=today"
                      onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline"
                    >
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
                    <Link
                      to="/admin/agenda?period=overdue"
                      onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline"
                    >
                      Ver agenda →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-neutral-100 p-6">
          <Outlet />
        </main>
      </div>
      <GlobalSearch />
    </div>
  );
}
