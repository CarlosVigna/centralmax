import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-300 bg-white px-6 py-4">
          <span className="text-sm text-neutral-600">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </header>
        <main className="flex-1 bg-neutral-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
