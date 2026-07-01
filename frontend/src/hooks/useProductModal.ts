import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../services/productService';
import type { ProductSummary } from '../types/product';

export function useProductModal() {
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [popoverProduct, setPopoverProduct] = useState<ProductSummary | null>(null);
  const [pendingQuickAdd, setPendingQuickAdd] = useState<ProductSummary | null>(null);

  const { data: pendingDetail } = useQuery({
    queryKey: ['product', pendingQuickAdd?.id],
    queryFn: () => getProduct(pendingQuickAdd!.id),
    enabled: !!pendingQuickAdd,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!pendingQuickAdd || !pendingDetail) return;
    const product = pendingQuickAdd;
    setPendingQuickAdd(null);
    if (pendingDetail.variations.length > 0) {
      setOpenModalId(product.id);
    } else {
      setPopoverProduct(product);
    }
  }, [pendingDetail, pendingQuickAdd]);

  return {
    openModalId,
    openModal: (id: string) => setOpenModalId(id),
    closeModal: () => setOpenModalId(null),
    popoverProduct,
    closePopover: () => setPopoverProduct(null),
    triggerQuickAdd: (product: ProductSummary) => setPendingQuickAdd(product),
  };
}
