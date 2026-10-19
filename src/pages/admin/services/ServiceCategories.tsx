import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Check, Plus, ChevronRight, Tags, RefreshCw } from 'lucide-react'
import { getServiceCategories } from '@/api/serviceCategories'
import type { ServiceCategory } from '@/types/serviceCategory'
import ServiceCategoryCard from '@/components/admin/service-categories/ServiceCategoryCard'
import ServiceCategoryModal from '@/components/admin/service-categories/ServiceCategoryModal'
import DeleteServiceCategoryModal from '@/components/admin/service-categories/DeleteServiceCategoryModal'

export default function ServiceCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null)

  const { data: categories = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['service-categories-new'],
    queryFn: getServiceCategories,
  })

  const handleCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = (category: ServiceCategory) => {
    setDeletingCategory(category)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/services" className="hover:text-gray-700">
          Servicios
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Categorías</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categorías de servicios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organiza y clasifica los servicios que ofreces en tus alojamientos.
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
            Nueva categoría
          </button>
        </div>
      </div>

      {/* Banner del catálogo */}
      <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center">
            <Tags size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Catálogo de categorías
            </p>
            <p className="text-xs text-gray-500">
              {categories.length}{' '}
              {categories.length === 1
                ? 'categoría configurada'
                : 'categorías configuradas'}{' '}
              para tus servicios
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold text-orange-600">Activo</span>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse"
            >
              <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <Tags size={22} className="text-orange-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Aún no hay categorías de servicios
          </h3>
          <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
            Crea tu primera categoría para empezar a clasificar los servicios.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <ServiceCategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ServiceCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
      <DeleteServiceCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
      />
    </div>
  )
}
