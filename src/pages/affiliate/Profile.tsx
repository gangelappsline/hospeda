import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Wallet,
  Loader2,
  Check,
  Share2,
} from 'lucide-react'
import {
  getMyAffiliateProfile,
  updateMyAffiliateProfile,
} from '@/api/affiliates'
import type { Affiliate, AffiliatePayload, PayoutMethod } from '@/types/affiliate'
import {
  AUDIENCE_SIZE_OPTIONS,
  CHANNEL_TYPE_OPTIONS,
  PAYOUT_METHOD_LABELS,
} from '@/types/affiliate'
import type { ApiError } from '@/types/auth'
import ReferralLinkCard from '@/components/affiliate/ReferralLinkCard'
import StatusBadge from '@/components/affiliate/StatusBadge'

const METHODS: PayoutMethod[] = ['paypal', 'spei', 'bank_transfer', 'oxxo']

export default function AffiliateProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['affiliate-profile'],
    queryFn: getMyAffiliateProfile,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-cool-steel-100 rounded-lg animate-pulse" />
        <div className="h-96 bg-white rounded-xl border border-cool-steel-100 animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-vivid-tangerine-200 bg-vivid-tangerine-50 p-5 text-sm text-vivid-tangerine-700">
        No pudimos cargar tu perfil de afiliado. Si acabas de registrarte,
        espera la aprobación o intenta más tarde.
      </div>
    )
  }

  return <ProfileForm profile={profile} />
}

function ProfileForm({ profile }: { profile: Affiliate }) {
  const queryClient = useQueryClient()
  const details = profile.payout_details ?? {}

  const [name, setName] = useState(profile.name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [channelType, setChannelType] = useState(profile.channel_type ?? '')
  const [channelUrl, setChannelUrl] = useState(profile.channel_url ?? '')
  const [audienceSize, setAudienceSize] = useState(profile.audience_size ?? '')
  const [website, setWebsite] = useState(profile.website ?? '')
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>(
    profile.payout_method ?? 'paypal'
  )
  const [paypalEmail, setPaypalEmail] = useState(details.email ?? '')
  const [clabe, setClabe] = useState(details.clabe ?? '')
  const [bank, setBank] = useState(details.bank ?? '')
  const [beneficiary, setBeneficiary] = useState(details.beneficiary ?? '')
  const [account, setAccount] = useState(details.account ?? '')
  const [oxxoPhone, setOxxoPhone] = useState(details.phone ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (payload: AffiliatePayload) => updateMyAffiliateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-profile'] })
      toast.success('Perfil actualizado', {
        description: 'Tus datos se guardaron correctamente.',
      })
    },
    onError: (error: ApiError) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
        toast.error('Datos incompletos', {
          description: 'Verifica los campos marcados en rojo.',
        })
      } else {
        toast.error('No se pudo actualizar', {
          description: error.message || 'Inténtalo nuevamente.',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!channelType) newErrors.channel_type = 'Selecciona un canal'
    if (!channelUrl.trim()) newErrors.channel_url = 'La URL o usuario es obligatoria'
    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      newErrors.website = 'Ingresa una URL válida (https://...)'
    }

    const payout_details: Record<string, string> = {}
    if (payoutMethod === 'paypal') {
      if (!paypalEmail.trim()) newErrors.paypal_email = 'El correo de PayPal es obligatorio'
      else payout_details.email = paypalEmail.trim()
    } else if (payoutMethod === 'spei') {
      if (!/^\d{18}$/.test(clabe.replace(/\s/g, '')))
        newErrors.clabe = 'La CLABE debe tener 18 dígitos'
      else payout_details.clabe = clabe.replace(/\s/g, '')
      if (!bank.trim()) newErrors.bank = 'El banco es obligatorio'
      else payout_details.bank = bank.trim()
      if (!beneficiary.trim()) newErrors.beneficiary = 'El titular es obligatorio'
      else payout_details.beneficiary = beneficiary.trim()
    } else if (payoutMethod === 'bank_transfer') {
      if (!bank.trim()) newErrors.bank = 'El banco es obligatorio'
      else payout_details.bank = bank.trim()
      if (!account.trim()) newErrors.account = 'La cuenta es obligatoria'
      else payout_details.account = account.trim()
      if (!beneficiary.trim()) newErrors.beneficiary = 'El titular es obligatorio'
      else payout_details.beneficiary = beneficiary.trim()
      if (clabe) payout_details.clabe = clabe.replace(/\s/g, '')
    } else if (payoutMethod === 'oxxo') {
      if (!/^\d{10}$/.test(oxxoPhone.replace(/\D/g, '')))
        newErrors.oxxo_phone = 'Ingresa un celular de 10 dígitos'
      else payout_details.phone = oxxoPhone.replace(/\D/g, '')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    mutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      channel_type: channelType,
      channel_url: channelUrl.trim(),
      audience_size: audienceSize || undefined,
      website: website.trim() || undefined,
      payout_method: payoutMethod,
      payout_details,
    })
  }

  const inputClass = (key: string) =>
    `w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
      errors[key]
        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
    }`

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">Mi perfil</h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Administra tus datos personales, canal de promoción y datos de
            cobro.
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <StatusBadge kind="affiliate" status={profile.status} />
            <span className="text-xs text-cool-steel-400">
              Código: <span className="font-mono font-semibold text-parchment-600">{profile.code}</span>
            </span>
          </div>
        )}
      </div>

      {/* Enlace de referido */}
      {profile && <ReferralLinkCard code={profile.code} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
            <UserIcon size={18} className="text-vivid-tangerine-500" />
            <h2 className="text-base font-semibold text-cool-steel-900">
              Datos personales
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Nombre completo <span className="text-vivid-tangerine-500">*</span>
              </label>
              <div className="relative">
                <UserIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClass('name')} pl-9`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                />
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  disabled
                  className="w-full rounded-lg border border-cool-steel-200 bg-cool-steel-50 py-2.5 pl-9 pr-3.5 text-sm text-cool-steel-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-cool-steel-400">
                El correo no se puede modificar.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Teléfono
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className={`${inputClass('phone')} pl-9`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Sitio web
              </label>
              <div className="relative">
                <Globe
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tusitio.com"
                  className={`${inputClass('website')} pl-9`}
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Presencia digital */}
        <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
            <Share2 size={18} className="text-vivid-tangerine-500" />
            <h2 className="text-base font-semibold text-cool-steel-900">
              Presencia digital
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Canal principal <span className="text-vivid-tangerine-500">*</span>
              </label>
              <select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
                className={inputClass('channel_type') + ' bg-white'}
              >
                <option value="">Selecciona un canal</option>
                {CHANNEL_TYPE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.channel_type && (
                <p className="mt-1 text-xs text-vivid-tangerine-500">
                  {errors.channel_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                URL o usuario <span className="text-vivid-tangerine-500">*</span>
              </label>
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="@tuusuario"
                className={inputClass('channel_url')}
              />
              {errors.channel_url && (
                <p className="mt-1 text-xs text-vivid-tangerine-500">
                  {errors.channel_url}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Tamaño de audiencia
              </label>
              <select
                value={audienceSize}
                onChange={(e) => setAudienceSize(e.target.value)}
                className={inputClass('audience_size') + ' bg-white'}
              >
                <option value="">Prefiero no decirlo</option>
                {AUDIENCE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Datos de cobro */}
        <div className="bg-white rounded-xl border border-cool-steel-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cool-steel-100">
            <Wallet size={18} className="text-vivid-tangerine-500" />
            <h2 className="text-base font-semibold text-cool-steel-900">
              Datos de cobro
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-2.5">
                Método de pago <span className="text-vivid-tangerine-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method)}
                    className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
                      payoutMethod === method
                        ? 'border-vivid-tangerine-500 bg-vivid-tangerine-50'
                        : 'border-cool-steel-200 hover:border-cool-steel-300 bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Wallet
                        size={15}
                        className={
                          payoutMethod === method
                            ? 'text-vivid-tangerine-500'
                            : 'text-cool-steel-400'
                        }
                      />
                      <span className="text-sm font-semibold text-cool-steel-800">
                        {PAYOUT_METHOD_LABELS[method]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos por método */}
            {payoutMethod === 'paypal' && (
              <div className="max-w-md">
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Correo de PayPal <span className="text-vivid-tangerine-500">*</span>
                </label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className={inputClass('paypal_email')}
                />
                {errors.paypal_email && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.paypal_email}
                  </p>
                )}
              </div>
            )}

            {payoutMethod === 'spei' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    CLABE (18 dígitos) <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    value={clabe}
                    onChange={(e) => setClabe(e.target.value.replace(/\D/g, ''))}
                    className={inputClass('clabe') + ' font-mono tracking-wider'}
                  />
                  {errors.clabe && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.clabe}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Banco <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className={inputClass('bank')}
                  />
                  {errors.bank && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.bank}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Titular <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className={inputClass('beneficiary')}
                  />
                  {errors.beneficiary && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.beneficiary}
                    </p>
                  )}
                </div>
              </div>
            )}

            {payoutMethod === 'bank_transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Banco <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className={inputClass('bank')}
                  />
                  {errors.bank && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.bank}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Número de cuenta <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className={inputClass('account') + ' font-mono'}
                  />
                  {errors.account && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.account}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    CLABE (opcional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    value={clabe}
                    onChange={(e) => setClabe(e.target.value.replace(/\D/g, ''))}
                    className={inputClass('clabe') + ' font-mono tracking-wider'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Titular <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className={inputClass('beneficiary')}
                  />
                  {errors.beneficiary && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.beneficiary}
                    </p>
                  )}
                </div>
              </div>
            )}

            {payoutMethod === 'oxxo' && (
              <div className="max-w-md">
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Celular para OXXO Pay <span className="text-vivid-tangerine-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={oxxoPhone}
                    onChange={(e) => setOxxoPhone(e.target.value.replace(/\D/g, ''))}
                    className={inputClass('oxxo_phone') + ' pl-9'}
                  />
                </div>
                {errors.oxxo_phone && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">
                    {errors.oxxo_phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Check size={17} />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
