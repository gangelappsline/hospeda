export interface LodgingType {
  id: number
  name: string
  description: string | null
  icon_url: string
}

export interface LodgingTypePayload {
  name: string
  description?: string
  icon: File
}