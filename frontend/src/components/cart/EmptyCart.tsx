import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface EmptyCartProps {
  onContinue?: () => void;
}

export function EmptyCart({ onContinue }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-sm text-neutral-600">Seu carrinho está vazio.</p>
      <Link to="/catalogo" onClick={onContinue}>
        <Button variant="outline" size="sm">
          Voltar ao catálogo
        </Button>
      </Link>
    </div>
  );
}
