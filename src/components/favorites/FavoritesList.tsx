import { Link } from 'react-router-dom'
import {
  Heart,
  MapPin,
  Star,
  Search,
  Trash2,
  Users,
  BedDouble,
} from 'lucide-react'
import { toast } from 'sonner'
import { useFavorites } from '@/hooks/useFavorites'
import { formatMoney } from '@/utils/pricing'

interface Props {
  /** Mensaje vacío personalizado. */
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * Listado de alojamientos guardados. Se usa tanto en el panel del huésped
 * como en la página pública `/favoritos`.
 */
export default function FavoritesList({
  emptyTitle = 'Aún no tienes favoritos',
  emptyDescription = 'Cuando encuentres un alojamiento que te guste, toca el corazón para guardarlo aquí.',
}: Props) {
  const { favorites, removeFavorite } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cool-steel-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vivid-tangerine-50 border border-vivid-tangerine-100">
          <Heart size={24} className="text-vivid-tangerine-500" />
        </div>
        <h2 className="text-lg font-semibold text-cool-steel-900">{emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-cool-steel-500">
          {emptyDescription}
        </p>
        <Link
          to="/alojamientos"
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cool-steel-300 px-4 py-2.5 text-sm font-semibold text-cool-steel-800 transition-colors hover:bg-cool-steel-50"
        >
          <Search size={15} />
          Ver alojamientos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {favorites.map((favorite) => (
        <article
          key={favorite.slug}
          className="group overflow-hidden rounded-2xl border border-cool-steel-100 bg-white transition-all hover:border-cool-steel-200 hover:shadow-md"
        >
          <Link
            to={`/alojamiento/${favorite.slug}`}
            className="relative block aspect-[4/3] overflow-hidden bg-cool-steel-100"
          >
            {favorite.cover ? (
              <img
                src={favorite.cover}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-cool-steel-400">
                <Heart size={28} />
              </div>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                removeFavorite(favorite.slug)
                toast('Eliminado de favoritos', {
                  description: favorite.title,
                })
              }}
              aria-label="Quitar de favoritos"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5 transition-all hover:scale-105 hover:bg-white cursor-pointer"
            >
              <Trash2 size={15} className="text-cool-steel-700" />
            </button>
          </Link>

          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-cool-steel-500">
                <MapPin size={12} className="shrink-0 text-vivid-tangerine-500" />
                <span className="truncate">{favorite.city || 'México'}</span>
              </p>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-cool-steel-900">
                <Star size={12} className="fill-cool-steel-900 text-cool-steel-900" />
                {(favorite.rating || 0).toFixed(2)}
              </span>
            </div>

            <Link
              to={`/alojamiento/${favorite.slug}`}
              className="block text-sm font-semibold leading-snug text-cool-steel-900 line-clamp-2 transition-colors hover:text-vivid-tangerine-600"
            >
              {favorite.title}
            </Link>

            <div className="flex items-center gap-3 text-[11px] text-cool-steel-500">
              <span className="inline-flex items-center gap-1">
                <Users size={11} />
                {favorite.guests} huéspedes
              </span>
              <span className="inline-flex items-center gap-1">
                <BedDouble size={11} />
                {favorite.bedrooms} recámaras
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-cool-steel-100 pt-2">
              <p className="text-sm font-bold text-cool-steel-900">
                {formatMoney(favorite.price)}
                <span className="ml-1 text-[11px] font-normal text-cool-steel-500">
                  / noche
                </span>
              </p>
              <Link
                to={`/alojamiento/${favorite.slug}`}
                className="text-xs font-semibold text-vivid-tangerine-600 underline underline-offset-2 hover:text-vivid-tangerine-700"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
