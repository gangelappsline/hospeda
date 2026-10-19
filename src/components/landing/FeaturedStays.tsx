import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { getFeaturedStays } from '@/api/public'
import type { StayCategory } from '@/types/public'
import CategoryTabs from './CategoryTabs'
import StayCard from './StayCard'
import Skeleton from '@/components/ui/Skeleton'

export default function FeaturedStays() {
  const [category, setCategory] = useState<StayCategory>('all')

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
    return data.filter((s) => s.type.name === category)
  }, [data, category])

  return (
    <section id="explorar" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
      <div className="mb-8">
        <CategoryTabs active={category} onChange={setCategory} />
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
        <a
          href="#"
          className="text-sm font-medium text-vivid-tangerine-500 hover:text-vivid-tangerine-600 transition-colors shrink-0"
        >
          Ver todas
        </a>
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

      {!isLoading && !isError && stays.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {stays.map((stay, index) => (
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