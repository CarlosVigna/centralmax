import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center">
          <img src="/images/logo-horizontal.png" alt="CentralMax Embalagens" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-white/90">
          <Link to="/catalogo" className="hover:text-white transition-colors">
            Catálogo
          </Link>
          <Link to="/orcamento" className="hover:text-white transition-colors">
            Orçamento
          </Link>
          <button onClick={onCartClick} className="relative" aria-label="Abrir carrinho">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
