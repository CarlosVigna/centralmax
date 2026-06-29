import { api } from './api';
import type { ProductDetail, ProductSummary } from '../types/product';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
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
