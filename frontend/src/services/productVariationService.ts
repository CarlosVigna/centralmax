import { api } from './api';
import type { ProductVariation } from '../types/product';

export async function addVariation(
  productId: string,
  request: { name: string; value: string },
): Promise<ProductVariation> {
  const { data } = await api.post<ProductVariation>(`/products/${productId}/variations`, request);
  return data;
}

export async function removeVariation(productId: string, variationId: string): Promise<void> {
  await api.delete(`/products/${productId}/variations/${variationId}`);
}
