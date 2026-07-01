import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  name: string;
  description: string;
  priceC: number;
  categoryName: string;
  imageUrl: string | null;
}

export function ProductCardPreview({ name, description, priceC, categoryName, imageUrl }: Props) {
  return (
    <div className="pointer-events-none select-none">
      <Card variant="interactive" className="flex flex-col gap-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Preview'}
            className="h-40 w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-500">
            Sem imagem
          </div>
        )}
        <span className="text-xs text-neutral-600">
          {categoryName || 'Categoria'}
        </span>
        <h3 className="text-base font-medium text-neutral-900">
          {name || 'Nome do produto'}
        </h3>
        {description && (
          <p
            className="text-sm text-neutral-600"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
        <span className="text-lg font-bold text-primary">
          {priceC > 0 ? formatCurrency(priceC) : 'R$ —'}
        </span>
        <div className="rounded-md bg-primary py-1.5 text-center text-sm font-medium text-white">
          Adicionar ao carrinho
        </div>
      </Card>
    </div>
  );
}
