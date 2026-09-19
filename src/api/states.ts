import apiClient from './axios'
import type { State } from '@/types/settlement'

export const getStatesByCountry = async (countryId: number): Promise<State[]> => {
  const response = await apiClient.get('/web/admin/states', {
    params: { country_id: countryId },
  })
  return response.data.data ?? response.data
}