import { useEffect, useMemo, useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import AuthRequiredModal from '@/components/ui/AuthRequiredModal'
import { useFavorites } from '@/hooks/useFavorites'
import { getToken } from '@/utils/authStorage'
import {
  toggleFavorite as persistToggleFavorite,
  type FavoriteStay,
} from '@/utils/favorites'

export interface FavoriteStaySummary {
  id: number
  slug: string
  title: string
  cover?: string | null
  city?: string
  price: number
  rating?: number
  reviews?: number
  guests?: number
  bedrooms?: number
}

const PENDING_KEY = 'hospeda:pending-favorite'

interface Props {
  stay: FavoriteStaySummary
  /** `overlay` = botón circular sobre una imagen · `outline` = botón tipo tarjeta. */
  variant?: 'overlay' | 'outline'
  size?: 'sm' | 'md'
  /** Etiqueta cuando el alojamiento ya está guardado. */
  savedLabel?: string
  className?: string
}

/**
 * Botón de favoritos con control de sesión.
 * Si el usuario no ha iniciado sesión se muestra un modal para entrar o
 * registrarse en lugar de guardar el alojamiento.
 */
export default function FavoriteButton({
  stay,
  variant = 'overlay',
  size = 'md',
  savedLabel = 'Guardado',
  className = '',
}: Props) {
  const { isFavorite } = useFavorites()
  const [authOpen, setAuthOpen] = useState(false)
  const saved = isFavorite(stay.slug)

  const payload = useMemo<Omit<FavoriteStay, 'savedAt'>>(
    () => ({
      id: stay.id,
      slug: stay.slug,
      title: stay.title,
      cover: stay.cover ?? null,
      city: stay.city ?? '',
      price: stay.price,
      rating: stay.rating ?? 0,
      reviews: stay.reviews ?? 0,
      guests: stay.guests ?? 1,
      bedrooms: stay.bedrooms ?? 1,
    }),
    [
      stay.id,
      stay.slug,
      stay.title,
      stay.cover,
      stay.city,
      stay.price,
      stay.rating,
      stay.reviews,
      stay.guests,
      stay.bedrooms,
    ]
  )

  // Si la persona inició sesión justo después de tocar el corazón, se guarda
  // automáticamente al volver al alojamiento.
  useEffect(() => {
    if (!getToken()) return
    if (typeof window === 'undefined') return

    const pending = window.sessionStorage.getItem(PENDING_KEY)
    if (pending !== payload.slug) return

    window.sessionStorage.removeItem(PENDING_KEY)
    if (isFavorite(payload.slug)) return

    persistToggleFavorite(payload)
    toast.success('Guardado en favoritos', {
      description: 'Puedes consultarlo cuando quieras en tu lista.',
      action: {
        label: 'Ver favoritos',
        onClick: () => {
          window.location.assign('/favoritos')
        },
      },
    })
  }, [payload, isFavorite])

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!getToken()) {
      try {
        window.sessionStorage.setItem(PENDING_KEY, stay.slug)
      } catch {
        // Sin sessionStorage el modal sigue funcionando.
      }
      setAuthOpen(true)
      return
    }

    const nowSaved = persistToggleFavorite(payload)

    if (nowSaved) {
      toast.success('Guardado en favoritos', {
        description: 'Puedes consultarlo cuando quieras en tu lista.',
        action: {
          label: 'Ver favoritos',
          onClick: () => {
            window.location.assign('/favoritos')
          },
        },
      })
    } else {
      toast('Eliminado de favoritos', {
        description: 'Este alojamiento ya no está en tu lista.',
      })
    }
  }

  const iconSize = size === 'sm' ? 15 : 17
  const heart = (
    <Heart
      size={iconSize}
      className={
        saved
          ? 'fill-vivid-tangerine-500 text-vivid-tangerine-500'
          : 'text-cool-steel-700'
      }
    />
  )

  const label = saved ? savedLabel : 'Guardar'

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={
          saved ? 'Quitar de favoritos' : 'Guardar alojamiento en favoritos'
        }
        title={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        className={
          variant === 'overlay'
            ? `${
                size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
              } rounded-full bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5 flex items-center justify-center transition-all hover:bg-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-tangerine-400 cursor-pointer ${className}`
            : `w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-cool-steel-300 bg-white text-sm font-medium text-cool-steel-800 transition-colors hover:bg-cool-steel-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-tangerine-400 cursor-pointer ${className}`
        }
      >
        {variant === 'overlay' && heart}

        {variant === 'outline' && (
          <span className="flex items-center gap-2">
            {heart}
            <span>{saved ? label : 'Guardar en favoritos'}</span>
          </span>
        )}
      </button>

      <AuthRequiredModal
        open={authOpen}
        onClose={() => {
          try {
            window.sessionStorage.removeItem(PENDING_KEY)
          } catch {
            // Ignorar.
          }
          setAuthOpen(false)
        }}
        title="Inicia sesión para guardar en favoritos"
        redirectTo={`/alojamiento/${stay.slug}`}
      />
    </>
  )
}
