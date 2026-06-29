import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../../services/productService';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600">Carregando...</p>;
  }

  if (!product) {
    return <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600">Produto não encontrado.</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{product.name}</h1>
      <p className="mt-2 text-neutral-600">{product.description}</p>
      <p className="mt-4 text-2xl font-bold text-primary">{formatCurrency(product.displayPrice)}</p>
      <Button
        className="mt-6"
        onClick={() => addItem({ productId: product.id, name: product.name, unitPrice: product.displayPrice })}
      >
        Adicionar ao orçamento
      </Button>
    </section>
  );
}
