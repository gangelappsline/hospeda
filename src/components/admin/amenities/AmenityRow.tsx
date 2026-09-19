import { Pencil, Trash2 } from 'lucide-react'
import type { Amenity } from '@/types/amenity'

interface Props {
  amenity: Amenity
  onEdit: (amenity: Amenity) => void
  onDelete: (amenity: Amenity) => void
}

export default function AmenityRow({ amenity, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
      {/* Amenidad + ID */}
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">{amenity.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">ID: {amenity.id}</p>
      </td>

      {/* Icono */}
      <td className="px-5 py-4">
        {amenity.icon_url ? (
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5">
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
                    '<span class="text-xs text-gray-400">Sin icono</span>'
                }
              }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">—</span>
          </div>
        )}
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            amenity.active
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-100 text-gray-500'
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
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(amenity)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}