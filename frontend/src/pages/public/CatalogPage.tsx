import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { ProductGrid } from '../../components/catalog/ProductGrid';
import { CategoryFilter } from '../../components/catalog/CategoryFilter';
import { SearchBar } from '../../components/catalog/SearchBar';
import { Toast } from '../../components/ui/Toast';
import type { ProductSummary } from '../../types/product';

export function CatalogPage() {
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
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Catálogo</h1>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {isLoadingCategories ? (
          <p className="text-sm text-neutral-600">Carregando categorias...</p>
        ) : (
          <CategoryFilter categories={categories ?? []} selectedCategoryId={categoryId} onSelect={setCategoryId} />
        )}
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {isLoadingProducts ? (
        <p className="py-12 text-center text-sm text-neutral-600">Carregando produtos...</p>
      ) : (
        <ProductGrid products={productsPage?.content ?? []} onAdd={handleAdd} />
      )}

      {toastMessage && (
        <Toast key={toastMessage} message={toastMessage} variant="success" onClose={() => setToastMessage(null)} />
      )}
    </section>
  );
}
