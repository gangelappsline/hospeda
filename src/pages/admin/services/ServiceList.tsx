import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  ConciergeBell,
  Check,
} from 'lucide-react'
import { getServices } from '@/api/services'
import type { Service } from '@/types/service'
import ServiceRow from '@/components/admin/services/ServiceRow'
import ServiceModal from '@/components/admin/services/ServiceModal'
import DeleteServiceModal from '@/components/admin/services/DeleteServiceModal'

export default function ServiceList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [search, setSearch] = useState('')

  const { data: services = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  })

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services
    const term = search.toLowerCase()
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.category?.name ?? '').toLowerCase().includes(term)
    )
  }, [services, search])

  const activeCount = services.filter((s) => s.active).length

  const handleCreate = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleDelete = (service: Service) => {
    setDeletingService(service)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/services" className="hover:text-gray-700">
          Servicios
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Lista</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los servicios disponibles para los alojamientos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin text-orange-500' : ''}
            />
            Refrescar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo servicio
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center">
            <ConciergeBell size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Catálogo de servicios
            </p>
            <p className="text-xs text-gray-500">
              {services.length}{' '}
              {services.length === 1
                ? 'servicio registrado'
                : 'servicios registrados'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold text-orange-600">
            {activeCount} activos
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Buscador */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar servicio..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <ConciergeBell size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search
                ? 'Sin resultados'
                : 'Aún no hay servicios registrados'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron servicios que coincidan con "${search}".`
                : 'Crea tu primer servicio para ofrecer opciones adicionales a los huéspedes.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primer servicio
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={editingService}
      />
      <DeleteServiceModal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        service={deletingService}
      />
    </div>
  )
}
