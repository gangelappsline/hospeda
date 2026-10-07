import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Search, User as UserIcon, RefreshCw } from 'lucide-react'
import { getUsers } from '@/api/users'
import type { AdminUser, UserRole } from '@/types/user'
import { ROLE_LABELS } from '@/types/user'
import UserRow from '@/components/admin/users/UserRow'
import UserModal from '@/components/admin/users/UserModal'
import DeleteUserModal from '@/components/admin/users/DeleteUserModal'
import StatsCards from '@/components/admin/users/StatsCards'

type RoleFilter = 'all' | UserRole

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const { data: users = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  // Filtrado por búsqueda + rol
  const filteredUsers = useMemo(() => {
    let result = users

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          String(u.id).includes(term)
      )
    }

    return result
  }, [users, search, roleFilter])

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'administrator').length,
      visible: filteredUsers.length,
    }
  }, [users, filteredUsers])

  const handleCreate = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (user: AdminUser) => {
    setDeletingUser(user)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/dashboard" className="hover:text-gray-700">
          Administración
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Usuarios</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra cuentas, roles y permisos de acceso a Hospeda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin text-orange-500' : 'text-emerald-600'}
            />
            Actualizar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <StatsCards {...stats} />

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o ID..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">{ROLE_LABELS.administrator}</option>
            <option value="host">{ROLE_LABELS.host}</option>
            <option value="guest">{ROLE_LABELS.guest}</option>
          </select>

          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredUsers.length}{' '}
            {filteredUsers.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <UserIcon size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search || roleFilter !== 'all'
                ? 'Sin resultados'
                : 'Aún no hay usuarios'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search || roleFilter !== 'all'
                ? 'Prueba ajustando los filtros o el término de búsqueda.'
                : 'Crea el primer usuario para empezar a administrar cuentas.'}
            </p>
            {!search && roleFilter === 'all' && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primer usuario
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
      />
      <DeleteUserModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
      />
    </div>
  )
}