import { Link } from 'react-router-dom'
import {
  X,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  Compass,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import type { PublicExperience } from '@/types/public'

interface Props {
  experience: PublicExperience | null
  onClose: () => void
}

export default function ExperienceDetailModal({ experience, onClose }: Props) {
  if (!experience) return null

  const locationLabel = [experience.city, experience.state]
    .filter(Boolean)
    .join(', ')

  const handleRequest = () => {
    toast.success(
      `Solicitud iniciada para "${experience.name}". Inicia sesión para completar tu reserva.`
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-overlay/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white border border-cool-steel-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera visual */}
        <div className="relative h-64 sm:h-72 bg-cool-steel-100 shrink-0">
          {experience.image_url ? (
            <img
              src={experience.image_url}
              alt={experience.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-vivid-tangerine-50 text-vivid-tangerine-500">
              <Compass size={44} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-cool-steel-950/70 via-transparent to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-cool-steel-800 flex items-center justify-center shadow-md cursor-pointer"
          >
            <X size={18} />
          </button>

          {experience.category && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-vivid-tangerine-500 text-white text-xs font-semibold shadow-sm">
              {experience.category.name}
            </span>
          )}

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mb-1">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {locationLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="fill-white text-white" />
                {experience.rating.toFixed(2)} ({experience.reviews_count}{' '}
                reseñas)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              {experience.name}
            </h2>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <Clock size={12} className="text-vivid-tangerine-500" />
                Duración
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 mt-0.5">
                {experience.duration ?? 'Flexible'}
              </p>
            </div>
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <Users size={12} className="text-vivid-tangerine-500" />
                Grupo máximo
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 mt-0.5">
                Hasta {experience.max_guests} personas
              </p>
            </div>
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <Award size={12} className="text-vivid-tangerine-500" />
                Anfitrión
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 truncate mt-0.5">
                {experience.host_name}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cool-steel-900 mb-1.5">
              Sobre esta experiencia
            </h3>
            <p className="text-sm text-cool-steel-600 leading-relaxed">
              {experience.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cool-steel-900 mb-2">
              ¿Qué incluye?
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {experience.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs font-medium text-cool-steel-700 bg-pacific-blue-50/70 border border-pacific-blue-100 rounded-xl px-3 py-2"
                >
                  <CheckCircle2
                    size={14}
                    className="text-pacific-blue-600 shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pie de reserva */}
        <div className="px-6 py-4 bg-surface-muted border-t border-cool-steel-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-cool-steel-500">Precio total estimado</p>
            <p className="text-xl font-bold text-cool-steel-900">
              ${experience.price.toLocaleString('es-MX')}
              <span className="text-xs font-normal text-cool-steel-500 ml-1">
                MXN / persona
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/alojamientos"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-cool-steel-200 bg-white text-xs font-semibold text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
            >
              Ver alojamientos cerca
            </Link>
            <button
              type="button"
              onClick={handleRequest}
              className="px-5 py-2.5 rounded-xl bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
            >
              Solicitar reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
