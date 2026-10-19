import apiClient from './axios'
import type { ServiceCategory, ServiceCategoryPayload } from '@/types/serviceCategory'

const BASE = '/web/admin/service-categories'

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createServiceCategory = async (
  payload: ServiceCategoryPayload
): Promise<ServiceCategory> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.description) formData.append('description', payload.description)
  formData.append('icon', payload.icon)
  if (payload.active !== undefined) formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const updateServiceCategory = async (
  id: number,
  payload: Partial<ServiceCategoryPayload>
): Promise<ServiceCategory> => {
  const formData = new FormData()
  formData.append('_method', 'PUT')
  if (payload.name) formData.append('name', payload.name)
  if (payload.description !== undefined) formData.append('description', payload.description || '')
  if (payload.icon) formData.append('icon', payload.icon)
  if (payload.active !== undefined) formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data ?? response.data
}

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}
