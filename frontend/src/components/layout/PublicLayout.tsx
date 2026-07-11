import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

const PUBLIC_TITLES: Record<string, string> = {
  '/': 'CentralMax Embalagens — Soluções em Embalagens',
  '/catalogo': 'Catálogo — CentralMax Embalagens',
  '/orcamento': 'Orçamento — CentralMax Embalagens',
};

export function PublicLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const title = PUBLIC_TITLES[location.pathname];
    if (title) {
      document.title = title;
    } else if (location.pathname.startsWith('/catalogo/')) {
      document.title = 'Produto — CentralMax Embalagens';
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
