import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { ProductGrid } from './ProductGrid';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';
import { Toast } from '../ui/Toast';
import type { ProductSummary } from '../../types/product';

export function CatalogSection() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: productsPage, isLoading: isLoadingProducts } = useProducts({
    categoryId: categoryId ?? undefined,
    search: search || undefined,
  });

  function handleAdd(product: ProductSummary) {
    setToastMessage(`"${product.name}" adicionado ao carrinho`);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {isLoadingCategories ? (
          <p className="text-sm text-neutral-600">Carregando categorias...</p>
        ) : (
          <CategoryFilter
            categories={categories ?? []}
            selectedCategoryId={categoryId}
            onSelect={setCategoryId}
          />
        )}
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {isLoadingProducts ? (
        <p className="py-12 text-center text-sm text-neutral-600">Carregando produtos...</p>
      ) : (
        <ProductGrid products={productsPage?.content ?? []} onAdd={handleAdd} />
      )}

      {toastMessage && (
        <Toast
          key={toastMessage}
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}
