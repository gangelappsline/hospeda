import { Pencil, Trash2, Mail } from 'lucide-react'
import type { AdminUser, UserRole } from '@/types/user'
import { ROLE_LABELS } from '@/types/user'

interface Props {
  user: AdminUser
  onEdit: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

// Genera iniciales a partir del nombre
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Colores según el rol
const roleStyles: Record<UserRole, string> = {
  administrator: 'bg-vivid-tangerine-50 text-vivid-tangerine-600 border border-vivid-tangerine-100',
  host: 'bg-pacific-blue-50 text-pacific-blue-600 border border-pacific-blue-100',
  guest: 'bg-pacific-blue-50 text-pacific-blue-600 border border-pacific-blue-100',
  affiliate: 'bg-pacific-blue-50 text-pacific-blue-600 border border-pacific-blue-100',
}

export default function UserRow({ user, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-cool-steel-100 last:border-0 hover:bg-cool-steel-50/70 transition-colors">
      {/* Usuario (avatar + nombre + ID) */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
            roleStyles[user.role] || 'bg-cool-steel-100 text-cool-steel-600'
          }`}>
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cool-steel-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-cool-steel-400">ID: {user.id}</p>
          </div>
        </div>
      </td>

      {/* Contacto */}
      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-cool-steel-700">
            <Mail size={14} className="text-cool-steel-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <p className="text-xs text-cool-steel-400 pl-[22px]">
            {user.phone || 'Sin teléfono'}
          </p>
        </div>
      </td>

      {/* Rol */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            roleStyles[user.role] || 'bg-cool-steel-100 text-cool-steel-600'
          }`}
        >
          {ROLE_LABELS[user.role] || user.role}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onEdit(user)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(user)}
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