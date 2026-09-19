export interface User {
  id: number
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  user: User
  access_token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}