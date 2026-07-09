import { api } from './api';
import type {
  ContactSchedule,
  ContactScheduleRequest,
  CompleteScheduleRequest,
} from '../types/contactSchedule';

export async function getSchedulesByCustomer(customerId: string): Promise<ContactSchedule[]> {
  const { data } = await api.get<ContactSchedule[]>(`/customers/${customerId}/schedules`);
  return data;
}

export async function createSchedule(
  customerId: string,
  request: ContactScheduleRequest,
): Promise<ContactSchedule> {
  const { data } = await api.post<ContactSchedule>(`/customers/${customerId}/schedules`, request);
  return data;
}

export async function completeSchedule(
  scheduleId: string,
  request?: CompleteScheduleRequest,
): Promise<ContactSchedule> {
  const { data } = await api.patch<ContactSchedule>(`/schedules/${scheduleId}/complete`, request ?? {});
  return data;
}

export async function cancelSchedule(scheduleId: string): Promise<ContactSchedule> {
  const { data } = await api.patch<ContactSchedule>(`/schedules/${scheduleId}/cancel`);
  return data;
}

export interface AgendaFilters {
  period?: 'today' | 'tomorrow' | 'week' | 'month' | 'overdue';
  customerId?: string;
}

export async function getAgendaSchedules(filters: AgendaFilters = {}): Promise<ContactSchedule[]> {
  const { data } = await api.get<ContactSchedule[]>('/agenda/schedules', { params: filters });
  return data;
}
