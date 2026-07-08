import type { ProductSummary } from '../../types/product';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

interface ProductCardProps {
  product: ProductSummary;
  onCardClick?: (id: string) => void;
  onAddClick?: (product: ProductSummary) => void;
  /** legacy toast callback after direct add */
  onAdd?: (product: ProductSummary) => void;
}

export function ProductCard({ product, onCardClick, onAddClick, onAdd }: ProductCardProps) {
  function handleCardClick() {
    onCardClick?.(product.id);
  }

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onAddClick) {
      onAddClick(product);
    } else {
      // Fallback: no modal support, fire legacy callback
      onAdd?.(product);
    }
  }

  const imageUrl = product.mainImageUrl;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className="group flex flex-col gap-2 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm
        cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg outline-none
        focus-visible:ring-2 focus-visible:ring-secondary"
    >
      {/* Photo with zoom on hover */}
      <div className="overflow-hidden rounded-md">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-neutral-100 text-2xl text-neutral-400">
            📦
          </div>
        )}
      </div>

      <span className="text-xs text-neutral-600">{product.categoryName}</span>
      <h3 className="text-base font-medium text-neutral-900 leading-tight">{product.name}</h3>

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

      <span className="text-lg font-bold text-secondary">{formatCurrency(product.displayPrice)}</span>
      {product.minQuantity && product.minQuantity > 1 && (
        <span className="text-xs text-neutral-500">Pedido mínimo: {product.minQuantity} unidades</span>
      )}

      <Button size="sm" onClick={handleAddClick} className="mt-auto">
        Adicionar ao carrinho
      </Button>
    </div>
  );
}
