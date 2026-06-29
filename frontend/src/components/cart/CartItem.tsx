import type { CartItem as CartItemType } from '../../contexts/CartContext';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const subtotal = item.quantity * item.unitPrice;

  function decrease() {
    if (item.quantity <= 1) return;
    updateQuantity(item.productId, item.quantity - 1);
  }

  function increase() {
    updateQuantity(item.productId, item.quantity + 1);
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-300 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{item.name}</p>
        <p className="text-xs text-neutral-600">{formatCurrency(item.unitPrice)} / unidade</p>
        <p className="text-sm font-semibold text-primary">{formatCurrency(subtotal)}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={decrease} aria-label="Diminuir quantidade">
          −
        </Button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <Button variant="outline" size="sm" onClick={increase} aria-label="Aumentar quantidade">
          +
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
        Remover
      </Button>
    </div>
  );
}
