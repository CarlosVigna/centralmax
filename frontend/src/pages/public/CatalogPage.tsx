import { CatalogSection } from '../../components/catalog/CatalogSection';

export function CatalogPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Catálogo de Produtos</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Encontre embalagens para o seu negócio — clique num produto para ver detalhes.
        </p>
      </div>
      <CatalogSection />
    </section>
  );
}
