import { motion } from 'motion/react'
import { Home, ArrowRight } from 'lucide-react'

const STATS = [
  { value: '1,847', label: 'Propiedades activas' },
  { value: '4.9', label: 'Calificación promedio' },
  { value: '24 h', label: 'Pago tras el check-in' },
  { value: '3%', label: 'Comisión por reserva' },
]

export default function HostCTA() {
  return (
    <section id="anfitrion" className="py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-[#1a2740] px-8 py-12 sm:px-12 sm:py-16"
        >
          {/* Patrón decorativo sutil */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Columna izquierda */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-5">
                <Home size={13} />
                Para anfitriones
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Tu espacio puede generar más de lo que imaginas
              </h2>

              <p className="text-white/70 text-base leading-relaxed mb-7 max-w-lg">
                Publicar es gratis. Cobramos solo cuando recibes una reserva, con
                la comisión más baja del mercado y pagos en 24 horas.
              </p>

              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 transition-all hover:shadow-lg hover:shadow-orange-500/30 group">
                Comenzar ahora
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Columna derecha: estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5"
                >
                  <p className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}