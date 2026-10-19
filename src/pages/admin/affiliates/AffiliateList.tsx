import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronRight,
  Search,
  RefreshCw,
  Share2,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Users,
  UserPlus,
} from 'lucide-react'
import { getAffiliates, updateAffiliateStatus } from '@/api/affiliateAdmin'
import type { Affiliate, AffiliateStatus } from '@/types/affiliate'
import { formatMoney } from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import type { ApiError } from '@/types/auth'
import StatusBadge from '@/components/affiliate/StatusBadge'

const cfg = getAffiliateSettingsFallback()

type StatusFilter = 'all' | AffiliateStatus

export default function AffiliateList() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data: affiliates = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-affiliates'],
    queryFn: () => getAffiliates(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AffiliateStatus }) =>
      updateAffiliateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] })
      toast.success('Estado actualizado', {
        description:
          variables.status === 'active'
            ? 'El afiliado fue aprobado y ya puede compartir su enlace.'
            : `El afiliado ahora está: ${variables.status}.`,
      })
    },
    onError: (error: ApiError) => {
      toast.error('No se pudo actualizar el estado', {
        description: error.message || 'Inténtalo nuevamente.',
      })
    },
  })

  const filtered = useMemo(() => {
    let result = affiliates
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.code.toLowerCase().includes(term)
      )
    }
    return result
  }, [affiliates, search, statusFilter])

  const stats = useMemo(
    () => ({
      total: affiliates.length,
      active: affiliates.filter((a) => a.status === 'active').length,
      pending: affiliates.filter((a) => a.status === 'pending').length,
      network: affiliates.reduce(
        (sum, a) => sum + a.level1_count + a.level2_count,
        0
      ),
    }),
    [affiliates]
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cool-steel-500">
        <Link to="/admin/dashboard" className="hover:text-cool-steel-700">
          Administración
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <span className="text-cool-steel-900 font-medium">Afiliados</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Afiliados</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Administra el programa de afiliados: aprueba perfiles y monitorea
            las redes de referidos.
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
              className={isFetching ? 'animate-spin text-vivid-tangerine-500' : 'text-pacific-blue-600'}
            />
            Actualizar
          </button>
          <Link
            to="/admin/affiliates/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            Configurar comisiones
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center">
              <Share2 size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Afiliados totales</p>
              <p className="text-xl font-bold text-cool-steel-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pacific-blue-50 text-pacific-blue-600 flex items-center justify-center">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Activos</p>
              <p className="text-xl font-bold text-cool-steel-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-parchment-50 text-parchment-600 flex items-center justify-center">
              <UserPlus size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Pendientes</p>
              <p className="text-xl font-bold text-cool-steel-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cool-steel-100 text-cool-steel-600 flex items-center justify-center">
              <Users size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Red total</p>
              <p className="text-xl font-bold text-cool-steel-900">{stats.network}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-cool-steel-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o código..."
              className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-10 pr-4 text-sm text-cool-steel-700 placeholder-cool-steel-400 focus:border-vivid-tangerine-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-cool-steel-200 bg-white px-3.5 py-2.5 text-sm text-cool-steel-700 focus:border-vivid-tangerine-400 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
            <option value="rejected">Rechazados</option>
          </select>

          <span className="text-sm text-cool-steel-500 whitespace-nowrap">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-cool-steel-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <Share2 size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              {search || statusFilter !== 'all'
                ? 'Sin resultados'
                : 'Aún no hay afiliados'}
            </h3>
            <p className="text-sm text-cool-steel-500 text-center max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Prueba ajustando los filtros o el término de búsqueda.'
                : 'Los registros del programa de afiliados aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cool-steel-50 border-b border-cool-steel-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Red (N1 / N2)
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Generado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: Affiliate) => (
                  <tr
                    key={a.id}
                    className="border-b border-cool-steel-50 hover:bg-cool-steel-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vivid-tangerine-100 to-parchment-100 flex items-center justify-center text-sm font-semibold text-vivid-tangerine-700">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-cool-steel-800">{a.name}</p>
                          <p className="text-xs text-cool-steel-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-parchment-600 bg-parchment-50 px-2 py-1 rounded-md border border-parchment-200">
                        {a.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-vivid-tangerine-50 text-vivid-tangerine-600 font-semibold">
                          {a.level1_count} N1
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-parchment-50 text-parchment-600 font-semibold">
                          {a.level2_count} N2
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-cool-steel-800">
                      {formatMoney(a.total_earned, cfg.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="affiliate" status={a.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status === 'pending' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: a.id, status: 'active' })
                            }
                            disabled={statusMutation.isPending}
                            title="Aprobar"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-pacific-blue-700 bg-pacific-blue-50 hover:bg-pacific-blue-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Aprobar
                          </button>
                        )}
                        {a.status === 'active' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: a.id, status: 'suspended' })
                            }
                            disabled={statusMutation.isPending}
                            title="Suspender"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cool-steel-600 bg-cool-steel-100 hover:bg-cool-steel-200 transition-colors disabled:opacity-50"
                          >
                            <PauseCircle size={14} />
                            Suspender
                          </button>
                        )}
                        {a.status === 'suspended' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: a.id, status: 'active' })
                            }
                            disabled={statusMutation.isPending}
                            title="Reactivar"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-pacific-blue-700 bg-pacific-blue-50 hover:bg-pacific-blue-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Reactivar
                          </button>
                        )}
                        {a.status !== 'rejected' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: a.id, status: 'rejected' })
                            }
                            disabled={statusMutation.isPending}
                            title="Rechazar"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-vivid-tangerine-600 bg-vivid-tangerine-50 hover:bg-vivid-tangerine-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
