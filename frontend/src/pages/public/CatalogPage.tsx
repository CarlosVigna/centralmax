import { CatalogSection } from '../../components/catalog/CatalogSection';

export function CatalogPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Catálogo</h1>
      <CatalogSection />
    </section>
  );
}
