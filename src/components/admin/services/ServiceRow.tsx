import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import type { Service } from '@/types/service'

interface Props {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export default function ServiceRow({ service, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      {/* Nombre + imagen */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={16} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{service.name}</p>
            {service.description && (
              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="px-5 py-4">
        {service.category ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
            {service.category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Sin categoría</span>
        )}
      </td>

      {/* Precio */}
      <td className="px-5 py-4 text-gray-700">
        ${service.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            service.active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              service.active ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {service.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(service)}
            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(service)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
