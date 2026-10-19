import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Wallet,
  Percent,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import ReferralLinkCard from '@/components/affiliate/ReferralLinkCard'
import { LevelBadge } from '@/components/affiliate/StatusBadge'
import {
  getMyAffiliateProfile,
  getMyAffiliateStats,
  getMyReferrals,
} from '@/api/affiliates'
import type { AffiliateStats } from '@/types/affiliate'
import { formatMoney, formatPercent } from '@/types/affiliate'
import { getUser } from '@/utils/authStorage'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'

const cfg = getAffiliateSettingsFallback()

export default function AffiliateDashboard() {
  const user = getUser<{ name?: string }>()
  const firstName = user?.name?.split(' ')[0] || 'Afiliado'

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['affiliate-profile'],
    queryFn: getMyAffiliateProfile,
  })

  const { data: stats, isLoading: loadingStats } = useQuery<AffiliateStats>({
    queryKey: ['affiliate-stats'],
    queryFn: getMyAffiliateStats,
  })

  const { data: referrals, isLoading: loadingReferrals } = useQuery({
    queryKey: ['affiliate-referrals'],
    queryFn: () => getMyReferrals(),
  })

  const recentReferrals = (referrals?.level1 ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Así va tu red de afiliados y tus comisiones.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vivid-tangerine-50 text-vivid-tangerine-600 font-semibold border border-vivid-tangerine-100">
            <Percent size={13} />
            Nivel 1: {formatPercent(cfg.level1_percent)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment-50 text-parchment-600 font-semibold border border-parchment-200">
            <Percent size={13} />
            Nivel 2: {formatPercent(cfg.level2_percent)}
          </span>
        </div>
      </div>

      {/* Enlace de referido */}
      {loadingProfile ? (
        <div className="h-32 rounded-xl bg-white border border-cool-steel-100 animate-pulse" />
      ) : profile ? (
        <ReferralLinkCard code={profile.code} />
      ) : (
        <div className="rounded-xl border border-vivid-tangerine-200 bg-vivid-tangerine-50 p-5 text-sm text-vivid-tangerine-700">
          No pudimos cargar tu perfil de afiliado. Si acabas de registrarte,
          espera la aprobación o intenta más tarde.
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<UserPlus size={20} />}
          label="Referidos nivel 1"
          value={stats ? String(stats.level1_referrals) : '—'}
          subtitle="hijos directos · sin límite"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Referidos nivel 2"
          value={stats ? String(stats.level2_referrals) : '—'}
          subtitle="nietos · sin límite"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Total ganado"
          value={stats ? formatMoney(stats.total_earned, cfg.currency) : '—'}
          subtitle="comisiones históricas"
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Saldo disponible"
          value={stats ? formatMoney(stats.available_balance, cfg.currency) : '—'}
          subtitle="listo para retirar"
        />
      </div>

      {/* Gráfico mensual + referidos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rendimiento mensual */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cool-steel-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-cool-steel-900">
                Rendimiento mensual
              </h3>
              <p className="text-xs text-cool-steel-500 mt-0.5">
                Referidos nuevos y comisiones generadas
              </p>
            </div>
            <Link
              to="/affiliate/commissions"
              className="inline-flex items-center gap-1 text-sm font-medium text-vivid-tangerine-600 hover:text-vivid-tangerine-700"
            >
              Ver comisiones
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingStats ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-cool-steel-300" />
            </div>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {(stats?.monthly ?? []).map((point) => {
                const max = Math.max(
                  ...(stats?.monthly ?? []).map((m) => m.earnings),
                  1
                )
                const height = Math.max(8, (point.earnings / max) * 100)
                return (
                  <div
                    key={point.month}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <span className="text-[10px] font-medium text-cool-steel-500">
                      {formatMoney(point.earnings, cfg.currency).replace(
                        /\.00$/,
                        ''
                      )}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-vivid-tangerine-500 to-vivid-tangerine-300 transition-all"
                      style={{ height: `${height}%` }}
                      title={`${point.referrals} referidos`}
                    />
                    <span className="text-[11px] text-cool-steel-400">
                      {point.month.slice(5)}
                    </span>
                  </div>
                )
              })}
              {!stats?.monthly?.length && (
                <div className="flex-1 flex items-center justify-center text-sm text-cool-steel-400">
                  Aún no hay movimientos. Comparte tu enlace para empezar.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Referidos recientes */}
        <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cool-steel-900">
              Referidos recientes
            </h3>
            <Link
              to="/affiliate/referrals"
              className="inline-flex items-center gap-1 text-sm font-medium text-vivid-tangerine-600 hover:text-vivid-tangerine-700"
            >
              Ver red
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingReferrals ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-cool-steel-50 animate-pulse" />
              ))}
            </div>
          ) : recentReferrals.length === 0 ? (
            <div className="text-center py-10">
              <Users size={28} className="mx-auto text-cool-steel-300 mb-3" />
              <p className="text-sm text-cool-steel-500">
                Aún no tienes referidos.
                <br />
                Comparte tu enlace para empezar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cool-steel-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vivid-tangerine-100 to-parchment-100 flex items-center justify-center text-sm font-semibold text-vivid-tangerine-700">
                    {ref.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cool-steel-800 truncate">
                      {ref.name}
                    </p>
                    <p className="text-xs text-cool-steel-400">
                      {new Date(ref.joined_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <LevelBadge level={1} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
