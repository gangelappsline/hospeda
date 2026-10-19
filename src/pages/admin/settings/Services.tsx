import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { getServiceCategories } from '@/api/serviceCategories'
import ServiceCategoryModal from '@/components/admin/service-categories/ServiceCategoryModal'
import DeleteServiceCategoryModal from '@/components/admin/service-categories/DeleteServiceCategoryModal'
import type { ServiceCategory } from '@/types/serviceCategory'

export default function SettingServices() {
  const [activeTab, setActiveTab] = useState<'categories'>('categories')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cool-steel-500">
        <Link to="/admin/settings" className="hover:text-cool-steel-700">
          Configuración
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <span className="text-cool-steel-900 font-medium">Servicios</span>
      </nav>

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-cool-steel-900">
          Configuración de Servicios
        </h1>
        <p className="text-sm text-cool-steel-500 mt-1">
          Administra las categorías y opciones de servicios para tus alojamientos.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-cool-steel-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-cool-steel-500">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('categories')}
              className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg transition-colors ${
                activeTab === 'categories'
                  ? 'text-vivid-tangerine-600 border-vivid-tangerine-500'
                  : 'border-transparent hover:text-cool-steel-600 hover:border-cool-steel-300'
              }`}
            >
              <Tags size={18} />
              Categorías
            </button>
          </li>
        </ul>
      </div>

      {/* Contenido de la Tab */}
      <div className="mt-4">
        {activeTab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}

function CategoriesTab() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(
    null
  )
  const [deletingCategory, setDeletingCategory] =
    useState<ServiceCategory | null>(null)

  const {
    data: categories = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['service-categories'],
    queryFn: getServiceCategories,
  })

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const term = search.toLowerCase()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.hint ?? '').toLowerCase().includes(term) ||
        (c.example ?? '').toLowerCase().includes(term)
    )
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-md w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-10 pr-4 text-sm text-cool-steel-700 placeholder-cool-steel-400 focus:border-vivid-tangerine-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          />
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tabla y Skeleton */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        {isLoading || (isFetching && categories.length === 0) ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-cool-steel-100 rounded-lg shrink-0" />
                <div className="h-4 bg-cool-steel-100 rounded w-1/4" />
                <div className="h-4 bg-cool-steel-100 rounded w-1/3" />
                <div className="h-6 bg-cool-steel-100 rounded-full w-20" />
                <div className="flex gap-2 ml-auto">
                  <div className="w-8 h-8 bg-cool-steel-100 rounded-lg" />
                  <div className="w-8 h-8 bg-cool-steel-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <Tags size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              {search ? 'Sin resultados' : 'Aún no hay categorías configuradas'}
            </h3>
            <p className="text-sm text-cool-steel-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron categorías que coincidan con "${search}".`
                : 'Crea tu primera categoría para empezar a asignarla a los servicios.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
              >
                <Plus size={16} />
                Crear primera categoría
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cool-steel-50 border-b border-cool-steel-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Icono
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Hint / Ejemplo
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-cool-steel-50 hover:bg-cool-steel-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      {category.icon_url ? (
                        <img
                          src={category.icon_url}
                          alt={category.name}
                          className="w-10 h-10 object-contain p-1 rounded-lg border border-cool-steel-200 bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-cool-steel-100 flex items-center justify-center border border-cool-steel-200">
                          <ImageIcon size={18} className="text-cool-steel-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-cool-steel-900">
                      {category.name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-cool-steel-700">
                          {category.hint || '-'}
                        </span>
                        <span className="text-xs text-cool-steel-400">
                          {category.example || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.active
                            ? 'bg-pacific-blue-50 text-pacific-blue-700'
                            : 'bg-cool-steel-100 text-cool-steel-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            category.active ? 'bg-pacific-blue-500' : 'bg-cool-steel-400'
                          }`}
                        />
                        {category.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-cool-steel-400 hover:text-vivid-tangerine-500 hover:bg-vivid-tangerine-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-cool-steel-400 hover:text-vivid-tangerine-500 hover:bg-vivid-tangerine-50 rounded-lg transition-colors"
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
