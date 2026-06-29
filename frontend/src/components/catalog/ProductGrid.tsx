import type { ProductSummary } from '../../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductSummary[];
  onAdd?: (product: ProductSummary) => void;
}

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-sm text-neutral-600">Nenhum produto encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
