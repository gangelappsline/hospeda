import type { ArrivalInstruction } from './arrivalInstruction'

export interface FeaturedStay {
  id: number
  title: string
  slug: string
  description?: string
  address: LodgingAddress | null
  rating: number
  reviews?: number
  guests: number
  bedrooms: number
  beds?: number
  bathrooms: number | null
  price: number
  photos: LodgingPhoto[]
  type: LodgingType
  amenities?: string[]
  is_superhost: boolean
  latitude?: number
  longitude?: number
}

export interface LodgingType {
  id: number
  name: string
}

export interface LodgingPhoto {
  id: number
  photo: string
  thumbnail: string
}

export interface LodgingAddress {
  street: string
  city: string
  state: string
  country: string
  zip_code: string
  formatted_address: string
  latitude?: number
  longitude?: number
}

export interface LodgingAmenity {
  id: number
  amenity_id: number
  name: string
  icon: string
}

export interface LodgingOwner {
  id: number
  name: string
  photo: string | null
  is_superhost?: boolean
  reviews_count?: number
  rating?: number
}

export interface LodgingReview {
  id: number
  author_name: string
  author_photo: string | null
  author_location?: string
  rating: number
  comment: string
  created_at: string
}

interface ApiLodgingDetail {
  id: number
  title: string | null
  description: string | null
  slug: string | null
  base_price: string | null
  cleaning_fee: string | null
  service_fee: string | null
  security_deposit: string | null
  bathrooms: number
  bedrooms: number
  beds: number
  capacity: number
  rating: string
  reviews: number
  status: string
  type: { id: number; name: string }
  owner: { id: number; name: string; photo: string | null }
  amenities: Array<{
    id: number
    amenity_id: number
    name: string
    icon: string
  }>
  address: {
    street: string
    city: string
    state: string
    country: string
    zip_code: string
    formatted_address: string
  } | null
  photos: Array<{ id: number; photo: string; thumbnail: string }>
}

export interface ApiDetailResponse {
  success: boolean
  data: ApiLodgingDetail
  message: string
}

export interface LodgingDetail {
  id: number
  title: string
  description: string
  slug: string
  base_price: number
  cleaning_fee: number
  service_fee: number
  security_deposit: number
  bathrooms: number
  bedrooms: number
  beds: number
  guests: number
  rating: number
  reviews: number
  reviews_list?: LodgingReview[]
  status: string
  type: LodgingType
  owner: LodgingOwner
  amenities: LodgingAmenity[]
  address: LodgingAddress | null
  photos: LodgingPhoto[]
  arrival_instructions?: ArrivalInstruction[]
  check_in_time?: string
  check_out_time?: string
  is_superhost?: boolean
  is_guest_favorite?: boolean
}

export type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc'

export interface PublicCategory {
  id: number
  name: string
  slug?: string
  description?: string | null
  icon_url: string | null
  active: boolean
}

export interface LodgingSearchFilters {
  q?: string
  city?: string
  check_in?: string          // YYYY-MM-DD
  check_out?: string         // YYYY-MM-DD
  guests?: number
  bedrooms?: number
  min_price?: number
  max_price?: number
  type?: string              // nombre de la categoría de alojamiento
  category_id?: number
  min_rating?: number
  amenities?: string[]       // nombres de amenidades
  sort?: SortOption
}

export interface PublicExperience {
  id: number
  name: string
  slug: string
  description: string
  price: number
  duration: string | null
  duration_hours: number | null
  image_url: string | null
  category_id: number | null
  category: { id: number; name: string } | null
  city: string
  state: string
  rating: number
  reviews_count: number
  max_guests: number
  host_name: string
  includes: string[]
  featured?: boolean
}

export type ExperienceDurationFilter = 'short' | 'medium' | 'full_day'

export interface ExperienceSearchFilters {
  q?: string
  city?: string
  category?: string
  category_id?: number
  date?: string
  guests?: number
  min_price?: number
  max_price?: number
  duration?: ExperienceDurationFilter
  min_rating?: number
  sort?: SortOption
}

export type ServiceAvailability = 'inmediata' | '24h' | '48h'

export interface PublicService {
  id: number
  name: string
  slug: string
  description: string
  price: number
  price_unit: string
  image_url: string | null
  category_id: number | null
  category: { id: number; name: string } | null
  city: string
  coverage: string
  rating: number
  reviews_count: number
  availability: ServiceAvailability
  provider_name: string
  highlights: string[]
  featured?: boolean
}

export interface ServiceSearchFilters {
  q?: string
  city?: string
  category?: string
  category_id?: number
  date?: string
  min_price?: number
  max_price?: number
  availability?: ServiceAvailability
  min_rating?: number
  sort?: SortOption
}

export interface Paginated<T> {
  items: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export type StayCategory = string
