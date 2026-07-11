import { api } from './api';
import type { Customer, CustomerOrigin, CustomerRequest, CustomerStatus } from '../types/customer';
import type { PageResponse } from './productService';

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus;
  origin?: CustomerOrigin;
  active?: boolean;
  page?: number;
  size?: number;
}

export async function listCustomers(filters: CustomerFilters = {}): Promise<PageResponse<Customer>> {
  const { data } = await api.get<PageResponse<Customer>>('/customers', { params: filters });
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(request: CustomerRequest): Promise<Customer> {
  const { data } = await api.post<Customer>('/customers', request);
  return data;
}

export async function updateCustomer(id: string, request: CustomerRequest): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customers/${id}`, request);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export async function listReactivateCustomers(): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>('/customers/reactivate');
  return data;
}
