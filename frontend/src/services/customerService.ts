import { api } from './api';
import type { Customer } from '../types/customer';
import type { PageResponse } from './productService';

export interface CustomerFilters {
  status?: string;
  origin?: string;
  search?: string;
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
