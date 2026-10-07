import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Check,
  Plus,
  ChevronRight,
  Search,
  Award,
  RefreshCw,
} from 'lucide-react'
import { getAmenities } from '@/api/amenities'
import type { Amenity } from '@/types/amenity'
import AmenityRow from '@/components/admin/amenities/AmenityRow'
import AmenityModal from '@/components/admin/amenities/AmenityModal'
import DeleteAmenityModal from '@/components/admin/amenities/DeleteAmenityModal'

export default function Amenities() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [deletingAmenity, setDeletingAmenity] = useState<Amenity | null>(null)
  const [search, setSearch] = useState('')

  const { data: amenities = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  })

  // Filtrado local por búsqueda
  const filteredAmenities = useMemo(() => {
    if (!search.trim()) return amenities
    const term = search.toLowerCase()
    return amenities.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        String(a.id).includes(term)
    )
  }, [amenities, search])

  const activeCount = amenities.filter((a) => a.active).length

  const handleCreate = () => {
    setEditingAmenity(null)
    setIsModalOpen(true)
  }

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity)
    setIsModalOpen(true)
  }

  const handleDelete = (amenity: Amenity) => {
    setDeletingAmenity(amenity)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/settings" className="hover:text-gray-700">
          Configuración
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Amenidades</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amenidades</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las amenidades disponibles para tus alojamientos.
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
            Nueva amenidad
          </button>
        </div>
      </div>

      {/* Banner del catálogo */}
      <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center">
            <Award size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Catálogo de amenidades
            </p>
            <p className="text-xs text-gray-500">
              {amenities.length}{' '}
              {amenities.length === 1
                ? 'amenidad configurada'
                : 'amenidades configuradas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold text-orange-600">
            {activeCount} activas
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
              placeholder="Buscar amenidad..."
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
        ) : filteredAmenities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Award size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search
                ? 'Sin resultados'
                : 'Aún no hay amenidades configuradas'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron amenidades que coincidan con "${search}".`
                : 'Crea tu primera amenidad para empezar a asignarla a los alojamientos.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primera amenidad
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amenidad
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Icono
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
                {filteredAmenities.map((amenity) => (
                  <AmenityRow
                    key={amenity.id}
                    amenity={amenity}
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
      <AmenityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amenity={editingAmenity}
      />
      <DeleteAmenityModal
        isOpen={!!deletingAmenity}
        onClose={() => setDeletingAmenity(null)}
        amenity={deletingAmenity}
      />
    </div>
  )
}