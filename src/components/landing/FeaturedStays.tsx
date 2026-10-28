import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { getFeaturedStays } from '@/api/public'
import { normalizeText } from '@/utils/exploreFallback'
import type { PublicCategory, StayCategory } from '@/types/public'
import { ArrowRight } from 'lucide-react'
import CategoryTabs from './CategoryTabs'
import StayCard from './StayCard'
import Skeleton from '@/components/ui/Skeleton'

interface Props {
  /** Query string con los parámetros de búsqueda seleccionados en el hero. */
  seeAllQuery?: string
}

/** La home muestra una selección corta; el resto vive en /alojamientos. */
const MAX_VISIBLE_STAYS = 6

export default function FeaturedStays({ seeAllQuery = '' }: Props) {
  const [category, setCategory] = useState<StayCategory>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-stays'],
    queryFn: getFeaturedStays,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })

  const stays = useMemo(() => {
    if (!data) return []
    if (category === 'all') return data
    const targetNorm = normalizeText(category)
    return data.filter((s) => {
      if (selectedCategoryId && s.type.id > 0 && s.type.id === selectedCategoryId) {
        return true
      }
      return normalizeText(s.type.name) === targetNorm
    })
  }, [data, category, selectedCategoryId])

  const visibleStays = useMemo(
    () => stays.slice(0, MAX_VISIBLE_STAYS),
    [stays]
  )

  // "Ver todas" conserva la búsqueda del hero y la categoría activa.
  const seeAllHref = useMemo(() => {
    const params = new URLSearchParams(
      seeAllQuery.startsWith('?') ? seeAllQuery.slice(1) : seeAllQuery
    )

    if (category !== 'all') {
      params.set('type', category)
      if (selectedCategoryId != null) {
        params.set('category_id', String(selectedCategoryId))
      }
    }

    const qs = params.toString()
    return `/alojamientos${qs ? `?${qs}` : ''}`
  }, [seeAllQuery, category, selectedCategoryId])

  const handleCategoryChange = (
    nextCategory: StayCategory,
    categoryObj?: PublicCategory | null
  ) => {
    setCategory(nextCategory)
    setSelectedCategoryId(categoryObj?.id ?? null)
  }

  return (
    <section id="explorar" className="mx-auto max-w-7xl scroll-mt-20 px-6 pt-12 pb-10">
      <div className="mb-6">
        <CategoryTabs active={category} onChange={handleCategoryChange} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-cool-steel-900 mb-1">
            Estancias destacadas
          </h2>
          <p className="text-sm text-cool-steel-500">
            Seleccionadas por su calificación y calidad de anfitrión.
          </p>
        </div>
        <Link
          to={seeAllHref}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-vivid-tangerine-500 transition-colors hover:text-vivid-tangerine-600"
        >
          Ver todas
          <ArrowRight size={14} />
        </Link>
      </motion.div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <StayCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-sm text-cool-steel-500">
            No pudimos cargar las estancias. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {!isLoading && !isError && stays.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-cool-steel-500">
            No hay estancias disponibles en esta categoría.
          </p>
        </div>
      )}

      {!isLoading && !isError && visibleStays.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleStays.map((stay, index) => (
            <StayCard key={stay.id} stay={stay} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

function StayCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}