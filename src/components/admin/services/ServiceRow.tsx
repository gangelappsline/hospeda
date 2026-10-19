import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import type { Service } from '@/types/service'

interface Props {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export default function ServiceRow({ service, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-cool-steel-50 hover:bg-cool-steel-50/50 transition-colors">
      {/* Nombre + imagen */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cool-steel-100 border border-cool-steel-200 flex items-center justify-center overflow-hidden shrink-0">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={16} className="text-cool-steel-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-cool-steel-900">{service.name}</p>
            {service.description && (
              <p className="text-xs text-cool-steel-500 line-clamp-1 max-w-xs">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="px-5 py-4">
        {service.category ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-vivid-tangerine-50 text-vivid-tangerine-700">
            {service.category.name}
          </span>
        ) : (
          <span className="text-xs text-cool-steel-400">Sin categoría</span>
        )}
      </td>

      {/* Precio */}
      <td className="px-5 py-4 text-cool-steel-700">
        ${service.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            service.active
              ? 'bg-pacific-blue-50 text-pacific-blue-700'
              : 'bg-cool-steel-100 text-cool-steel-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              service.active ? 'bg-pacific-blue-500' : 'bg-cool-steel-400'
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
            className="p-2 text-cool-steel-400 hover:text-vivid-tangerine-500 hover:bg-vivid-tangerine-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(service)}
            className="p-2 text-cool-steel-400 hover:text-vivid-tangerine-500 hover:bg-vivid-tangerine-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
