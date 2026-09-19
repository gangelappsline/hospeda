export type UserRole = 'administrator' | 'guest' | 'host' | 'affiliate'

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface UserPayload {
  name: string
  email: string
  phone?: string
  role: UserRole
  password?: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  host: 'Anfitrión',
  guest: 'Huésped',
  affiliate: 'Afiliado',
  administrator: 'Administrador',
}