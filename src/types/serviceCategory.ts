export interface ServiceCategory {
  id: number
  name: string
  icon: string | null
  icon_url: string | null
  logo?: string | null
  logo_url?: string | null
  hint: string
  example: string
  active: boolean
}

export interface ServiceCategoryPayload {
  name: string
  icon?: File | null
  hint: string
  example: string
  active: boolean
}
