import { api } from './api';
import type { SalesChannel, SalesChannelRequest } from '../types/salesChannel';

export async function listActiveSalesChannels(): Promise<SalesChannel[]> {
  const { data } = await api.get<SalesChannel[]>('/sales-channels');
  return data;
}

export async function listAllSalesChannels(): Promise<SalesChannel[]> {
  const { data } = await api.get<SalesChannel[]>('/sales-channels/all');
  return data;
}

export async function createSalesChannel(request: SalesChannelRequest): Promise<SalesChannel> {
  const { data } = await api.post<SalesChannel>('/sales-channels', request);
  return data;
}

export async function updateSalesChannel(id: string, request: SalesChannelRequest): Promise<SalesChannel> {
  const { data } = await api.put<SalesChannel>(`/sales-channels/${id}`, request);
  return data;
}

export async function deleteSalesChannel(id: string): Promise<void> {
  await api.delete(`/sales-channels/${id}`);
}
