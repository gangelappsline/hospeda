import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Globe,
  Users,
  Wallet,
  ShieldCheck,
  Sparkles,
  Percent,
  Share2,
  AlertCircle,
  Info,
  Home,
  BadgeCheck,
} from 'lucide-react'
import {
  getAffiliateSettings,
  getReferrerPreview,
  registerAffiliate,
} from '@/api/affiliates'
import type {
  AffiliateSettings,
  PayoutMethod,
} from '@/types/affiliate'
import type { ApiError } from '@/types/auth'
import {
  AUDIENCE_SIZE_OPTIONS,
  CHANNEL_TYPE_OPTIONS,
  PAYOUT_METHOD_LABELS,
} from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'

const STEPS = [
  { id: 1, label: 'Datos personales', short: 'Personales' },
  { id: 2, label: 'Presencia digital', short: 'Digital' },
  { id: 3, label: 'Datos de pago', short: 'Pago' },
  { id: 4, label: 'Confirmación', short: 'Confirmar' },
] as const

const PAYOUT_METHODS: PayoutMethod[] = ['paypal', 'spei', 'bank_transfer', 'oxxo']

interface FormState {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  channel_type: string
  channel_url: string
  audience_size: string
  website: string
  motivation: string
  payout_method: PayoutMethod
  paypal_email: string
  spei_clabe: string
  spei_bank: string
  spei_beneficiary: string
  bank_name: string
  bank_account: string
  bank_clabe: string
  bank_beneficiary: string
  oxxo_phone: string
  referral_code: string
  accept_terms: boolean
  accept_privacy: boolean
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  channel_type: '',
  channel_url: '',
  audience_size: '',
  website: '',
  motivation: '',
  payout_method: 'paypal',
  paypal_email: '',
  spei_clabe: '',
  spei_bank: '',
  spei_beneficiary: '',
  bank_name: '',
  bank_account: '',
  bank_clabe: '',
  bank_beneficiary: '',
  oxxo_phone: '',
  referral_code: '',
  accept_terms: false,
  accept_privacy: false,
}

function validateStep(step: number, form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 1) {
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
    if (!form.email.trim()) {
      errors.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Correo inválido'
    }
    if (!form.password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    }
    if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden'
    }
    if (form.phone && !/^[+\d][\d\s().-]{7,}$/.test(form.phone)) {
      errors.phone = 'Teléfono inválido'
    }
  }

  if (step === 2) {
    if (!form.channel_type) errors.channel_type = 'Selecciona un canal'
    if (!form.channel_url.trim()) {
      errors.channel_url = 'La URL o usuario de tu canal es obligatoria'
    }
    if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
      errors.website = 'Ingresa una URL válida (https://...)'
    }
    if (form.motivation.length > 500) {
      errors.motivation = 'Máximo 500 caracteres'
    }
  }

  if (step === 3) {
    if (form.payout_method === 'paypal') {
      if (!form.paypal_email.trim()) {
        errors.paypal_email = 'El correo de PayPal es obligatorio'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypal_email)) {
        errors.paypal_email = 'Correo inválido'
      }
    }
    if (form.payout_method === 'spei') {
      if (!/^\d{18}$/.test(form.spei_clabe.replace(/\s/g, ''))) {
        errors.spei_clabe = 'La CLABE debe tener 18 dígitos'
      }
      if (!form.spei_bank.trim()) errors.spei_bank = 'El banco es obligatorio'
      if (!form.spei_beneficiary.trim())
        errors.spei_beneficiary = 'El titular es obligatorio'
    }
    if (form.payout_method === 'bank_transfer') {
      if (!form.bank_name.trim()) errors.bank_name = 'El banco es obligatorio'
      if (!form.bank_account.trim())
        errors.bank_account = 'La cuenta es obligatoria'
      if (!form.bank_beneficiary.trim())
        errors.bank_beneficiary = 'El titular es obligatorio'
    }
    if (form.payout_method === 'oxxo') {
      if (!/^\d{10}$/.test(form.oxxo_phone.replace(/\D/g, ''))) {
        errors.oxxo_phone = 'Ingresa un celular de 10 dígitos'
      }
    }
  }

  if (step === 4) {
    if (!form.accept_terms)
      errors.accept_terms = 'Debes aceptar los términos del programa'
    if (!form.accept_privacy)
      errors.accept_privacy = 'Debes aceptar el aviso de privacidad'
  }

  return errors
}

function buildPayload(form: FormState) {
  const payout_details: Record<string, string> = {}
  if (form.payout_method === 'paypal') {
    payout_details.email = form.paypal_email.trim()
  } else if (form.payout_method === 'spei') {
    payout_details.clabe = form.spei_clabe.replace(/\s/g, '')
    payout_details.bank = form.spei_bank.trim()
    payout_details.beneficiary = form.spei_beneficiary.trim()
  } else if (form.payout_method === 'bank_transfer') {
    payout_details.bank = form.bank_name.trim()
    payout_details.account = form.bank_account.trim()
    payout_details.clabe = form.bank_clabe.replace(/\s/g, '')
    payout_details.beneficiary = form.bank_beneficiary.trim()
  } else if (form.payout_method === 'oxxo') {
    payout_details.phone = form.oxxo_phone.replace(/\D/g, '')
  }

  return {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim() || undefined,
    password: form.password,
    password_confirmation: form.password_confirmation,
    channel_type: form.channel_type,
    channel_url: form.channel_url.trim(),
    audience_size: form.audience_size || undefined,
    website: form.website.trim() || undefined,
    motivation: form.motivation.trim() || undefined,
    payout_method: form.payout_method,
    payout_details,
    referral_code: form.referral_code.trim() || null,
    accept_terms: form.accept_terms,
    accept_privacy: form.accept_privacy,
  }
}

export default function AffiliateRegister() {
  const [searchParams] = useSearchParams()
  const refFromUrl = searchParams.get('ref') || ''

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    referral_code: refFromUrl,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const [registeredCode, setRegisteredCode] = useState('')

  // Configuración vigente (porcentajes configurables desde la API)
  const { data: settings } = useQuery<AffiliateSettings>({
    queryKey: ['affiliate-settings-public'],
    queryFn: getAffiliateSettings,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  const cfg = settings ?? getAffiliateSettingsFallback()

  // Vista previa del afiliado que invita
  const { data: referrer } = useQuery({
    queryKey: ['referrer-preview', form.referral_code],
    queryFn: () => getReferrerPreview(form.referral_code),
    enabled: form.referral_code.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
  })

  const setField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Limpiar el error del campo al editar
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: registerAffiliate,
    onSuccess: (data) => {
      setRegisteredName(data.user?.name ?? form.name)
      setRegisteredCode(data.affiliate?.code ?? '')
      setSuccess(true)
      toast.success('¡Registro enviado!', {
        description: 'Tu solicitud de afiliado fue recibida correctamente.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error: ApiError) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        // Mapeo de campos de la API → campos del formulario
        const mapping: Record<string, string> = {
          'payout_details.email': 'paypal_email',
          'payout_details.clabe': 'spei_clabe',
          'payout_details.bank': 'spei_bank',
          'payout_details.beneficiary': 'spei_beneficiary',
          'payout_details.phone': 'oxxo_phone',
          'payout_details.account': 'bank_account',
        }
        Object.entries(error.errors).forEach(([key, messages]) => {
          const field = mapping[key] ?? key
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
        })
        setErrors(fieldErrors)
        toast.error('Datos incompletos', {
          description: 'Verifica los campos marcados en rojo.',
        })
      } else {
        toast.error('No se pudo completar el registro', {
          description: error.message || 'Inténtalo nuevamente.',
        })
      }
    },
  })

  const goNext = () => {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step !== STEPS.length) {
      goNext()
      return
    }
    const stepErrors = validateStep(4, form)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    mutation.mutate(buildPayload(form))
  }

  const progress = useMemo(
    () => (step / STEPS.length) * 100,
    [step]
  )

  // ─── Pantalla de éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-parchment-50 via-parchment-100 to-vivid-tangerine-50">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-xl border border-cool-steel-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-pacific-blue-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-pacific-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-cool-steel-900 mb-2">
              ¡Bienvenido al programa{registeredName ? `, ${registeredName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-sm text-cool-steel-500 leading-relaxed max-w-md mx-auto">
              Tu solicitud fue enviada. Nuestro equipo la revisará y recibirás un
              correo con tu acceso al panel de afiliado. Mientras tanto, ya
              puedes compartir tu enlace.
            </p>

            {registeredCode && (
              <div className="mt-6 rounded-xl border border-parchment-200 bg-parchment-50 p-4">
                <p className="text-xs text-cool-steel-500 mb-1">
                  Tu código de afiliado
                </p>
                <p className="text-2xl font-bold font-mono text-parchment-600">
                  {registeredCode}
                </p>
                <p className="text-xs text-cool-steel-500 mt-2">
                  {window.location.origin}/afiliados/registro?ref={registeredCode}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/afiliados"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-cool-steel-200 text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al programa
              </Link>
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors"
              >
                Iniciar sesión
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-cool-steel-400 mt-6">
            © {new Date().getFullYear()} Hospeda · Programa de Afiliados
          </p>
        </div>
      </div>
    )
  }

  // ─── Formulario multi-paso ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — Branding */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-parchment-600 via-parchment-700 to-cool-steel-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cool-steel-900/95 via-parchment-800/70 to-parchment-600/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Hospeda</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-6">
              <Sparkles size={14} />
              Programa de Afiliados
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Convierte tu comunidad en ingresos
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Comparte Hospeda con tu audiencia y gana comisiones por cada
              persona que se suma a la plataforma — y por la red que ellos
              construyan.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur p-4">
                <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
                  <Percent size={22} />
                </div>
                <div>
                  <p className="font-semibold">{cfg.level1_percent}% por referidos directos</p>
                  <p className="text-sm text-white/75">
                    Nivel 1 — cada persona que invites tú
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur p-4">
                <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
                  <Share2 size={22} />
                </div>
                <div>
                  <p className="font-semibold">{cfg.level2_percent}% por segundo nivel</p>
                  <p className="text-sm text-white/75">
                    Nivel 2 — las personas que ellos inviten
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur p-4">
                <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <div>
                  <p className="font-semibold">Red sin límite</p>
                  <p className="text-sm text-white/75">
                    Infinitos referidos en cada nivel
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <ShieldCheck size={16} />
            Datos protegidos · Comisiones transparentes · Pagos puntuales
          </div>
        </div>
      </div>

      {/* Panel derecho — Wizard */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 sm:p-10 bg-surface-warm overflow-y-auto">
        <div className="w-full max-w-xl">
          <Link
            to="/afiliados"
            className="inline-flex items-center gap-1.5 text-sm text-cool-steel-500 hover:text-cool-steel-800 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Volver al programa
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-cool-steel-900 mb-1.5">
            Regístrate como afiliado
          </h1>
          <p className="text-sm text-cool-steel-500 mb-7">
            Completa tus datos en 4 pasos. Toma menos de 3 minutos.
          </p>

          {/* Indicador de progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center w-full last:w-auto">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step > s.id
                          ? 'bg-pacific-blue-500 text-white'
                          : step === s.id
                            ? 'bg-vivid-tangerine-500 text-white'
                            : 'bg-cool-steel-100 text-cool-steel-400'
                      }`}
                    >
                      {step > s.id ? <Check size={16} /> : s.id}
                    </div>
                    <span
                      className={`hidden sm:block text-[11px] mt-1.5 font-medium ${
                        step === s.id
                          ? 'text-vivid-tangerine-600'
                          : step > s.id
                            ? 'text-pacific-blue-600'
                            : 'text-cool-steel-400'
                      }`}
                    >
                      {s.short}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 rounded ${
                        step > s.id ? 'bg-pacific-blue-300' : 'bg-cool-steel-100'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 rounded-full bg-cool-steel-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vivid-tangerine-400 to-vivid-tangerine-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Código de referido detectado */}
          {form.referral_code && referrer && (
            <div className="flex items-start gap-2.5 rounded-lg border border-parchment-200 bg-parchment-50 p-3.5 mb-6">
              <BadgeCheck size={18} className="text-parchment-600 shrink-0 mt-0.5" />
              <p className="text-sm text-cool-steel-700">
                Te invita:{' '}
                <span className="font-semibold">{referrer.name}</span>{' '}
                <span className="text-cool-steel-500">
                  (código {form.referral_code})
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ═══ PASO 1 · Datos personales ═══ */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Nombre completo <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                    />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="Ej. Ana García López"
                      autoFocus
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Correo electrónico <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Teléfono{' '}
                    <span className="text-cool-steel-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                    />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+52 55 1234 5678"
                      autoComplete="tel"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                      Contraseña <span className="text-vivid-tangerine-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                      />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setField('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.password
                            ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                            : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        }`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-vivid-tangerine-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                      Confirmar contraseña{' '}
                      <span className="text-vivid-tangerine-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                      />
                      <input
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) =>
                          setField('password_confirmation', e.target.value)
                        }
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.password_confirmation
                            ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                            : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        }`}
                      />
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-xs text-vivid-tangerine-500">
                        {errors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ PASO 2 · Presencia digital ═══ */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Canal principal <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <select
                    value={form.channel_type}
                    onChange={(e) => setField('channel_type', e.target.value)}
                    className={`w-full rounded-lg border py-2.5 px-3.5 text-sm bg-white transition-colors focus:outline-none focus:ring-2 ${
                      errors.channel_type
                        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    }`}
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
                    URL o usuario de tu canal{' '}
                    <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                    />
                    <input
                      type="text"
                      value={form.channel_url}
                      onChange={(e) => setField('channel_url', e.target.value)}
                      placeholder="Ej. @tuusuario o https://instagram.com/tuusuario"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        errors.channel_url
                          ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      }`}
                    />
                  </div>
                  {errors.channel_url && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.channel_url}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Tamaño de audiencia{' '}
                    <span className="text-cool-steel-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    value={form.audience_size}
                    onChange={(e) => setField('audience_size', e.target.value)}
                    className="w-full rounded-lg border border-cool-steel-300 bg-white py-2.5 px-3.5 text-sm focus:border-vivid-tangerine-500 focus:ring-2 focus:ring-vivid-tangerine-100 focus:outline-none transition-colors"
                  >
                    <option value="">Prefiero no decirlo</option>
                    {AUDIENCE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Sitio web o blog{' '}
                    <span className="text-cool-steel-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setField('website', e.target.value)}
                    placeholder="https://tusitio.com"
                    className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.website
                        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    }`}
                  />
                  {errors.website && (
                    <p className="mt-1 text-xs text-vivid-tangerine-500">
                      {errors.website}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    ¿Por qué quieres ser afiliado?{' '}
                    <span className="text-cool-steel-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={form.motivation}
                    onChange={(e) => setField('motivation', e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Cuéntanos brevemente cómo promoverías Hospeda en tu comunidad..."
                    className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors resize-none focus:outline-none focus:ring-2 ${
                      errors.motivation
                        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.motivation ? (
                      <p className="text-xs text-vivid-tangerine-500">
                        {errors.motivation}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-cool-steel-400">
                      {form.motivation.length}/500
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ PASO 3 · Datos de pago ═══ */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-2.5">
                    Método para recibir tus comisiones{' '}
                    <span className="text-vivid-tangerine-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYOUT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setField('payout_method', method)}
                        className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3.5 text-left transition-colors ${
                          form.payout_method === method
                            ? 'border-vivid-tangerine-500 bg-vivid-tangerine-50'
                            : 'border-cool-steel-200 hover:border-cool-steel-300 bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Wallet
                            size={16}
                            className={
                              form.payout_method === method
                                ? 'text-vivid-tangerine-500'
                                : 'text-cool-steel-400'
                            }
                          />
                          <span className="text-sm font-semibold text-cool-steel-800">
                            {PAYOUT_METHOD_LABELS[method]}
                          </span>
                        </span>
                        {form.payout_method === method && (
                          <CheckCircle2
                            size={14}
                            className="text-vivid-tangerine-500"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos dinámicos según método */}
                {form.payout_method === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                      Correo de PayPal{' '}
                      <span className="text-vivid-tangerine-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.paypal_email}
                      onChange={(e) => setField('paypal_email', e.target.value)}
                      placeholder="tu@paypal.com"
                      className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        errors.paypal_email
                          ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      }`}
                    />
                    {errors.paypal_email && (
                      <p className="mt-1 text-xs text-vivid-tangerine-500">
                        {errors.paypal_email}
                      </p>
                    )}
                  </div>
                )}

                {form.payout_method === 'spei' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                        CLABE interbancaria (18 dígitos){' '}
                        <span className="text-vivid-tangerine-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        value={form.spei_clabe}
                        onChange={(e) =>
                          setField('spei_clabe', e.target.value.replace(/\D/g, ''))
                        }
                        placeholder="012345678901234567"
                        className={`w-full rounded-lg border py-2.5 px-3.5 text-sm font-mono tracking-wider transition-colors focus:outline-none focus:ring-2 ${
                          errors.spei_clabe
                            ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                            : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        }`}
                      />
                      {errors.spei_clabe && (
                        <p className="mt-1 text-xs text-vivid-tangerine-500">
                          {errors.spei_clabe}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                          Banco <span className="text-vivid-tangerine-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.spei_bank}
                          onChange={(e) => setField('spei_bank', e.target.value)}
                          placeholder="Ej. BBVA"
                          className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                            errors.spei_bank
                              ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                              : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          }`}
                        />
                        {errors.spei_bank && (
                          <p className="mt-1 text-xs text-vivid-tangerine-500">
                            {errors.spei_bank}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                          Titular de la cuenta{' '}
                          <span className="text-vivid-tangerine-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.spei_beneficiary}
                          onChange={(e) =>
                            setField('spei_beneficiary', e.target.value)
                          }
                          placeholder="Nombre completo"
                          className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                            errors.spei_beneficiary
                              ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                              : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          }`}
                        />
                        {errors.spei_beneficiary && (
                          <p className="mt-1 text-xs text-vivid-tangerine-500">
                            {errors.spei_beneficiary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {form.payout_method === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                          Banco <span className="text-vivid-tangerine-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.bank_name}
                          onChange={(e) => setField('bank_name', e.target.value)}
                          placeholder="Ej. Santander"
                          className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                            errors.bank_name
                              ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                              : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          }`}
                        />
                        {errors.bank_name && (
                          <p className="mt-1 text-xs text-vivid-tangerine-500">
                            {errors.bank_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                          Número de cuenta{' '}
                          <span className="text-vivid-tangerine-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.bank_account}
                          onChange={(e) => setField('bank_account', e.target.value)}
                          placeholder="0123456789"
                          className={`w-full rounded-lg border py-2.5 px-3.5 text-sm font-mono transition-colors focus:outline-none focus:ring-2 ${
                            errors.bank_account
                              ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                              : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                          }`}
                        />
                        {errors.bank_account && (
                          <p className="mt-1 text-xs text-vivid-tangerine-500">
                            {errors.bank_account}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                        CLABE <span className="text-cool-steel-400 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        value={form.bank_clabe}
                        onChange={(e) =>
                          setField('bank_clabe', e.target.value.replace(/\D/g, ''))
                        }
                        placeholder="012345678901234567"
                        className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm font-mono tracking-wider focus:border-vivid-tangerine-500 focus:ring-2 focus:ring-vivid-tangerine-100 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                        Titular de la cuenta{' '}
                        <span className="text-vivid-tangerine-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.bank_beneficiary}
                        onChange={(e) =>
                          setField('bank_beneficiary', e.target.value)
                        }
                        placeholder="Nombre completo"
                        className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.bank_beneficiary
                            ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                            : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        }`}
                      />
                      {errors.bank_beneficiary && (
                        <p className="mt-1 text-xs text-vivid-tangerine-500">
                          {errors.bank_beneficiary}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {form.payout_method === 'oxxo' && (
                  <div>
                    <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                      Celular para OXXO Pay{' '}
                      <span className="text-vivid-tangerine-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-cool-steel-400"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.oxxo_phone}
                        onChange={(e) =>
                          setField(
                            'oxxo_phone',
                            e.target.value.replace(/\D/g, '')
                          )
                        }
                        placeholder="5512345678"
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.oxxo_phone
                            ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                            : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        }`}
                      />
                    </div>
                    {errors.oxxo_phone && (
                      <p className="mt-1 text-xs text-vivid-tangerine-500">
                        {errors.oxxo_phone}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-2.5 rounded-lg border border-cool-steel-200 bg-cool-steel-50 p-3.5">
                  <Info size={16} className="text-cool-steel-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-cool-steel-600 leading-relaxed">
                    Tus datos de pago se almacenan de forma cifrada y solo se
                    utilizan para depositar tus comisiones. El monto mínimo de
                    retiro es de {cfg.currency}{' '}
                    {cfg.min_payout_amount.toLocaleString('es-MX')}.
                  </p>
                </div>
              </div>
            )}

            {/* ═══ PASO 4 · Confirmación ═══ */}
            {step === 4 && (
              <div className="space-y-5">
                {/* Resumen */}
                <div className="rounded-xl border border-cool-steel-200 overflow-hidden">
                  <div className="bg-cool-steel-50 px-4 py-2.5">
                    <p className="text-xs font-semibold text-cool-steel-500 uppercase tracking-wider">
                      Resumen de tu registro
                    </p>
                  </div>
                  <dl className="divide-y divide-cool-steel-100">
                    <div className="flex justify-between px-4 py-2.5">
                      <dt className="text-sm text-cool-steel-500">Nombre</dt>
                      <dd className="text-sm font-medium text-cool-steel-800">
                        {form.name}
                      </dd>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <dt className="text-sm text-cool-steel-500">Correo</dt>
                      <dd className="text-sm font-medium text-cool-steel-800">
                        {form.email}
                      </dd>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <dt className="text-sm text-cool-steel-500">Canal</dt>
                      <dd className="text-sm font-medium text-cool-steel-800">
                        {form.channel_type}
                        {form.audience_size ? ` · ${form.audience_size}` : ''}
                      </dd>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <dt className="text-sm text-cool-steel-500">Cobro</dt>
                      <dd className="text-sm font-medium text-cool-steel-800">
                        {PAYOUT_METHOD_LABELS[form.payout_method]}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Código de referido */}
                <div>
                  <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                    Código de quien te invita{' '}
                    <span className="text-cool-steel-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.referral_code}
                    onChange={(e) =>
                      setField('referral_code', e.target.value.toUpperCase())
                    }
                    placeholder="Ej. ANA-8F3K"
                    className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm font-mono uppercase tracking-wider focus:border-vivid-tangerine-500 focus:ring-2 focus:ring-vivid-tangerine-100 focus:outline-none transition-colors"
                  />
                  <p className="mt-1 text-xs text-cool-steel-400">
                    Si alguien te invitó a unirte, ingresa su código para que
                    ambos se beneficien.
                  </p>
                </div>

                {/* Consentimientos */}
                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.accept_terms}
                      onChange={(e) => setField('accept_terms', e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-cool-steel-300 text-vivid-tangerine-600 focus:ring-vivid-tangerine-500"
                    />
                    <span className="text-sm text-cool-steel-700">
                      Acepto los{' '}
                      <span className="text-vivid-tangerine-600 font-medium">
                        términos y condiciones
                      </span>{' '}
                      del Programa de Afiliados de Hospeda.{' '}
                      <span className="text-vivid-tangerine-500">*</span>
                    </span>
                  </label>
                  {errors.accept_terms && (
                    <p className="text-xs text-vivid-tangerine-500 ml-6">
                      {errors.accept_terms}
                    </p>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.accept_privacy}
                      onChange={(e) =>
                        setField('accept_privacy', e.target.checked)
                      }
                      className="w-4 h-4 mt-0.5 rounded border-cool-steel-300 text-vivid-tangerine-600 focus:ring-vivid-tangerine-500"
                    />
                    <span className="text-sm text-cool-steel-700">
                      Acepto el{' '}
                      <span className="text-vivid-tangerine-600 font-medium">
                        aviso de privacidad
                      </span>{' '}
                      y el tratamiento de mis datos personales.{' '}
                      <span className="text-vivid-tangerine-500">*</span>
                    </span>
                  </label>
                  {errors.accept_privacy && (
                    <p className="text-xs text-vivid-tangerine-500 ml-6">
                      {errors.accept_privacy}
                    </p>
                  )}
                </div>

                {/* Error general de la API */}
                {mutation.isError &&
                  !Object.keys(errors).length &&
                  (mutation.error as ApiError)?.status !== 422 && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-vivid-tangerine-200 bg-vivid-tangerine-50 p-3.5">
                      <AlertCircle
                        size={18}
                        className="text-vivid-tangerine-500 shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-vivid-tangerine-700">
                        {(mutation.error as ApiError)?.message ||
                          'No se pudo enviar el registro. Verifica tu conexión.'}
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-cool-steel-100">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || mutation.isPending}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  step === 1
                    ? 'text-cool-steel-300 cursor-not-allowed'
                    : 'text-cool-steel-600 hover:bg-cool-steel-100'
                }`}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : step === STEPS.length ? (
                  <>
                    <Check size={16} />
                    Completar registro
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-cool-steel-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-vivid-tangerine-600 hover:text-vivid-tangerine-700 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
