import { useQuery } from '@tanstack/react-query';
import { listOrders, type OrderFilters } from '../services/orderService';

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => listOrders(filters),
  });
}
