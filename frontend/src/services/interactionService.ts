import { api } from './api';
import type { Interaction, InteractionRequest } from '../types/interaction';

export async function listInteractions(customerId: string): Promise<Interaction[]> {
  const { data } = await api.get<Interaction[]>(`/customers/${customerId}/interactions`);
  return data;
}

export async function createInteraction(
  customerId: string,
  request: InteractionRequest,
): Promise<Interaction> {
  const { data } = await api.post<Interaction>(`/customers/${customerId}/interactions`, request);
  return data;
}

export async function deleteInteraction(customerId: string, interactionId: string): Promise<void> {
  await api.delete(`/customers/${customerId}/interactions/${interactionId}`);
}

export async function getAgenda(period: 'today' | 'week' | 'overdue'): Promise<Interaction[]> {
  const { data } = await api.get<Interaction[]>('/customers/agenda', { params: { period } });
  return data;
}
