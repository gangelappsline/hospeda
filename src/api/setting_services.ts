import apiClient from './axios'
import type { ServiceCategory as Service, ServiceCategoryPayload as ServicePayload } from '@/types/settingServices'

const BASE = '/web/admin/settings/services'

export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createService = async (payload: ServicePayload): Promise<Service> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('logo', payload.logo)
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
  formData.append('_method', 'PUT') // Laravel: spoofing para PUT con multipart
  if (payload.name) formData.append('name', payload.name)
  if (payload.logo) formData.append('logo', payload.logo)
  if (payload.active !== undefined) {
    formData.append('active', payload.active ? '1' : '0')
  }

  const response = await apiClient.put(`${BASE}/${id}`, formData, {
    headers: { 
      // Nota: Laravel requiere multipart/form-data para subir archivos
      'Content-Type': 'multipart/form-data' 
    },
  })
  return response.data.data ?? response.data
}

export const deleteService = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}