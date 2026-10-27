import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  Clock,
  Star,
  X,
  RotateCcw,
  Home as HomeIcon,
} from 'lucide-react'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { useSearchExperiences } from '@/hooks/useSearchExperiences'
import { usePublicExperienceCategories } from '@/hooks/usePublicCategories'
import { normalizeText } from '@/utils/exploreFallback'
import ExperienceCard from '@/components/explore/ExperienceCard'
import ExperienceDetailModal from '@/components/explore/ExperienceDetailModal'
import Skeleton from '@/components/ui/Skeleton'
import type {
  ExperienceDurationFilter,
  ExperienceSearchFilters,
  PublicExperience,
  SortOption,
} from '@/types/public'

const DURATION_OPTIONS: {
  label: string
  value: ExperienceDurationFilter | null
}[] = [
  { label: 'Cualquier duración', value: null },
  { label: 'Corta (hasta 2.5 h)', value: 'short' },
  { label: 'Media (3 a 5 h)', value: 'medium' },
  { label: 'Día completo (6+ h)', value: 'full_day' },
]

function parseFilters(params: URLSearchParams): ExperienceSearchFilters {
  const filters: ExperienceSearchFilters = {}

  const q = params.get('q')
  if (q) filters.q = q

  const city = params.get('city')
  if (city) filters.city = city

  const category = params.get('category')
  if (category) filters.category = category

  const category_id = params.get('category_id')
  if (category_id) filters.category_id = Number(category_id)

  const date = params.get('date')
  if (date) filters.date = date

  const guests = params.get('guests')
  if (guests) filters.guests = Number(guests)

  const min_price = params.get('min_price')
  if (min_price) filters.min_price = Number(min_price)

  const max_price = params.get('max_price')
  if (max_price) filters.max_price = Number(max_price)

  const duration = params.get('duration') as ExperienceDurationFilter | null
  if (duration) filters.duration = duration

  const min_rating = params.get('min_rating')
  if (min_rating) filters.min_rating = Number(min_rating)

  const sort = params.get('sort') as SortOption | null
  if (sort) filters.sort = sort

  return filters
}

export default function ExperiencesExplore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedExperience, setSelectedExperience] =
    useState<PublicExperience | null>(null)

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const { data, isLoading, isError } = useSearchExperiences(filters)
  const {
    data: experienceCategories = [],
    isLoading: categoriesLoading,
  } = usePublicExperienceCategories()

  const experiences = useMemo(() => {
    const rawItems = data ?? []
    if (experienceCategories.length === 0) return rawItems
    const catById = new Map(experienceCategories.map((c) => [c.id, c]))
    return rawItems.map((exp) => {
      if (!exp.category && exp.category_id && catById.has(exp.category_id)) {
        const matched = catById.get(exp.category_id)!
        return {
          ...exp,
          category: { id: matched.id, name: matched.name },
        }
      }
      return exp
    })
  }, [data, experienceCategories])

  const setFilter = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(searchParams)
    if (value == null || value === '') next.delete(key)
    else next.set(key, String(value))
    setSearchParams(next, { replace: false })
  }

  const batchChange = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    setSearchParams(next, { replace: false })
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: false })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  const advancedCount =
    (filters.min_price != null || filters.max_price != null ? 1 : 0) +
    (filters.duration ? 1 : 0) +
    (filters.min_rating != null ? 1 : 0)

  const activeChips: { key: string; label: string }[] = []
  if (filters.q) activeChips.push({ key: 'q', label: `Búsqueda: "${filters.q}"` })
  if (filters.city)
    activeChips.push({ key: 'city', label: `Destino: ${filters.city}` })
  if (filters.category)
    activeChips.push({ key: 'category', label: filters.category })
  if (filters.date)
    activeChips.push({ key: 'date', label: `Fecha: ${filters.date}` })
  if (filters.guests)
    activeChips.push({
      key: 'guests',
      label: `${filters.guests} participante${filters.guests !== 1 ? 's' : ''}`,
    })
  if (filters.min_price != null || filters.max_price != null) {
    activeChips.push({
      key: 'price',
      label: `$${(filters.min_price ?? 0).toLocaleString('es-MX')} – ${
        filters.max_price != null
          ? `$${filters.max_price.toLocaleString('es-MX')}`
          : 'Sin tope'
      }`,
    })
  }
  if (filters.duration) {
    const durLabel =
      DURATION_OPTIONS.find((d) => d.value === filters.duration)?.label ??
      filters.duration
    activeChips.push({ key: 'duration', label: durLabel })
  }
  if (filters.min_rating) {
    activeChips.push({
      key: 'min_rating',
      label: `${filters.min_rating}+ estrellas`,
    })
  }

  const removeChip = (key: string) => {
    if (key === 'price') {
      batchChange({ min_price: null, max_price: null })
    } else if (key === 'category') {
      batchChange({ category: null, category_id: null })
    } else {
      setFilter(key, null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      <LandingNavbar />

      <main className="pt-16 flex-1">
        {/* Encabezado hero compacto */}
        <section className="bg-gradient-to-br from-parchment-50 via-white to-vivid-tangerine-50/50 border-b border-cool-steel-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-vivid-tangerine-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Compass size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-vivid-tangerine-600">
                Explorar · Experiencias
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-cool-steel-900">
              Experiencias auténticas guiadas por expertos locales
            </h1>
            <p className="text-sm text-cool-steel-600 mt-1 max-w-2xl">
              Gastronomía regional, inmersiones en la naturaleza, historia viva y
              talleres creativos para transformar cada viaje.
            </p>
          </div>
        </section>

        {/* Barra de formulario de búsqueda con filtros */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-cool-steel-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 space-y-3">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 bg-cool-steel-50/70 lg:bg-white rounded-2xl lg:rounded-full border border-cool-steel-200 p-2 lg:px-3 lg:py-1.5 shadow-sm">
                {/* Actividad / Palabra clave */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 lg:border-r lg:border-cool-steel-200 min-w-0">
                  <Compass
                    size={16}
                    className="text-vivid-tangerine-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Experiencia
                    </label>
                    <input
                      type="text"
                      value={filters.q ?? ''}
                      onChange={(e) => setFilter('q', e.target.value || null)}
                      placeholder="Mezcal, cenote, cocina..."
                      className="w-full text-sm bg-transparent outline-none placeholder:text-cool-steel-400 text-cool-steel-900"
                    />
                  </div>
                </div>

                {/* Destino */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 lg:border-r lg:border-cool-steel-200 min-w-0">
                  <MapPin
                    size={16}
                    className="text-vivid-tangerine-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Destino
                    </label>
                    <input
                      type="text"
                      value={filters.city ?? ''}
                      onChange={(e) => setFilter('city', e.target.value || null)}
                      placeholder="¿En qué ciudad?"
                      className="w-full text-sm bg-transparent outline-none placeholder:text-cool-steel-400 text-cool-steel-900"
                    />
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 lg:border-r lg:border-cool-steel-200 min-w-0">
                  <Calendar
                    size={16}
                    className="text-vivid-tangerine-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={filters.date ?? ''}
                      onChange={(e) => setFilter('date', e.target.value || null)}
                      className="w-full text-sm bg-transparent outline-none text-cool-steel-900"
                    />
                  </div>
                </div>

                {/* Participantes */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 min-w-0">
                  <Users
                    size={16}
                    className="text-vivid-tangerine-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-cool-steel-500 leading-tight">
                      Participantes
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={filters.guests ?? ''}
                      onChange={(e) =>
                        setFilter(
                          'guests',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="¿Cuántas personas?"
                      className="w-full text-sm bg-transparent outline-none placeholder:text-cool-steel-400 text-cool-steel-900"
                    />
                  </div>
                </div>
              </div>

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

            {/* Categorías reales desde /experience-categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              <button
                type="button"
                onClick={() => batchChange({ category: null, category_id: null })}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  !filters.category && filters.category_id == null
                    ? 'bg-cool-steel-900 text-white shadow-sm'
                    : 'bg-cool-steel-50 text-cool-steel-700 border border-cool-steel-200 hover:bg-white'
                }`}
              >
                Todas las categorías
              </button>

              {categoriesLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={`exp-cat-skel-${index}`}
                    className="h-7 w-28 rounded-full shrink-0"
                  />
                ))}

              {!categoriesLoading &&
                experienceCategories.map((cat) => {
                  const isSelected =
                    (filters.category_id != null &&
                      cat.id > 0 &&
                      filters.category_id === cat.id) ||
                    (Boolean(filters.category) &&
                      normalizeText(filters.category ?? '') ===
                        normalizeText(cat.name))

                  return (
                    <button
                      key={cat.id || cat.name}
                      type="button"
                      title={cat.description ?? undefined}
                      onClick={() =>
                        batchChange(
                          isSelected
                            ? { category: null, category_id: null }
                            : {
                                category: cat.name,
                                category_id: cat.id > 0 ? cat.id : null,
                              }
                        )
                      }
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-cool-steel-900 text-white shadow-sm'
                          : 'bg-cool-steel-50 text-cool-steel-700 border border-cool-steel-200 hover:bg-white'
                      }`}
                    >
                      {cat.icon_url && (
                        <img
                          src={cat.icon_url}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                          className={`w-3.5 h-3.5 object-contain shrink-0 ${
                            isSelected ? 'brightness-0 invert' : ''
                          }`}
                        />
                      )}
                      <span>{cat.name}</span>
                    </button>
                  )
                })}
            </div>

            {/* Panel de filtros avanzados */}
            {filtersOpen && (
              <div className="rounded-2xl border border-cool-steel-200 bg-surface-muted p-4 sm:p-5 space-y-4 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Precio por persona */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2">
                      Precio por persona (MXN)
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cool-steel-400">
                          $
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={filters.min_price ?? ''}
                          onChange={(e) =>
                            setFilter(
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
                          step={50}
                          value={filters.max_price ?? ''}
                          onChange={(e) =>
                            setFilter(
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
                          batchChange({ min_price: null, max_price: 1200 })
                        }
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                      >
                        Hasta $1,200
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          batchChange({ min_price: 1200, max_price: 2200 })
                        }
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                      >
                        $1,200 – $2,200
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          batchChange({ min_price: 2200, max_price: null })
                        }
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-cool-steel-200 text-cool-steel-700 hover:border-vivid-tangerine-400 cursor-pointer"
                      >
                        $2,200+
                      </button>
                    </div>
                  </div>

                  {/* Duración */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2 flex items-center gap-1.5">
                      <Clock size={13} className="text-vivid-tangerine-500" />
                      Duración
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DURATION_OPTIONS.map((opt) => {
                        const active = (filters.duration ?? null) === opt.value
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('duration', opt.value)}
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

                  {/* Calificación */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cool-steel-600 mb-2 flex items-center gap-1.5">
                      <Star size={13} className="text-vivid-tangerine-500" />
                      Calificación mínima
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Cualquiera', value: null },
                        { label: '4.8+', value: 4.8 },
                        { label: '4.9+', value: 4.9 },
                      ].map((opt) => {
                        const active =
                          (filters.min_rating ?? null) === opt.value
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('min_rating', opt.value)}
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

                <div className="flex items-center justify-between pt-3 border-t border-cool-steel-200">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cool-steel-600 hover:text-cool-steel-900 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Limpiar filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="px-4 py-2 rounded-xl bg-cool-steel-900 hover:bg-cool-steel-950 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Ver {experiences.length} experiencia
                    {experiences.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Chips activos */}
        {activeChips.length > 0 && (
          <div className="bg-white border-b border-cool-steel-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-steel-900 text-white text-xs font-medium shrink-0 hover:bg-cool-steel-950 transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={12} />
                Limpiar ({activeChips.length})
              </button>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cool-steel-300 bg-white hover:border-vivid-tangerine-400 text-xs text-cool-steel-700 shrink-0 transition-colors cursor-pointer"
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
        )}

        {/* Grid de experiencias encontradas */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-vivid-tangerine-500">
                Catálogo verificado
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-cool-steel-900">
                {isLoading
                  ? 'Buscando experiencias...'
                  : experiences.length === 0
                    ? 'Sin coincidencias'
                    : `${experiences.length} experiencia${
                        experiences.length !== 1 ? 's' : ''
                      } disponible${experiences.length !== 1 ? 's' : ''}${
                        filters.city ? ` en "${filters.city}"` : ''
                      }`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="experiences-sort"
                className="text-xs font-medium text-cool-steel-500"
              >
                Ordenar:
              </label>
              <select
                id="experiences-sort"
                value={filters.sort ?? 'recommended'}
                onChange={(e) =>
                  setFilter(
                    'sort',
                    e.target.value === 'recommended' ? null : e.target.value
                  )
                }
                className="rounded-xl border border-cool-steel-200 bg-white px-3 py-1.5 text-xs font-medium text-cool-steel-800 outline-none focus:border-vivid-tangerine-400"
              >
                <option value="recommended">Recomendadas</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating_desc">Mejor calificadas</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-cool-steel-100 bg-white p-3 space-y-3"
                >
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-16 bg-white border border-cool-steel-100 rounded-2xl">
              <p className="text-sm text-cool-steel-500">
                No pudimos cargar las experiencias. Intenta de nuevo.
              </p>
            </div>
          )}

          {!isLoading && !isError && experiences.length === 0 && (
            <div className="text-center py-16 px-4 bg-white border border-cool-steel-100 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center mx-auto mb-3">
                <Compass size={22} />
              </div>
              <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
                No encontramos experiencias para tu búsqueda
              </h3>
              <p className="text-sm text-cool-steel-500 mb-4 max-w-sm mx-auto">
                Ajusta los términos de búsqueda, categoría o rango de precios
                para descubrir más actividades.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {!isLoading && !isError && experiences.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {experiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  onSelect={setSelectedExperience}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />

      {/* Footer */}
      <footer className="border-t border-cool-steel-100 bg-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
