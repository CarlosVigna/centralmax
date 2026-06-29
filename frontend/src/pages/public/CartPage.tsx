import { useCart } from '../../hooks/useCart';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { EmptyCart } from '../../components/cart/EmptyCart';

export function CartPage() {
  const { items } = useCart();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Seu carrinho</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
          <div className="mt-4">
            <CartSummary />
          </div>
        </>
      )}
    </section>
  );
}
