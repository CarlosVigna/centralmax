import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useProductModal } from '../../hooks/useProductModal';
import { ProductGrid } from './ProductGrid';
import { ProductModal } from './ProductModal';
import { QuantityPopover } from './QuantityPopover';
import type { ProductSummary } from '../../types/product';

export function FeaturedSection() {
  const { openModalId, openModal, closeModal, popoverProduct, closePopover, triggerQuickAdd } =
    useProductModal();

  const { data: productsPage, isLoading } = useProducts({ size: 8 });

  function handleAddClick(product: ProductSummary) {
    triggerQuickAdd(product);
  }

  return (
    <>
      {isLoading ? (
        <p className="py-12 text-center text-sm text-neutral-300">Carregando produtos...</p>
      ) : (
        <>
          <ProductGrid
            products={productsPage?.content ?? []}
            onCardClick={openModal}
            onAddClick={handleAddClick}
          />

          <div className="mt-10 text-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-md border border-secondary bg-transparent
                px-8 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
            >
              Ver todos os produtos →
            </Link>
          </div>
        </>
      )}

      <ProductModal productId={openModalId} onClose={closeModal} />

      {popoverProduct && (
        <QuantityPopover product={popoverProduct} onClose={closePopover} />
      )}
    </>
  );
}
