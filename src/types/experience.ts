export interface Experience {
  id: number
  name: string
  description: string | null
  price: number
  duration: string | null
  image_url: string | null
  category_id: number | null
  category: ExperienceCategoryRef | null
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ExperienceCategoryRef {
  id: number
  name: string
}

export interface ExperiencePayload {
  name: string
  description?: string
  price: number
  duration?: string
  category_id?: number | null
  image?: File
  active: boolean
}
