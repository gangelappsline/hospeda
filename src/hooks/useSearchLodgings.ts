import { useQuery } from '@tanstack/react-query'
import { searchLodgings } from '@/api/public'
import type { LodgingSearchFilters } from '@/types/public'

export function useSearchLodgings(filters: LodgingSearchFilters) {
  return useQuery({
    queryKey: ['search-lodgings', filters],
    queryFn: () => searchLodgings(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
}