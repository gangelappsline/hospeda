export interface ExperienceCategory {
  id: number
  name: string
  description: string | null
  icon_url: string | null
  active: boolean
}

export interface ExperienceCategoryPayload {
  name: string
  description?: string
  icon: File
  active?: boolean
}
