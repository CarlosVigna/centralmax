import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useProductModal } from '../../hooks/useProductModal';
import { ProductGrid } from './ProductGrid';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';
import { ProductModal } from './ProductModal';
import { QuantityPopover } from './QuantityPopover';
import { Toast } from '../ui/Toast';
import type { ProductSummary } from '../../types/product';

const PAGE_SIZE = 24;

export function CatalogSection() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { openModalId, openModal, closeModal, popoverProduct, closePopover, triggerQuickAdd } =
    useProductModal();

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: productsPage, isLoading: isLoadingProducts } = useProducts({
    categoryId: categoryId ?? undefined,
    search: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  // Reset to page 0 when filters change
  function handleCategoryChange(id: string | null) {
    setCategoryId(id);
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleAddClick(product: ProductSummary) {
    triggerQuickAdd(product);
  }

  const totalPages = productsPage?.totalPages ?? 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {isLoadingCategories ? (
          <p className="text-sm text-neutral-600">Carregando categorias...</p>
        ) : (
          <CategoryFilter
            categories={categories ?? []}
            selectedCategoryId={categoryId}
            onSelect={handleCategoryChange}
          />
        )}
        <SearchBar value={search} onChange={handleSearchChange} />
      </div>

      {isLoadingProducts ? (
        <p className="py-12 text-center text-sm text-neutral-600">Carregando produtos...</p>
      ) : (
        <ProductGrid
          products={productsPage?.content ?? []}
          onCardClick={openModal}
          onAddClick={handleAddClick}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium
              disabled:opacity-40 hover:bg-neutral-50 transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-neutral-600">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium
              disabled:opacity-40 hover:bg-neutral-50 transition"
          >
            Próxima →
          </button>
        </div>
      )}

      {toastMessage && (
        <Toast
          key={toastMessage}
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      <ProductModal productId={openModalId} onClose={closeModal} />

      {popoverProduct && (
        <QuantityPopover
          product={popoverProduct}
          onClose={closePopover}
        />
      )}
    </>
  );
}
