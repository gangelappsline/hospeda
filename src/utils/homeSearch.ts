import type { LodgingSearchFilters, SortOption } from '@/types/public'
import { toISODate } from './dates'

/** Amenidad que se activa automáticamente al viajar con mascotas. */
export const PET_FRIENDLY_AMENITY = 'Pet friendly'

/** Estado del formulario de búsqueda de la página principal. */
export interface HomeSearchDraft {
  destination: string
  checkIn: Date | null
  checkOut: Date | null
  adults: number
  children: number
  pets: number
  bedrooms: number | null
  minPrice: number | null
  maxPrice: number | null
  minRating: number | null
  amenities: string[]
  categoryId: number | null
  categoryName: string | null
}

export function createEmptyDraft(): HomeSearchDraft {
  return {
    destination: '',
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    pets: 0,
    bedrooms: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    amenities: [],
    categoryId: null,
    categoryName: null,
  }
}

export function getTotalGuests(draft: HomeSearchDraft): number {
  return draft.adults + draft.children
}

/** Huéspedes mínimos que se envían al API (1 es el valor por defecto). */
function guestsFilter(draft: HomeSearchDraft): number | undefined {
  const guests = getTotalGuests(draft)
  return guests > 1 ? guests : undefined
}

/** Convierte el formulario en filtros tipados para el API. */
export function draftToFilters(draft: HomeSearchDraft): LodgingSearchFilters {
  const filters: LodgingSearchFilters = {}

  const city = draft.destination.trim()
  if (city) filters.city = city

  if (draft.checkIn) filters.check_in = toISODate(draft.checkIn)
  if (draft.checkOut) filters.check_out = toISODate(draft.checkOut)

  const guests = guestsFilter(draft)
  if (guests !== undefined) filters.guests = guests

  if (draft.bedrooms != null) filters.bedrooms = draft.bedrooms
  if (draft.minPrice != null) filters.min_price = draft.minPrice
  if (draft.maxPrice != null) filters.max_price = draft.maxPrice
  if (draft.minRating != null) filters.min_rating = draft.minRating

  const amenities = [...draft.amenities]
  if (draft.pets > 0 && !amenities.includes(PET_FRIENDLY_AMENITY)) {
    amenities.push(PET_FRIENDLY_AMENITY)
  }
  if (amenities.length > 0) filters.amenities = amenities

  if (draft.categoryName) filters.type = draft.categoryName
  if (draft.categoryId != null) filters.category_id = draft.categoryId

  return filters
}

/** Serializa los filtros a query string (mismo formato que lee /alojamientos). */
export function filtersToSearchParams(
  filters: LodgingSearchFilters
): URLSearchParams {
  const params = new URLSearchParams()

  const setIfPresent = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  }

  setIfPresent('city', filters.city)
  setIfPresent('check_in', filters.check_in)
  setIfPresent('check_out', filters.check_out)
  setIfPresent('guests', filters.guests)
  setIfPresent('bedrooms', filters.bedrooms)
  setIfPresent('min_price', filters.min_price)
  setIfPresent('max_price', filters.max_price)
  setIfPresent('type', filters.type)
  setIfPresent('category_id', filters.category_id)
  setIfPresent('min_rating', filters.min_rating)
  setIfPresent('sort', filters.sort)

  filters.amenities?.forEach((amenity) => {
    params.append('amenities[]', amenity)
  })

  return params
}

/** Texto de query string listo para concatenar en un enlace. */
export function filtersToQueryString(filters: LodgingSearchFilters): string {
  const qs = filtersToSearchParams(filters).toString()
  return qs ? `?${qs}` : ''
}

/** Número de filtros "avanzados" activos (para el contador del hero). */
export function countAdvancedFilters(draft: HomeSearchDraft): number {
  return (
    (draft.bedrooms != null ? 1 : 0) +
    (draft.minPrice != null || draft.maxPrice != null ? 1 : 0) +
    (draft.minRating != null ? 1 : 0) +
    draft.amenities.length +
    (draft.pets > 0 ? 1 : 0) +
    (draft.categoryName ? 1 : 0)
  )
}

/** ¿El usuario ya seleccionó algo distinto de los valores por defecto? */
export function hasActiveSearch(draft: HomeSearchDraft): boolean {
  return (
    draft.destination.trim() !== '' ||
    draft.checkIn != null ||
    draft.checkOut != null ||
    getTotalGuests(draft) > 1 ||
    countAdvancedFilters(draft) > 0
  )
}

/** Filtros de una búsqueda ya aplicada + orden opcional. */
export function withSort(
  filters: LodgingSearchFilters,
  sort?: SortOption
): LodgingSearchFilters {
  return sort ? { ...filters, sort } : filters
}
