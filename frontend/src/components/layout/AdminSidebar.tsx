import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

type NavItem = {
  to: string;
  label: string;
  showBadge?: boolean;
  icon: React.ReactNode;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const IconDashboard = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconOrders = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconTruck = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconCalendar = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconBox = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);
const IconTag = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);
const IconUsers = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconSupplier = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconWallet = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 12V7H5a2 2 0 010-4h14v4" />
    <path d="M3 5v14a2 2 0 002 2h16v-5" />
    <circle cx="18" cy="14" r="2" />
  </svg>
);
const IconChart = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconUserCog = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconX = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'OPERAÇÃO',
    items: [
      { to: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
      { to: '/admin/pedidos', label: 'Pedidos', icon: <IconOrders /> },
      { to: '/admin/expedicao', label: 'Expedição', showBadge: true, icon: <IconTruck /> },
      { to: '/admin/romaneio', label: 'Romaneio', icon: <IconBox /> },
      { to: '/admin/rota-entrega', label: 'Rota de Entrega', icon: <IconTruck /> },
      { to: '/admin/agenda', label: 'Agenda', icon: <IconCalendar /> },
    ],
  },
  {
    group: 'CADASTROS',
    items: [
      { to: '/admin/produtos', label: 'Produtos', icon: <IconBox /> },
      { to: '/admin/categorias', label: 'Categorias', icon: <IconTag /> },
      { to: '/admin/clientes', label: 'Clientes', icon: <IconUsers /> },
      { to: '/admin/fornecedores', label: 'Fornecedores', icon: <IconSupplier /> },
    ],
  },
  {
    group: 'FINANCEIRO',
    items: [
      { to: '/admin/financeiro', label: 'Financeiro', icon: <IconWallet /> },
      { to: '/admin/relatorios', label: 'Relatórios', icon: <IconChart /> },
    ],
  },
  {
    group: 'SISTEMA',
    items: [
      { to: '/admin/usuarios', label: 'Usuários', icon: <IconUserCog /> },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { data: notifications } = useNotifications();
  const activeOrders = notifications?.activeOrdersTotal ?? 0;

  function handleNavClick() {
    onClose?.();
  }

  return (
    <aside className="flex h-full w-70 flex-col border-r border-neutral-300 bg-white p-4">
      <div className="mb-5 flex items-center justify-between">
        <p className="px-3 text-lg font-bold text-primary">CentralMax</p>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 transition md:hidden"
            aria-label="Fechar menu"
          >
            <IconX />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-4 overflow-y-auto text-sm font-medium text-neutral-900">
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              {group.group}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-3 py-2
                    ${isActive ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                  {link.showBadge && activeOrders > 0 && (
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {activeOrders > 99 ? '99+' : activeOrders}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
