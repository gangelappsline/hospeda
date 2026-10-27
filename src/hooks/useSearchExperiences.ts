import { useQuery } from '@tanstack/react-query'
import { searchExperiences } from '@/api/public'
import type { ExperienceSearchFilters } from '@/types/public'

export function useSearchExperiences(filters: ExperienceSearchFilters) {
  return useQuery({
    queryKey: ['search-experiences', filters],
    queryFn: () => searchExperiences(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
}
