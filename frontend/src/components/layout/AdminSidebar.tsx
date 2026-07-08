import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/fornecedores', label: 'Fornecedores' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/expedicao', label: 'Expedição', showBadge: true },
  { to: '/admin/financeiro', label: 'Financeiro' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuários' },
  { to: '/admin/relatorios', label: 'Relatórios' },
];

export function AdminSidebar() {
  const { data: notifications } = useNotifications();
  const activeOrders = notifications?.activeOrdersTotal ?? 0;

  return (
    <aside className="w-60 border-r border-neutral-300 bg-white p-4">
      <p className="mb-5 px-3 text-lg font-bold text-primary">CentralMax</p>
      <nav className="flex flex-col gap-2 text-sm font-medium text-neutral-900">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-md px-3 py-2
              ${isActive ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`
            }
          >
            <span>{link.label}</span>
            {link.showBadge && activeOrders > 0 && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeOrders > 99 ? '99+' : activeOrders}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
