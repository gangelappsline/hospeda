import apiClient from './axios'
import type { LoginCredentials, LoginResponse, AuthUser } from '@/types/auth'

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  credentials = {
    ...credentials,
    'source': 'web'
  }
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>('/auth/me')
  return response.data
}