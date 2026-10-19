import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Users,
  Percent,
  Share2,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Sparkles,
  ChevronDown,
  Home,
  LogIn,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { getAffiliateSettings } from '@/api/affiliates'
import type { AffiliateSettings } from '@/types/affiliate'
import { getAffiliateSettingsFallback } from '@/utils/affiliateFallback'
import LogoIcon from '@/assets/images/icon.webp'

const FAQ_ITEMS = [
  {
    q: '¿Quién puede ser afiliado de Hospeda?',
    a: 'Cualquier persona mayor de 18 años: influencers, creadores de contenido, community managers, blogueros o simplemente personas con una gran red de contactos. Solo necesitas registrarte y ser aprobado por nuestro equipo.',
  },
  {
    q: '¿Cómo funcionan los niveles de comisión?',
    a: 'Ganas un porcentaje por cada persona que se registre con tu enlace (nivel 1) y un porcentaje adicional por las personas que ellos inviten (nivel 2). No hay límite de personas por nivel: mientras más crezca tu red, más ganas.',
  },
  {
    q: '¿Cuándo y cómo recibo mis pagos?',
    a: 'Las comisiones se acumulan cuando las personas de tu red generan reservas confirmadas. Cuando tu saldo alcanza el monto mínimo, puedes solicitar un retiro por PayPal, transferencia SPEI u otros medios disponibles.',
  },
  {
    q: '¿Tiene algún costo unirme?',
    a: 'No. El Programa de Afiliados de Hospeda es completamente gratuito. Solo ganas: un porcentaje por cada transacción de tu red.',
  },
  {
    q: '¿Puedo promover Hospeda en cualquier canal?',
    a: 'Sí. Redes sociales, blogs, podcasts, comunidades de WhatsApp o Telegram, eventos presenciales... Tú eliges cómo compartir tu enlace de referido.',
  },
] as const

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-cool-steel-100 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-cool-steel-50/50 transition-colors"
      >
        <span className="text-sm font-semibold text-cool-steel-900">{q}</span>
        <ChevronDown
          size={18}
          className={`text-cool-steel-400 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-cool-steel-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function AffiliatesLanding() {
  const { data: settings } = useQuery<AffiliateSettings>({
    queryKey: ['affiliate-settings-public'],
    queryFn: getAffiliateSettings,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  const cfg = settings ?? getAffiliateSettingsFallback()

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Navbar ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src={LogoIcon} alt="Hospeda" className="w-10 h-10" />
            </div>
            <span className="text-lg font-bold text-cool-steel-900 tracking-tight">
              Hospeda
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#beneficios"
              className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
            >
              Preguntas frecuentes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
            >
              <LogIn size={15} />
              Iniciar sesión
            </Link>
            <Link
              to="/afiliados/registro"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-all hover:shadow-md hover:shadow-vivid-tangerine-500/20"
            >
              Quiero ser afiliado
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parchment-50 via-white to-vivid-tangerine-50" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vivid-tangerine-100 text-vivid-tangerine-700 text-xs font-semibold mb-6">
              <Sparkles size={14} />
              Programa de Afiliados Hospeda
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cool-steel-900 leading-[1.1] mb-6">
              Gana dinero compartiendo{' '}
              <span className="text-vivid-tangerine-500">Hospeda</span>
            </h1>

            <p className="text-lg text-cool-steel-600 leading-relaxed mb-10 max-w-2xl">
              Invita a personas a unirse a nuestra plataforma de hospedajes y
              gana <strong className="text-cool-steel-800">{cfg.level1_percent}%</strong> por cada
              referido directo y <strong className="text-cool-steel-800">{cfg.level2_percent}%</strong> por
              cada persona que ellos invitan. Sin límite de referidos, sin costo
              de inscripción.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/afiliados/registro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-vivid-tangerine-500 text-base font-semibold text-white hover:bg-vivid-tangerine-600 transition-all hover:shadow-lg hover:shadow-vivid-tangerine-500/25"
              >
                Registrarme gratis
                <ArrowRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cool-steel-200 text-base font-semibold text-cool-steel-700 hover:border-cool-steel-300 hover:bg-white transition-colors"
              >
                Cómo funciona
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-parchment-200 to-vivid-tangerine-200 border-2 border-white"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-cool-steel-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-vivid-tangerine-400 text-vivid-tangerine-400" />
                  ))}
                  <span className="text-xs ml-1">Comunidad en crecimiento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas flotantes de comisión */}
          <div className="hidden lg:grid grid-cols-2 gap-4 absolute right-12 top-1/2 -translate-y-1/2 w-[380px]">
            <div className="bg-white rounded-2xl shadow-xl border border-parchment-100 p-6 rotate-[-2deg]">
              <div className="w-11 h-11 rounded-xl bg-vivid-tangerine-50 flex items-center justify-center text-vivid-tangerine-500 mb-4">
                <Users size={22} />
              </div>
              <p className="text-3xl font-bold text-cool-steel-900">{cfg.level1_percent}%</p>
              <p className="text-sm font-medium text-cool-steel-600 mt-1">Nivel 1 · Referidos directos</p>
              <p className="text-xs text-cool-steel-400 mt-2">
                Por cada persona que invites tú
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-parchment-100 p-6 rotate-[2deg] mt-8">
              <div className="w-11 h-11 rounded-xl bg-parchment-50 flex items-center justify-center text-parchment-600 mb-4">
                <Share2 size={22} />
              </div>
              <p className="text-3xl font-bold text-cool-steel-900">{cfg.level2_percent}%</p>
              <p className="text-sm font-medium text-cool-steel-600 mt-1">Nivel 2 · Red extendida</p>
              <p className="text-xs text-cool-steel-400 mt-2">
                Por las personas que ellos inviten
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Cómo funciona ═══ */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-vivid-tangerine-600 uppercase tracking-wider mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cool-steel-900 mb-4">
              Empieza a ganar en 3 simples pasos
            </h2>
            <p className="text-cool-steel-500">
              Sin complicaciones. Tú compartes, nosotros nos encargamos del
              resto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BadgeCheck size={26} />,
                step: '01',
                title: 'Regístrate',
                text: 'Crea tu cuenta de afiliado en menos de 3 minutos. Nuestro equipo revisa y aprueba tu perfil rápidamente.',
              },
              {
                icon: <Share2 size={26} />,
                step: '02',
                title: 'Comparte tu enlace',
                text: 'Recibes un enlace único. Compártelo en redes, blog, WhatsApp o donde esté tu comunidad.',
              },
              {
                icon: <Wallet size={26} />,
                step: '03',
                title: 'Cobra tus comisiones',
                text: `Gana ${cfg.level1_percent}% por tus referidos directos y ${cfg.level2_percent}% por el segundo nivel. Retira cuando quieras.`,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-cool-steel-100 bg-white p-8 hover:shadow-xl hover:shadow-cool-steel-100 transition-shadow"
              >
                <span className="absolute -top-4 right-6 text-5xl font-bold text-cool-steel-100 select-none">
                  {item.step}
                </span>
                <div className="w-13 h-13 rounded-xl bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-cool-steel-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-cool-steel-500 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Beneficios ═══ */}
      <section id="beneficios" className="py-24 bg-cool-steel-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-vivid-tangerine-600 uppercase tracking-wider mb-3">
                Beneficios
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cool-steel-900 mb-6 leading-tight">
                Una red sin límites que trabaja para ti
              </h2>
              <p className="text-cool-steel-600 leading-relaxed mb-8">
                El modelo de dos niveles hace que tu comunidad siga generando
                ingresos aunque tú no estés promoviendo activamente. Cada
                persona que suma, suma a tu red.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: <Users size={20} />,
                    title: 'Referidos ilimitados',
                    text: 'Invita a miles de personas. No hay tope en ninguno de los dos niveles.',
                  },
                  {
                    icon: <Percent size={20} />,
                    title: 'Comisiones transparentes',
                    text: `Consulta cada comisión generada: nivel, porcentaje aplicado y monto, en tiempo real.`,
                  },
                  {
                    icon: <TrendingUp size={20} />,
                    title: 'Crecimiento pasivo',
                    text: 'Tu red de segundo nivel genera comisiones aunque no conozcas personalmente a esas personas.',
                  },
                  {
                    icon: <ShieldCheck size={20} />,
                    title: 'Pagos seguros',
                    text: 'Retira por PayPal, SPEI u otros medios con montos mínimos accesibles.',
                  },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-cool-steel-100 text-vivid-tangerine-500 flex items-center justify-center shrink-0 shadow-sm">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-cool-steel-900 mb-0.5">
                        {b.title}
                      </h4>
                      <p className="text-sm text-cool-steel-500 leading-relaxed">
                        {b.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de ejemplo de comisiones */}
            <div className="bg-white rounded-2xl shadow-xl border border-cool-steel-100 overflow-hidden">
              <div className="bg-gradient-to-r from-parchment-600 to-parchment-700 px-6 py-5">
                <p className="text-white font-semibold">Tu panel de afiliado</p>
                <p className="text-white/70 text-xs">
                  Todo el control de tu red en un solo lugar
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-parchment-50 p-4">
                    <p className="text-xs text-cool-steel-500 mb-1">Nivel 1</p>
                    <p className="text-2xl font-bold text-cool-steel-900">128</p>
                    <p className="text-xs text-parchment-600 font-medium">
                      referidos directos
                    </p>
                  </div>
                  <div className="rounded-xl bg-vivid-tangerine-50 p-4">
                    <p className="text-xs text-cool-steel-500 mb-1">Nivel 2</p>
                    <p className="text-2xl font-bold text-cool-steel-900">542</p>
                    <p className="text-xs text-vivid-tangerine-600 font-medium">
                      referidos extendidos
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-cool-steel-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-cool-steel-700">
                      Comisiones del mes
                    </p>
                    <span className="text-xs font-semibold text-pacific-blue-600 bg-pacific-blue-50 px-2 py-0.5 rounded-full">
                      +18.2%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-cool-steel-900">
                    ${cfg.currency === 'MXN' ? '12,480.00' : '12,480.00'}
                  </p>
                  <div className="flex items-end gap-1.5 h-16 mt-4">
                    {[35, 52, 41, 68, 59, 82, 74, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-vivid-tangerine-400 to-vivid-tangerine-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-pacific-blue-50 p-4 flex items-center gap-3">
                  <Clock size={18} className="text-pacific-blue-500 shrink-0" />
                  <p className="text-xs text-pacific-blue-800 leading-relaxed">
                    Próximo pago programado: las comisiones aprobadas se
                    depositan los días 1 y 15 de cada mes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-vivid-tangerine-600 uppercase tracking-wider mb-3">
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cool-steel-900">
              Resolvemos tus dudas
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA final ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vivid-tangerine-600 via-vivid-tangerine-700 to-parchment-800 px-8 sm:px-16 py-16 text-center">
            <div
              className="absolute inset-0 opacity-15 mix-blend-overlay"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                ¿Listo para empezar a ganar?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
                Únete al Programa de Afiliados de Hospeda y convierte tu
                comunidad en un ingreso extra recurrente. El registro toma menos
                de 3 minutos.
              </p>
              <Link
                to="/afiliados/registro"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-base font-semibold text-vivid-tangerine-700 hover:bg-parchment-50 transition-colors hover:shadow-xl"
              >
                Crear mi cuenta de afiliado
                <ArrowRight size={18} />
              </Link>
              <p className="text-white/60 text-xs mt-5">
                Sin costo de inscripción · Sin ventas mínimas · Pagos puntuales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-cool-steel-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vivid-tangerine-500 flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="font-semibold text-cool-steel-900">Hospeda</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-cool-steel-500">
            <Link to="/afiliados" className="hover:text-cool-steel-800">
              Programa de Afiliados
            </Link>
            <a href="#faq" className="hover:text-cool-steel-800">
              Preguntas frecuentes
            </a>
            <Link to="/login" className="hover:text-cool-steel-800">
              Iniciar sesión
            </Link>
          </div>
          <p className="text-xs text-cool-steel-400">
            © {new Date().getFullYear()} Hospeda. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
