import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  Network,
  Search,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react'
import { getMyReferrals } from '@/api/affiliates'
import type { ReferralNode } from '@/types/affiliate'
import { formatMoney } from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import StatusBadge, { LevelBadge } from '@/components/affiliate/StatusBadge'

const cfg = getAffiliateSettingsFallback()

type LevelFilter = 'all' | 1 | 2

export default function AffiliateReferrals() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [expanded, setExpanded] = useState<number[]>([])

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['affiliate-referrals', search, levelFilter],
    queryFn: () =>
      getMyReferrals({
        search: search.trim() || undefined,
        level: levelFilter === 'all' ? undefined : levelFilter,
      }),
  })

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const level1 = useMemo(() => data?.level1 ?? [], [data])
  const totals = useMemo(
    () =>
      data?.totals ?? {
        level1: level1.length,
        level2: level1.reduce((sum, n) => sum + (n.children?.length ?? 0), 0),
      },
    [data, level1]
  )

  const expandedAll = useMemo(
    () => level1.every((n) => expanded.includes(n.id)),
    [level1, expanded]
  )

  const renderLevel2 = (children: ReferralNode[] | undefined) => {
    if (!children || children.length === 0) return null
    return (
      <div className="ml-6 sm:ml-10 mt-2 space-y-2 border-l-2 border-parchment-100 pl-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-parchment-100 bg-parchment-50/50 px-3.5 py-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-parchment-100 to-parchment-200 flex items-center justify-center text-xs font-semibold text-parchment-700">
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-[150px]">
              <p className="text-sm font-medium text-cool-steel-800">
                {child.name}
              </p>
              <p className="text-xs text-cool-steel-400">
                Se unió el{' '}
                {new Date(child.joined_at).toLocaleDateString('es-MX')}
                {child.channel_type ? ` · ${child.channel_type}` : ''}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="text-center">
                <p className="text-cool-steel-400">Conversiones</p>
                <p className="font-semibold text-cool-steel-700">
                  {child.stats.conversions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-cool-steel-400">Generó</p>
                <p className="font-semibold text-cool-steel-700">
                  {formatMoney(child.stats.generated_amount, cfg.currency)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-cool-steel-400">Tu comisión</p>
                <p className="font-semibold text-parchment-600">
                  {formatMoney(child.stats.my_commission, cfg.currency)}
                </p>
              </div>
            </div>
            <LevelBadge level={2} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Mi red</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Tus referidos directos (nivel 1) y las personas que ellos invitan
            (nivel 2). Sin límite de personas en cada nivel.
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

      {/* Resumen de la pirámide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-vivid-tangerine-100 bg-gradient-to-br from-vivid-tangerine-50 to-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-500 text-white flex items-center justify-center">
              <UserPlus size={19} />
            </div>
            <div>
              <p className="text-2xl font-bold text-cool-steel-900">
                {totals.level1}
              </p>
              <p className="text-xs text-cool-steel-500">
                Nivel 1 · Hijos directos
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-parchment-100 bg-gradient-to-br from-parchment-50 to-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-parchment-500 text-white flex items-center justify-center">
              <Users size={19} />
            </div>
            <div>
              <p className="text-2xl font-bold text-cool-steel-900">
                {totals.level2}
              </p>
              <p className="text-xs text-cool-steel-500">
                Nivel 2 · Nietos
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-pacific-blue-100 bg-gradient-to-br from-pacific-blue-50 to-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pacific-blue-500 text-white flex items-center justify-center">
              <Network size={19} />
            </div>
            <div>
              <p className="text-2xl font-bold text-cool-steel-900">
                {totals.level1 + totals.level2}
              </p>
              <p className="text-xs text-cool-steel-500">
                Red total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Árbol de referidos */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="p-5 border-b border-cool-steel-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar referido por nombre o correo..."
              className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-10 pr-4 text-sm text-cool-steel-700 placeholder-cool-steel-400 focus:border-vivid-tangerine-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
            className="rounded-lg border border-cool-steel-200 bg-white px-3.5 py-2.5 text-sm text-cool-steel-700 focus:border-vivid-tangerine-400 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
          >
            <option value="all">Todos los niveles</option>
            <option value={1}>Solo nivel 1</option>
            <option value={2}>Solo nivel 2</option>
          </select>

          {level1.length > 0 && (
            <button
              onClick={() =>
                setExpanded(expandedAll ? [] : level1.map((n) => n.id))
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-cool-steel-600 hover:bg-cool-steel-50 transition-colors"
            >
              <ChevronDown size={15} />
              {expandedAll ? 'Contraer todo' : 'Expandir todo'}
            </button>
          )}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-cool-steel-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : level1.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <Network size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              Tu red está empezando
            </h3>
            <p className="text-sm text-cool-steel-500 mb-2 text-center max-w-sm">
              {search || levelFilter !== 'all'
                ? 'No hay referidos que coincidan con los filtros.'
                : 'Comparte tu enlace de referido y empieza a construir tu red de nivel 1 y nivel 2.'}
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {level1.map((node) => {
              const isExpanded = expanded.includes(node.id)
              return (
                <div key={node.id}>
                  {/* Nodo nivel 1 */}
                  <div
                    className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors cursor-pointer ${
                      isExpanded
                        ? 'border-vivid-tangerine-200 bg-vivid-tangerine-50/40'
                        : 'border-cool-steel-100 hover:border-cool-steel-200 hover:bg-cool-steel-50/50'
                    }`}
                    onClick={() => toggleExpand(node.id)}
                  >
                    <button
                      type="button"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-cool-steel-400 hover:bg-white"
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vivid-tangerine-100 to-vivid-tangerine-200 flex items-center justify-center text-sm font-semibold text-vivid-tangerine-700">
                      {node.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-cool-steel-900">
                          {node.name}
                        </p>
                        <StatusBadge kind="affiliate" status={node.status} />
                      </div>
                      <p className="text-xs text-cool-steel-400 mt-0.5">
                        {node.email}
                        {node.channel_type ? ` · ${node.channel_type}` : ''} ·
                        Se unió el{' '}
                        {new Date(node.joined_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-5 text-xs">
                      <div className="text-center">
                        <p className="text-cool-steel-400">Nietos</p>
                        <p className="font-semibold text-cool-steel-700">
                          {node.children?.length ?? 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-cool-steel-400">Generó</p>
                        <p className="font-semibold text-cool-steel-700">
                          {formatMoney(node.stats.generated_amount, cfg.currency)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-cool-steel-400">Tu comisión</p>
                        <p className="font-semibold text-vivid-tangerine-600">
                          {formatMoney(node.stats.my_commission, cfg.currency)}
                        </p>
                      </div>
                    </div>

                    <LevelBadge level={1} />
                  </div>

                  {/* Hijos del nodo (nivel 2) */}
                  {isExpanded && renderLevel2(node.children)}
                  {isExpanded &&
                    (!node.children || node.children.length === 0) && (
                      <p className="ml-10 mt-2 text-xs text-cool-steel-400 italic">
                        Este referido aún no tiene referidos de nivel 2.
                      </p>
                    )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
