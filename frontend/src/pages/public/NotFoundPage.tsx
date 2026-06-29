import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Página não encontrada</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Voltar para a página inicial
      </Link>
    </section>
  );
}
