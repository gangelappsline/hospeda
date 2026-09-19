import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { getFeaturedStays } from '@/api/public'
import type { FeaturedStay, StayCategory } from '@/types/public'
import CategoryTabs from './CategoryTabs'
import StayCard from './StayCard'
import Skeleton from '@/components/ui/Skeleton'

// Datos mock de fallback mientras la API responde
const MOCK_STAYS: FeaturedStay[] = [
  {
    id: 1,
    title: 'Loft Condesa con terraza privada',
    location: 'Ciudad de México, México',
    rating: 4.94,
    guests: 4,
    bedrooms: 2,
    price_per_night: 2100,
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    is_superhost: true,
    category: 'city',
  },
  {
    id: 2,
    title: 'Casa frente al mar en Tulum',
    location: 'Tulum, México',
    rating: 4.88,
    guests: 6,
    bedrooms: 3,
    price_per_night: 4500,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    is_superhost: true,
    category: 'all',
  },
  {
    id: 3,
    title: 'Cabaña de madera en el bosque',
    location: 'Valle de Bravo, México',
    rating: 4.79,
    guests: 5,
    bedrooms: 2,
    price_per_night: 2300,
    image_url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    is_superhost: false,
    category: 'cabins',
  },
  {
    id: 4,
    title: 'Departamento minimalista en Polanco',
    location: 'Ciudad de México, México',
    rating: 4.91,
    guests: 2,
    bedrooms: 1,
    price_per_night: 3750,
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    is_superhost: false,
    category: 'design',
  },
  {
    id: 5,
    title: 'Hacienda colonial restaurada',
    location: 'San Miguel de Allende, México',
    rating: 4.97,
    guests: 10,
    bedrooms: 5,
    price_per_night: 4650,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    is_superhost: true,
    category: 'haciendas',
  },
  {
    id: 6,
    title: 'Suite con alberca infinita',
    location: 'Puerto Vallarta, México',
    rating: 4.85,
    guests: 4,
    bedrooms: 2,
    price_per_night: 3980,
    image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
    is_superhost: false,
    category: 'views',
  },
]

export default function FeaturedStays() {
  const [category, setCategory] = useState<StayCategory>('all')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-stays'],
    queryFn: getFeaturedStays,
    retry: 1,
  })

  // Usar datos de API si existen, si no los mock
  const stays = useMemo(() => {
    const list = !isError && data && data.length > 0 ? data : MOCK_STAYS
    if (category === 'all') return list
    return list.filter((s) => s.category === category)
  }, [data, isError, category])

  return (
    <section id="explorar" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
      {/* Tabs de categoría */}
      <div className="mb-8">
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Estancias destacadas
          </h2>
          <p className="text-sm text-gray-500">
            Seleccionadas por su calificación y calidad de anfitrión.
          </p>
        </div>
        <a
          href="#"
          className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors shrink-0"
        >
          Ver todas
        </a>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : stays.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">
            No hay estancias disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {stays.map((stay, index) => (
            <StayCard key={stay.id} stay={stay} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}