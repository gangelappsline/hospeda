import { useQuery } from '@tanstack/react-query'
import {
  getPublicExperienceCategories,
  getPublicLodgingCategories,
  getPublicServiceCategories,
} from '@/api/public'

export function usePublicLodgingCategories() {
  return useQuery({
    queryKey: ['public-lodging-categories'],
    queryFn: getPublicLodgingCategories,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function usePublicExperienceCategories() {
  return useQuery({
    queryKey: ['public-experience-categories'],
    queryFn: getPublicExperienceCategories,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function usePublicServiceCategories() {
  return useQuery({
    queryKey: ['public-service-categories'],
    queryFn: getPublicServiceCategories,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
