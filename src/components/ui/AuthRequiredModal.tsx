import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Heart, LogIn, UserPlus, X, Check, ShieldCheck } from 'lucide-react'
import { useLockBodyScroll } from '@/hooks/useUiHelpers'

interface Props {
  open: boolean
  onClose: () => void
  /** Ruta a la que se vuelve después de iniciar sesión / registrarse. */
  redirectTo?: string
  title?: string
  description?: string
  action?: string
}

const BENEFITS = [
  'Guarda tus alojamientos favoritos',
  'Recupera tus fechas y huéspedes',
  'Reserva y paga de forma segura',
]

export default function AuthRequiredModal({
  open,
  onClose,
  redirectTo,
  title = 'Inicia sesión para guardar en favoritos',
  description = 'Crea tu cuenta gratis o inicia sesión para guardar este alojamiento y consultarlo cuando quieras.',
  action = 'guardar en favoritos',
}: Props) {
  const location = useLocation()
  const target = redirectTo ?? `${location.pathname}${location.search}`
  const loginHref = `/login?redirect=${encodeURIComponent(target)}`
  const registerHref = `/register?redirect=${encodeURIComponent(target)}`

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-cool-steel-950/60 backdrop-blur-sm cursor-default"
      />

      {/* Tarjeta */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-cool-steel-950/30 overflow-hidden animate-[modalIn_.22s_ease-out]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 border border-cool-steel-200 text-cool-steel-600 flex items-center justify-center transition-colors hover:bg-cool-steel-50 hover:text-cool-steel-900 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Encabezado */}
        <div className="relative px-6 pt-8 pb-6 sm:px-8 bg-gradient-to-br from-vivid-tangerine-50 via-white to-white border-b border-cool-steel-100">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-vivid-tangerine-500/15 border border-vivid-tangerine-100 flex items-center justify-center mb-4">
            <Heart
              size={26}
              className="fill-vivid-tangerine-500 text-vivid-tangerine-500"
            />
          </div>
          <h2
            id="auth-required-title"
            className="text-xl sm:text-2xl font-bold text-cool-steel-900 leading-snug pr-8"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-cool-steel-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Beneficios */}
        <div className="px-6 pt-5 sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cool-steel-500 mb-3">
            Al tener una cuenta puedes
          </p>
          <ul className="space-y-2.5">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-cool-steel-700"
              >
                <span className="mt-0.5 w-5 h-5 rounded-full bg-pacific-blue-50 border border-pacific-blue-200 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-pacific-blue-700" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div className="px-6 py-6 sm:px-8 space-y-2.5">
          <Link
            to={loginHref}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-vivid-tangerine-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-vivid-tangerine-500/25 transition-colors hover:bg-vivid-tangerine-600"
          >
            <LogIn size={16} />
            Iniciar sesión
          </Link>
          <Link
            to={registerHref}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cool-steel-300 bg-white px-4 py-3 text-sm font-semibold text-cool-steel-800 transition-colors hover:bg-cool-steel-50"
          >
            <UserPlus size={16} />
            Crear cuenta gratis
          </Link>

          <p className="pt-1 flex items-center justify-center gap-1.5 text-center text-[11px] text-cool-steel-500">
            <ShieldCheck size={13} className="text-pacific-blue-600" />
            Volverás aquí mismo para {action}.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}
