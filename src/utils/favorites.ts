import { getUser } from './authStorage'

/** Resumen de un alojamiento guardado, suficiente para pintar la tarjeta. */
export interface FavoriteStay {
  id: number
  slug: string
  title: string
  cover: string | null
  city: string
  price: number
  rating: number
  reviews: number
  guests: number
  bedrooms: number
  savedAt: string
}

export const FAVORITES_CHANGED_EVENT = 'hospeda:favorites-changed'

function storageKey(): string {
  const user = getUser<{ id?: number }>()
  const userId = user?.id ?? 'anon'
  return `hospeda:favorites:${userId}`
}

function isFavoriteStay(value: unknown): value is FavoriteStay {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<FavoriteStay>
  return typeof candidate.slug === 'string' && candidate.slug.length > 0
}

export function readFavorites(): FavoriteStay[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey())
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFavoriteStay)
  } catch {
    return []
  }
}

function persist(favorites: FavoriteStay[]) {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(favorites))
  } catch {
    // Si el almacenamiento está lleno o bloqueado, se ignora silenciosamente.
  }
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT))
}

export function isFavoriteSlug(slug: string): boolean {
  return readFavorites().some((favorite) => favorite.slug === slug)
}

/** Alterna el favorito y devuelve el estado final (true = guardado). */
export function toggleFavorite(stay: Omit<FavoriteStay, 'savedAt'>): boolean {
  const favorites = readFavorites()
  const exists = favorites.some((favorite) => favorite.slug === stay.slug)

  if (exists) {
    persist(favorites.filter((favorite) => favorite.slug !== stay.slug))
    return false
  }

  persist([{ ...stay, savedAt: new Date().toISOString() }, ...favorites])
  return true
}

export function removeFavorite(slug: string): void {
  persist(readFavorites().filter((favorite) => favorite.slug !== slug))
}
