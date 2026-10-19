import apiClient from './axios'
import type { ExperienceCategory, ExperienceCategoryPayload } from '@/types/experienceCategory'

const BASE = '/web/admin/experience-categories'

export const getExperienceCategories = async (): Promise<ExperienceCategory[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createExperienceCategory = async (
  payload: ExperienceCategoryPayload
): Promise<ExperienceCategory> => {
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

export const updateExperienceCategory = async (
  id: number,
  payload: Partial<ExperienceCategoryPayload>
): Promise<ExperienceCategory> => {
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

export const deleteExperienceCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}
