import { X, SlidersHorizontal } from 'lucide-react'
import type { LodgingSearchFilters } from '@/types/public'

interface Props {
  filters: LodgingSearchFilters
  onRemove: (key: string, value?: string) => void
  onClearAll: () => void
}

export default function ActiveFilterChips({ filters, onRemove, onClearAll }: Props) {
  const chips: { key: string; label: string; value?: string }[] = []

  if (filters.city) chips.push({ key: 'city', label: filters.city })
  if (filters.check_in && filters.check_out) {
    chips.push({
      key: 'dates',
      label: `${formatShort(filters.check_in)} - ${formatShort(filters.check_out)}`,
    })
  }
  if (filters.guests) {
    chips.push({
      key: 'guests',
      label: `${filters.guests} huésped${filters.guests !== 1 ? 'es' : ''}`,
    })
  }
  if (filters.min_price != null || filters.max_price != null) {
    chips.push({
      key: 'price',
      label: `$${filters.min_price ?? 0} - $${filters.max_price ?? '∞'}`,
    })
  }
  if (filters.type) chips.push({ key: 'type', label: filters.type })
  if (filters.min_rating) {
    chips.push({ key: 'min_rating', label: `${filters.min_rating}+ estrellas` })
  }
  filters.amenities?.forEach((a) =>
    chips.push({ key: 'amenities', value: a, label: a })
  )

  if (chips.length === 0) return null

  return (
    <div className="bg-white border-b border-cool-steel-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-steel-900 text-white text-xs font-medium shrink-0 hover:bg-cool-steel-950 transition-colors"
        >
          <SlidersHorizontal size={12} />
          Filtros ({chips.length})
        </button>

        {chips.map((chip, i) => (
          <button
            key={`${chip.key}-${chip.value ?? ''}-${i}`}
            onClick={() => onRemove(chip.key, chip.value)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cool-steel-300 hover:border-cool-steel-400 text-xs text-cool-steel-700 shrink-0 transition-colors"
          >
            {chip.label}
            <X
              size={12}
              className="text-cool-steel-400 group-hover:text-cool-steel-700"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function formatShort(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}