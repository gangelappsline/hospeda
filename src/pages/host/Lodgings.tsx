import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Home as HomeIcon } from 'lucide-react'
import { useHostLodgings } from '@/hooks/useHostLodgings'
import HostLodgingCard from '@/components/host/HostLodgingCard'
import Skeleton from '@/components/ui/Skeleton'

type StatusFilter = 'all' | 'published' | 'draft'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
]

export default function HostLodgings() {
  const { data, isLoading, isError } = useHostLodgings()

  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((l) => {
      const matchesStatus = status === 'all' || l.status === status
      const matchesQuery =
        query.trim() === '' ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        (l.address?.city ?? '').toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesQuery
    })
  }, [data, status, query])

  // Contadores para los tabs
  const counts = useMemo(() => {
    const all = data?.length ?? 0
    const published = data?.filter((l) => l.status === 'published').length ?? 0
    const draft = data?.filter((l) => l.status === 'draft').length ?? 0
    return { all, published, draft }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">
            Mis alojamientos
          </h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Administra tus propiedades, publícalas o edítalas.
          </p>
        </div>
        <Link
          to="/host/lodgings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          Agregar alojamiento
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Tabs de estado */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-cool-steel-100 w-fit">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value
            const count = counts[tab.value]
            return (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-cool-steel-900 shadow-sm'
                    : 'text-cool-steel-600 hover:text-cool-steel-900'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-cool-steel-400">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Buscador */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o ciudad..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-cool-steel-300 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Estados */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <LodgingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-white rounded-xl border border-cool-steel-200">
          <p className="text-sm text-cool-steel-500">
            No pudimos cargar tus alojamientos. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState hasFilters={query !== '' || status !== 'all'} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((lodging) => (
            <HostLodgingCard key={lodging.id} lodging={lodging} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ----- Subcomponentes ----- */

function LodgingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-cool-steel-200 overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 pt-3">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-cool-steel-200">
      <div className="w-14 h-14 mx-auto rounded-full bg-cool-steel-100 flex items-center justify-center mb-4">
        <HomeIcon size={24} className="text-cool-steel-400" />
      </div>
      <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
        {hasFilters ? 'Sin resultados' : 'Aún no tienes alojamientos'}
      </h3>
      <p className="text-sm text-cool-steel-500 mb-4 max-w-sm mx-auto">
        {hasFilters
          ? 'Prueba con otros filtros o términos de búsqueda.'
          : 'Agrega tu primera propiedad para empezar a recibir reservas.'}
      </p>
      {!hasFilters && (
        <Link
          to="/host/lodgings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Agregar alojamiento
        </Link>
      )}
    </div>
  )
}