import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-white p-4 sm:w-96"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Carrinho</h2>
          <button onClick={onClose} aria-label="Fechar carrinho" className="text-neutral-600 hover:text-neutral-900">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyCart onContinue={onClose} />
          ) : (
            items.map((item) => <CartItem key={item.productId} item={item} />)
          )}
        </div>

        {items.length > 0 && <CartSummary />}
      </div>
    </div>
  );
}
