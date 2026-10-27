import { X, SlidersHorizontal } from 'lucide-react'
import type { LodgingSearchFilters } from '@/types/public'

interface Props {
  filters: LodgingSearchFilters
  onRemove: (key: string, value?: string) => void
  onClearAll: () => void
}

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: Props) {
  const chips: { key: string; label: string; value?: string }[] = []

  if (filters.city) chips.push({ key: 'city', label: `Destino: ${filters.city}` })
  if (filters.check_in && filters.check_out) {
    chips.push({
      key: 'dates',
      label: `${formatShort(filters.check_in)} – ${formatShort(filters.check_out)}`,
    })
  } else if (filters.check_in) {
    chips.push({
      key: 'check_in',
      label: `Llegada: ${formatShort(filters.check_in)}`,
    })
  } else if (filters.check_out) {
    chips.push({
      key: 'check_out',
      label: `Salida: ${formatShort(filters.check_out)}`,
    })
  }
  if (filters.guests) {
    chips.push({
      key: 'guests',
      label: `${filters.guests} huésped${filters.guests !== 1 ? 'es' : ''}`,
    })
  }
  if (filters.bedrooms) {
    chips.push({
      key: 'bedrooms',
      label: `${filters.bedrooms}+ recámara${filters.bedrooms !== 1 ? 's' : ''}`,
    })
  }
  if (filters.min_price != null || filters.max_price != null) {
    chips.push({
      key: 'price',
      label: `$${(filters.min_price ?? 0).toLocaleString('es-MX')} – ${
        filters.max_price != null
          ? `$${filters.max_price.toLocaleString('es-MX')}`
          : 'Sin tope'
      }`,
    })
  }
  if (filters.type) chips.push({ key: 'type', label: `Tipo: ${filters.type}` })
  if (filters.min_rating) {
    chips.push({ key: 'min_rating', label: `${filters.min_rating}+ estrellas` })
  }
  filters.amenities?.forEach((a) =>
    chips.push({ key: 'amenities', value: a, label: a })
  )

  if (chips.length === 0) return null

  return (
    <div className="bg-white border-b border-cool-steel-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-steel-900 text-white text-xs font-medium shrink-0 hover:bg-cool-steel-950 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={12} />
          Limpiar ({chips.length})
        </button>

        {chips.map((chip, i) => (
          <button
            key={`${chip.key}-${chip.value ?? ''}-${i}`}
            type="button"
            onClick={() => onRemove(chip.key, chip.value)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cool-steel-300 bg-white hover:border-vivid-tangerine-400 hover:bg-vivid-tangerine-50/40 text-xs text-cool-steel-700 shrink-0 transition-colors cursor-pointer"
          >
            <span>{chip.label}</span>
            <X
              size={12}
              className="text-cool-steel-400 group-hover:text-vivid-tangerine-600"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function formatShort(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  const parsed = new Date(y, m - 1, d)
  return parsed.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
