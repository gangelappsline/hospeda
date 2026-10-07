import type { FeaturedStay, LodgingDetail, LodgingSearchFilters } from '@/types/public'

const API_BASE_URL = 'http://192.168.1.202:8000/api/v1/web'

// Forma cruda de un lodging tal como lo devuelve la API
interface ApiLodging {
  id: number
  title: string | null
  slug: string | null
  base_price: string | null
  capacity: number
  bedrooms: number
  bathrooms: number | null
  rating: string
  status: string
  type: { id: number; name: string }
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

interface ApiResponse {
  success: boolean
  data: ApiLodging[]
  message: string
}

function mapLodging(raw: ApiLodging): FeaturedStay {
  return {
    id: raw.id,
    title: raw.title ?? 'Sin título',
    slug: raw.slug ?? '',
    address: raw.address,
    rating: Number(raw.rating) || 0,
    guests: raw.capacity,
    bedrooms: raw.bedrooms,
    bathrooms: raw.bathrooms ?? null,
    price: Number(raw.base_price) || 0,
    photos: raw.photos ?? [],
    type: raw.type,
    is_superhost: false, // la API no lo expone aún
  }
}

/**
 * Convierte los filtros a query string.
 * Omite claves vacías/undefined/null.
 */
function buildQuery(filters: LodgingSearchFilters): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(`${key}[]`, String(v)))
    } else {
      params.set(key, String(value))
    }
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function searchLodgings(
  filters: LodgingSearchFilters = {}
): Promise<FeaturedStay[]> {
  const response = await fetch(
    `${API_BASE_URL}/lodgings${buildQuery(filters)}`
  )

  if (!response.ok) {
    throw new Error(`Error al buscar alojamientos: ${response.status}`)
  }

  const json: ApiResponse = await response.json()

  if (!json.success) {
    throw new Error(json.message ?? 'Error al buscar alojamientos')
  }

  return (json.data ?? [])
    .filter((l) => l.status === 'published' && l.title && l.address)
    .map(mapLodging)
}

export async function getFeaturedStays(): Promise<FeaturedStay[]> {
  const response = await fetch(`${API_BASE_URL}/lodgings`)

  if (!response.ok) {
    throw new Error(`Error al obtener alojamientos: ${response.status}`)
  }

  const json: ApiResponse = await response.json()

  if (!json.success) {
    throw new Error(json.message ?? 'Error desconocido al obtener alojamientos')
  }

  return (json.data ?? [])
    // Descartamos drafts y registros incompletos
    .filter((l) => l.status === 'published' && l.title && l.address)
    .map(mapLodging)
}

export async function getLodgingBySlug(slug: string): Promise<LodgingDetail> {
  const response = await fetch(`${API_BASE_URL}/lodgings/${slug}`)

  if (!response.ok) {
    throw new Error(`Error al obtener el alojamiento: ${response.status}`)
  }

  const json = await response.json()
  if (!json.success) throw new Error(json.message)

  const raw = json.data

  return {
    id: raw.id,
    title: raw.title ?? 'Sin título',
    description: raw.description ?? '',
    slug: raw.slug ?? '',
    base_price: Number(raw.base_price) || 0,
    cleaning_fee: Number(raw.cleaning_fee) || 0,
    service_fee: Number(raw.service_fee) || 0,
    security_deposit: Number(raw.security_deposit) || 0,
    bathrooms: raw.bathrooms,
    bedrooms: raw.bedrooms,
    beds: raw.beds,
    guests: raw.capacity,
    rating: Number(raw.rating) || 0,
    reviews: raw.reviews,
    reviews_list: raw.reviews_list ?? [],
    status: raw.status,
    type: raw.type,
    owner: raw.owner,
    amenities: raw.amenities ?? [],
    address: raw.address,
    photos: raw.photos ?? [],
    is_superhost: raw.is_superhost ?? false,
    is_guest_favorite: raw.is_guest_favorite ?? false,
  }
}