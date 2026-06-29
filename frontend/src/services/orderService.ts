import { api } from './api';
import type { Order } from '../types/order';
import type { PageResponse } from './productService';

export interface OrderFilters {
  status?: string;
  customerId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export async function listOrders(filters: OrderFilters = {}): Promise<PageResponse<Order>> {
  const { data } = await api.get<PageResponse<Order>>('/orders', { params: filters });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}
