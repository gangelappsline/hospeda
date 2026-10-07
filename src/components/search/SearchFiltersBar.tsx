import { MapPin, Calendar, Users, Search } from 'lucide-react'
import type { LodgingSearchFilters } from '@/types/public'

interface Props {
  filters: LodgingSearchFilters
  onChange: (key: string, value: string | number | null) => void
}

export default function SearchFiltersBar({ filters, onChange }: Props) {
  const guestsLabel =
    filters.guests != null
      ? `${filters.guests} huésped${filters.guests !== 1 ? 'es' : ''}`
      : 'Agregar viajeros'

  const datesLabel =
    filters.check_in && filters.check_out
      ? `${formatShort(filters.check_in)} - ${formatShort(filters.check_out)}`
      : 'Agregar fechas'

  return (
    <div className="sticky top-16 z-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:rounded-full sm:border sm:border-gray-200 sm:shadow-sm sm:px-2 sm:py-1.5">
          {/* Destino */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-4 py-2 sm:py-1 sm:border-r sm:border-gray-200">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-semibold uppercase text-gray-500 leading-tight">
                Destino
              </label>
              <input
                type="text"
                value={filters.city ?? ''}
                onChange={(e) => onChange('city', e.target.value || null)}
                placeholder="¿A dónde vas?"
                className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-4 py-2 sm:py-1 sm:border-r sm:border-gray-200">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-semibold uppercase text-gray-500 leading-tight">
                Fechas
              </label>
              <button
                type="button"
                className="w-full text-left text-sm text-gray-900 truncate"
                onClick={() => {
                  // TODO: abrir date picker
                }}
              >
                {datesLabel}
              </button>
            </div>
          </div>

          {/* Viajeros */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-4 py-2 sm:py-1">
            <Users size={16} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-semibold uppercase text-gray-500 leading-tight">
                Viajeros
              </label>
              <input
                type="number"
                min={1}
                value={filters.guests ?? ''}
                onChange={(e) =>
                  onChange('guests', e.target.value ? Number(e.target.value) : null)
                }
                placeholder={guestsLabel}
                className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Search size={15} />
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}

function formatShort(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}