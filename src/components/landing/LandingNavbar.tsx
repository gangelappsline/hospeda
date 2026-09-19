import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Home, LogIn } from 'lucide-react'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            Hospeda
          </span>
        </Link>

        {/* Centro */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#explorar"
            className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
          >
            Explorar
          </a>
          <a
            href="#por-que"
            className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
          >
            Por qué Hospeda
          </a>
          <a
            href="#anfitrion"
            className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
          >
            Sé anfitrión
          </a>
        </nav>

        {/* Derecha */}
        <div className="flex items-center gap-3">
          <a
            href="#anfitrion"
            className="hidden sm:block text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
          >
            Pon tu espacio en Hospeda
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-all hover:shadow-md hover:shadow-orange-500/20"
          >
            <LogIn size={15} />
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  )
}