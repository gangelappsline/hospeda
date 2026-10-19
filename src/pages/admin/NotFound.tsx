import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, ArrowLeft, Search, Compass } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Ilustración / número 404 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-vivid-tangerine-100/60 blur-3xl" />
          </div>

          <div className="relative flex items-center justify-center">
            <span className="text-[120px] font-black text-cool-steel-900 leading-none tracking-tighter">
              4
            </span>
            <div className="mx-2 w-20 h-20 rounded-2xl bg-vivid-tangerine-500 flex items-center justify-center shadow-lg shadow-vivid-tangerine-500/30">
              <Compass size={40} className="text-white" />
            </div>
            <span className="text-[120px] font-black text-cool-steel-900 leading-none tracking-tighter">
              4
            </span>
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="text-2xl font-bold text-cool-steel-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-sm text-cool-steel-500 leading-relaxed mb-2 max-w-md mx-auto">
          La ruta que intentas visitar no existe o fue movida. Verifica la URL o
          regresa al panel principal para continuar trabajando.
        </p>

        {/* Ruta intentada */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cool-steel-100 text-xs font-mono text-cool-steel-600 mb-8 max-w-full">
          <Search size={12} className="shrink-0" />
          <span className="truncate">{location.pathname}</span>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cool-steel-200 bg-white text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-50 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={16} />
            Volver atrás
          </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-all hover:shadow-lg hover:shadow-vivid-tangerine-500/20 w-full sm:w-auto justify-center"
          >
            <Home size={16} />
            Ir al panel principal
          </Link>
        </div>
      </motion.div>
    </div>
  )
}