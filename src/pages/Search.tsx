import { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Home as HomeIcon, Map as MapIcon, Building2 } from 'lucide-react'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { useSearchLodgings } from '@/hooks/useSearchLodgings'
import SearchFiltersBar from '@/components/search/SearchFiltersBar'
import ActiveFilterChips from '@/components/search/ActiveFilterChips'
import LodgingHorizontalCard from '@/components/search/LodgingHorizontalCard'
import SearchResultsMap from '@/components/search/SearchResultsMap'
import SearchSkeleton from '@/components/search/SearchSkeleton'
import type { FeaturedStay, LodgingSearchFilters, SortOption } from '@/types/public'

/** Convierte los searchParams de la URL en un objeto tipado. */
function parseFilters(params: URLSearchParams): LodgingSearchFilters {
  const filters: LodgingSearchFilters = {}

  const q = params.get('q')
  if (q) filters.q = q

  const city = params.get('city')
  if (city) filters.city = city

  const check_in = params.get('check_in')
  if (check_in) filters.check_in = check_in

  const check_out = params.get('check_out')
  if (check_out) filters.check_out = check_out

  const guests = params.get('guests')
  if (guests) filters.guests = Number(guests)

  const bedrooms = params.get('bedrooms')
  if (bedrooms) filters.bedrooms = Number(bedrooms)

  const min_price = params.get('min_price')
  if (min_price) filters.min_price = Number(min_price)

  const max_price = params.get('max_price')
  if (max_price) filters.max_price = Number(max_price)

  const type = params.get('type')
  if (type) filters.type = type

  const min_rating = params.get('min_rating')
  if (min_rating) filters.min_rating = Number(min_rating)

  const sort = params.get('sort') as SortOption | null
  if (sort) filters.sort = sort

  const amenities = params.getAll('amenities[]')
  if (amenities.length > 0) filters.amenities = amenities

  return filters
}

function computeNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 4
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff > 0 ? diff : 1
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hoveredStayId, setHoveredStayId] = useState<number | null>(null)
  const [selectedStayId, setSelectedStayId] = useState<number | null>(null)
  const [showMobileMap, setShowMobileMap] = useState(false)

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const { data, isLoading, isError } = useSearchLodgings(filters)

  const stays = data ?? []
  const nights = computeNights(filters.check_in, filters.check_out)

  // --- Mutadores de filtros ---
  const setFilter = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(searchParams)
    if (value == null || value === '') next.delete(key)
    else next.set(key, String(value))
    setSearchParams(next, { replace: false })
  }

  const batchChangeFilters = (
    updates: Record<string, string | number | null>
  ) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    setSearchParams(next, { replace: false })
  }

  const toggleAmenity = (amenity: string) => {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll('amenities[]')
    next.delete('amenities[]')
    if (current.includes(amenity)) {
      current
        .filter((item) => item !== amenity)
        .forEach((item) => next.append('amenities[]', item))
    } else {
      ;[...current, amenity].forEach((item) =>
        next.append('amenities[]', item)
      )
    }
    setSearchParams(next, { replace: false })
  }

  const removeFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams)
    if (key === 'dates') {
      next.delete('check_in')
      next.delete('check_out')
    } else if (key === 'price') {
      next.delete('min_price')
      next.delete('max_price')
    } else if (value != null) {
      const existing = next.getAll(`${key}[]`)
      next.delete(`${key}[]`)
      existing
        .filter((v) => v !== value)
        .forEach((v) => next.append(`${key}[]`, v))
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: false })
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: false })
  }

  const handleSelectStayOnMap = useCallback((stayId: number | null) => {
    setSelectedStayId(stayId)
  }, [])

  const handleFocusOnMap = (stay: FeaturedStay) => {
    setSelectedStayId(stay.id)
    setShowMobileMap(true)
  }

  const hasFilters = Object.keys(filters).some((k) => k !== 'sort')

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      <LandingNavbar />

      <main className="pt-16 flex-1">
        {/* Encabezado contextual */}
        <div className="bg-gradient-to-r from-parchment-50 via-white to-vivid-tangerine-50/40 border-b border-cool-steel-100">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-vivid-tangerine-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Building2 size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-vivid-tangerine-600">
                  Explorar · Alojamientos
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-cool-steel-900">
                  Encuentra tu estancia ideal en México
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileMap((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cool-steel-900 text-white text-xs font-semibold cursor-pointer"
            >
              <MapIcon size={14} />
              {showMobileMap ? 'Ocultar mapa' : `Ver mapa (${stays.length})`}
            </button>
          </div>
        </div>

        {/* Formulario de búsqueda con filtros */}
        <SearchFiltersBar
          filters={filters}
          totalResults={stays.length}
          onChange={setFilter}
          onToggleAmenity={toggleAmenity}
          onBatchChange={batchChangeFilters}
          onClearAll={clearAllFilters}
        />

        {/* Chips de filtros activos */}
        {hasFilters && (
          <ActiveFilterChips
            filters={filters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

        {/* Mapa colapsable en móvil */}
        {showMobileMap && (
          <div className="lg:hidden px-4 pt-4">
            <div className="h-80 rounded-2xl overflow-hidden border border-cool-steel-200 shadow-sm">
              <SearchResultsMap
                lodgings={stays}
                highlightedId={hoveredStayId}
                selectedStayId={selectedStayId}
                onSelectStay={handleSelectStayOnMap}
              />
            </div>
          </div>
        )}

        {/* Layout principal: 4/6 Listado + 2/6 Mapa */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
            {/* Columna izquierda (4/6): Listado de alojamientos */}
            <div className="lg:col-span-4 min-w-0">
              <ResultsHeader
                total={stays.length}
                city={filters.city}
                isLoading={isLoading}
                sort={filters.sort ?? 'recommended'}
                onSortChange={(nextSort) =>
                  setFilter(
                    'sort',
                    nextSort === 'recommended' ? null : nextSort
                  )
                }
              />

              {isLoading && <SearchSkeleton />}

              {isError && (
                <div className="text-center py-16 bg-white border border-cool-steel-100 rounded-2xl">
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
                    <LodgingHorizontalCard
                      key={stay.id}
                      stay={stay}
                      nights={nights}
                      isHighlighted={
                        hoveredStayId === stay.id || selectedStayId === stay.id
                      }
                      onMouseEnter={() => setHoveredStayId(stay.id)}
                      onMouseLeave={() => setHoveredStayId(null)}
                      onFocusOnMap={handleFocusOnMap}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha (2/6): Mapa interactivo con markers */}
            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-40 h-[calc(100vh-11.5rem)] min-h-[480px] rounded-2xl overflow-hidden border border-cool-steel-200 shadow-sm">
                <SearchResultsMap
                  lodgings={stays}
                  highlightedId={hoveredStayId}
                  selectedStayId={selectedStayId}
                  onSelectStay={handleSelectStayOnMap}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cool-steel-100 bg-white py-8 mt-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-vivid-tangerine-500 flex items-center justify-center">
              <HomeIcon size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-cool-steel-900">
              Hospeda
            </span>
          </div>
          <p className="text-sm text-cool-steel-400">
            © 2026 Hospeda. Hecho en México.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ----- Subcomponentes de la página ----- */

function ResultsHeader({
  total,
  city,
  isLoading,
  sort,
  onSortChange,
}: {
  total: number
  city?: string
  isLoading: boolean
  sort: SortOption
  onSortChange: (value: SortOption) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-vivid-tangerine-500 mb-0.5">
          Disponibilidad verificada
        </p>
        <h2 className="text-base sm:text-lg font-semibold text-cool-steel-900">
          {isLoading
            ? 'Buscando alojamientos...'
            : total === 0
              ? 'Sin resultados'
              : `${total} alojamiento${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}${
                  city ? ` para "${city}"` : ''
                }`}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="lodgings-sort"
          className="text-xs font-medium text-cool-steel-500"
        >
          Ordenar:
        </label>
        <select
          id="lodgings-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-xl border border-cool-steel-200 bg-white px-3 py-1.5 text-xs font-medium text-cool-steel-800 outline-none focus:border-vivid-tangerine-400"
        >
          <option value="recommended">Recomendados</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="rating_desc">Mejor calificados</option>
        </select>
      </div>
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
    <div className="text-center py-16 px-4 bg-white border border-cool-steel-100 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center mx-auto mb-3">
        <Building2 size={20} />
      </div>
      <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
        {hasFilters
          ? 'Sin alojamientos para tu búsqueda'
          : 'No hay alojamientos disponibles'}
      </h3>
      <p className="text-sm text-cool-steel-500 mb-4 max-w-sm mx-auto">
        {hasFilters
          ? 'Prueba ajustando los filtros, el rango de precio o buscando en otra ciudad.'
          : 'Vuelve más tarde, estamos actualizando el catálogo.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-xl bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  )
}
