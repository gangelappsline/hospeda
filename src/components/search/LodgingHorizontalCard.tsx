import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Sparkles, MapPin } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'

interface Props {
  stay: FeaturedStay
  nights?: number
  isHighlighted?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocusOnMap?: (stay: FeaturedStay) => void
}

export default function LodgingHorizontalCard({
  stay,
  nights = 4,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
  onFocusOnMap,
}: Props) {
  const [saved, setSaved] = useState(false)
  const cover = stay.photos?.[0]?.thumbnail ?? stay.photos?.[0]?.photo
  const city = stay.address?.city ?? ''
  const state = stay.address?.state ?? ''
  const location = [city, state].filter(Boolean).join(', ')
  const tags =
    stay.amenities && stay.amenities.length > 0
      ? stay.amenities.slice(0, 4)
      : ['Estancia verificada', 'Cancelación flexible']

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex flex-col sm:flex-row gap-4 p-3.5 rounded-2xl border bg-white transition-all group ${
        isHighlighted
          ? 'border-vivid-tangerine-400 ring-2 ring-vivid-tangerine-100 shadow-md'
          : 'border-cool-steel-100 hover:border-cool-steel-200 hover:shadow-md'
      }`}
    >
      {/* Imagen */}
      <Link
        to={`/alojamiento/${stay.slug}`}
        className="relative w-full sm:w-56 xl:w-64 shrink-0 aspect-[4/3] sm:aspect-[5/4] rounded-xl overflow-hidden bg-cool-steel-100 block"
      >
        {cover && (
          <img
            src={cover}
            alt={stay.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Tipo + Superanfitrión */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md bg-cool-steel-900/80 backdrop-blur text-[10px] font-semibold text-white">
            {stay.type.name}
          </span>
          {stay.is_superhost && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 backdrop-blur text-[10px] font-semibold text-cool-steel-900 shadow-sm">
              <Sparkles size={10} className="text-vivid-tangerine-500" />
              Superanfitrión
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setSaved((prev) => !prev)
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer"
          aria-label="Guardar alojamiento"
        >
          <Heart
            size={15}
            className={
              saved
                ? 'fill-vivid-tangerine-500 text-vivid-tangerine-500'
                : 'text-cool-steel-700'
            }
          />
        </button>
      </Link>

      {/* Información */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="text-vivid-tangerine-500 shrink-0" />
              <p className="text-xs font-medium text-cool-steel-500 truncate">
                {location || 'México'}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="fill-cool-steel-900 text-cool-steel-900" />
              <span className="text-xs font-semibold text-cool-steel-900">
                {(Number(stay.rating) || 0).toFixed(2)}
              </span>
              {typeof stay.reviews === 'number' && (
                <span className="text-xs text-cool-steel-400">
                  ({stay.reviews})
                </span>
              )}
            </div>
          </div>

          <Link to={`/alojamiento/${stay.slug}`} className="block">
            <h3 className="text-base sm:text-lg font-semibold text-cool-steel-900 group-hover:text-vivid-tangerine-600 transition-colors leading-snug mb-1.5 line-clamp-2">
              {stay.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-cool-steel-500">
            {stay.guests} huésped{stay.guests !== 1 ? 'es' : ''} ·{' '}
            {stay.bedrooms} recámara{stay.bedrooms !== 1 ? 's' : ''} ·{' '}
            {stay.bathrooms ?? 1} baño{(stay.bathrooms ?? 1) !== 1 ? 's' : ''}
          </p>

          {/* Amenidades / etiquetas */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-pacific-blue-50 border border-pacific-blue-200 text-pacific-blue-800 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Precio + Acciones */}
        <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-cool-steel-100">
          <div className="flex items-center gap-3">
            <Link
              to={`/alojamiento/${stay.slug}`}
              className="text-xs font-semibold text-vivid-tangerine-600 hover:text-vivid-tangerine-700 underline underline-offset-2"
            >
              Ver detalles y reservar
            </Link>
            {onFocusOnMap && (
              <button
                type="button"
                onClick={() => onFocusOnMap(stay)}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-cool-steel-500 hover:text-cool-steel-900 cursor-pointer"
              >
                <MapPin size={12} />
                Ubicar en mapa
              </button>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-base sm:text-lg font-bold text-cool-steel-900">
              ${stay.price.toLocaleString('es-MX')}
              <span className="text-xs font-normal text-cool-steel-500 ml-1">
                MXN / noche
              </span>
            </p>
            <p className="text-[11px] text-cool-steel-400">
              ${(stay.price * nights).toLocaleString('es-MX')} total por {nights}{' '}
              noche{nights !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
