import { api } from './api';
import type { OrderStatus } from '../types/order';

export interface DeliveryRouteStop {
  orderNumber: string;
  customerName: string;
  phone: string | null;
  address: string | null;
  fullAddress: string | null;
  items: string;
  neighborhood: string | null;
}

export interface DeliveryRouteResponse {
  date: string;
  stops: DeliveryRouteStop[];
  googleMapsUrl: string | null;
}

export async function getDeliveryRoute(
  date?: string,
  statuses?: OrderStatus[],
): Promise<DeliveryRouteResponse> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  if (statuses && statuses.length > 0) params.status = statuses.join(',');
  const { data } = await api.get<DeliveryRouteResponse>('/orders/delivery-route', { params });
  return data;
}
