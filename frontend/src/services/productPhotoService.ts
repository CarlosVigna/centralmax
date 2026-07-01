import { api } from './api';
import type { ProductPhoto } from '../types/product';

export async function uploadPhoto(productId: string, file: File): Promise<ProductPhoto> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ProductPhoto>(`/products/${productId}/photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function setPrimaryPhoto(productId: string, photoId: string): Promise<ProductPhoto> {
  const { data } = await api.patch<ProductPhoto>(`/products/${productId}/photos/${photoId}/primary`);
  return data;
}

export async function deletePhoto(productId: string, photoId: string): Promise<void> {
  await api.delete(`/products/${productId}/photos/${photoId}`);
}

export async function reorderPhotos(productId: string, order: string[]): Promise<ProductPhoto[]> {
  const { data } = await api.patch<ProductPhoto[]>(`/products/${productId}/photos/reorder`, { order });
  return data;
}
