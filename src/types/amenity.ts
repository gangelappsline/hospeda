export interface Amenity {
  id: number
  name: string
  icon_url: string | null   // ← asegúrate de que esta línea exista
  active: boolean
}

export interface AmenityPayload {
  name: string
  icon: File
  active: boolean
}