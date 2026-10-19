import { Pencil, Trash2 } from 'lucide-react'
import type { ServiceCategory } from '@/types/serviceCategory'

interface Props {
  category: ServiceCategory
  onEdit: (category: ServiceCategory) => void
  onDelete: (category: ServiceCategory) => void
}

export default function ServiceCategoryCard({
  category,
  onEdit,
  onDelete,
}: Props) {
  const iconSrc = category.icon_url || category.logo_url || null
  const isActive = Boolean(category.active)

  return (
    <div className="bg-white rounded-xl border border-cool-steel-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header con ID, estado y acciones */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-cool-steel-100 text-xs font-medium text-cool-steel-600">
            ID {category.id}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-pacific-blue-50 text-pacific-blue-700'
                : 'bg-cool-steel-100 text-cool-steel-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-pacific-blue-500' : 'bg-cool-steel-400'
              }`}
            />
            {isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-vivid-tangerine-50 hover:text-vivid-tangerine-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Área del icono con gradiente */}
      <div className="flex items-center justify-center py-8 bg-gradient-to-b from-vivid-tangerine-50/60 to-transparent">
        <div className="w-24 h-24 rounded-xl bg-white border border-cool-steel-100 flex items-center justify-center p-3 shadow-sm">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={category.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmOTczMTYiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIvPjxwYXRoIGQ9Ik0xMiA4djhtLTQtNGg4Ii8+PC9zdmc+'
              }}
            />
          ) : (
            <span className="text-3xl text-vivid-tangerine-300">🏷️</span>
          )}
        </div>
      </div>

      {/* Footer con nombre, hint y ejemplo */}
      <div className="p-4 border-t border-cool-steel-100 mt-auto space-y-2">
        <h3 className="text-base font-semibold text-cool-steel-900">
          {category.name}
        </h3>
        <div className="space-y-1 text-xs">
          <p className="text-cool-steel-600 line-clamp-2">
            <span className="font-medium text-cool-steel-700">Hint: </span>
            {category.hint || '—'}
          </p>
          <p className="text-cool-steel-500 line-clamp-2">
            <span className="font-medium text-cool-steel-700">Ejemplo: </span>
            {category.example || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
