import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Embalagens para o seu negócio, sob medida.</h1>
      <p className="mt-4 text-base text-neutral-600">
        A Central Max Embalagens distribui embalagens em São José do Rio Preto/SP, com orçamento rápido direto pelo
        WhatsApp.
      </p>
      <Link to="/catalogo">
        <Button size="lg" className="mt-8">
          Ver catálogo
        </Button>
      </Link>
    </section>
  );
}
