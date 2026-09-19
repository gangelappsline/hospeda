import apiClient from './axios'
import type { FeaturedStay } from '@/types/public'

/**
 * Obtiene las estancias destacadas.
 * Ajusta el endpoint a tu API real cuando esté listo.
 */
export const getFeaturedStays = async (): Promise<FeaturedStay[]> => {
  const response = await apiClient.get('/web/public/featured-stays')
  return response.data.data ?? response.data
}