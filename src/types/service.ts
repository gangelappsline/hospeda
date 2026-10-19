export interface Service {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: number | null
  category: ServiceCategoryRef | null
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ServiceCategoryRef {
  id: number
  name: string
}

export interface ServicePayload {
  name: string
  description?: string
  price: number
  category_id?: number | null
  image?: File
  active: boolean
}
