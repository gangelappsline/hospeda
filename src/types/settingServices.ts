// src/types/settingServices.ts
export interface ServiceCategory {
  id: number
  name: string
  hint: string | null
  example: string | null
  active: boolean
  logo: string | null       // ruta relativa guardada en DB (ej: service-categories/uuid.webp)
  logo_url: string | null   // URL completa generada en el backend (accessor)
}

export interface ServiceCategoryPayload {
  name: string
  hint?: string | null
  example?: string | null
  active: boolean
  logo: File
}