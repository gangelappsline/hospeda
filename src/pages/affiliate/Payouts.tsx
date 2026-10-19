import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Wallet,
  Plus,
  Loader2,
  Check,
  RefreshCw,
  Info,
  X,
} from 'lucide-react'
import { getMyPayouts, requestPayout } from '@/api/affiliates'
import type { PayoutMethod, PayoutRequestPayload } from '@/types/affiliate'
import {
  formatMoney,
  PAYOUT_METHOD_LABELS,
} from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import type { ApiError } from '@/types/auth'
import StatusBadge from '@/components/affiliate/StatusBadge'

const cfg = getAffiliateSettingsFallback()

const METHODS: PayoutMethod[] = ['paypal', 'spei', 'bank_transfer', 'oxxo']

export default function AffiliatePayouts() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PayoutMethod>('paypal')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: payouts = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['affiliate-payouts'],
    queryFn: getMyPayouts,
  })

  const mutation = useMutation({
    mutationFn: (payload: PayoutRequestPayload) => requestPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-stats'] })
      toast.success('Solicitud de retiro enviada', {
        description: 'La procesaremos en cuanto sea revisada.',
      })
      setIsModalOpen(false)
      setAmount('')
    },
    onError: (error: ApiError) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
      }
      toast.error('No se pudo solicitar el retiro', {
        description: error.message || 'Inténtalo nuevamente.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = Number(amount)
    const newErrors: Record<string, string> = {}

    if (!amount.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Ingresa un monto válido'
    } else if (numericAmount < cfg.min_payout_amount) {
      newErrors.amount = `El monto mínimo es ${formatMoney(cfg.min_payout_amount, cfg.currency)}`
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    mutation.mutate({ amount: numericAmount, method })
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Retiros</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Solicita el pago de tus comisiones acumuladas. Monto mínimo:{' '}
            {formatMoney(cfg.min_payout_amount, cfg.currency)}.
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors"
          >
            <Plus size={16} />
            Solicitar retiro
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5 rounded-lg border border-pacific-blue-200 bg-pacific-blue-50 p-4">
        <Info size={18} className="text-pacific-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-pacific-blue-800 leading-relaxed">
          Solo tus comisiones aprobadas están disponibles para retiro. Las
          comisiones pendientes se liberan cuando se confirma la reserva que las
          originó.
        </p>
      </div>

      {/* Historial de retiros */}
      <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-cool-steel-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-vivid-tangerine-50 flex items-center justify-center mb-4">
              <Wallet size={22} className="text-vivid-tangerine-500" />
            </div>
            <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
              Sin retiros solicitados
            </h3>
            <p className="text-sm text-cool-steel-500 text-center max-w-sm">
              Cuando tengas saldo disponible, solicita tu primer retiro y
              aparecerá en este historial.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cool-steel-50 border-b border-cool-steel-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Folio
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Solicitado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Pagado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-cool-steel-50 hover:bg-cool-steel-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-cool-steel-500">
                      #{String(p.id).padStart(5, '0')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-cool-steel-800">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-cool-steel-600">
                      {PAYOUT_METHOD_LABELS[p.method] ?? p.method}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="payout" status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-cool-steel-500">
                      {new Date(p.requested_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-5 py-3.5 text-cool-steel-500">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-cool-steel-500 max-w-[200px] truncate">
                      {p.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de solicitud */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-start justify-between p-6 pb-4 border-b border-cool-steel-100">
              <div>
                <h2 className="text-lg font-bold text-cool-steel-900">
                  Solicitar retiro
                </h2>
                <p className="text-sm text-cool-steel-500 mt-0.5">
                  Recibirás tus comisiones por el método elegido.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-400 hover:bg-cool-steel-100 hover:text-cool-steel-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Monto a retirar <span className="text-vivid-tangerine-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cool-steel-400 text-sm">
                    {cfg.currency}
                  </span>
                  <input
                    type="number"
                    min={cfg.min_payout_amount}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Mínimo ${cfg.min_payout_amount}`}
                    autoFocus
                    className={`w-full rounded-lg border py-2.5 pl-16 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.amount
                        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Método de pago <span className="text-vivid-tangerine-500">*</span>
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PayoutMethod)}
                  className="w-full rounded-lg border border-cool-steel-300 bg-white py-2.5 px-3.5 text-sm focus:border-vivid-tangerine-500 focus:ring-2 focus:ring-vivid-tangerine-100 focus:outline-none transition-colors"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {PAYOUT_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-cool-steel-400">
                  Usaremos los datos de pago que configuraste en tu perfil.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cool-steel-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={mutation.isPending}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Confirmar retiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
