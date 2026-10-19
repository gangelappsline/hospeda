import { Pencil, Trash2 } from 'lucide-react'
import type { Amenity } from '@/types/amenity'

interface Props {
  amenity: Amenity
  onEdit: (amenity: Amenity) => void
  onDelete: (amenity: Amenity) => void
}

export default function AmenityRow({ amenity, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-cool-steel-100 last:border-0 hover:bg-cool-steel-50/70 transition-colors">
      {/* Amenidad + ID */}
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-cool-steel-900">{amenity.name}</p>
        <p className="text-xs text-cool-steel-400 mt-0.5">ID: {amenity.id}</p>
      </td>

      {/* Icono */}
      <td className="px-5 py-4">
        {amenity.icon_url ? (
          <div className="w-10 h-10 rounded-lg bg-cool-steel-50 border border-cool-steel-100 flex items-center justify-center p-1.5">
            <img
              src={amenity.icon_url}
              alt={amenity.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-xs text-cool-steel-400">Sin icono</span>'
                }
              }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-cool-steel-50 border border-cool-steel-100 flex items-center justify-center">
            <span className="text-xs text-cool-steel-400">—</span>
          </div>
        )}
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            amenity.active
              ? 'bg-pacific-blue-50 text-pacific-blue-600'
              : 'bg-cool-steel-100 text-cool-steel-500'
          }`}
        >
          {amenity.active ? 'Activa' : 'Inactiva'}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onEdit(amenity)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(amenity)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-vivid-tangerine-50 hover:text-vivid-tangerine-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}