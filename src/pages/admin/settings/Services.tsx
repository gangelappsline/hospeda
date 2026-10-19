import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Tags,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import apiClient from '@/api/axios'
import ServiceCategoryModal from '@/components/admin/settings/ServiceCategoryModal'
import type { ServiceCategory } from '@/types/settingServices'

// --- API Helpers ---
const fetchCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await apiClient.get('/web/admin/settings/services')
  // La API puede responder [] o { data: [] } (recurso/paginación de Laravel)
  const list = Array.isArray(data) ? data : data?.data
  return Array.isArray(list) ? list : []
}

const deleteCategory = async (id: number) => {
  await apiClient.delete(`/web/admin/settings/services/${id}`)
}

// --- Componente Principal ---
export default function SettingServices() {
  const [activeTab, setActiveTab] = useState<'categories'>('categories')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/settings" className="hover:text-gray-700">
          Configuración
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Servicios</span>
      </nav>

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Servicios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra las categorías y opciones de servicios para tus alojamientos.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('categories')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg transition-colors ${
                activeTab === 'categories'
                  ? 'text-orange-600 border-orange-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <Tags size={18} />
              Categorías
            </button>
          </li>
          {/* Aquí puedes agregar más tabs en el futuro */}
        </ul>
      </div>

      {/* Contenido de la Tab */}
      <div className="mt-4">
        {activeTab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}

// --- Componente de la Tab de Categorías ---
function CategoriesTab() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null)

  const { data: categories = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['service-categories'],
    queryFn: fetchCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] })
      setDeletingCategory(null)
    },
  })

  // Filtrado local por búsqueda
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const term = search.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(term))
  }, [categories, search])

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
    <div className="space-y-4">
      {/* Acciones */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-orange-500' : ''} />
            Refrescar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tabla y Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Skeleton Loader: Se muestra en carga inicial o si se refresca sin datos previos */}
        {isLoading || (isFetching && categories.length === 0) ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                {/* Columna Logo */}
                <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                {/* Columna Nombre */}
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                {/* Columna Hint/Ejemplo */}
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                {/* Columna Estado */}
                <div className="h-6 bg-gray-100 rounded-full w-20" />
                {/* Columna Acciones */}
                <div className="flex gap-2 ml-auto">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Tags size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search ? 'Sin resultados' : 'Aún no hay categorías configuradas'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron categorías que coincidan con "${search}".`
                : 'Crea tu primera categoría para empezar a asignarla a los servicios.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primera categoría
              </button>
            )}
          </div>
        ) : (
          // Tabla normal
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hint / Ejemplo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      {category.logo ? (
                        <img
                          src={`/storage/${category.logo}`}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon size={18} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{category.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700">{category.hint || '-'}</span>
                        <span className="text-xs text-gray-400">{category.example || ''}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${category.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {category.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Categoría</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar la categoría <strong>{deletingCategory.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingCategory.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación/Edición (Placeholder) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            {/* Modal de Creación/Edición */}
      <ServiceCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}