import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../services/categoryService';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 1000 * 60 * 10,
  });
}
