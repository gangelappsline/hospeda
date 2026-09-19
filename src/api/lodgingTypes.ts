import apiClient from './axios'
import type { LodgingType, LodgingTypePayload } from '@/types/lodgingType'

const BASE = '/web/admin/lodging-types'

export const getLodgingTypes = async (): Promise<LodgingType[]> => {
  const response = await apiClient.get(BASE)
  // Adaptar según tu respuesta: { data: [...] } o [...]
  return response.data.data ?? response.data
}

export const createLodgingType = async (
  payload: LodgingTypePayload
): Promise<LodgingType> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.description) {
    formData.append('description', payload.description)
  }
  formData.append('icon', payload.icon)

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const updateLodgingType = async (
  id: number,
  payload: Partial<LodgingTypePayload>
): Promise<LodgingType> => {
  const formData = new FormData()
  formData.append('_method', 'PUT') // Laravel: spoofing para PUT con multipart
  if (payload.name) formData.append('name', payload.name)
  if (payload.description !== undefined) {
    formData.append('description', payload.description || '')
  }
  if (payload.icon) formData.append('icon', payload.icon)

  const response = await apiClient.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const deleteLodgingType = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}