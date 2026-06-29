import type { ProductSummary } from '../../types/product';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: ProductSummary;
  onAdd?: (product: ProductSummary) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({ productId: product.id, name: product.name, unitPrice: product.displayPrice });
    onAdd?.(product);
  }

  return (
    <Card variant="interactive" className="flex flex-col gap-2">
      {product.mainImageUrl ? (
        <img src={product.mainImageUrl} alt={product.name} className="h-40 w-full rounded-md object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-600">
          Sem imagem
        </div>
      )}
      <span className="text-xs text-neutral-600">{product.categoryName}</span>
      <h3 className="text-base font-medium text-neutral-900">{product.name}</h3>
      {product.description && (
        <p
          className="text-sm text-neutral-600"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </p>
      )}
      <span className="text-lg font-bold text-primary">{formatCurrency(product.displayPrice)}</span>
      <Button size="sm" onClick={handleAdd}>
        Adicionar ao carrinho
      </Button>
    </Card>
  );
}
