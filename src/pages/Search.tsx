import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { useSearchLodgings } from '@/hooks/useSearchLodgings'
import SearchFiltersBar from '@/components/search/SearchFiltersBar'
import ActiveFilterChips from '@/components/search/ActiveFilterChips'
import LodgingHorizontalCard from '@/components/search/LodgingHorizontalCard'
import SearchResultsMap from '@/components/search/SearchResultsMap'
import SearchSkeleton from '@/components/search/SearchSkeleton'
import type { LodgingSearchFilters } from '@/types/public'

/** Convierte los searchParams de la URL en un objeto tipado. */
function parseFilters(params: URLSearchParams): LodgingSearchFilters {
  const filters: LodgingSearchFilters = {}

  const city = params.get('city')
  if (city) filters.city = city

  const check_in = params.get('check_in')
  if (check_in) filters.check_in = check_in

  const check_out = params.get('check_out')
  if (check_out) filters.check_out = check_out

  const guests = params.get('guests')
  if (guests) filters.guests = Number(guests)

  const min_price = params.get('min_price')
  if (min_price) filters.min_price = Number(min_price)

  const max_price = params.get('max_price')
  if (max_price) filters.max_price = Number(max_price)

  const type = params.get('type')
  if (type) filters.type = type

  const min_rating = params.get('min_rating')
  if (min_rating) filters.min_rating = Number(min_rating)

  const amenities = params.getAll('amenities[]')
  if (amenities.length > 0) filters.amenities = amenities

  return filters
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const { data, isLoading, isError } = useSearchLodgings(filters)

  const stays = data ?? []

  // --- Mutadores de filtros ---
  const setFilter = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(searchParams)
    if (value == null || value === '') next.delete(key)
    else next.set(key, String(value))
    setSearchParams(next, { replace: false })
  }

  const removeFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams)
    if (value != null) {
      // Remover solo un valor específico de un array (ej. una amenidad)
      const existing = next.getAll(`${key}[]`)
      next.delete(`${key}[]`)
      existing.filter((v) => v !== value).forEach((v) => next.append(`${key}[]`, v))
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: false })
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: false })
  }

  const hasFilters = Object.keys(filters).length > 0

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <div className="pt-16">
        {/* Barra de filtros */}
        <SearchFiltersBar filters={filters} onChange={setFilter} />

        {/* Chips de filtros activos */}
        {hasFilters && (
          <ActiveFilterChips
            filters={filters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

        {/* Layout principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6">
            {/* Columna izquierda */}
            <div>
              <ResultsHeader
                total={stays.length}
                city={filters.city}
                isLoading={isLoading}
              />

              {isLoading && <SearchSkeleton />}

              {isError && (
                <div className="text-center py-16 bg-cool-steel-50 rounded-xl">
                  <p className="text-sm text-cool-steel-500">
                    No pudimos cargar los alojamientos. Intenta de nuevo.
                  </p>
                </div>
              )}

              {!isLoading && !isError && stays.length === 0 && (
                <EmptyState
                  hasFilters={hasFilters}
                  onClear={clearAllFilters}
                />
              )}

              {!isLoading && !isError && stays.length > 0 && (
                <div className="space-y-4">
                  {stays.map((stay) => (
                    <LodgingHorizontalCard key={stay.id} stay={stay} />
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha: mapa */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-7rem)] rounded-xl overflow-hidden">
                <SearchResultsMap lodgings={stays} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----- Subcomponentes de la página ----- */

function ResultsHeader({
  total,
  city,
  isLoading,
}: {
  total: number
  city?: string
  isLoading: boolean
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-vivid-tangerine-500 mb-1">
        Disponibilidad en vivo
      </p>
      <h1 className="text-lg sm:text-xl font-semibold text-cool-steel-900">
        {isLoading
          ? 'Buscando alojamientos...'
          : total === 0
            ? 'Sin resultados'
            : `Más de ${total} alojamiento${total !== 1 ? 's' : ''}${city ? ` en ${city}` : ''}`}
      </h1>
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="text-center py-16 bg-cool-steel-50 rounded-xl">
      <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
        {hasFilters ? 'Sin resultados para tu búsqueda' : 'No hay alojamientos disponibles'}
      </h3>
      <p className="text-sm text-cool-steel-500 mb-4 max-w-sm mx-auto">
        {hasFilters
          ? 'Prueba ajustando los filtros o buscando en otra ciudad.'
          : 'Vuelve más tarde, estamos actualizando el catálogo.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-vivid-tangerine-600 hover:text-vivid-tangerine-700 underline"
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  )
}