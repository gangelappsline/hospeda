import apiClient from './axios'
import type { Settlement, SettlementPayload } from '@/types/settlement'

const BASE = '/web/admin/settlements'

export const getSettlementsByCity = async (
  cityId: number
): Promise<Settlement[]> => {
  const response = await apiClient.get(BASE, {
    params: { city_id: cityId },
  })
  return response.data.data ?? response.data
}

export const createSettlement = async (
  payload: SettlementPayload
): Promise<Settlement> => {
  const response = await apiClient.post(BASE, payload)
  return response.data.data ?? response.data
}

export const updateSettlement = async (
  id: number,
  payload: Partial<SettlementPayload>
): Promise<Settlement> => {
  const response = await apiClient.put(`${BASE}/${id}`, payload)
  return response.data.data ?? response.data
}

export const deleteSettlement = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}