import { useQuery } from '@tanstack/react-query';
import { listCustomers, type CustomerFilters } from '../services/customerService';

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => listCustomers(filters),
  });
}
