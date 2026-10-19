import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronRight,
  Percent,
  Settings,
  Loader2,
  Check,
  Info,
  Wallet,
  Cookie,
  ShieldCheck,
} from 'lucide-react'
import {
  getAdminAffiliateSettings,
  updateAffiliateSettings,
} from '@/api/affiliateAdmin'
import type {
  AffiliateSettings,
  CommissionBase,
  PayoutMethod,
} from '@/types/affiliate'
import { PAYOUT_METHOD_LABELS } from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import type { ApiError } from '@/types/auth'

const METHODS: PayoutMethod[] = ['paypal', 'spei', 'bank_transfer', 'oxxo']

export default function AffiliateSettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-affiliate-settings'],
    queryFn: getAdminAffiliateSettings,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-cool-steel-100 animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-cool-steel-100 animate-pulse" />
      </div>
    )
  }

  return (
    <SettingsForm settings={settings ?? getAffiliateSettingsFallback()} />
  )
}

function SettingsForm({ settings }: { settings: AffiliateSettings }) {
  const queryClient = useQueryClient()

  const [level1, setLevel1] = useState(String(settings.level1_percent))
  const [level2, setLevel2] = useState(String(settings.level2_percent))
  const [minPayout, setMinPayout] = useState(String(settings.min_payout_amount))
  const [cookieDays, setCookieDays] = useState(String(settings.cookie_days))
  const [currency, setCurrency] = useState(settings.currency)
  const [commissionBase, setCommissionBase] = useState<CommissionBase>(
    settings.commission_base
  )
  const [autoApprove, setAutoApprove] = useState(settings.auto_approve)
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(
    settings.payout_methods
  )
  const [termsUrl, setTermsUrl] = useState(settings.terms_url ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (payload: Partial<AffiliateSettings>) =>
      updateAffiliateSettings(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliate-settings'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-settings-public'] })
      toast.success('Configuración actualizada', {
        description: `Nivel 1: ${data.level1_percent}% · Nivel 2: ${data.level2_percent}%. Los nuevos porcentajes aplican a las comisiones futuras.`,
      })
    },
    onError: (error: ApiError) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
        toast.error('Datos inválidos', {
          description: 'Revisa los campos marcados en rojo.',
        })
      } else {
        toast.error('No se pudo guardar', {
          description: error.message || 'Inténtalo nuevamente.',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const p1 = Number(level1)
    const p2 = Number(level2)
    const payout = Number(minPayout)
    const cookies = Number(cookieDays)

    if (Number.isNaN(p1) || p1 < 0 || p1 > 100) {
      newErrors.level1_percent = 'Ingresa un porcentaje entre 0 y 100'
    }
    if (Number.isNaN(p2) || p2 < 0 || p2 > 100) {
      newErrors.level2_percent = 'Ingresa un porcentaje entre 0 y 100'
    }
    if (Number.isNaN(payout) || payout < 0) {
      newErrors.min_payout_amount = 'Ingresa un monto válido'
    }
    if (Number.isNaN(cookies) || cookies < 1 || cookies > 365) {
      newErrors.cookie_days = 'Ingresa entre 1 y 365 días'
    }
    if (!currency.trim()) {
      newErrors.currency = 'La moneda es obligatoria'
    }
    if (payoutMethods.length === 0) {
      newErrors.payout_methods = 'Selecciona al menos un método de pago'
    }
    if (termsUrl && !/^https?:\/\/.+\..+/.test(termsUrl)) {
      newErrors.terms_url = 'Ingresa una URL válida (https://...)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    mutation.mutate({
      level1_percent: p1,
      level2_percent: p2,
      max_levels: 2,
      min_payout_amount: payout,
      cookie_days: cookies,
      currency: currency.trim().toUpperCase(),
      commission_base: commissionBase,
      auto_approve: autoApprove,
      payout_methods: payoutMethods,
      terms_url: termsUrl.trim() || null,
    })
  }

  const toggleMethod = (method: PayoutMethod) => {
    setPayoutMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    )
  }

  const inputClass = (key: string) =>
    `w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
      errors[key]
        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
    }`

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-cool-steel-500">
        <Link to="/admin/dashboard" className="hover:text-cool-steel-700">
          Administración
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <Link to="/admin/affiliates" className="hover:text-cool-steel-700">
          Afiliados
        </Link>
        <ChevronRight size={14} className="text-cool-steel-400" />
        <span className="text-cool-steel-900 font-medium">Configuración</span>
      </nav>

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-cool-steel-900">
          Configuración del programa
        </h1>
        <p className="text-sm text-cool-steel-500 mt-1 max-w-2xl">
          Estos valores controlan las comisiones y reglas del sistema de
          afiliados. Se sirven vía API (GET /api/affiliates/settings), por lo que
          los cambios aplican en toda la plataforma sin despliegues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comisiones por nivel */}
          <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
              <Percent size={18} className="text-vivid-tangerine-500" />
              <h2 className="text-base font-semibold text-cool-steel-900">
                Porcentajes de comisión
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nivel 1 */}
                <div className="rounded-xl border-2 border-vivid-tangerine-100 bg-vivid-tangerine-50/40 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-500 text-white flex items-center justify-center">
                      <Percent size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cool-steel-900">
                        Nivel 1 · Referidos directos (hijos)
                      </p>
                      <p className="text-xs text-cool-steel-500">
                        Personas invitadas directamente por el afiliado
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={level1}
                      onChange={(e) => setLevel1(e.target.value)}
                      className={inputClass('level1_percent') + ' pr-10 text-lg font-semibold'}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-steel-400 font-semibold">
                      %
                    </span>
                  </div>
                  {errors.level1_percent && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.level1_percent}
                    </p>
                  )}
                </div>

                {/* Nivel 2 */}
                <div className="rounded-xl border-2 border-parchment-200 bg-parchment-50/40 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-parchment-500 text-white flex items-center justify-center">
                      <Percent size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cool-steel-900">
                        Nivel 2 · Red extendida (nietos)
                      </p>
                      <p className="text-xs text-cool-steel-500">
                        Personas invitadas por los referidos de nivel 1
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={level2}
                      onChange={(e) => setLevel2(e.target.value)}
                      className={inputClass('level2_percent') + ' pr-10 text-lg font-semibold'}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-steel-400 font-semibold">
                      %
                    </span>
                  </div>
                  {errors.level2_percent && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.level2_percent}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-cool-steel-200 bg-cool-steel-50 p-4 mt-6">
                <Info size={16} className="text-cool-steel-500 shrink-0 mt-0.5" />
                <p className="text-xs text-cool-steel-600 leading-relaxed">
                  Las comisiones se calculan así:{' '}
                  <strong>comisión = monto base × porcentaje</strong>. El
                  porcentaje se guarda como instantánea en cada comisión, por lo
                  que cambiar estos valores no afecta las comisiones ya
                  generadas. Cada nivel puede tener infinitos referidos.
                </p>
              </div>
            </div>
          </div>

          {/* Reglas del programa */}
          <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
              <Settings size={18} className="text-vivid-tangerine-500" />
              <h2 className="text-base font-semibold text-cool-steel-900">
                Reglas del programa
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet size={14} className="text-cool-steel-400" />
                    Monto mínimo de retiro
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className={inputClass('min_payout_amount')}
                />
                {errors.min_payout_amount && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.min_payout_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Cookie size={14} className="text-cool-steel-400" />
                    Duración de cookie (días)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={cookieDays}
                  onChange={(e) => setCookieDays(e.target.value)}
                  className={inputClass('cookie_days')}
                />
                {errors.cookie_days && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.cookie_days}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Moneda
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="MXN"
                  className={inputClass('currency') + ' uppercase'}
                />
                {errors.currency && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.currency}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Base de cálculo
                </label>
                <select
                  value={commissionBase}
                  onChange={(e) =>
                    setCommissionBase(e.target.value as CommissionBase)
                  }
                  className={inputClass('commission_base') + ' bg-white'}
                >
                  <option value="booking_total">Total de la reserva</option>
                  <option value="net_revenue">Ingreso neto (sin cargos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Métodos de pago y aprobación */}
          <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
              <ShieldCheck size={18} className="text-vivid-tangerine-500" />
              <h2 className="text-base font-semibold text-cool-steel-900">
                Pagos y aprobación
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-2.5">
                  Métodos de retiro habilitados
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {METHODS.map((method) => {
                    const active = payoutMethods.includes(method)
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => toggleMethod(method)}
                        className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
                          active
                            ? 'border-vivid-tangerine-500 bg-vivid-tangerine-50'
                            : 'border-cool-steel-200 hover:border-cool-steel-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-cool-steel-800">
                            {PAYOUT_METHOD_LABELS[method]}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border-2 ${
                              active
                                ? 'border-vivid-tangerine-500 bg-vivid-tangerine-500'
                                : 'border-cool-steel-300'
                            }`}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
                {errors.payout_methods && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.payout_methods}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  URL de términos y condiciones
                </label>
                <input
                  type="url"
                  value={termsUrl}
                  onChange={(e) => setTermsUrl(e.target.value)}
                  placeholder="https://hospeda.mx/terminos-afiliados"
                  className={inputClass('terms_url')}
                />
                {errors.terms_url && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.terms_url}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none rounded-lg border border-cool-steel-200 p-4 hover:bg-cool-steel-50 transition-colors">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-cool-steel-300 text-vivid-tangerine-600 focus:ring-vivid-tangerine-500"
                />
                <div>
                  <p className="text-sm font-medium text-cool-steel-800">
                    Aprobar afiliados automáticamente
                  </p>
                  <p className="text-xs text-cool-steel-500 mt-0.5">
                    Si se desactiva, cada registro quedará en estado
                    &quot;pendiente&quot; hasta que un administrador lo apruebe
                    desde el directorio.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Guardar */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/admin/affiliates"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              Guardar configuración
            </button>
          </div>
      </form>
    </div>
  )
}
