import apiClient from './axios'
import type { Service, ServicePayload } from '@/types/service'

const BASE = '/web/admin/services'

export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createService = async (payload: ServicePayload): Promise<Service> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.description) formData.append('description', payload.description)
  formData.append('price', String(payload.price))
  if (payload.category_id) formData.append('category_id', String(payload.category_id))
  if (payload.image) formData.append('image', payload.image)
  formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const updateService = async (
  id: number,
  payload: Partial<ServicePayload>
): Promise<Service> => {
  const formData = new FormData()
  formData.append('_method', 'PUT')
  if (payload.name) formData.append('name', payload.name)
  if (payload.description !== undefined) formData.append('description', payload.description || '')
  if (payload.price !== undefined) formData.append('price', String(payload.price))
  if (payload.category_id !== undefined) {
    formData.append('category_id', payload.category_id ? String(payload.category_id) : '')
  }
  if (payload.image) formData.append('image', payload.image)
  if (payload.active !== undefined) formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const deleteService = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}
