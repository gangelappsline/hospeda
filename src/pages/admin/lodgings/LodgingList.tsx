import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Check,
  Pencil,
  Trash2,
  Compass,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { getHostLodgings } from '@/api/host'
import { useDeleteHostLodging } from '@/hooks/useHostLodgings'
import type { HostLodging } from '@/types/hostLodgings'

export default function LodgingList() {
  const [search, setSearch] = useState('')
  const deleteMutation = useDeleteHostLodging()

  const { data: lodgings = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['host-lodgings'],
    queryFn: getHostLodgings,
  })

  const filteredLodgings = useMemo(() => {
    if (!search.trim()) return lodgings
    const term = search.toLowerCase()
    return lodgings.filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        (l.address?.city ?? '').toLowerCase().includes(term) ||
        (l.type?.name ?? '').toLowerCase().includes(term)
    )
  }, [lodgings, search])

  const publishedCount = lodgings.filter((l) => l.status === 'published').length

  const handleDelete = (lodging: HostLodging) => {
    if (window.confirm(`¿Estás seguro de eliminar el alojamiento "${lodging.title}"?`)) {
      deleteMutation.mutate(lodging.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cool-steel-500">
        <Link to="/admin/lodgings" className="hover:text-cool-steel-700">
          Alojamientos
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <span className="text-cool-steel-900 font-medium">Lista</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Alojamientos</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Administra las propiedades registradas en el catálogo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cool-steel-200 bg-white text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin text-vivid-tangerine-500' : ''}
            />
            Refrescar
          </button>
          <Link
            to="/admin/lodgings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo alojamiento
          </Link>
        </div>
      </div>

      {/* Banner de resumen */}
      <div className="flex items-center justify-between rounded-xl border border-vivid-tangerine-100 bg-vivid-tangerine-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-vivid-tangerine-100 flex items-center justify-center">
            <Building2 size={18} className="text-vivid-tangerine-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-cool-steel-900">
              Catálogo de alojamientos
            </p>
            <p className="text-xs text-cool-steel-500">
              {lodgings.length}{' '}
              {lodgings.length === 1
                ? 'propiedad registrada'
                : 'propiedades registradas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-pacific-blue-500" />
          <span className="text-sm font-semibold text-pacific-blue-600">
            {publishedCount} publicados
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        {/* Buscador */}
        <div className="p-5 border-b border-cool-steel-100">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alojamiento por título, ciudad o tipo..."
              className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-10 pr-4 text-sm text-cool-steel-700 placeholder-cool-steel-400 focus:border-vivid-tangerine-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
            />
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-cool-steel-50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredLodgings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <Building2 size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              {search ? 'Sin resultados' : 'Aún no hay alojamientos registrados'}
            </h3>
            <p className="text-sm text-cool-steel-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron alojamientos que coincidan con "${search}".`
                : 'Agrega una nueva propiedad para comenzar a recibir reservaciones.'}
            </p>
            {!search && (
              <Link
                to="/admin/lodgings/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
              >
                <Plus size={16} />
                Agregar alojamiento
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cool-steel-50 border-b border-cool-steel-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Alojamiento
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Precio / noche
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cool-steel-100">
                {filteredLodgings.map((lodging) => {
                  const isPublished = lodging.status === 'published'
                  return (
                    <tr key={lodging.id} className="hover:bg-cool-steel-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-cool-steel-100 overflow-hidden shrink-0 border border-cool-steel-200">
                            {lodging.cover ? (
                              <img
                                src={lodging.cover}
                                alt={lodging.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-cool-steel-300">
                                <Building2 size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-cool-steel-900 truncate max-w-xs">
                              {lodging.title}
                            </p>
                            <p className="text-xs text-cool-steel-500">
                              {lodging.guests} huéspedes · {lodging.bedrooms} rec · {lodging.bathrooms} baños
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-cool-steel-700">
                        {lodging.type?.name || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-cool-steel-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-cool-steel-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {lodging.address?.city || 'Sin ciudad'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-cool-steel-900">
                        ${lodging.base_price.toLocaleString('es-MX')} MXN
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPublished
                              ? 'bg-pacific-blue-100 text-pacific-blue-800'
                              : 'bg-tangerine-dream-100 text-tangerine-dream-800'
                          }`}
                        >
                          {isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Botón directo a Instrucciones de llegada (Paso 6) */}
                          <Link
                            to={`/admin/lodgings/${lodging.id}/edit?step=6`}
                            className="p-1.5 rounded-md text-pacific-blue-600 hover:bg-pacific-blue-50 transition-colors"
                            title="Instrucciones de llegada"
                          >
                            <Compass size={16} />
                          </Link>

                          {/* Editar */}
                          <Link
                            to={`/admin/lodgings/${lodging.id}/edit`}
                            className="p-1.5 rounded-md text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-800 transition-colors"
                            title="Editar alojamiento"
                          >
                            <Pencil size={16} />
                          </Link>

                          {/* Ver en el sitio si tiene slug */}
                          {lodging.slug && (
                            <a
                              href={`/alojamiento/${lodging.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-800 transition-colors"
                              title="Ver en el sitio"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}

                          {/* Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDelete(lodging)}
                            className="p-1.5 rounded-md text-cool-steel-400 hover:bg-vivid-tangerine-50 hover:text-vivid-tangerine-600 transition-colors"
                            title="Eliminar alojamiento"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
