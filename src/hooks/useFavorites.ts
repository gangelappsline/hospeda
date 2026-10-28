import { useCallback, useEffect, useState } from 'react'
import {
  FAVORITES_CHANGED_EVENT,
  readFavorites,
  removeFavorite,
  toggleFavorite,
  type FavoriteStay,
} from '@/utils/favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStay[]>(() =>
    readFavorites()
  )

  useEffect(() => {
    const sync = () => setFavorites(readFavorites())

    window.addEventListener(FAVORITES_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.some((favorite) => favorite.slug === slug),
    [favorites]
  )

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }
}
