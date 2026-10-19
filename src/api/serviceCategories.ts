import apiClient from './axios'
import type { ServiceCategory, ServiceCategoryPayload } from '@/types/serviceCategory'

const BASE = '/web/admin/service-categories'

const resolveIconUrl = (raw: Record<string, any>): string | null => {
  const directUrl = raw.icon_url ?? raw.logo_url
  if (typeof directUrl === 'string' && directUrl.trim() !== '') {
    return directUrl
  }

  const rawPath = raw.icon ?? raw.logo
  if (typeof rawPath !== 'string' || rawPath.trim() === '') {
    return null
  }

  if (
    rawPath.startsWith('http://') ||
    rawPath.startsWith('https://') ||
    rawPath.startsWith('blob:') ||
    rawPath.startsWith('data:')
  ) {
    return rawPath
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(
    /\/api(\/v\d+)?\/?$/,
    ''
  )
  const cleanPath = rawPath.replace(/^\/?(storage\/)?/, '')
  return baseUrl ? `${baseUrl}/storage/${cleanPath}` : `/storage/${cleanPath}`
}

const normalizeServiceCategory = (raw: any): ServiceCategory => ({
  id: Number(raw.id),
  name: raw.name ?? '',
  icon: raw.icon ?? raw.logo ?? null,
  icon_url: resolveIconUrl(raw),
  logo: raw.logo ?? raw.icon ?? null,
  logo_url: resolveIconUrl(raw),
  hint: raw.hint ?? '',
  example: raw.example ?? '',
  active:
    raw.active !== undefined && raw.active !== null
      ? Boolean(
          typeof raw.active === 'boolean' ? raw.active : Number(raw.active)
        )
      : true,
})

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await apiClient.get(BASE)
  const list = Array.isArray(response.data)
    ? response.data
    : (response.data?.data ?? [])
  return Array.isArray(list) ? list.map(normalizeServiceCategory) : []
}

export const createServiceCategory = async (
  payload: ServiceCategoryPayload
): Promise<ServiceCategory> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.icon) {
    formData.append('icon', payload.icon)
  }
  formData.append('hint', payload.hint)
  formData.append('example', payload.example)
  formData.append('active', payload.active ? '1' : '0')

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const data = response.data?.data ?? response.data
  return normalizeServiceCategory(data)
}

export const updateServiceCategory = async (
  id: number,
  payload: Partial<ServiceCategoryPayload>
): Promise<ServiceCategory> => {
  const formData = new FormData()
  formData.append('_method', 'PUT')
  if (payload.name !== undefined) formData.append('name', payload.name)
  if (payload.icon) formData.append('icon', payload.icon)
  if (payload.hint !== undefined) formData.append('hint', payload.hint)
  if (payload.example !== undefined) formData.append('example', payload.example)
  if (payload.active !== undefined) {
    formData.append('active', payload.active ? '1' : '0')
  }

  const response = await apiClient.post(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const data = response.data?.data ?? response.data
  return normalizeServiceCategory(data)
}

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}
