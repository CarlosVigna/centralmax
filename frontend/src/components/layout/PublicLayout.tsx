import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export function PublicLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

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
