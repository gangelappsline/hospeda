import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Check, Plus, ChevronRight, Tags, RefreshCw } from 'lucide-react'
import { getLodgingTypes } from '@/api/lodgingTypes'
import type { LodgingType } from '@/types/lodgingType'
import LodgingTypeCard from '@/components/admin/lodging-types/LodgingTypeCard'
import LodgingTypeModal from '@/components/admin/lodging-types/LodgingTypeModal'
import DeleteConfirmModal from '@/components/admin/lodging-types/DeleteConfirmModal'

export default function LodgingTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<LodgingType | null>(null)
  const [deletingType, setDeletingType] = useState<LodgingType | null>(null)

  const { data: lodgingTypes = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['lodging-types'],
    queryFn: getLodgingTypes,
  })

  const handleCreate = () => {
    setEditingType(null)
    setIsModalOpen(true)
  }

  const handleEdit = (type: LodgingType) => {
    setEditingType(type)
    setIsModalOpen(true)
  }

  const handleDelete = (type: LodgingType) => {
    setDeletingType(type)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cool-steel-500">
        <Link to="/admin/properties" className="hover:text-cool-steel-700">
          Alojamientos
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <span className="text-cool-steel-900 font-medium">Tipos</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">
            Tipos de alojamiento
          </h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Organiza el catálogo y define cómo se clasifican tus alojamientos.
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
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo tipo
          </button>
        </div>
      </div>

      {/* Banner del catálogo */}
      <div className="flex items-center justify-between rounded-xl border border-vivid-tangerine-100 bg-vivid-tangerine-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-vivid-tangerine-100 flex items-center justify-center">
            <Tags size={18} className="text-vivid-tangerine-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-cool-steel-900">
              Catálogo de tipos
            </p>
            <p className="text-xs text-cool-steel-500">
              {lodgingTypes.length}{' '}
              {lodgingTypes.length === 1 ? 'tipo configurado' : 'tipos configurados'}{' '}
              para tus alojamientos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-pacific-blue-500" />
          <span className="text-sm font-semibold text-vivid-tangerine-600">Activo</span>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-cool-steel-100 h-72 animate-pulse"
            >
              <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-cool-steel-100" />
              </div>
            </div>
          ))}
        </div>
      ) : lodgingTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-cool-steel-200">
          <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
            <Tags size={22} className="text-vivid-tangerine-500" />
          </div>
          <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
            Aún no hay tipos de alojamiento
          </h3>
          <p className="text-sm text-cool-steel-500 mb-5 text-center max-w-sm">
            Crea tu primer tipo para empezar a clasificar los alojamientos del catálogo.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            <Plus size={16} />
            Crear primer tipo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lodgingTypes.map((type) => (
            <LodgingTypeCard
              key={type.id}
              lodgingType={type}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <LodgingTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lodgingType={editingType}
      />
      <DeleteConfirmModal
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        lodgingType={deletingType}
      />
    </div>
  )
}