import { useQuery } from '@tanstack/react-query';
import { listProducts, type ProductFilters } from '../services/productService';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
  });
}
