import { useEffect, useRef, useState } from 'react';
import type { ProductSummary } from '../../types/product';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';

interface QuantityPopoverProps {
  product: ProductSummary;
  onClose: () => void;
}

export function QuantityPopover({ product, onClose }: QuantityPopoverProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleConfirm() {
    addItem({ productId: product.id, name: product.name, unitPrice: product.displayPrice }, quantity);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-xs rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-neutral-500">{product.categoryName}</p>
            <h3 className="text-sm font-semibold text-neutral-900 leading-tight">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 transition flex-shrink-0"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm font-medium text-neutral-700">Quantas unidades?</p>

        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300
              text-lg font-semibold hover:bg-neutral-50 transition"
            aria-label="Diminuir"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n)) setQuantity(Math.min(99, Math.max(1, n)));
            }}
            className="w-16 rounded-md border border-neutral-300 px-2 py-1.5 text-center text-sm
              focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300
              text-lg font-semibold hover:bg-neutral-50 transition"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} className="flex-1">
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
