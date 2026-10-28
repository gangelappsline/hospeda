import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  MapPin,
  Calendar,
  Users,
  Search,
  TrendingUp,
  ChevronDown,
  SlidersHorizontal,
  BedDouble,
  Star,
  PawPrint,
  Baby,
  RotateCcw,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react'
import DateRangeCalendar, {
  type DateRange,
} from '@/components/booking/DateRangeCalendar'
import Counter from '@/components/ui/Counter'
import Skeleton from '@/components/ui/Skeleton'
import { useDismissable } from '@/hooks/useUiHelpers'
import { usePublicLodgingCategories } from '@/hooks/usePublicCategories'
import { formatDayMonth } from '@/utils/dates'
import {
  countAdvancedFilters,
  getTotalGuests,
  type HomeSearchDraft,
} from '@/utils/homeSearch'

interface Props {
  draft: HomeSearchDraft
  onChange: (updates: Partial<HomeSearchDraft>) => void
  onSubmit: () => void
  /** Búsqueda inmediata al tocar un destino popular. */
  onQuickSearch?: (destination: string) => void
  onClear: () => void
  isSearching?: boolean
}

const BEDROOM_OPTIONS = [
  { label: 'Todas', value: null },
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

const PRICE_PRESETS = [
  { label: 'Hasta $2,500', min: null, max: 2500 },
  { label: '$2,500 – $4,500', min: 2500, max: 4500 },
  { label: '$4,500+', min: 4500, max: null },
] as const

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

const POPULAR_DESTINATIONS = [
  'Cancún',
  'Tulum',
  'Ciudad de México',
  'Oaxaca',
  'Los Cabos',
  'Valle de Bravo',
] as const

export default function Hero({
  draft,
  onChange,
  onSubmit,
  onQuickSearch,
  onClear,
  isSearching = false,
}: Props) {
  const [datesOpen, setDatesOpen] = useState(false)
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const datesRef = useDismissable(datesOpen, () => setDatesOpen(false))
  const guestsRef = useDismissable(guestsOpen, () => setGuestsOpen(false))

  const { data: categories = [], isLoading: categoriesLoading } =
    usePublicLodgingCategories()

  const advancedCount = countAdvancedFilters(draft)
  const totalGuests = getTotalGuests(draft)
  const range: DateRange = { checkIn: draft.checkIn, checkOut: draft.checkOut }

  const guestsSummary = [
    `${totalGuests} huésped${totalGuests === 1 ? '' : 'es'}`,
    draft.pets > 0
      ? `${draft.pets} mascota${draft.pets === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const toggleAmenity = (amenity: string) => {
    const selected = draft.amenities.includes(amenity)
    onChange({
      amenities: selected
        ? draft.amenities.filter((item) => item !== amenity)
        : [...draft.amenities, amenity],
    })
  }

  return (
    <section className="relative flex min-h-[760px] items-center justify-center lg:min-h-[880px]">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
          alt="Hospedaje de lujo"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cool-steel-950/55 via-cool-steel-950/35 to-cool-steel-950/65" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md"
        >
          <TrendingUp size={13} />
          Más de 12,000 viajeros hospedados este mes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Encuentra tu próximo lugar favorito
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
        >
          Estancias verificadas, precios transparentes y anfitriones de confianza
          en todo México. Así debería sentirse viajar.
        </motion.p>

        {/* Buscador */}
        <motion.form
          onSubmit={(event) => {
            event.preventDefault()
            setDatesOpen(false)
            setGuestsOpen(false)
            onSubmit()
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto max-w-4xl text-left"
        >
          <div className="rounded-3xl border border-white/50 bg-white/95 p-2.5 shadow-2xl shadow-cool-steel-950/25 backdrop-blur-xl">
            {/* Fila principal */}
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-[1.25fr_1.15fr_1fr_auto]">
              {/* Destino */}
              <label className="flex cursor-text items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-cool-steel-50 focus-within:bg-cool-steel-50">
                <MapPin size={18} className="shrink-0 text-vivid-tangerine-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-cool-steel-500">
                    Destino
                  </span>
                  <input
                    type="text"
                    value={draft.destination}
                    onChange={(event) =>
                      onChange({ destination: event.target.value })
                    }
                    placeholder="¿A dónde vas?"
                    className="w-full bg-transparent text-sm font-medium text-cool-steel-900 placeholder:font-normal placeholder:text-cool-steel-400 focus:outline-none"
                  />
                </span>
              </label>

              {/* Fechas */}
              <div ref={datesRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGuestsOpen(false)
                    setDatesOpen((open) => !open)
                  }}
                  aria-expanded={datesOpen}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                    datesOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
                  }`}
                >
                  <Calendar
                    size={18}
                    className="shrink-0 text-vivid-tangerine-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-cool-steel-500">
                      Fechas
                    </span>
                    <span
                      className={`block truncate text-sm ${
                        draft.checkIn
                          ? 'font-medium text-cool-steel-900'
                          : 'text-cool-steel-400'
                      }`}
                    >
                      {draft.checkIn
                        ? `${formatDayMonth(draft.checkIn)} → ${
                            draft.checkOut
                              ? formatDayMonth(draft.checkOut)
                              : 'Salida'
                          }`
                        : 'Llegada y salida'}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
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
                      className="fixed inset-0 z-[105] cursor-default bg-cool-steel-950/40 sm:hidden"
                    />
                    <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:inset-x-auto sm:left-1/2 sm:top-full sm:z-50 sm:mt-3 sm:w-[640px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2">
                      <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl border border-cool-steel-200 bg-white p-4 shadow-2xl shadow-cool-steel-950/25 sm:rounded-2xl">
                        <DateRangeCalendar
                          value={range}
                          onChange={(next) =>
                            onChange({
                              checkIn: next.checkIn,
                              checkOut: next.checkOut,
                            })
                          }
                          numberOfMonths={2}
                          compact
                        />
                        <button
                          type="button"
                          onClick={() => setDatesOpen(false)}
                          className="mt-3 w-full cursor-pointer rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Huéspedes */}
              <div ref={guestsRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDatesOpen(false)
                    setGuestsOpen((open) => !open)
                  }}
                  aria-expanded={guestsOpen}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                    guestsOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
                  }`}
                >
                  <Users
                    size={18}
                    className="shrink-0 text-vivid-tangerine-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-cool-steel-500">
                      Huéspedes
                    </span>
                    <span className="block truncate text-sm font-medium text-cool-steel-900">
                      {guestsSummary}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-cool-steel-400 transition-transform ${
                      guestsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {guestsOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar selector de huéspedes"
                      onClick={() => setGuestsOpen(false)}
                      className="fixed inset-0 z-[105] cursor-default bg-cool-steel-950/40 sm:hidden"
                    />
                    <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:z-50 sm:mt-3 sm:w-80">
                      <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl border border-cool-steel-200 bg-white p-4 shadow-2xl shadow-cool-steel-950/25 sm:rounded-2xl">
                        <p className="mb-1 text-sm font-semibold text-cool-steel-900">
                          ¿Quién viaja?
                        </p>
                        <p className="mb-3 text-xs text-cool-steel-500">
                          Indica el total de personas para filtrar por capacidad.
                        </p>

                        <div className="divide-y divide-cool-steel-100">
                          <div className="py-3">
                            <Counter
                              icon={<Users size={15} />}
                              label="Adultos"
                              hint="13 años o más"
                              value={draft.adults}
                              min={1}
                              max={16}
                              onChange={(adults) => onChange({ adults })}
                            />
                          </div>
                          <div className="py-3">
                            <Counter
                              icon={<Baby size={15} />}
                              label="Menores"
                              hint="De 0 a 12 años"
                              value={draft.children}
                              min={0}
                              max={10}
                              onChange={(children) => onChange({ children })}
                            />
                          </div>
                          <div className="py-3">
                            <Counter
                              icon={<PawPrint size={15} />}
                              label="Mascotas"
                              hint="Filtra alojamientos pet friendly"
                              value={draft.pets}
                              min={0}
                              max={5}
                              onChange={(pets) => onChange({ pets })}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setGuestsOpen(false)}
                          className="mt-3 w-full cursor-pointer rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Buscar */}
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-vivid-tangerine-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-vivid-tangerine-600 hover:shadow-lg hover:shadow-vivid-tangerine-500/30 disabled:cursor-wait disabled:opacity-80 lg:py-3"
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                <span>{isSearching ? 'Buscando…' : 'Buscar'}</span>
              </button>
            </div>

            {/* Barra intermedia: más filtros + limpiar */}
            <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-cool-steel-100 px-2 pt-2.5 pb-1">
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                aria-expanded={advancedOpen}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  advancedOpen || advancedCount > 0
                    ? 'bg-cool-steel-900 text-white'
                    : 'text-cool-steel-700 hover:bg-cool-steel-50'
                }`}
              >
                <SlidersHorizontal size={14} />
                {advancedOpen ? 'Ocultar filtros' : 'Más filtros'}
                {advancedCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-vivid-tangerine-500 px-1.5 text-[11px] font-bold text-white">
                    {advancedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onClear}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-cool-steel-500 transition-colors hover:bg-cool-steel-50 hover:text-cool-steel-800"
              >
                <RotateCcw size={13} />
                Limpiar
              </button>
            </div>

            {/* Filtros avanzados */}
            <AnimatePresence initial={false}>
              {advancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 border-t border-cool-steel-100 px-2 pt-4 pb-2">
                    {/* Tipo de alojamiento */}
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-600">
                        <Sparkles size={12} className="text-vivid-tangerine-500" />
                        Tipo de alojamiento
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onChange({ categoryId: null, categoryName: null })
                          }
                          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            draft.categoryName === null
                              ? 'border-cool-steel-900 bg-cool-steel-900 text-white'
                              : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300'
                          }`}
                        >
                          Todos
                        </button>

                        {categoriesLoading &&
                          Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                              key={`hero-cat-${index}`}
                              className="h-8 w-20 rounded-full"
                            />
                          ))}

                        {!categoriesLoading &&
                          categories.map((category) => {
                            const active =
                              draft.categoryName === category.name ||
                              (draft.categoryId != null &&
                                draft.categoryId === category.id)
                            return (
                              <button
                                key={category.id || category.name}
                                type="button"
                                onClick={() =>
                                  onChange(
                                    active
                                      ? { categoryId: null, categoryName: null }
                                      : {
                                          categoryId:
                                            category.id > 0 ? category.id : null,
                                          categoryName: category.name,
                                        }
                                  )
                                }
                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  active
                                    ? 'border-cool-steel-900 bg-cool-steel-900 text-white'
                                    : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300'
                                }`}
                              >
                                {category.name}
                              </button>
                            )
                          })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      {/* Recámaras */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-600">
                          <BedDouble
                            size={12}
                            className="text-vivid-tangerine-500"
                          />
                          Recámaras mínimas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {BEDROOM_OPTIONS.map((option) => {
                            const active =
                              (draft.bedrooms ?? null) === option.value
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() =>
                                  onChange({ bedrooms: option.value })
                                }
                                className={`cursor-pointer rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  active
                                    ? 'border-cool-steel-900 bg-cool-steel-900 text-white'
                                    : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300'
                                }`}
                              >
                                {option.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Precio */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-600">
                          <span className="text-vivid-tangerine-500">$</span>
                          Precio por noche (MXN)
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={draft.minPrice ?? ''}
                            onChange={(event) =>
                              onChange({
                                minPrice: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                            placeholder="Mínimo"
                            className="w-full rounded-xl border border-cool-steel-200 bg-white px-3 py-2 text-xs text-cool-steel-900 outline-none focus:border-vivid-tangerine-500"
                          />
                          <span className="text-xs text-cool-steel-400">—</span>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={draft.maxPrice ?? ''}
                            onChange={(event) =>
                              onChange({
                                maxPrice: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                            placeholder="Máximo"
                            className="w-full rounded-xl border border-cool-steel-200 bg-white px-3 py-2 text-xs text-cool-steel-900 outline-none focus:border-vivid-tangerine-500"
                          />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {PRICE_PRESETS.map((preset) => {
                            const active =
                              (draft.minPrice ?? null) === preset.min &&
                              (draft.maxPrice ?? null) === preset.max
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() =>
                                  onChange(
                                    active
                                      ? { minPrice: null, maxPrice: null }
                                      : { minPrice: preset.min, maxPrice: preset.max }
                                  )
                                }
                                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                  active
                                    ? 'border-vivid-tangerine-500 bg-vivid-tangerine-50 text-vivid-tangerine-700'
                                    : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-vivid-tangerine-400'
                                }`}
                              >
                                {preset.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Calificación */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-600">
                          <Star size={12} className="text-vivid-tangerine-500" />
                          Calificación mínima
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {RATING_OPTIONS.map((option) => {
                            const active =
                              (draft.minRating ?? null) === option.value
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() =>
                                  onChange({ minRating: option.value })
                                }
                                className={`cursor-pointer rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  active
                                    ? 'border-cool-steel-900 bg-cool-steel-900 text-white'
                                    : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300'
                                }`}
                              >
                                {option.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Amenidades */}
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-600">
                        Amenidades
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {AMENITY_OPTIONS.map((amenity) => {
                          const selected = draft.amenities.includes(amenity)
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? 'border-vivid-tangerine-500 bg-vivid-tangerine-500 text-white shadow-sm'
                                  : 'border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300'
                              }`}
                            >
                              {selected && <Check size={12} />}
                              {amenity}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Destinos populares */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs font-medium text-white/60">Populares:</span>
          {POPULAR_DESTINATIONS.map((destination) => (
            <button
              key={destination}
              type="button"
              onClick={() =>
                onQuickSearch ? onQuickSearch(destination) : onChange({ destination })
              }
              className="cursor-pointer rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {destination}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
