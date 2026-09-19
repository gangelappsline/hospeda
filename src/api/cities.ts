import apiClient from './axios'
import type { City } from '@/types/settlement'

export const getCitiesByState = async (stateId: number): Promise<City[]> => {
  const response = await apiClient.get('/web/admin/cities', {
    params: { state_id: stateId },
  })
  return response.data.data ?? response.data
}