import { Pencil, Trash2 } from 'lucide-react'
import type { ServiceCategory } from '@/types/serviceCategory'

interface Props {
  category: ServiceCategory
  onEdit: (category: ServiceCategory) => void
  onDelete: (category: ServiceCategory) => void
}

export default function ServiceCategoryCard({ category, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header con ID y acciones */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
          ID {category.id}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Área del icono con gradiente */}
      <div className="flex items-center justify-center py-8 bg-gradient-to-b from-orange-50/60 to-transparent">
        <div className="w-24 h-24 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm">
          {category.icon_url ? (
            <img
              src={category.icon_url}
              alt={category.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmOTczMTYiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIvPjxwYXRoIGQ9Ik0xMiA4djhtLTQtNGg4Ii8+PC9zdmc+'
              }}
            />
          ) : (
            <span className="text-3xl text-orange-300">🏷️</span>
          )}
        </div>
      </div>

      {/* Footer con nombre y descripción */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {category.description || 'Sin descripción'}
        </p>
      </div>
    </div>
  )
}
