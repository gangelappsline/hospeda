import { useMemo, useState, type FormEvent } from 'react'
import {
  MapPin,
  Calendar,
  Users,
  Search,
  SlidersHorizontal,
  Star,
  Check,
  RotateCcw,
  BedDouble,
  ChevronDown,
} from 'lucide-react'
import { usePublicLodgingCategories } from '@/hooks/usePublicCategories'
import { normalizeText } from '@/utils/exploreFallback'
import Skeleton from '@/components/ui/Skeleton'
import DateRangeCalendar, {
  type DateRange,
} from '@/components/booking/DateRangeCalendar'
import { useDismissable } from '@/hooks/useUiHelpers'
import {
  formatDayMonth,
  parseISODate,
  toISODate,
} from '@/utils/dates'
import type { LodgingSearchFilters } from '@/types/public'

interface Props {
  filters: LodgingSearchFilters
  totalResults: number
  onChange: (key: string, value: string | number | null) => void
  onToggleAmenity: (amenity: string) => void
  onBatchChange: (updates: Record<string, string | number | null>) => void
  onClearAll: () => void
}

const AMENITY_OPTIONS = [
  'Wifi',
  'Alberca',
  'Cocina',
  'Estacionamiento',
  'Aire acondicionado',
  'Vista al mar',
  'Pet friendly',
  'Área de trabajo',
] as const

const BEDROOM_OPTIONS = [
  { label: 'Cualquiera', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
] as const

const RATING_OPTIONS = [
  { label: 'Cualquiera', value: null },
  { label: '4.5+', value: 4.5 },
  { label: '4.8+', value: 4.8 },
  { label: '4.9+', value: 4.9 },
] as const

export default function SearchFiltersBar({
  filters,
  totalResults,
  onChange,
  onToggleAmenity,
  onBatchChange,
  onClearAll,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)
  const [cityDraft, setCityDraft] = useState<string | null>(null)
  const datesRef = useDismissable(datesOpen, () => setDatesOpen(false))

  const dateRange: DateRange = useMemo(
    () => ({
      checkIn: filters.check_in ? parseISODate(filters.check_in) : null,
      checkOut: filters.check_out ? parseISODate(filters.check_out) : null,
    }),
    [filters.check_in, filters.check_out]
  )
  const { data: lodgingCategories = [], isLoading: categoriesLoading } =
    usePublicLodgingCategories()

  const displayedCity = cityDraft !== null ? cityDraft : (filters.city ?? '')

  const advancedCount =
    (filters.min_price != null || filters.max_price != null ? 1 : 0) +
    (filters.bedrooms != null ? 1 : 0) +
    (filters.min_rating != null ? 1 : 0) +
    (filters.amenities?.length ?? 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (cityDraft !== null) {
      onChange('city', cityDraft.trim() || null)
      setCityDraft(null)
    }
  }

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-cool-steel-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Formulario principal de búsqueda */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 bg-cool-steel-50/70 lg:bg-white rounded-2xl lg:rounded-full border border-cool-steel-200 p-2 lg:px-3 lg:py-1.5 shadow-sm">
            {/* Destino */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 lg:border-r lg:border-cool-steel-200 min-w-0">
              <MapPin size={16} className="text-vivid-tangerine-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                  Destino o anuncio
                </label>
                <input
                  type="text"
                  value={displayedCity}
                  onChange={(e) => {
                    const nextVal = e.target.value
                    setCityDraft(nextVal)
                    onChange('city', nextVal.trim() || null)
                  }}
                  onBlur={() => setCityDraft(null)}
                  placeholder="Ciudad, estado o nombre..."
                  className="w-full text-sm bg-transparent outline-none placeholder:text-cool-steel-400 text-cool-steel-900"
                />
              </div>
            </div>

            {/* Fechas (calendario propio) */}
            <div
              ref={datesRef}
              className="relative sm:col-span-2 lg:col-span-2 lg:border-r lg:border-cool-steel-200"
            >
              <button
                type="button"
                onClick={() => setDatesOpen((open) => !open)}
                aria-expanded={datesOpen}
                className="group flex w-full items-center gap-2.5 px-3 py-1.5 text-left cursor-pointer"
              >
                <Calendar size={16} className="text-vivid-tangerine-500 shrink-0" />
                <span className="min-w-0 flex-1 grid grid-cols-2 gap-2">
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Llegada
                    </span>
                    <span
                      className={`block truncate text-sm ${
                        dateRange.checkIn
                          ? 'font-medium text-cool-steel-900'
                          : 'text-cool-steel-400'
                      }`}
                    >
                      {dateRange.checkIn
                        ? formatDayMonth(dateRange.checkIn)
                        : 'Selecciona'}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Salida
                    </span>
                    <span
                      className={`block truncate text-sm ${
                        dateRange.checkOut
                          ? 'font-medium text-cool-steel-900'
                          : 'text-cool-steel-400'
                      }`}
                    >
                      {dateRange.checkOut
                        ? formatDayMonth(dateRange.checkOut)
                        : 'Selecciona'}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-cool-steel-400 transition-transform ${
                    datesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {datesOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Cerrar calendario"
                    onClick={() => setDatesOpen(false)}
                    className="fixed inset-0 z-[105] bg-cool-steel-950/40 sm:hidden cursor-default"
                  />
                  <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:left-1/2 sm:z-50 sm:mt-3 sm:w-[620px] sm:max-w-[calc(100vw-3rem)] sm:-translate-x-1/2">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-cool-steel-200 shadow-2xl shadow-cool-steel-950/20 p-4 max-h-[88vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-1 sm:hidden">
                        <p className="text-sm font-semibold text-cool-steel-900">
                          Fechas de tu estancia
                        </p>
                        <button
                          type="button"
                          onClick={() => setDatesOpen(false)}
                          className="text-xs font-semibold text-vivid-tangerine-600 cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </div>

                      <DateRangeCalendar
                        value={dateRange}
                        onChange={(next) =>
                          onBatchChange({
                            check_in: next.checkIn
                              ? toISODate(next.checkIn)
                              : null,
                            check_out: next.checkOut
                              ? toISODate(next.checkOut)
                              : null,
                          })
                        }
                        numberOfMonths={2}
                        compact
                      />

                      <button
                        type="button"
                        onClick={() => setDatesOpen(false)}
                        className="mt-3 w-full rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800 cursor-pointer"
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Huéspedes */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 min-w-0">
              <Users size={16} className="text-vivid-tangerine-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                  Huéspedes
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={filters.guests ?? ''}
                  onChange={(e) =>
                    onChange(
                      'guests',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="¿Cuántos viajan?"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-cool-steel-400 text-cool-steel-900"
                />
              </div>
            </div>
          </div>

          {/* Botones Buscar + Filtros */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Search size={16} />
              <span>Buscar</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                filtersOpen || advancedCount > 0
                  ? 'border-cool-steel-900 bg-cool-steel-900 text-white'
                  : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300 hover:bg-cool-steel-50'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filtros</span>
              {advancedCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-vivid-tangerine-500 text-white text-xs font-bold">
                  {advancedCount}
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Categorías reales desde /lodging-categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          <button
            type="button"
            onClick={() => onBatchChange({ type: null, category_id: null })}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              !filters.type && filters.category_id == null
                ? 'bg-cool-steel-900 text-white shadow-sm'
                : 'bg-cool-steel-50 text-cool-steel-700 border border-cool-steel-200 hover:border-cool-steel-300 hover:bg-white'
            }`}
          >
            Todos
          </button>

          {categoriesLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`lodging-cat-skel-${index}`}
                className="h-7 w-24 rounded-full shrink-0"
              />
            ))}

          {!categoriesLoading &&
            lodgingCategories.map((cat) => {
              const isSelected =
                (filters.category_id != null &&
                  cat.id > 0 &&
                  filters.category_id === cat.id) ||
                (Boolean(filters.type) &&
                  normalizeText(filters.type ?? '') === normalizeText(cat.name))

              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  title={cat.description ?? undefined}
                  onClick={() =>
                    onBatchChange(
                      isSelected
                        ? { type: null, category_id: null }
                        : {
                            type: cat.name,
                            category_id: cat.id > 0 ? cat.id : null,
                          }
                    )
                  }
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-cool-steel-900 text-white shadow-sm'
                      : 'bg-cool-steel-50 text-cool-steel-700 border border-cool-steel-200 hover:border-cool-steel-300 hover:bg-white'
                  }`}
                >
                  {cat.icon_url && (
                    <img
                      src={cat.icon_url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      className={`w-8 h-8 object-contain rounded-full shrink-0 ${
                        isSelected ? '' : 'grayscale'
                      }`}
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              )
            })}
        </div>

        {/* Panel desplegable de filtros avanzados */}
        {filtersOpen && (
          <div className="rounded-2xl border border-cool-steel-200 bg-surface-muted p-4 sm:p-5 space-y-5 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Precio por noche */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2">
                  Precio por noche (MXN)
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cool-steel-400">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={filters.min_price ?? ''}
                      onChange={(e) =>
                        onChange(
                          'min_price',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="Mínimo"
                      className="w-full rounded-xl border border-cool-steel-200 bg-white py-2 pl-7 pr-3 text-sm text-cool-steel-900 outline-none focus:border-vivid-tangerine-500"
                    />
                  </div>
                  <span className="text-cool-steel-400 text-xs">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cool-steel-400">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={filters.max_price ?? ''}
                      onChange={(e) =>
                        onChange(
                          'max_price',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="Máximo"
                      className="w-full rounded-xl border border-cool-steel-200 bg-white py-2 pl-7 pr-3 text-sm text-cool-steel-900 outline-none focus:border-vivid-tangerine-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onBatchChange({ min_price: null, max_price: 2500 })
                    }
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                  >
                    Hasta $2,500
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onBatchChange({ min_price: 2500, max_price: 4500 })
                    }
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                  >
                    $2,500 – $4,500
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onBatchChange({ min_price: 4500, max_price: null })
                    }
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                  >
                    $4,500+
                  </button>
                </div>
              </div>

              {/* Recámaras mínimas */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2 flex items-center gap-1.5">
                  <BedDouble size={13} className="text-vivid-tangerine-500" />
                  Recámaras mínimas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BEDROOM_OPTIONS.map((opt) => {
                    const active = (filters.bedrooms ?? null) === opt.value
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => onChange('bedrooms', opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-cool-steel-900 border-cool-steel-900 text-white'
                            : 'bg-white border-cool-steel-200 text-cool-steel-700 hover:border-cool-steel-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Calificación mínima */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2 flex items-center gap-1.5">
                  <Star size={13} className="text-vivid-tangerine-500" />
                  Calificación mínima
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {RATING_OPTIONS.map((opt) => {
                    const active = (filters.min_rating ?? null) === opt.value
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => onChange('min_rating', opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-cool-steel-900 border-cool-steel-900 text-white'
                            : 'bg-white border-cool-steel-200 text-cool-steel-700 hover:border-cool-steel-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Amenidades */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2">
                Amenidades
              </p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => {
                  const selected = filters.amenities?.includes(amenity) ?? false
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => onToggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        selected
                          ? 'bg-vivid-tangerine-500 border-vivid-tangerine-500 text-white shadow-sm'
                          : 'bg-white border-cool-steel-200 text-cool-steel-700 hover:border-cool-steel-300'
                      }`}
                    >
                      {selected && <Check size={12} />}
                      {amenity}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pie del panel */}
            <div className="flex items-center justify-between pt-3 border-t border-cool-steel-200">
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-cool-steel-600 hover:text-cool-steel-900 cursor-pointer"
              >
                <RotateCcw size={13} />
                Limpiar todos los filtros
              </button>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="px-4 py-2 rounded-xl bg-cool-steel-900 hover:bg-cool-steel-950 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Ver {totalResults} alojamiento{totalResults !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
