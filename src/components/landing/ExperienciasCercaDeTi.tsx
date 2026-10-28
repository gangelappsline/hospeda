import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Compass as CompassIcon,
} from 'lucide-react'
import { useSearchExperiences } from '@/hooks/useSearchExperiences'
import ExperienceCard from '@/components/explore/ExperienceCard'
import ExperienceDetailModal from '@/components/explore/ExperienceDetailModal'
import Skeleton from '@/components/ui/Skeleton'
import type { PublicExperience } from '@/types/public'

interface Props {
  /** Ciudad de referencia (destino buscado por el usuario). */
  referenceCity?: string
}

const MAX_VISIBLE_EXPERIENCES = 3

const SUGGESTED_CITIES = [
  'Cancún',
  'Tulum',
  'Ciudad de México',
  'Oaxaca',
  'Mérida',
  'San Miguel de Allende',
  'Puerto Vallarta',
] as const

/**
 * "Experiencias cerca de ti": tours, gastronomía y actividades en la ciudad
 * que el usuario está buscando (o en los destinos más populares si aún no
 * eligió uno).
 */
export default function ExperienciasCercaDeTi({ referenceCity = '' }: Props) {
  const normalizedReference = referenceCity.trim()
  const [selectedCity, setSelectedCity] = useState<string>(
    normalizedReference
  )
  const [selectedExperience, setSelectedExperience] =
    useState<PublicExperience | null>(null)

  const activeCity = selectedCity.trim()

  const { data, isLoading, isError } = useSearchExperiences(
    activeCity ? { city: activeCity } : {}
  )

  const experiences = useMemo(
    () => (data ?? []).slice(0, MAX_VISIBLE_EXPERIENCES),
    [data]
  )

  const cityOptions = useMemo(() => {
    const list = [
      normalizedReference,
      ...SUGGESTED_CITIES.filter(
        (city) => city.toLowerCase() !== normalizedReference.toLowerCase()
      ),
    ].filter(Boolean)
    return Array.from(new Set(list)).slice(0, 7)
  }, [normalizedReference])

  const seeAllHref = activeCity
    ? `/experiencias?city=${encodeURIComponent(activeCity)}`
    : '/experiencias'

  const subtitle = activeCity
    ? `Planes, tours y gastronomía en ${activeCity} para completar tu viaje.`
    : 'Tours, gastronomía y aventuras en los destinos más buscados de México.'

  return (
    <section
      id="experiencias"
      className="scroll-mt-20 border-y border-cool-steel-100 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-vivid-tangerine-600">
              <Sparkles size={12} />
              Vive el destino
            </p>
            <h2 className="mt-1.5 flex items-center gap-2 text-2xl font-bold text-cool-steel-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-vivid-tangerine-50 text-vivid-tangerine-600">
                <Compass size={17} />
              </span>
              Experiencias cerca de ti
            </h2>
            <p className="mt-1 max-w-xl text-sm text-cool-steel-500">{subtitle}</p>
          </div>

          <Link
            to={seeAllHref}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-vivid-tangerine-500 transition-colors hover:text-vivid-tangerine-600"
          >
            Ver todas
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Ciudades sugeridas */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cool-steel-500">
            <MapPin size={11} className="text-vivid-tangerine-500" />
            Destino
          </span>

          <button
            type="button"
            onClick={() => setSelectedCity('')}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeCity === ''
                ? 'bg-cool-steel-900 text-white shadow-sm'
                : 'border border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300 hover:bg-cool-steel-50'
            }`}
          >
            Todos
          </button>

          {cityOptions.map((city) => {
            const isActive =
              activeCity.toLowerCase() === city.toLowerCase()
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cool-steel-900 text-white shadow-sm'
                    : 'border border-cool-steel-200 bg-white text-cool-steel-700 hover:border-cool-steel-300 hover:bg-cool-steel-50'
                }`}
              >
                {city}
              </button>
            )
          })}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: MAX_VISIBLE_EXPERIENCES }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-cool-steel-100 bg-white"
              >
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-2xl border border-cool-steel-100 bg-cool-steel-50/60 p-10 text-center">
            <p className="text-sm text-cool-steel-600">
              No pudimos cargar las experiencias. Intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isLoading && !isError && experiences.length === 0 && (
          <div className="rounded-2xl border border-dashed border-cool-steel-200 bg-cool-steel-50/40 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cool-steel-100 bg-white">
              <CompassIcon size={24} className="text-cool-steel-400" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900">
              Aún no hay experiencias en {activeCity || 'esta zona'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-cool-steel-500">
              Prueba con otro destino o explora todas las experiencias
              disponibles.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className="cursor-pointer rounded-xl bg-vivid-tangerine-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vivid-tangerine-600"
              >
                Ver todos los destinos
              </button>
              <Link
                to="/experiencias"
                className="rounded-xl border border-cool-steel-200 px-4 py-2.5 text-sm font-semibold text-cool-steel-700 transition-colors hover:bg-white"
              >
                Explorar experiencias
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !isError && experiences.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onSelect={setSelectedExperience}
              />
            ))}
          </div>
        )}
      </div>

      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />
    </section>
  )
}
