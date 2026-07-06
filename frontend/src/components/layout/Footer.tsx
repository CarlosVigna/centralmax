import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/images/logo-horizontal.png" alt="CentralMax Embalagens" className="h-8 w-auto" />
          <p className="text-sm text-white/70">
            Soluções em embalagens para o seu negócio ir mais longe
          </p>
          <p className="mt-4 text-xs text-white/50">
            © 2026 CentralMax Embalagens. Todos os direitos reservados.
          </p>
          <Link
            to="/admin/login"
            className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
