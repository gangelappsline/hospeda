import type {
  ExperienceSearchFilters,
  FeaturedStay,
  LodgingAddress,
  LodgingAmenity,
  LodgingDetail,
  LodgingPhoto,
  LodgingReview,
  LodgingSearchFilters,
  LodgingType,
  PublicCategory,
  PublicExperience,
  PublicService,
  ServiceAvailability,
  ServiceSearchFilters,
  SortOption,
} from '@/types/public'
import {
  FALLBACK_EXPERIENCE_CATEGORIES,
  FALLBACK_EXPERIENCES,
  FALLBACK_LODGING_CATEGORIES,
  FALLBACK_LODGINGS,
  FALLBACK_SERVICE_CATEGORIES,
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
  return Boolean(API_BASE_URL)
}

interface ApiListEnvelope<T> {
  success?: boolean
  data?: T[]
  message?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Extrae de forma segura un texto legible aunque la API devuelva un objeto
 * anidado (por ejemplo { id, name }) en lugar de un string plano.
 */
function toDisplayString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (isRecord(value)) {
    const candidate =
      value.name ??
      value.title ??
      value.label ??
      value.formatted_address ??
      value.full_name
    if (typeof candidate === 'string') return candidate
    if (typeof candidate === 'number') return String(candidate)
  }
  return ''
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

/**
 * Normaliza el conteo de reseñas tanto cuando la API devuelve un número
 * como cuando devuelve el arreglo de objetos de reseña [{ id, author, rating, comment, created_at }].
 */
function normalizeReviewsCount(
  reviewsRaw: unknown,
  reviewsCountRaw?: unknown
): number {
  if (reviewsCountRaw !== undefined && reviewsCountRaw !== null) {
    return toSafeNumber(reviewsCountRaw, 0)
  }
  if (Array.isArray(reviewsRaw)) {
    return reviewsRaw.length
  }
  return toSafeNumber(reviewsRaw, 0)
}

function normalizeReviewsList(
  reviewsListRaw: unknown,
  reviewsRaw?: unknown
): LodgingReview[] {
  const source = Array.isArray(reviewsListRaw)
    ? reviewsListRaw
    : Array.isArray(reviewsRaw)
      ? reviewsRaw
      : []

  return source
    .filter(isRecord)
    .map((item, idx) => {
      const authorRaw = item.author
      const authorObj = isRecord(authorRaw) ? authorRaw : null

      const authorName =
        toDisplayString(item.author_name) ||
        (typeof authorRaw === 'string'
          ? authorRaw
          : toDisplayString(authorObj?.name ?? authorObj?.full_name)) ||
        'Huésped'

      const rawPhoto =
        toDisplayString(item.author_photo) ||
        toDisplayString(authorObj?.photo ?? authorObj?.avatar ?? authorObj?.photo_url)

      const authorLocation =
        toDisplayString(item.author_location) ||
        toDisplayString(authorObj?.location ?? authorObj?.city)

      return {
        id: toSafeNumber(item.id, idx + 1),
        author_name: authorName,
        author_photo: resolveMediaUrl(rawPhoto || null),
        author_location: authorLocation || undefined,
        rating: toSafeNumber(item.rating, 5),
        comment: toDisplayString(item.comment),
        created_at: toDisplayString(item.created_at) || new Date().toISOString(),
      }
    })
}

function normalizeLodgingType(
  rawType: unknown,
  fallbackId?: unknown
): LodgingType {
  if (isRecord(rawType)) {
    return {
      id: toSafeNumber(rawType.id ?? fallbackId, 0),
      name: toDisplayString(rawType.name ?? rawType.title) || 'Alojamiento',
    }
  }
  if (typeof rawType === 'string' && rawType.trim() !== '') {
    return { id: toSafeNumber(fallbackId, 0), name: rawType }
  }
  return { id: toSafeNumber(fallbackId, 0), name: 'Alojamiento' }
}

function normalizeAddress(rawAddress: unknown): LodgingAddress | null {
  if (!isRecord(rawAddress)) return null

  const street = toDisplayString(rawAddress.street)
  const city = toDisplayString(rawAddress.city)
  const state = toDisplayString(rawAddress.state)
  const country = toDisplayString(rawAddress.country)
  const zip_code = toDisplayString(rawAddress.zip_code)
  const formatted_address =
    toDisplayString(rawAddress.formatted_address) ||
    [city, state, country].filter(Boolean).join(', ')

  const rawLat =
    rawAddress.latitude !== undefined && rawAddress.latitude !== null
      ? toSafeNumber(rawAddress.latitude, Number.NaN)
      : Number.NaN
  const rawLng =
    rawAddress.longitude !== undefined && rawAddress.longitude !== null
      ? toSafeNumber(rawAddress.longitude, Number.NaN)
      : Number.NaN

  return {
    street,
    city,
    state,
    country,
    zip_code,
    formatted_address,
    latitude: Number.isFinite(rawLat) ? rawLat : undefined,
    longitude: Number.isFinite(rawLng) ? rawLng : undefined,
  }
}

function normalizePhotos(rawPhotos: unknown): LodgingPhoto[] {
  if (!Array.isArray(rawPhotos)) return []
  return rawPhotos
    .filter(isRecord)
    .map((p, idx) => {
      const photo =
        resolveMediaUrl(toDisplayString(p.photo) || toDisplayString(p.url)) ?? ''
      const thumbnail =
        resolveMediaUrl(
          toDisplayString(p.thumbnail) ||
            toDisplayString(p.photo) ||
            toDisplayString(p.url)
        ) ?? photo
      return {
        id: toSafeNumber(p.id, idx + 1),
        photo,
        thumbnail,
      }
    })
    .filter((p) => p.photo !== '' || p.thumbnail !== '')
}

function normalizeAmenityNames(rawAmenities: unknown): string[] {
  if (!Array.isArray(rawAmenities)) return []
  return rawAmenities
    .map((item) => {
      if (typeof item === 'string') return item
      if (isRecord(item)) {
        return (
          toDisplayString(item.name) ||
          toDisplayString(item.amenity)
        )
      }
      return ''
    })
    .filter((name) => name.trim() !== '')
}

function normalizeDetailAmenities(rawAmenities: unknown): LodgingAmenity[] {
  if (!Array.isArray(rawAmenities)) return []
  return rawAmenities
    .map((item, idx): LodgingAmenity | null => {
      if (typeof item === 'string') {
        return {
          id: idx + 1,
          amenity_id: idx + 1,
          name: item,
          icon: item,
        }
      }
      if (isRecord(item)) {
        const nested = isRecord(item.amenity) ? item.amenity : null
        const name =
          toDisplayString(item.name) || toDisplayString(nested?.name)
        if (!name) return null
        return {
          id: toSafeNumber(item.id, idx + 1),
          amenity_id: toSafeNumber(item.amenity_id ?? nested?.id, idx + 1),
          name,
          icon:
            toDisplayString(item.icon) ||
            toDisplayString(nested?.icon) ||
            name,
        }
      }
      return null
    })
    .filter((item): item is LodgingAmenity => item !== null)
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

function mapLodging(raw: Record<string, unknown>): FeaturedStay {
  const address = normalizeAddress(raw.address)
  const amenities = normalizeAmenityNames(raw.amenities)
  const title = toDisplayString(raw.title) || 'Sin título'
  const id = toSafeNumber(raw.id, 0)

  const base: FeaturedStay = {
    id,
    title,
    slug: toDisplayString(raw.slug) || String(id),
    description: toDisplayString(raw.description) || undefined,
    address,
    rating: toSafeNumber(raw.rating, 0),
    reviews: normalizeReviewsCount(raw.reviews, raw.reviews_count),
    guests: toSafeNumber(raw.capacity ?? raw.guests, 1),
    bedrooms: toSafeNumber(raw.bedrooms, 0),
    beds:
      raw.beds !== undefined && raw.beds !== null
        ? toSafeNumber(raw.beds, 0)
        : undefined,
    bathrooms:
      raw.bathrooms !== undefined && raw.bathrooms !== null
        ? toSafeNumber(raw.bathrooms, 1)
        : null,
    price: toSafeNumber(raw.base_price ?? raw.price, 0),
    photos: normalizePhotos(raw.photos),
    type: normalizeLodgingType(
      raw.type ?? raw.category ?? raw.lodging_category,
      raw.type_id ?? raw.category_id ?? raw.lodging_category_id
    ),
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

function parseDurationHours(
  duration?: string | null,
  explicit?: unknown
): number | null {
  if (typeof explicit === 'number' && Number.isFinite(explicit)) return explicit
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

function normalizeCategoryRef(
  rawCategory: unknown,
  fallbackId?: unknown
): { id: number; name: string } | null {
  if (isRecord(rawCategory)) {
    const name = toDisplayString(rawCategory.name ?? rawCategory.title)
    if (!name) return null
    return {
      id: toSafeNumber(rawCategory.id ?? fallbackId, 0),
      name,
    }
  }
  if (typeof rawCategory === 'string' && rawCategory.trim() !== '') {
    return {
      id: toSafeNumber(fallbackId, 0),
      name: rawCategory,
    }
  }
  return null
}

function normalizeStringList(rawList: unknown, fallback: string[]): string[] {
  if (!Array.isArray(rawList)) return fallback
  const mapped = rawList
    .map((item) => toDisplayString(item))
    .filter((item) => item.trim() !== '')
  return mapped.length > 0 ? mapped : fallback
}

function mapExperience(raw: Record<string, unknown>): PublicExperience {
  const id = toSafeNumber(raw.id, 0)
  const name =
    toDisplayString(raw.name ?? raw.title) || `Experiencia ${id}`
  const rawSlug = toDisplayString(raw.slug)
  const slug =
    rawSlug ||
    normalizeText(name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `experiencia-${id}`

  const durationStr = toDisplayString(raw.duration) || null
  const category = normalizeCategoryRef(raw.category, raw.category_id)
  const imageStr =
    toDisplayString(raw.image_url) || toDisplayString(raw.image) || null

  return {
    id,
    name,
    slug,
    description:
      toDisplayString(raw.description) ||
      'Experiencia local guiada por expertos certificados de la comunidad Hospeda.',
    price: toSafeNumber(raw.price ?? raw.base_price, 0),
    duration: durationStr,
    duration_hours: parseDurationHours(durationStr, raw.duration_hours),
    image_url: resolveMediaUrl(imageStr),
    category_id:
      raw.category_id !== undefined && raw.category_id !== null
        ? toSafeNumber(raw.category_id, 0)
        : (category?.id ?? null),
    category,
    city: toDisplayString(raw.city) || 'México',
    state: toDisplayString(raw.state),
    rating: toSafeNumber(raw.rating, 4.9),
    reviews_count: normalizeReviewsCount(
      raw.reviews,
      raw.reviews_count ?? 24
    ),
    max_guests: toSafeNumber(raw.max_guests ?? raw.capacity, 10),
    host_name:
      toDisplayString(raw.host_name ?? raw.host ?? raw.owner) ||
      'Anfitrión Hospeda',
    includes: normalizeStringList(raw.includes, [
      'Guía certificado',
      'Materiales incluidos',
    ]),
  }
}

function normalizeAvailability(value: unknown): ServiceAvailability {
  const norm = normalizeText(toDisplayString(value))
  if (norm.includes('48')) return '48h'
  if (norm.includes('24')) return '24h'
  return 'inmediata'
}

function mapService(raw: Record<string, unknown>): PublicService {
  const id = toSafeNumber(raw.id, 0)
  const name = toDisplayString(raw.name ?? raw.title) || `Servicio ${id}`
  const rawSlug = toDisplayString(raw.slug)
  const slug =
    rawSlug ||
    normalizeText(name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `servicio-${id}`

  const category = normalizeCategoryRef(raw.category, raw.category_id)
  const city = toDisplayString(raw.city) || 'Todo México'
  const imageStr =
    toDisplayString(raw.image_url) || toDisplayString(raw.image) || null

  return {
    id,
    name,
    slug,
    description:
      toDisplayString(raw.description) ||
      'Servicio verificado por Hospeda disponible para complementar tu estancia.',
    price: toSafeNumber(raw.price ?? raw.base_price, 0),
    price_unit: toDisplayString(raw.price_unit) || 'por servicio',
    image_url: resolveMediaUrl(imageStr),
    category_id:
      raw.category_id !== undefined && raw.category_id !== null
        ? toSafeNumber(raw.category_id, 0)
        : (category?.id ?? null),
    category,
    city,
    coverage: toDisplayString(raw.coverage) || city || 'Disponible en tu destino',
    rating: toSafeNumber(raw.rating, 4.9),
    reviews_count: normalizeReviewsCount(
      raw.reviews,
      raw.reviews_count ?? 32
    ),
    availability: normalizeAvailability(raw.availability),
    provider_name:
      toDisplayString(raw.provider_name ?? raw.provider ?? raw.owner) ||
      'Proveedor Verificado Hospeda',
    highlights: normalizeStringList(raw.highlights, [
      'Proveedor verificado',
      'Atención en tu alojamiento',
    ]),
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

    if (typeNorm || filters.category_id != null) {
      const matchesId =
        filters.category_id != null &&
        stay.type.id > 0 &&
        stay.type.id === filters.category_id
      const matchesName =
        typeNorm !== '' && normalizeText(stay.type.name) === typeNorm
      if (!matchesId && !matchesName) {
        return false
      }
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

    if (catNorm || filters.category_id != null) {
      const matchesId =
        filters.category_id != null &&
        exp.category_id != null &&
        exp.category_id > 0 &&
        exp.category_id === filters.category_id
      const matchesName =
        catNorm !== '' &&
        normalizeText(exp.category?.name ?? '') === catNorm
      if (!matchesId && !matchesName) {
        return false
      }
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
      if (filters.duration === 'medium' && (hours <= 2.5 || hours > 5.5))
        return false
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

    if (catNorm || filters.category_id != null) {
      const matchesId =
        filters.category_id != null &&
        srv.category_id != null &&
        srv.category_id > 0 &&
        srv.category_id === filters.category_id
      const matchesName =
        catNorm !== '' &&
        normalizeText(srv.category?.name ?? '') === catNorm
      if (!matchesId && !matchesName) {
        return false
      }
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

function extractDataList(
  json: unknown
): Record<string, unknown>[] {
  if (Array.isArray(json)) {
    return json.filter(isRecord)
  }
  if (isRecord(json)) {
    if (Array.isArray(json.data)) {
      return json.data.filter(isRecord)
    }
    if (isRecord(json.data) && Array.isArray(json.data.data)) {
      return json.data.data.filter(isRecord)
    }
  }
  return []
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
        const json: ApiListEnvelope<Record<string, unknown>> | unknown =
          await response.json()
        const rawList = extractDataList(json)
        const mapped = rawList
          .filter(
            (l) =>
              toDisplayString(l.status) === 'published' &&
              Boolean(toDisplayString(l.title)) &&
              isRecord(l.address)
          )
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
        const json: unknown = await response.json()
        const rawList = extractDataList(json)
        return rawList
          .filter(
            (l) =>
              toDisplayString(l.status) === 'published' &&
              Boolean(toDisplayString(l.title)) &&
              isRecord(l.address)
          )
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
        const json: unknown = await response.json()
        const raw =
          isRecord(json) && json.success !== false && isRecord(json.data)
            ? json.data
            : null

        if (raw) {
          const ownerObj = isRecord(raw.owner) ? raw.owner : null
          const reviewsList = normalizeReviewsList(
            raw.reviews_list,
            raw.reviews
          )

          return {
            id: toSafeNumber(raw.id, 0),
            title: toDisplayString(raw.title) || 'Sin título',
            description: toDisplayString(raw.description),
            slug: toDisplayString(raw.slug) || slug,
            base_price: toSafeNumber(raw.base_price, 0),
            cleaning_fee: toSafeNumber(raw.cleaning_fee, 0),
            service_fee: toSafeNumber(raw.service_fee, 0),
            security_deposit: toSafeNumber(raw.security_deposit, 0),
            bathrooms: toSafeNumber(raw.bathrooms, 1),
            bedrooms: toSafeNumber(raw.bedrooms, 0),
            beds: toSafeNumber(raw.beds, 0),
            guests: toSafeNumber(raw.capacity ?? raw.guests, 1),
            rating: toSafeNumber(raw.rating, 0),
            reviews: normalizeReviewsCount(raw.reviews, raw.reviews_count),
            reviews_list: reviewsList,
            status: toDisplayString(raw.status) || 'published',
            type: normalizeLodgingType(
              raw.type ?? raw.category ?? raw.lodging_category,
              raw.type_id ?? raw.category_id ?? raw.lodging_category_id
            ),
            owner: {
              id: toSafeNumber(ownerObj?.id, 0),
              name: toDisplayString(ownerObj?.name ?? raw.owner) || 'Anfitrión',
              photo: resolveMediaUrl(
                toDisplayString(ownerObj?.photo ?? ownerObj?.avatar) || null
              ),
              is_superhost: Boolean(ownerObj?.is_superhost ?? raw.is_superhost),
              reviews_count: normalizeReviewsCount(
                ownerObj?.reviews,
                ownerObj?.reviews_count
              ),
              rating:
                ownerObj?.rating !== undefined
                  ? toSafeNumber(ownerObj.rating, 5)
                  : undefined,
            },
            amenities: normalizeDetailAmenities(raw.amenities),
            address: normalizeAddress(raw.address),
            photos: normalizePhotos(raw.photos),
            arrival_instructions: Array.isArray(raw.arrival_instructions)
              ? raw.arrival_instructions
              : undefined,
            is_superhost: Boolean(raw.is_superhost),
            is_guest_favorite: Boolean(raw.is_guest_favorite),
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
        const json: unknown = await response.json()
        const rawList = extractDataList(json)
        const mapped = rawList
          .filter(
            (item) =>
              item.active === undefined ||
              item.active === true ||
              Number(item.active) === 1
          )
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
        const json: unknown = await response.json()
        const rawList = extractDataList(json)
        const mapped = rawList
          .filter(
            (item) =>
              item.active === undefined ||
              item.active === true ||
              Number(item.active) === 1
          )
          .map(mapService)
        return filterAndSortServices(mapped, filters)
      }
    } catch {
      // Fallback visual cuando el endpoint público aún no responde
    }
  }

  return filterAndSortServices(FALLBACK_SERVICES, filters)
}

function mapPublicCategory(
  raw: Record<string, unknown>,
  fallbackIndex: number
): PublicCategory | null {
  const name = toDisplayString(raw.name ?? raw.title).trim()
  if (!name) return null

  const active =
    raw.active === undefined || raw.active === null
      ? true
      : raw.active === true ||
        Number(raw.active) === 1 ||
        raw.active === 'true'

  const iconRaw =
    toDisplayString(raw.icon_url ?? raw.logo_url ?? raw.icon ?? raw.logo) ||
    null

  const rawSlug = toDisplayString(raw.slug)
  const slug =
    rawSlug ||
    normalizeText(name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  return {
    id: toSafeNumber(raw.id, fallbackIndex + 1),
    name,
    slug,
    description: toDisplayString(raw.description ?? raw.hint) || null,
    icon_url: resolveMediaUrl(iconRaw),
    active,
  }
}

async function fetchPublicCategories(
  endpointPath: string,
  fallbackCategories: PublicCategory[]
): Promise<PublicCategory[]> {
  if (canCallApi()) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpointPath}`)
      if (response.ok) {
        const json: unknown = await response.json()
        const rawList = extractDataList(json)
        return rawList
          .map((item, index) => mapPublicCategory(item, index))
          .filter(
            (category): category is PublicCategory =>
              category !== null && category.active
          )
      }
    } catch {
      // Fallback visual cuando el endpoint público no está accesible
    }
  }

  return fallbackCategories
}

export async function getPublicLodgingCategories(): Promise<PublicCategory[]> {
  return fetchPublicCategories(
    '/lodging-categories',
    FALLBACK_LODGING_CATEGORIES
  )
}

export async function getPublicExperienceCategories(): Promise<PublicCategory[]> {
  return fetchPublicCategories(
    '/experience-categories',
    FALLBACK_EXPERIENCE_CATEGORIES
  )
}

export async function getPublicServiceCategories(): Promise<PublicCategory[]> {
  return fetchPublicCategories(
    '/service-categories',
    FALLBACK_SERVICE_CATEGORIES
  )
}

