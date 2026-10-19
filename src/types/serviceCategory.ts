export interface ServiceCategory {
  id: number
  name: string
  description: string | null
  icon_url: string | null
  active: boolean
}

export interface ServiceCategoryPayload {
  name: string
  description?: string
  icon: File
  active?: boolean
}
