import { api } from './api';
import type { OrderRequest, OrderResponse, OrderStatus } from '../types/order';
import type { PageResponse } from './productService';

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  customerId?: string;
  page?: number;
  size?: number;
}

export async function listOrders(filters: OrderFilters = {}): Promise<PageResponse<OrderResponse>> {
  const { data } = await api.get<PageResponse<OrderResponse>>('/orders', { params: filters });
  return data;
}

export async function getOrder(id: string): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/orders/${id}`);
  return data;
}

export async function createOrder(request: OrderRequest): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>('/orders', request);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
  const { data } = await api.patch<OrderResponse>(`/orders/${id}/status`, { status });
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

export async function duplicateOrder(id: string): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>(`/orders/${id}/duplicate`);
  return data;
}
