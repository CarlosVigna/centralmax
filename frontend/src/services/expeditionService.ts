import { api } from './api';
import type { OrderResponse } from '../types/order';

export async function getBoardOrders(): Promise<OrderResponse[]> {
  const { data } = await api.get<OrderResponse[]>('/orders/board');
  return data;
}
