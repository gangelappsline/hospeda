import { useState } from 'react'
import {
  Clock,
  Heart,
  MapPin,
  Star,
  Users,
  Compass,
  ArrowUpRight,
} from 'lucide-react'
import type { PublicExperience } from '@/types/public'

interface Props {
  experience: PublicExperience
  onSelect: (experience: PublicExperience) => void
}

export default function ExperienceCard({ experience, onSelect }: Props) {
  const [saved, setSaved] = useState(false)
  const locationLabel = [experience.city, experience.state]
    .filter(Boolean)
    .join(', ')

  return (
    <article
      onClick={() => onSelect(experience)}
      className="group rounded-2xl border border-cool-steel-100 bg-white overflow-hidden hover:border-cool-steel-200 hover:shadow-lg hover:shadow-cool-steel-900/5 transition-all flex flex-col cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-cool-steel-100 overflow-hidden">
        {experience.image_url ? (
          <img
            src={experience.image_url}
            alt={experience.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-vivid-tangerine-50 text-vivid-tangerine-400">
            <Compass size={32} />
          </div>
        )}

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {experience.category && (
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[11px] font-semibold text-cool-steel-900 shadow-sm">
              {experience.category.name}
            </span>
          )}
        </div>

        {/* Duración */}
        {experience.duration && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cool-steel-900/80 backdrop-blur text-[11px] font-medium text-white">
            <Clock size={11} />
            {experience.duration}
          </span>
        )}

        {/* Guardar */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setSaved((prev) => !prev)
          }}
          aria-label="Guardar experiencia"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer"
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
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-cool-steel-500 truncate">
              <MapPin size={12} className="text-vivid-tangerine-500 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-cool-steel-900 shrink-0">
              <Star
                size={12}
                className="fill-cool-steel-900 text-cool-steel-900"
              />
              {experience.rating.toFixed(2)}
              <span className="font-normal text-cool-steel-400">
                ({experience.reviews_count})
              </span>
            </span>
          </div>

          <h3 className="text-base font-semibold text-cool-steel-900 group-hover:text-vivid-tangerine-600 transition-colors leading-snug line-clamp-2 mb-1.5">
            {experience.name}
          </h3>

          <p className="text-xs text-cool-steel-500 line-clamp-2 leading-relaxed mb-3">
            {experience.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cool-steel-50 text-cool-steel-600 text-[11px] font-medium">
              <Users size={11} />
              Hasta {experience.max_guests} personas
            </span>
            {experience.includes[0] && (
              <span className="px-2 py-0.5 rounded-full bg-pacific-blue-50 text-pacific-blue-800 text-[11px] font-medium truncate max-w-[170px]">
                {experience.includes[0]}
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-cool-steel-100 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] text-cool-steel-400">Desde</p>
            <p className="text-base font-bold text-cool-steel-900">
              ${experience.price.toLocaleString('es-MX')}
              <span className="text-xs font-normal text-cool-steel-500 ml-1">
                MXN / persona
              </span>
            </p>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-vivid-tangerine-50 text-vivid-tangerine-600 group-hover:bg-vivid-tangerine-500 group-hover:text-white text-xs font-semibold transition-colors">
            <span>Explorar</span>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </article>
  )
}
