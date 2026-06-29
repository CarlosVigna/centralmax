import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/fornecedores', label: 'Fornecedores' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/pedidos', label: 'Pedidos' },
];

export function AdminSidebar() {
  return (
    <aside className="w-60 border-r border-neutral-300 bg-white p-4">
      <nav className="flex flex-col gap-2 text-sm font-medium text-neutral-900">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) => `rounded-md px-3 py-2 ${isActive ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
