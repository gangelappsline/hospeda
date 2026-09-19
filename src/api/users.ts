import apiClient from './axios'
import type { AdminUser, UserPayload } from '@/types/user'

const BASE = '/web/admin/users'

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get(BASE)
  return response.data.data ?? response.data
}

export const createUser = async (payload: UserPayload): Promise<AdminUser> => {
  const response = await apiClient.post(BASE, payload)
  return response.data.data ?? response.data
}

export const updateUser = async (
  id: number,
  payload: Partial<UserPayload>
): Promise<AdminUser> => {
  const response = await apiClient.put(`${BASE}/${id}`, payload)
  return response.data.data ?? response.data
}

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`)
}