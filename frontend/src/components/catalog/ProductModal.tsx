import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../../services/productService';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { buildSingleProductWhatsApp } from '../../utils/buildWhatsAppMessage';
import { Button } from '../ui/Button';
import type { ProductVariation } from '../../types/product';

interface ProductModalProps {
  productId: string | null;
  onClose: () => void;
}

// Group variations by name: [{ name: 'Cor', values: ['Azul', 'Vermelho'] }]
function groupVariations(variations: ProductVariation[]) {
  const map = new Map<string, string[]>();
  for (const v of variations) {
    if (!map.has(v.name)) map.set(v.name, []);
    map.get(v.name)!.push(v.value);
  }
  return Array.from(map.entries()).map(([name, values]) => ({ name, values }));
}

export function ProductModal({ productId, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<{ name: string; value: string } | null>(null);
  const [addFeedback, setAddFeedback] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
    staleTime: 60_000,
  });

  // Reset state when modal opens for a new product
  useEffect(() => {
    setPhotoIndex(0);
    setQuantity(1);
    setSelectedVariation(null);
    setAddFeedback(false);
  }, [productId]);

  // ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  if (!productId) return null;

  const photos = product?.photos ?? [];
  const hasPhotos = photos.length > 0;
  const currentPhotoUrl = hasPhotos ? photos[photoIndex]?.url : product?.mainImageUrl ?? null;
  const variationGroups = product ? groupVariations(product.variations) : [];
  const requiresVariation = variationGroups.length > 0;
  const canAdd = !requiresVariation || selectedVariation !== null;

  function prevPhoto() {
    setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }

  function nextPhoto() {
    setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }

  function handleAdd() {
    if (!product || !canAdd) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        unitPrice: product.displayPrice,
        selectedVariation,
      },
      quantity,
    );
    setAddFeedback(true);
    setTimeout(() => setAddFeedback(false), 2000);
  }

  function handleWhatsApp() {
    if (!product) return;
    const url = buildSingleProductWhatsApp(product.name, quantity, selectedVariation);
    window.open(url, '_blank');
  }

  function handleQuantityInput(val: string) {
    const n = parseInt(val, 10);
    if (!isNaN(n)) setQuantity(Math.min(99, Math.max(1, n)));
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl
          lg:flex-row lg:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full
            bg-white/90 text-neutral-700 shadow hover:bg-white hover:text-neutral-900 transition"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* ── Left: photo gallery ── */}
        <div className="relative flex flex-col bg-neutral-100 lg:w-1/2 lg:flex-shrink-0">
          {/* Main photo */}
          <div className="relative flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-neutral-400 lg:h-full">
                Carregando...
              </div>
            ) : currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt={product?.name}
                className="h-64 w-full object-cover transition-transform duration-300 hover:scale-[1.15] lg:h-full"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-6xl text-neutral-300 lg:h-full">
                📦
              </div>
            )}

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center
                    rounded-full bg-white/80 text-neutral-700 shadow hover:bg-white transition"
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center
                    rounded-full bg-white/80 text-neutral-700 shadow hover:bg-white transition"
                  aria-label="Próxima foto"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-2">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setPhotoIndex(idx)}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 transition
                    ${idx === photoIndex ? 'border-secondary' : 'border-transparent hover:border-neutral-300'}`}
                >
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: product info ── */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {isLoading ? (
            <p className="text-sm text-neutral-600">Carregando informações...</p>
          ) : product ? (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {product.categoryName}
                </p>
                <h2 className="mt-1 text-xl font-bold text-neutral-900 leading-tight">
                  {product.name}
                </h2>
              </div>

              <p className="text-3xl font-bold text-secondary">
                {formatCurrency(product.displayPrice)}
              </p>

              {product.description && (
                <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>
              )}

              {/* Variation groups */}
              {variationGroups.map((group) => (
                <div key={group.name}>
                  <p className="mb-2 text-sm font-semibold text-neutral-800">{group.name}:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const isSelected =
                        selectedVariation?.name === group.name &&
                        selectedVariation?.value === value;
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            setSelectedVariation(
                              isSelected ? null : { name: group.name, value },
                            )
                          }
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition
                            ${
                              isSelected
                                ? 'border-secondary bg-secondary/10 text-secondary'
                                : 'border-neutral-300 bg-white text-neutral-700 hover:border-secondary hover:text-secondary'
                            }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                  {requiresVariation && !selectedVariation && (
                    <p className="mt-1 text-xs text-red-500">Selecione uma opção antes de adicionar</p>
                  )}
                </div>
              ))}

              {/* Quantity selector */}
              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-800">Quantidade:</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300
                      text-lg font-semibold hover:bg-neutral-50 transition"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    className="w-16 rounded-md border border-neutral-300 px-2 py-1.5 text-center text-sm
                      focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300
                      text-lg font-semibold hover:bg-neutral-50 transition"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={handleAdd}
                  disabled={!canAdd}
                  className={`w-full rounded-md py-3 text-sm font-semibold text-white transition
                    ${
                      addFeedback
                        ? 'bg-green-500'
                        : canAdd
                        ? 'bg-secondary hover:opacity-90'
                        : 'cursor-not-allowed bg-neutral-300'
                    }`}
                >
                  {addFeedback ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
                </button>

                <Button variant="outline" onClick={handleWhatsApp} className="w-full">
                  Solicitar Orçamento via WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-600">Produto não encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
