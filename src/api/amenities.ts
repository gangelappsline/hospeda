import apiClient from './axios'
import type { Amenity, AmenityPayload } from '@/types/amenity'

const BASE = '/web/admin/amenities'

export const getAmenities = async (): Promise<Amenity[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createAmenity = async (payload: AmenityPayload): Promise<Amenity> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('icon', payload.icon)
  formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const updateAmenity = async (
  id: number,
  payload: Partial<AmenityPayload>
): Promise<Amenity> => {
  const formData = new FormData()
  formData.append('_method', 'PUT') // Laravel: spoofing para PUT con multipart
  if (payload.name) formData.append('name', payload.name)
  if (payload.icon) formData.append('icon', payload.icon)
  if (payload.active !== undefined) {
    formData.append('active', payload.active ? '1' : '0')
  }

  const response = await apiClient.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const deleteAmenity = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}