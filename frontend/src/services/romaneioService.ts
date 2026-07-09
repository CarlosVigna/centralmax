import { api } from './api';
import type { OrderStatus } from '../types/order';

export interface PurchaseListOrderRef {
  orderNumber: string;
  customerName: string;
  quantity: number;
}

export interface PurchaseListItem {
  productId: string;
  productName: string;
  sku: string | null;
  totalQuantity: number;
  orders: PurchaseListOrderRef[];
}

export interface PurchaseListResponse {
  generatedAt: string;
  orders: string[];
  items: PurchaseListItem[];
}

export async function getPurchaseList(statuses?: OrderStatus[]): Promise<PurchaseListResponse> {
  const params: Record<string, string> = {};
  if (statuses && statuses.length > 0) {
    params.status = statuses.join(',');
  }
  const { data } = await api.get<PurchaseListResponse>('/orders/purchase-list', { params });
  return data;
}
