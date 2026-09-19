import apiClient from './axios'
import type { ProfileUser, ProfilePayload } from '@/types/profile'

const BASE = '/web/admin/me'

export const getProfile = async (): Promise<ProfileUser> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const updateProfile = async (
  payload: ProfilePayload
): Promise<ProfileUser> => {
  const formData = new FormData()

  // Laravel: spoofing para PUT con multipart
  formData.append('_method', 'PUT')

  if (payload.name !== undefined) {
    formData.append('name', payload.name)
  }
  if (payload.password) {
    formData.append('password', payload.password)
  }
  if (payload.password_confirmation) {
    formData.append('password_confirmation', payload.password_confirmation)
  }
  if (payload.avatar) {
    formData.append('avatar', payload.avatar)
  }

  const response = await apiClient.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data.data ?? response.data
}