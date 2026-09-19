import apiClient from './axios'
import type { Country } from '@/types/settlement'

export const getCountries = async (): Promise<Country[]> => {
  const response = await apiClient.get('/web/admin/countries')
  return response.data.data ?? response.data
}