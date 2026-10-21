import type { ArrivalInstruction } from './arrivalInstruction'

export type LodgingStatus = 'published' | 'draft' | 'archived'

export interface HostLodging {
  id: number
  title: string
  slug: string
  description: string
  status: LodgingStatus
  base_price: number
  cleaning_fee: number
  service_fee: number
  security_deposit: number
  bathrooms: number
  bedrooms: number
  beds: number
  guests: number
  lodging_scope: 'entire_place' | 'private_room' | 'shared_room'
  rating: number
  reviews: number
  type: LodgingType
  address: LodgingAddress | null
  photos: LodgingPhoto[]
  cover: string | null        // derivado: photo con cover=1 o la primera
  amenitiesCount: number
  arrival_instructions?: ArrivalInstruction[]
  createdAt: string
  updatedAt: string
}

export interface LodgingType {
  id: number
  name: string
}

export interface LodgingAddress {
  street: string
  city: string
  state: string
  country: string
  zip_code: string
  formatted_address: string
}

export interface LodgingPhoto {
  id: number
  photo: string
  thumbnail: string
  order: number
  cover: number
}