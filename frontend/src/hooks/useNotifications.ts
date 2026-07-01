import { useQuery } from '@tanstack/react-query';
import { getNotificationSummary } from '../services/notificationService';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
