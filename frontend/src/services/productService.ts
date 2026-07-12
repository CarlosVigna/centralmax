import { api } from './api';
import type { ProductAdmin, ProductDetail, ProductRequest, ProductSummary, VolumeDiscount, PriceHistory, ImportResult } from '../types/product';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface AdminProductFilters {
  search?: string;
  status?: 'ATIVO' | 'INATIVO';
  categoryId?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function listProducts(filters: ProductFilters = {}): Promise<PageResponse<ProductSummary>> {
  const { data } = await api.get<PageResponse<ProductSummary>>('/products', { params: filters });
  return data;
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data;
}

export async function listAdminProducts(filters: AdminProductFilters = {}): Promise<PageResponse<ProductAdmin>> {
  const { data } = await api.get<PageResponse<ProductAdmin>>('/products/admin', { params: filters });
  return data;
}

export async function getAdminProduct(id: string): Promise<ProductAdmin> {
  const { data } = await api.get<ProductAdmin>(`/products/${id}/admin`);
  return data;
}

export async function createProduct(request: ProductRequest): Promise<ProductAdmin> {
  const { data } = await api.post<ProductAdmin>('/products', request);
  return data;
}

export async function updateProduct(id: string, request: ProductRequest): Promise<ProductAdmin> {
  const { data } = await api.put<ProductAdmin>(`/products/${id}`, request);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function activateProduct(id: string): Promise<ProductAdmin> {
  const { data } = await api.patch<ProductAdmin>(`/products/${id}/activate`);
  return data;
}

export async function duplicateProduct(
  id: string,
  copyPhotos: boolean,
): Promise<ProductAdmin> {
  const { data } = await api.post<ProductAdmin>(
    `/products/${id}/duplicate?copyPhotos=${copyPhotos}`,
  );
  return data;
}

export async function getProductDiscounts(productId: string): Promise<VolumeDiscount[]> {
  const { data } = await api.get<VolumeDiscount[]>(`/products/${productId}/discounts`);
  return data;
}

export async function createProductDiscount(
  productId: string,
  request: { minQuantity: number; discountPercent: number },
): Promise<VolumeDiscount> {
  const { data } = await api.post<VolumeDiscount>(`/products/${productId}/discounts`, request);
  return data;
}

export async function deleteProductDiscount(productId: string, discountId: string): Promise<void> {
  await api.delete(`/products/${productId}/discounts/${discountId}`);
}

export async function getProductPriceHistory(productId: string): Promise<PriceHistory[]> {
  const { data } = await api.get<PriceHistory[]>(`/products/${productId}/price-history`);
  return data;
}

export async function importProductsCsv(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ImportResult>('/products/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
