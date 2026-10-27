import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LogIn,
  UserPlus,
  ChevronDown,
  Building2,
  Compass,
  ConciergeBell,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react'
import LogoIcon from '@/assets/images/icon.webp'

const EXPLORE_ITEMS = [
  {
    to: '/alojamientos',
    matchPaths: ['/alojamientos', '/buscar'],
    label: 'Alojamientos',
    description: 'Casas, villas, cabañas y espacios verificados',
    icon: Building2,
  },
  {
    to: '/experiencias',
    matchPaths: ['/experiencias'],
    label: 'Experiencias',
    description: 'Tours, gastronomía y actividades locales',
    icon: Compass,
  },
  {
    to: '/servicios',
    matchPaths: ['/servicios'],
    label: 'Servicios',
    description: 'Chef privado, traslados, bienestar y más',
    icon: ConciergeBell,
  },
] as const

export default function LandingNavbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExploreOpen, setMobileExploreOpen] = useState(true)

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  const isOnHome = location.pathname === '/'
  const sectionHref = (hash: string) => (isOnHome ? hash : `/${hash}`)

  const isExploreActive = EXPLORE_ITEMS.some((item) =>
    item.matchPaths.some((p) => location.pathname.startsWith(p))
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setExploreOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExploreOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const openDesktopExplore = () => {
    if (closeTimeoutRef.current != null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setExploreOpen(true)
  }

  const scheduleCloseDesktopExplore = () => {
    if (closeTimeoutRef.current != null) {
      window.clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setExploreOpen(false)
    }, 150)
  }

  const closeAllMenus = () => {
    setExploreOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen || !isOnHome
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cool-steel-100'
          : 'bg-white/85 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeAllMenus}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src={LogoIcon} alt="Hospeda Logo" className="w-10 h-10" />
          </div>
          <span className="text-lg font-bold text-cool-steel-900 tracking-tight">
            Hospeda
          </span>
        </Link>

        {/* Navegación central (Desktop) */}
        <nav className="hidden md:flex items-center gap-7">
          {/* Submenú Explorar */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDesktopExplore}
            onMouseLeave={scheduleCloseDesktopExplore}
          >
            <button
              type="button"
              onClick={() => setExploreOpen((prev) => !prev)}
              aria-expanded={exploreOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                exploreOpen || isExploreActive
                  ? 'text-vivid-tangerine-600'
                  : 'text-cool-steel-700 hover:text-vivid-tangerine-500'
              }`}
            >
              <span>Explorar</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  exploreOpen ? 'rotate-180 text-vivid-tangerine-500' : ''
                }`}
              />
            </button>

            {/* Panel desplegable */}
            <div
              role="menu"
              aria-label="Opciones para explorar"
              className={`absolute left-0 top-full pt-2 w-80 transition-all duration-200 origin-top-left ${
                exploreOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-1.5 pointer-events-none'
              }`}
            >
              <div className="rounded-2xl bg-white border border-cool-steel-100 shadow-xl shadow-cool-steel-900/10 p-2 space-y-1">
                {EXPLORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.matchPaths.some((p) =>
                    location.pathname.startsWith(p)
                  )
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      onClick={closeAllMenus}
                      className={`group flex items-start gap-3.5 p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-vivid-tangerine-50 text-vivid-tangerine-700'
                          : 'hover:bg-cool-steel-50 text-cool-steel-900'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-vivid-tangerine-500 text-white'
                            : 'bg-vivid-tangerine-50 text-vivid-tangerine-600 group-hover:bg-vivid-tangerine-500 group-hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-cool-steel-900 group-hover:text-vivid-tangerine-600 transition-colors">
                            {item.label}
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="text-cool-steel-300 group-hover:text-vivid-tangerine-500 transition-colors shrink-0"
                          />
                        </div>
                        <p className="text-xs text-cool-steel-500 leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <a
            href={sectionHref('#por-que')}
            onClick={closeAllMenus}
            className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
          >
            Por qué Hospeda
          </a>
          <a
            href={sectionHref('#anfitrion')}
            onClick={closeAllMenus}
            className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
          >
            Sé anfitrión
          </a>
          <Link
            to="/afiliados"
            onClick={closeAllMenus}
            className="text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors"
          >
            Programa de afiliados
          </Link>
        </nav>

        {/* Acciones derecha + botón móvil */}
        <div className="flex items-center gap-2">
          <a
            href={sectionHref('#anfitrion')}
            onClick={closeAllMenus}
            className="hidden xl:block text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500 transition-colors mr-1"
          >
            Pon tu espacio en Hospeda
          </a>
          <Link
            to="/login"
            onClick={closeAllMenus}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-cool-steel-200 bg-white text-sm font-medium text-cool-steel-700 hover:border-cool-steel-300 hover:text-vivid-tangerine-600 transition-colors"
          >
            <LogIn size={15} />
            <span>Iniciar sesión</span>
          </Link>
          <Link
            to="/register"
            onClick={closeAllMenus}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-all hover:shadow-md hover:shadow-vivid-tangerine-500/20"
          >
            <UserPlus size={15} />
            <span>Crear cuenta</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-cool-steel-200 text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cool-steel-100 bg-white px-4 pt-3 pb-5 shadow-lg space-y-3">
          <div>
            <button
              type="button"
              onClick={() => setMobileExploreOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-cool-steel-900"
            >
              <span>Explorar</span>
              <ChevronDown
                size={16}
                className={`text-cool-steel-500 transition-transform ${
                  mobileExploreOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mobileExploreOpen && (
              <div className="mt-1 space-y-1 pl-1">
                {EXPLORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.matchPaths.some((p) =>
                    location.pathname.startsWith(p)
                  )
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeAllMenus}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-vivid-tangerine-50 text-vivid-tangerine-700'
                          : 'hover:bg-cool-steel-50 text-cool-steel-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-vivid-tangerine-500 text-white'
                            : 'bg-vivid-tangerine-50 text-vivid-tangerine-600'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cool-steel-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-cool-steel-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-cool-steel-100 pt-2 space-y-1">
            <a
              href={sectionHref('#por-que')}
              onClick={closeAllMenus}
              className="block py-2 text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500"
            >
              Por qué Hospeda
            </a>
            <a
              href={sectionHref('#anfitrion')}
              onClick={closeAllMenus}
              className="block py-2 text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500"
            >
              Sé anfitrión
            </a>
            <Link
              to="/afiliados"
              onClick={closeAllMenus}
              className="block py-2 text-sm font-medium text-cool-steel-700 hover:text-vivid-tangerine-500"
            >
              Programa de afiliados
            </Link>
          </div>

          <div className="border-t border-cool-steel-100 pt-3 grid grid-cols-2 gap-2.5">
            <Link
              to="/login"
              onClick={closeAllMenus}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-cool-steel-200 bg-white text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-50 transition-colors"
            >
              <LogIn size={15} />
              <span>Iniciar sesión</span>
            </Link>
            <Link
              to="/register"
              onClick={closeAllMenus}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors"
            >
              <UserPlus size={15} />
              <span>Crear cuenta</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
