import { Link } from 'react-router-dom'
import {
  X,
  MapPin,
  Star,
  CheckCircle2,
  ConciergeBell,
  BadgeCheck,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import type { PublicService, ServiceAvailability } from '@/types/public'

interface Props {
  service: PublicService | null
  onClose: () => void
}

const AVAILABILITY_DESC: Record<ServiceAvailability, string> = {
  inmediata: 'Reserva inmediata disponible',
  '24h': 'Requiere 24 h de anticipación',
  '48h': 'Requiere 48 h de anticipación',
}

export default function ServiceDetailModal({ service, onClose }: Props) {
  if (!service) return null

  const handleRequest = () => {
    toast.success(
      `Solicitud enviada para "${service.name}". Puedes vincularlo a tu estancia al iniciar sesión.`
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
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-vivid-tangerine-50 text-vivid-tangerine-500">
              <ConciergeBell size={44} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-cool-steel-950/75 via-transparent to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-cool-steel-800 flex items-center justify-center shadow-md cursor-pointer"
          >
            <X size={18} />
          </button>

          {service.category && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-vivid-tangerine-500 text-white text-xs font-semibold shadow-sm">
              {service.category.name}
            </span>
          )}

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/90 mb-1">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {service.coverage}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="fill-white text-white" />
                {service.rating.toFixed(2)} ({service.reviews_count} reseñas)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              {service.name}
            </h2>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <BadgeCheck size={12} className="text-pacific-blue-600" />
                Proveedor
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 truncate mt-0.5">
                {service.provider_name}
              </p>
            </div>
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <Zap size={12} className="text-vivid-tangerine-500" />
                Disponibilidad
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 mt-0.5">
                {AVAILABILITY_DESC[service.availability]}
              </p>
            </div>
            <div className="rounded-xl bg-cool-steel-50 p-3">
              <p className="text-[11px] text-cool-steel-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-pacific-blue-600" />
                Garantía
              </p>
              <p className="text-sm font-semibold text-cool-steel-900 mt-0.5">
                Verificado por Hospeda
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cool-steel-900 mb-1.5">
              Descripción del servicio
            </h3>
            <p className="text-sm text-cool-steel-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cool-steel-900 mb-2">
              Beneficios incluidos
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.highlights.map((item) => (
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

        {/* Pie */}
        <div className="px-6 py-4 bg-surface-muted border-t border-cool-steel-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-cool-steel-500">Tarifa del servicio</p>
            <p className="text-xl font-bold text-cool-steel-900">
              ${service.price.toLocaleString('es-MX')}
              <span className="text-xs font-normal text-cool-steel-500 ml-1">
                MXN {service.price_unit}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/alojamientos"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-cool-steel-200 bg-white text-xs font-semibold text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
            >
              Buscar alojamiento
            </Link>
            <button
              type="button"
              onClick={handleRequest}
              className="px-5 py-2.5 rounded-xl bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
            >
              Agregar servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
