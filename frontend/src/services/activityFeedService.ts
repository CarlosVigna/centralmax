import { api } from './api';

export interface ActivityFeedEntry {
  id: string;
  userId: string;
  userName: string;
  actionType: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  details: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function listActivityFeed(page = 0, size = 30): Promise<PageResponse<ActivityFeedEntry>> {
  const { data } = await api.get<PageResponse<ActivityFeedEntry>>('/activity-feed', {
    params: { page, size },
  });
  return data;
}

export async function listRecentActivity(limit = 10): Promise<ActivityFeedEntry[]> {
  const { data } = await api.get<ActivityFeedEntry[]>('/activity-feed/recent', {
    params: { limit },
  });
  return data;
}
