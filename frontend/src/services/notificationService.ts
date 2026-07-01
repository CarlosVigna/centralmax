import { api } from './api';
import type { NotificationSummary } from '../types/notification';

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const { data } = await api.get<NotificationSummary>('/notifications/summary');
  return data;
}
