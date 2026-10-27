import { useQuery } from '@tanstack/react-query'
import { searchServices } from '@/api/public'
import type { ServiceSearchFilters } from '@/types/public'

export function useSearchServices(filters: ServiceSearchFilters) {
  return useQuery({
    queryKey: ['search-services', filters],
    queryFn: () => searchServices(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
}
