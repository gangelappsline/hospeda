import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Percent, RefreshCw, ReceiptText, Wallet } from 'lucide-react'
import { getMyCommissions } from '@/api/affiliates'
import type { CommissionStatus } from '@/types/affiliate'
import {
  formatMoney,
  formatPercent,
  COMMISSION_STATUS_LABELS,
} from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import StatusBadge, { LevelBadge } from '@/components/affiliate/StatusBadge'

const cfg = getAffiliateSettingsFallback()

type StatusFilter = 'all' | CommissionStatus

export default function AffiliateCommissions() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2>('all')

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['affiliate-commissions', statusFilter, levelFilter],
    queryFn: () =>
      getMyCommissions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        level: levelFilter === 'all' ? undefined : levelFilter,
      }),
  })

  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Comisiones</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Cada comisión muestra el nivel que la originó y el porcentaje
            aplicado sobre el monto base.
          </p>
        </div>
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
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center">
              <Percent size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Comisiones por nivel 1</p>
              <p className="text-sm font-semibold text-cool-steel-800">
                {formatPercent(cfg.level1_percent)} del monto base
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-parchment-50 text-parchment-600 flex items-center justify-center">
              <Percent size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Comisiones por nivel 2</p>
              <p className="text-sm font-semibold text-cool-steel-800">
                {formatPercent(cfg.level2_percent)} del monto base
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pacific-blue-50 text-pacific-blue-600 flex items-center justify-center">
              <Wallet size={19} />
            </div>
            <div>
              <p className="text-xs text-cool-steel-500">Pendiente de liquidar</p>
              <p className="text-lg font-bold text-cool-steel-900">
                {data
                  ? formatMoney(data.pending_amount, cfg.currency)
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de comisiones */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-cool-steel-100 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-cool-steel-200 bg-white px-3.5 py-2.5 text-sm text-cool-steel-700 focus:border-vivid-tangerine-400 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          >
            <option value="all">Todos los estados</option>
            {(
              Object.entries(COMMISSION_STATUS_LABELS) as [
                CommissionStatus,
                string,
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'all' | 1 | 2)}
            className="rounded-lg border border-cool-steel-200 bg-white px-3.5 py-2.5 text-sm text-cool-steel-700 focus:border-vivid-tangerine-400 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          >
            <option value="all">Todos los niveles</option>
            <option value={1}>Nivel 1</option>
            <option value={2}>Nivel 2</option>
          </select>

          <span className="text-sm text-cool-steel-500 whitespace-nowrap ml-auto">
            {items.length} {items.length === 1 ? 'comisión' : 'comisiones'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-cool-steel-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <ReceiptText size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              Sin comisiones todavía
            </h3>
            <p className="text-sm text-cool-steel-500 text-center max-w-sm">
              Cuando las personas de tu red generen reservas, cada comisión
              aparecerá aquí con su nivel y porcentaje.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cool-steel-50 border-b border-cool-steel-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Referido
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Monto base
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    %
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Tu comisión
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-cool-steel-50 hover:bg-cool-steel-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-cool-steel-800">
                        {c.referred_user?.name ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <LevelBadge level={c.level} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-cool-steel-500">
                      {c.reference ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-cool-steel-600">
                      {formatMoney(c.base_amount, c.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cool-steel-100 text-cool-steel-700">
                        {formatPercent(c.percent)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-parchment-600">
                      {formatMoney(c.amount, c.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="commission" status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-cool-steel-500">
                      {new Date(c.created_at).toLocaleDateString('es-MX')}
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
