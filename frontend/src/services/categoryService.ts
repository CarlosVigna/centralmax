import { api } from './api';
import type { Category, CategoryFull } from '../types/product';

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function listAllCategories(): Promise<CategoryFull[]> {
  const { data } = await api.get<CategoryFull[]>('/categories/admin');
  return data;
}

export async function getCategory(id: string): Promise<CategoryFull> {
  const { data } = await api.get<CategoryFull>(`/categories/${id}`);
  return data;
}

export async function createCategory(name: string): Promise<CategoryFull> {
  const { data } = await api.post<CategoryFull>('/categories', { name });
  return data;
}

export async function updateCategory(id: string, name: string): Promise<CategoryFull> {
  const { data } = await api.put<CategoryFull>(`/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function activateCategory(id: string): Promise<CategoryFull> {
  const { data } = await api.patch<CategoryFull>(`/categories/${id}/activate`);
  return data;
}
