import { Link } from 'react-router-dom'
import { Heart, Star, Sparkles } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'

interface Props {
  stay: FeaturedStay
}

export default function LodgingHorizontalCard({ stay }: Props) {
  const cover = stay.photos?.[0]?.thumbnail
  const city = stay.address?.city ?? ''
  const state = stay.address?.state ?? ''
  const location = [city, state].filter(Boolean).join(', ')

  return (
    <Link
      to={`/alojamiento/${stay.slug}`}
      className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-cool-steel-50 transition-colors group"
    >
      {/* Imagen */}
      <div className="relative w-full sm:w-56 lg:w-64 shrink-0 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-cool-steel-100">
        {cover && (
          <img
            src={cover}
            alt={stay.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Badge "Hospeda Lujo" / superhost */}
        {stay.is_superhost && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 backdrop-blur text-[10px] font-semibold text-cool-steel-900 shadow-sm">
            <Sparkles size={10} />
            Hospeda Lujo
          </span>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: favoritos
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
          aria-label="Guardar"
        >
          <Heart size={16} className="text-cool-steel-700" />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs text-cool-steel-500 truncate">{location}</p>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={11} className="fill-cool-steel-900 text-cool-steel-900" />
              <span className="text-xs font-medium text-cool-steel-900">
                {stay.rating.toFixed(2)}
              </span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-cool-steel-900 leading-snug mb-1.5 line-clamp-2">
            {stay.title}
          </h3>

          <p className="text-sm text-cool-steel-500">
            {stay.guests} huéspedes · {stay.bedrooms} rec · {stay.bathrooms ?? 1} baños
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-full bg-pacific-blue-100 text-pacific-blue-700 text-[11px] font-medium">
            Vistas directas a la ciudad
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pacific-blue-100 text-pacific-blue-700 text-[11px] font-medium">
            Cancelación flexible
          </span>
        </div>

        {/* Precio + CTA */}
        <div className="flex items-end justify-between gap-3 mt-4">
          <span className="text-xs text-cool-steel-500 underline underline-offset-2">
            Detalles y reserva
          </span>
          <div className="text-right">
            <p className="text-base font-semibold text-cool-steel-900">
              ${stay.price.toLocaleString('es-MX')}
              <span className="text-xs font-normal text-cool-steel-500 ml-1">/ noche</span>
            </p>
            <p className="text-xs text-cool-steel-400">
              ${(stay.price * 4).toLocaleString('es-MX')} total 4 noches
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}