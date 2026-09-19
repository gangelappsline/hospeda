export interface ProfileUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  photo: string | null
}

export interface ProfilePayload {
  name?: string
  password?: string
  password_confirmation?: string
  avatar?: File
}