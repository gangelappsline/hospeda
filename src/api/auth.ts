import apiClient from './axios'
import type {
  AuthUser,
  ApiError,
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '@/types/auth'

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const payload: LoginCredentials = {
    ...credentials,
    source: 'web',
  }
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export const register = async (
  data: RegisterPayload
): Promise<RegisterResponse> => {
  const payload: RegisterPayload = {
    ...data,
    source: 'web',
  }

  try {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      payload
    )
    return response.data
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr?.status === 404) {
      const fallbackResponse = await apiClient.post<RegisterResponse>(
        '/register',
        payload
      )
      return fallbackResponse.data
    }
    throw err
  }
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>('/auth/me')
  return response.data
}
