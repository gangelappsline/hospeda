import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  MapPin,
  PawPrint,
  RotateCcw,
  SearchX,
  Star,
  Users,
  Wallet,
  Check,
} from 'lucide-react'
import { useSearchLodgings } from '@/hooks/useSearchLodgings'
import { usePublicLodgingCategories } from '@/hooks/usePublicCategories'
import StayCard from './StayCard'
import Skeleton from '@/components/ui/Skeleton'
import { formatDayMonth, diffInNights } from '@/utils/dates'
import {
  filtersToQueryString,
  getTotalGuests,
  type HomeSearchDraft,
} from '@/utils/homeSearch'
import type { LodgingSearchFilters } from '@/types/public'

interface Props {
  filters: LodgingSearchFilters
  draft: HomeSearchDraft
  onClear: () => void
}

const MAX_VISIBLE_RESULTS = 6

export default function HeroSearchResults({ filters, draft, onClear }: Props) {
  const { data, isLoading, isError } = useSearchLodgings(filters)
  const { data: lodgingCategories = [] } = usePublicLodgingCategories()

  const stays = useMemo(() => {
    const rawStays = data ?? []
    if (lodgingCategories.length === 0) return rawStays
    const nameById = new Map(lodgingCategories.map((cat) => [cat.id, cat.name]))
    return rawStays.map((stay) => {
      if (
        stay.type.id > 0 &&
        stay.type.name === 'Alojamiento' &&
        nameById.has(stay.type.id)
      ) {
        return {
          ...stay,
          type: { id: stay.type.id, name: nameById.get(stay.type.id)! },
        }
      }
      return stay
    })
  }, [data, lodgingCategories])

  const total = stays.length
  const visible = stays.slice(0, MAX_VISIBLE_RESULTS)
  const seeAllHref = `/alojamientos${filtersToQueryString(filters)}`
  const nights =
    draft.checkIn && draft.checkOut
      ? Math.max(1, diffInNights(draft.checkIn, draft.checkOut))
      : null
  const guests = getTotalGuests(draft)

  const chips: Array<{ key: string; icon: React.ReactNode; label: string }> = []

  if (draft.destination.trim()) {
    chips.push({
      key: 'destination',
      icon: <MapPin size={12} />,
      label: draft.destination.trim(),
    })
  }
  if (draft.checkIn && draft.checkOut) {
    chips.push({
      key: 'dates',
      icon: <CalendarDays size={12} />,
      label: `${formatDayMonth(draft.checkIn)} → ${formatDayMonth(
        draft.checkOut
      )}${nights ? ` · ${nights} noche${nights === 1 ? '' : 's'}` : ''}`,
    })
  } else if (draft.checkIn) {
    chips.push({
      key: 'dates',
      icon: <CalendarDays size={12} />,
      label: `Desde ${formatDayMonth(draft.checkIn)}`,
    })
  }
  if (guests > 1) {
    chips.push({
      key: 'guests',
      icon: <Users size={12} />,
      label: `${guests} huéspedes`,
    })
  }
  if (draft.pets > 0) {
    chips.push({
      key: 'pets',
      icon: <PawPrint size={12} />,
      label: `${draft.pets} mascota${draft.pets === 1 ? '' : 's'}`,
    })
  }
  if (draft.bedrooms != null) {
    chips.push({
      key: 'bedrooms',
      icon: <BedDouble size={12} />,
      label: `${draft.bedrooms}+ recámaras`,
    })
  }
  if (draft.minPrice != null || draft.maxPrice != null) {
    chips.push({
      key: 'price',
      icon: <Wallet size={12} />,
      label:
        draft.minPrice != null && draft.maxPrice != null
          ? `$${draft.minPrice.toLocaleString('es-MX')} – $${draft.maxPrice.toLocaleString('es-MX')}`
          : draft.maxPrice != null
            ? `Hasta $${draft.maxPrice.toLocaleString('es-MX')}`
            : `Desde $${draft.minPrice!.toLocaleString('es-MX')}`,
    })
  }
  if (draft.minRating != null) {
    chips.push({
      key: 'rating',
      icon: <Star size={12} />,
      label: `${draft.minRating}+ estrellas`,
    })
  }
  if (draft.categoryName) {
    chips.push({
      key: 'type',
      icon: <Check size={12} />,
      label: draft.categoryName,
    })
  }
  draft.amenities.forEach((amenity) => {
    chips.push({ key: `amenity-${amenity}`, icon: <Check size={12} />, label: amenity })
  })

  const heading = draft.destination.trim()
    ? `Alojamientos en ${draft.destination.trim()}`
    : 'Alojamientos disponibles'

  return (
    <section
      id="resultados"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-12 pb-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vivid-tangerine-600">
            Tu búsqueda
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-cool-steel-900 sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-cool-steel-500" aria-live="polite">
            {isLoading
              ? 'Buscando las mejores opciones para ti…'
              : isError
                ? 'No pudimos completar la búsqueda.'
                : `${total} alojamiento${total === 1 ? '' : 's'} encontrado${
                    total === 1 ? '' : 's'
                  }${draft.destination.trim() ? '' : ' en México'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cool-steel-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-cool-steel-700 transition-colors hover:bg-cool-steel-50"
          >
            <RotateCcw size={14} />
            Limpiar búsqueda
          </button>
          <Link
            to={seeAllHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cool-steel-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-cool-steel-800"
          >
            Ver todos los resultados
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {chips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-cool-steel-200 bg-white px-3 py-1.5 text-[11px] font-medium text-cool-steel-700"
            >
              <span className="text-vivid-tangerine-500">{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-2xl border border-cool-steel-100 bg-white p-10 text-center">
          <p className="text-sm text-cool-steel-600">
            No pudimos cargar los resultados. Intenta de nuevo en un momento.
          </p>
        </div>
      )}

      {!isLoading && !isError && total === 0 && (
        <div className="rounded-2xl border border-dashed border-cool-steel-200 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cool-steel-100 bg-cool-steel-50">
            <SearchX size={24} className="text-cool-steel-500" />
          </div>
          <h3 className="text-lg font-semibold text-cool-steel-900">
            No encontramos alojamientos con esos filtros
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-cool-steel-500">
            Prueba con otras fechas, menos huéspedes o quita algunos filtros para
            ver más opciones.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-vivid-tangerine-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vivid-tangerine-600"
            >
              <RotateCcw size={14} />
              Ajustar búsqueda
            </button>
            <Link
              to={seeAllHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cool-steel-200 px-4 py-2.5 text-sm font-semibold text-cool-steel-700 transition-colors hover:bg-cool-steel-50"
            >
              Ver en la página de alojamientos
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !isError && total > 0 && (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((stay, index) => (
              <StayCard key={stay.id} stay={stay} index={index} />
            ))}
          </div>

          {total > MAX_VISIBLE_RESULTS && (
            <div className="mt-8 flex justify-center">
              <Link
                to={seeAllHref}
                className="inline-flex items-center gap-2 rounded-xl border border-cool-steel-300 bg-white px-5 py-3 text-sm font-semibold text-cool-steel-900 transition-colors hover:bg-cool-steel-50"
              >
                Ver los {total} alojamientos
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
