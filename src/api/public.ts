import type {
  ExperienceSearchFilters,
  FeaturedStay,
  LodgingDetail,
  LodgingSearchFilters,
  PublicExperience,
  PublicService,
  ServiceAvailability,
  ServiceSearchFilters,
  SortOption,
} from '@/types/public'
import {
  FALLBACK_EXPERIENCES,
  FALLBACK_LODGINGS,
  FALLBACK_SERVICES,
  getFallbackLodgingBySlug,
  normalizeText,
  resolveStayCoordinates,
} from '@/utils/exploreFallback'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

function canCallApi(): boolean {
  if (!API_BASE_URL) return false
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    API_BASE_URL.startsWith('http://')
  ) {
    return false
  }
  return true
}

// Forma cruda de un lodging tal como lo devuelve la API
interface ApiLodging {
  id: number
  title: string | null
  description?: string | null
  slug: string | null
  base_price: string | number | null
  capacity: number
  bedrooms: number
  beds?: number
  bathrooms: number | null
  rating: string | number
  reviews?: number
  status: string
  is_superhost?: boolean
  type: { id: number; name: string }
  amenities?: Array<{ id?: number; name: string } | string>
  address: {
    street: string
    city: string
    state: string
    country: string
    zip_code: string
    formatted_address: string
    latitude?: number | string
    longitude?: number | string
  } | null
  photos: Array<{ id: number; photo: string; thumbnail: string }>
}

interface ApiListEnvelope<T> {
  success?: boolean
  data?: T[]
  message?: string
}

interface ApiExperienceRaw {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  price: string | number
  duration?: string | null
  duration_hours?: number | null
  image_url?: string | null
  image?: string | null
  category_id?: number | null
  category?: { id: number; name: string } | null
  city?: string | null
  state?: string | null
  rating?: string | number | null
  reviews_count?: number | null
  max_guests?: number | null
  host_name?: string | null
  includes?: string[] | null
  active?: boolean | number
}

interface ApiServiceRaw {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  price: string | number
  price_unit?: string | null
  image_url?: string | null
  image?: string | null
  category_id?: number | null
  category?: { id: number; name: string } | null
  city?: string | null
  coverage?: string | null
  rating?: string | number | null
  reviews_count?: number | null
  availability?: string | null
  provider_name?: string | null
  highlights?: string[] | null
  active?: boolean | number
}

function resolveMediaUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || rawUrl.trim() === '') return null
  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('blob:') ||
    rawUrl.startsWith('data:')
  ) {
    return rawUrl
  }
  const storageRoot = API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '')
  const cleanPath = rawUrl.replace(/^\/?(storage\/)?/, '')
  return storageRoot ? `${storageRoot}/storage/${cleanPath}` : `/storage/${cleanPath}`
}

async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    window.clearTimeout(timer)
  }
}

function mapLodging(raw: ApiLodging): FeaturedStay {
  const rawLat = raw.address?.latitude !== undefined ? Number(raw.address.latitude) : undefined
  const rawLng = raw.address?.longitude !== undefined ? Number(raw.address.longitude) : undefined
  const amenities = (raw.amenities ?? []).map((a) =>
    typeof a === 'string' ? a : a.name
  )

  const base: FeaturedStay = {
    id: raw.id,
    title: raw.title ?? 'Sin título',
    slug: raw.slug ?? String(raw.id),
    description: raw.description ?? undefined,
    address: raw.address
      ? {
          street: raw.address.street,
          city: raw.address.city,
          state: raw.address.state,
          country: raw.address.country,
          zip_code: raw.address.zip_code,
          formatted_address: raw.address.formatted_address,
          latitude: rawLat && !Number.isNaN(rawLat) ? rawLat : undefined,
          longitude: rawLng && !Number.isNaN(rawLng) ? rawLng : undefined,
        }
      : null,
    rating: Number(raw.rating) || 0,
    reviews: raw.reviews,
    guests: raw.capacity,
    bedrooms: raw.bedrooms,
    beds: raw.beds,
    bathrooms: raw.bathrooms ?? null,
    price: Number(raw.base_price) || 0,
    photos: raw.photos ?? [],
    type: raw.type,
    amenities: amenities.length > 0 ? amenities : undefined,
    is_superhost: Boolean(raw.is_superhost),
  }

  const [lat, lng] = resolveStayCoordinates(base)
  return {
    ...base,
    latitude: lat,
    longitude: lng,
  }
}

function parseDurationHours(duration?: string | null, explicit?: number | null): number | null {
  if (typeof explicit === 'number' && !Number.isNaN(explicit)) return explicit
  if (!duration) return null
  const normalized = normalizeText(duration)
  if (normalized.includes('dia completo')) return 8
  if (normalized.includes('medio dia')) return 4
  const match = normalized.match(/(\d+(?:[.,]\d+)?)/)
  if (!match) return null
  const val = Number(match[1].replace(',', '.'))
  if (Number.isNaN(val)) return null
  if (normalized.includes('min')) return val / 60
  return val
}

function mapExperience(raw: ApiExperienceRaw): PublicExperience {
  const slug =
    raw.slug ??
    normalizeText(raw.name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  return {
    id: Number(raw.id),
    name: raw.name,
    slug: slug || `experiencia-${raw.id}`,
    description:
      raw.description ??
      'Experiencia local guiada por expertos certificados de la comunidad Hospeda.',
    price: Number(raw.price) || 0,
    duration: raw.duration ?? null,
    duration_hours: parseDurationHours(raw.duration, raw.duration_hours),
    image_url: resolveMediaUrl(raw.image_url ?? raw.image),
    category_id: raw.category_id ?? raw.category?.id ?? null,
    category: raw.category ?? null,
    city: raw.city ?? 'México',
    state: raw.state ?? '',
    rating: Number(raw.rating) || 4.9,
    reviews_count: raw.reviews_count ?? 24,
    max_guests: raw.max_guests ?? 10,
    host_name: raw.host_name ?? 'Anfitrión Hospeda',
    includes:
      raw.includes && raw.includes.length > 0
        ? raw.includes
        : ['Guía certificado', 'Materiales incluidos'],
  }
}

function normalizeAvailability(value?: string | null): ServiceAvailability {
  const norm = normalizeText(value ?? '')
  if (norm.includes('48')) return '48h'
  if (norm.includes('24')) return '24h'
  return 'inmediata'
}

function mapService(raw: ApiServiceRaw): PublicService {
  const slug =
    raw.slug ??
    normalizeText(raw.name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  return {
    id: Number(raw.id),
    name: raw.name,
    slug: slug || `servicio-${raw.id}`,
    description:
      raw.description ??
      'Servicio verificado por Hospeda disponible para complementar tu estancia.',
    price: Number(raw.price) || 0,
    price_unit: raw.price_unit ?? 'por servicio',
    image_url: resolveMediaUrl(raw.image_url ?? raw.image),
    category_id: raw.category_id ?? raw.category?.id ?? null,
    category: raw.category ?? null,
    city: raw.city ?? 'Todo México',
    coverage: raw.coverage ?? raw.city ?? 'Disponible en tu destino',
    rating: Number(raw.rating) || 4.9,
    reviews_count: raw.reviews_count ?? 32,
    availability: normalizeAvailability(raw.availability),
    provider_name: raw.provider_name ?? 'Proveedor Verificado Hospeda',
    highlights:
      raw.highlights && raw.highlights.length > 0
        ? raw.highlights
        : ['Proveedor verificado', 'Atención en tu alojamiento'],
  }
}

/**
 * Convierte un objeto de filtros a query string omitiendo valores vacíos.
 */
function buildQuery(filters: object): string {
  const params = new URLSearchParams()
  Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
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

function sortItems<T extends { price: number; rating: number }>(
  items: T[],
  sort?: SortOption
): T[] {
  const copy = [...items]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'rating_desc':
      return copy.sort((a, b) => b.rating - a.rating)
    default:
      return copy
  }
}

export function filterAndSortLodgings(
  items: FeaturedStay[],
  filters: LodgingSearchFilters
): FeaturedStay[] {
  const qNorm = filters.q ? normalizeText(filters.q) : ''
  const cityNorm = filters.city ? normalizeText(filters.city) : ''
  const typeNorm = filters.type ? normalizeText(filters.type) : ''

  const filtered = items.filter((stay) => {
    if (qNorm) {
      const haystack = normalizeText(
        [
          stay.title,
          stay.description ?? '',
          stay.type.name,
          stay.address?.city ?? '',
          stay.address?.state ?? '',
          stay.address?.formatted_address ?? '',
        ].join(' ')
      )
      if (!haystack.includes(qNorm)) return false
    }

    if (cityNorm) {
      const locationHaystack = normalizeText(
        [
          stay.address?.city ?? '',
          stay.address?.state ?? '',
          stay.address?.formatted_address ?? '',
          stay.title,
        ].join(' ')
      )
      if (!locationHaystack.includes(cityNorm)) return false
    }

    if (typeNorm && normalizeText(stay.type.name) !== typeNorm) {
      return false
    }

    if (filters.guests != null && stay.guests < filters.guests) {
      return false
    }

    if (filters.bedrooms != null && stay.bedrooms < filters.bedrooms) {
      return false
    }

    if (filters.min_price != null && stay.price < filters.min_price) {
      return false
    }

    if (filters.max_price != null && stay.price > filters.max_price) {
      return false
    }

    if (filters.min_rating != null && stay.rating < filters.min_rating) {
      return false
    }

    if (filters.amenities && filters.amenities.length > 0) {
      const stayAmenities = (stay.amenities ?? []).map(normalizeText)
      const matchesAll = filters.amenities.every((req) =>
        stayAmenities.some((a) => a.includes(normalizeText(req)))
      )
      if (!matchesAll) return false
    }

    return true
  })

  return sortItems(filtered, filters.sort)
}

export function filterAndSortExperiences(
  items: PublicExperience[],
  filters: ExperienceSearchFilters
): PublicExperience[] {
  const qNorm = filters.q ? normalizeText(filters.q) : ''
  const cityNorm = filters.city ? normalizeText(filters.city) : ''
  const catNorm = filters.category ? normalizeText(filters.category) : ''

  const filtered = items.filter((exp) => {
    if (qNorm) {
      const haystack = normalizeText(
        [
          exp.name,
          exp.description,
          exp.category?.name ?? '',
          exp.city,
          exp.state,
          exp.host_name,
          ...exp.includes,
        ].join(' ')
      )
      if (!haystack.includes(qNorm)) return false
    }

    if (cityNorm) {
      const loc = normalizeText(`${exp.city} ${exp.state} ${exp.name}`)
      if (!loc.includes(cityNorm)) return false
    }

    if (catNorm && normalizeText(exp.category?.name ?? '') !== catNorm) {
      return false
    }

    if (filters.guests != null && exp.max_guests < filters.guests) {
      return false
    }

    if (filters.min_price != null && exp.price < filters.min_price) {
      return false
    }

    if (filters.max_price != null && exp.price > filters.max_price) {
      return false
    }

    if (filters.min_rating != null && exp.rating < filters.min_rating) {
      return false
    }

    if (filters.duration) {
      const hours = exp.duration_hours ?? 3
      if (filters.duration === 'short' && hours > 2.5) return false
      if (filters.duration === 'medium' && (hours <= 2.5 || hours > 5.5)) return false
      if (filters.duration === 'full_day' && hours <= 5.5) return false
    }

    return true
  })

  return sortItems(filtered, filters.sort)
}

export function filterAndSortServices(
  items: PublicService[],
  filters: ServiceSearchFilters
): PublicService[] {
  const qNorm = filters.q ? normalizeText(filters.q) : ''
  const cityNorm = filters.city ? normalizeText(filters.city) : ''
  const catNorm = filters.category ? normalizeText(filters.category) : ''

  const filtered = items.filter((srv) => {
    if (qNorm) {
      const haystack = normalizeText(
        [
          srv.name,
          srv.description,
          srv.category?.name ?? '',
          srv.city,
          srv.coverage,
          srv.provider_name,
          ...srv.highlights,
        ].join(' ')
      )
      if (!haystack.includes(qNorm)) return false
    }

    if (cityNorm) {
      const loc = normalizeText(`${srv.city} ${srv.coverage} ${srv.name}`)
      if (!loc.includes(cityNorm)) return false
    }

    if (catNorm && normalizeText(srv.category?.name ?? '') !== catNorm) {
      return false
    }

    if (filters.min_price != null && srv.price < filters.min_price) {
      return false
    }

    if (filters.max_price != null && srv.price > filters.max_price) {
      return false
    }

    if (filters.min_rating != null && srv.rating < filters.min_rating) {
      return false
    }

    if (filters.availability && srv.availability !== filters.availability) {
      return false
    }

    return true
  })

  return sortItems(filtered, filters.sort)
}

export async function searchLodgings(
  filters: LodgingSearchFilters = {}
): Promise<FeaturedStay[]> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/lodgings${buildQuery(filters)}`
      )
      if (response.ok) {
        const json: ApiListEnvelope<ApiLodging> | ApiLodging[] = await response.json()
        const rawList = Array.isArray(json) ? json : (json.data ?? [])
        const mapped = rawList
          .filter((l) => l.status === 'published' && l.title && l.address)
          .map(mapLodging)
        return filterAndSortLodgings(mapped, filters)
      }
    } catch {
      // Fallback visual cuando la API local/remota no está accesible
    }
  }

  return filterAndSortLodgings(FALLBACK_LODGINGS, filters)
}

export async function getFeaturedStays(): Promise<FeaturedStay[]> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/lodgings`)
      if (response.ok) {
        const json: ApiListEnvelope<ApiLodging> | ApiLodging[] = await response.json()
        const rawList = Array.isArray(json) ? json : (json.data ?? [])
        return rawList
          .filter((l) => l.status === 'published' && l.title && l.address)
          .map(mapLodging)
      }
    } catch {
      // Fallback visual cuando la API no está accesible
    }
  }

  return FALLBACK_LODGINGS.slice(0, 6)
}

export async function getLodgingBySlug(slug: string): Promise<LodgingDetail> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/lodgings/${slug}`)
      if (response.ok) {
        const json = await response.json()
        if (json.success !== false && json.data) {
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
      }
    } catch {
      // Intenta resolver desde catálogo fallback si aplica
    }
  }

  const fallback = getFallbackLodgingBySlug(slug)
  if (fallback) return fallback

  throw new Error('No se encontró el alojamiento solicitado.')
}

export async function searchExperiences(
  filters: ExperienceSearchFilters = {}
): Promise<PublicExperience[]> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/experiences${buildQuery(filters)}`
      )
      if (response.ok) {
        const json: ApiListEnvelope<ApiExperienceRaw> | ApiExperienceRaw[] =
          await response.json()
        const rawList = Array.isArray(json) ? json : (json.data ?? [])
        const mapped = rawList
          .filter((item) => item.active === undefined || Boolean(Number(item.active)))
          .map(mapExperience)
        return filterAndSortExperiences(mapped, filters)
      }
    } catch {
      // Fallback visual cuando el endpoint público aún no responde
    }
  }

  return filterAndSortExperiences(FALLBACK_EXPERIENCES, filters)
}

export async function searchServices(
  filters: ServiceSearchFilters = {}
): Promise<PublicService[]> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/services${buildQuery(filters)}`
      )
      if (response.ok) {
        const json: ApiListEnvelope<ApiServiceRaw> | ApiServiceRaw[] =
          await response.json()
        const rawList = Array.isArray(json) ? json : (json.data ?? [])
        const mapped = rawList
          .filter((item) => item.active === undefined || Boolean(Number(item.active)))
          .map(mapService)
        return filterAndSortServices(mapped, filters)
      }
    } catch {
      // Fallback visual cuando el endpoint público aún no responde
    }
  }

  return filterAndSortServices(FALLBACK_SERVICES, filters)
}
