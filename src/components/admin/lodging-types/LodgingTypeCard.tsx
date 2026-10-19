import { Pencil, Trash2 } from 'lucide-react'
import type { LodgingType } from '@/types/lodgingType'

interface Props {
  lodgingType: LodgingType
  onEdit: (type: LodgingType) => void
  onDelete: (type: LodgingType) => void
}

export default function LodgingTypeCard({ lodgingType, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-cool-steel-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header con ID y acciones */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="px-2.5 py-1 rounded-md bg-cool-steel-100 text-xs font-medium text-cool-steel-600">
          ID {lodgingType.id}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(lodgingType)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(lodgingType)}
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
          <img
            src={lodgingType.icon_url}
            alt={lodgingType.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTMgOWw5LTYgOSA2djEwYTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIvPjwvc3ZnPg=='
            }}
          />
        </div>
      </div>

      {/* Footer con nombre y descripción */}
      <div className="p-4 border-t border-cool-steel-100 mt-auto">
        <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
          {lodgingType.name}
        </h3>
        <p className="text-sm text-cool-steel-500 line-clamp-2">
          {lodgingType.description || 'Sin descripción'}
        </p>
      </div>
    </div>
  )
}