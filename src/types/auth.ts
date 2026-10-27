/*export interface User {
  id: number
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
  source?: string
}

export interface LoginResponse {
  user: User
  access_token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}*/
export type Role = 'administrator' | 'host' | 'guest' | 'support' | 'affiliate'

export interface AuthUser {
  id: number
  name: string
  email: string
  photo: string | null
  role: Role          // ⚠️ multi-rol: array
  // ... el resto de campos que ya tengas
}

export interface User {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  access_token: string
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
  source?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  source?: string
  referral_code?: string
}

export interface RegisterResponse {
  access_token?: string
  token?: string
  user?: AuthUser
  message?: string
  data?: {
    access_token?: string
    token?: string
    user?: AuthUser
  }
}

export interface ApiError {
  status: number | undefined
  message: string
  errors?: Record<string, string[]>
}