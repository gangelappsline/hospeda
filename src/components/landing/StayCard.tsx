import { motion } from 'motion/react'
import { Star, Heart } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'

interface Props {
  stay: FeaturedStay
  index: number
}

export default function StayCard({ stay, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
        <img
          src={stay.image_url}
          alt={stay.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge Superanfitrión */}
        {stay.is_superhost && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white text-xs font-semibold text-gray-900 shadow-sm">
            Superanfitrión
          </span>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            // TODO: lógica de favoritos
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
          aria-label="Guardar en favoritos"
        >
          <Heart size={16} className="text-gray-700" />
        </button>
      </div>

      {/* Información */}
      <div className="space-y-1">
        {/* Ubicación + Rating */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {stay.location}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} className="fill-gray-900 text-gray-900" />
            <span className="text-sm text-gray-900">{stay.rating}</span>
          </div>
        </div>

        {/* Título */}
        <p className="text-sm text-gray-600 truncate">{stay.title}</p>

        {/* Detalles */}
        <p className="text-sm text-gray-400">
          {stay.guests} huéspedes · {stay.bedrooms} recámaras
        </p>

        {/* Precio */}
        <p className="text-sm text-gray-900 pt-1">
          <span className="font-semibold">${stay.price_per_night.toLocaleString()}</span>{' '}
          <span className="text-gray-500">noche</span>
        </p>
      </div>
    </motion.article>
  )
}