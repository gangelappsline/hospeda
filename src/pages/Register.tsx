import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Check,
  Circle,
} from 'lucide-react'
import { register } from '@/api/auth'
import type { ApiError, RegisterPayload } from '@/types/auth'
import InputField from '@/components/InputField'
import { saveAuth } from '@/utils/authStorage'
import { PANELS, getDefaultPanel } from '@/config/panels'
import {
  MIN_PASSWORD_LENGTH,
  evaluatePasswordSecurity,
  type PasswordStrengthLevel,
} from '@/utils/passwordSecurity'
import LogoIcon from '@/assets/images/icon.webp'

function getStrengthStyles(level: PasswordStrengthLevel): {
  bar: string
  text: string
} {
  switch (level) {
    case 'weak':
      return {
        bar: 'bg-vivid-tangerine-500',
        text: 'text-vivid-tangerine-600',
      }
    case 'fair':
      return {
        bar: 'bg-tangerine-dream-500',
        text: 'text-tangerine-dream-700',
      }
    case 'strong':
      return {
        bar: 'bg-pacific-blue-500',
        text: 'text-pacific-blue-700',
      }
    case 'very_strong':
      return {
        bar: 'bg-pacific-blue-600',
        text: 'text-pacific-blue-700',
      }
    default:
      return {
        bar: 'bg-cool-steel-200',
        text: 'text-cool-steel-500',
      }
  }
}

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const referralCode = searchParams.get('ref')?.trim() || undefined

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordEval = useMemo(
    () => evaluatePasswordSecurity(password),
    [password]
  )

  const strengthStyles = getStrengthStyles(passwordEval.level)

  const confirmationStatus = useMemo(() => {
    if (!passwordConfirmation) return 'empty' as const
    return password === passwordConfirmation
      ? ('match' as const)
      : ('mismatch' as const)
  }, [password, passwordConfirmation])

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (response) => {
      const token =
        response.access_token ??
        response.token ??
        response.data?.access_token ??
        response.data?.token

      const user = response.user ?? response.data?.user

      if (token && user) {
        saveAuth(token, user, true)
        toast.success('¡Cuenta creada con éxito!', {
          description: `Bienvenido a Hospeda, ${user.name}.`,
        })

        if (redirectParam && redirectParam.startsWith('/')) {
          navigate(redirectParam, { replace: true })
          return
        }

        if (user.role && user.role in PANELS) {
          navigate(getDefaultPanel(user.role), { replace: true })
          return
        }

        navigate('/', { replace: true })
        return
      }

      toast.success('¡Cuenta creada con éxito!', {
        description: 'Ya puedes iniciar sesión con tu correo y contraseña.',
      })

      const loginTarget = redirectParam
        ? `/login?redirect=${encodeURIComponent(redirectParam)}`
        : '/login'
      navigate(loginTarget, { replace: true })
    },
    onError: (error: ApiError) => {
      setFieldErrors({})

      if (error.status === 422 && error.errors) {
        const errors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
        })
        setFieldErrors(errors)
        toast.error('Revisa los datos ingresados', {
          description: 'Verifica los campos marcados antes de continuar.',
        })
        return
      }

      if (error.status === 0) {
        toast.error('Sin conexión', {
          description:
            'No se pudo conectar con el servidor de Hospeda. Verifica tu conexión a internet.',
        })
      } else if (error.status === 429) {
        toast.error('Demasiados intentos', {
          description:
            'Por seguridad, espera un momento antes de intentar de nuevo.',
        })
      } else {
        toast.error('No se pudo crear la cuenta', {
          description: error.message || 'Inténtalo nuevamente en unos instantes.',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      nextErrors.name = 'El nombre es obligatorio'
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Ingresa un nombre válido'
    }

    if (!trimmedEmail) {
      nextErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Ingresa un correo electrónico válido'
    }

    if (!passwordEval.isValid) {
      nextErrors.password =
        passwordEval.errorMessage ??
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres y ser segura`
    }

    if (!passwordConfirmation) {
      nextErrors.password_confirmation = 'Confirma tu contraseña'
    } else if (password !== passwordConfirmation) {
      nextErrors.password_confirmation = 'Las contraseñas no coinciden'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    mutation.mutate({
      name: trimmedName,
      email: trimmedEmail,
      password,
      password_confirmation: passwordConfirmation,
      ...(referralCode ? { referral_code: referralCode } : {}),
    })
  }

  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : '/login'

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-vivid-tangerine-600 via-vivid-tangerine-700 to-vivid-tangerine-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vivid-tangerine-900/90 via-vivid-tangerine-800/60 to-vivid-tangerine-600/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center">
              <img src={LogoIcon} alt="Hospeda Logo" className="w-12" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Hospeda
            </span>
          </Link>

          {/* Texto central */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Descubre alojamientos, experiencias y servicios únicos
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Crea tu cuenta en segundos para reservar estancias verificadas,
              guardar tus favoritos o compartir tu espacio como anfitrión.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Reservas y pagos protegidos de extremo a extremo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <BadgeCheck size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Anfitriones, experiencias y servicios verificados
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Registro rápido sin cargos ni trámites innecesarios
                </span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-white/60">
            © 2026 Hospeda. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario sencillo de registro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-warm">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-cool-steel-500 hover:text-cool-steel-800 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          <h1 className="text-3xl font-bold text-cool-steel-900 mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-cool-steel-500 mb-7">
            Solo completa tus datos esenciales para comenzar en Hospeda.
          </p>

          {/* Alerta de error general */}
          {mutation.isError &&
            !Object.keys(fieldErrors).length &&
            (mutation.error as ApiError)?.status !== 422 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-vivid-tangerine-200 bg-vivid-tangerine-50 p-3.5 mb-6">
                <AlertCircle
                  size={18}
                  className="text-vivid-tangerine-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-vivid-tangerine-700">
                  {(mutation.error as ApiError)?.message ||
                    'No se pudo conectar con el servidor de Hospeda.'}
                </p>
              </div>
            )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputField
              label="Nombre"
              type="text"
              value={name}
              onChange={(val) => {
                setName(val)
                clearFieldError('name')
              }}
              placeholder="Ej. Ana García López"
              icon={<User size={18} />}
              error={fieldErrors.name}
              autoComplete="name"
            />

            <InputField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(val) => {
                setEmail(val)
                clearFieldError('email')
              }}
              placeholder="tu@correo.com"
              icon={<Mail size={18} />}
              error={fieldErrors.email}
              autoComplete="email"
            />

            <div>
              <InputField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(val) => {
                  setPassword(val)
                  clearFieldError('password')
                }}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                icon={<Lock size={18} />}
                error={fieldErrors.password}
                autoComplete="new-password"
              />

              {/* Evaluador de seguridad de contraseña en tiempo real */}
              <div className="mt-2.5 rounded-xl border border-cool-steel-200 bg-white p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-cool-steel-600">
                    Seguridad de la contraseña
                  </span>
                  {passwordEval.label ? (
                    <span className={`font-semibold ${strengthStyles.text}`}>
                      {passwordEval.label}
                    </span>
                  ) : (
                    <span className="text-cool-steel-400">Sin evaluar</span>
                  )}
                </div>

                {/* Barra segmentada (4 niveles) */}
                <div
                  className="grid grid-cols-4 gap-1.5"
                  aria-hidden="true"
                >
                  {[1, 2, 3, 4].map((segment) => (
                    <div
                      key={segment}
                      className={`h-1.5 rounded-full transition-colors duration-200 ${
                        segment <= passwordEval.segmentsFilled
                          ? strengthStyles.bar
                          : 'bg-cool-steel-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Lista de requisitos */}
                <ul className="space-y-1 pt-0.5">
                  {passwordEval.checks.map((rule) => (
                    <li
                      key={rule.key}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        rule.passed
                          ? 'text-pacific-blue-700 font-medium'
                          : 'text-cool-steel-500'
                      }`}
                    >
                      {rule.passed ? (
                        <Check
                          size={13}
                          className="text-pacific-blue-600 shrink-0"
                        />
                      ) : (
                        <Circle
                          size={11}
                          className="text-cool-steel-300 shrink-0 ml-[1px]"
                        />
                      )}
                      <span>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <InputField
                label="Confirmar contraseña"
                type="password"
                value={passwordConfirmation}
                onChange={(val) => {
                  setPasswordConfirmation(val)
                  clearFieldError('password_confirmation')
                }}
                placeholder="Repite tu contraseña"
                icon={<Lock size={18} />}
                error={fieldErrors.password_confirmation}
                autoComplete="new-password"
              />

              {!fieldErrors.password_confirmation &&
                confirmationStatus === 'match' && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-pacific-blue-700">
                    <Check size={13} className="text-pacific-blue-600" />
                    Las contraseñas coinciden
                  </p>
                )}

              {!fieldErrors.password_confirmation &&
                confirmationStatus === 'mismatch' && (
                  <p className="mt-1.5 text-xs text-vivid-tangerine-600">
                    Las contraseñas aún no coinciden
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-lg bg-vivid-tangerine-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-vivid-tangerine-700 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {mutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-cool-steel-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              to={loginHref}
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
