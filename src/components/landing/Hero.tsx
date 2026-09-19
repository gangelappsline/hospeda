import { motion } from 'motion/react'
import { MapPin, Calendar, Users, Search, TrendingUp } from 'lucide-react'

export default function Hero() {
  const scrollToStays = () => {
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[680px] flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
          alt="Hospedaje de lujo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-28 pb-16 text-center">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-6"
        >
          <TrendingUp size={13} />
          Más de 12,000 viajeros hospedados este mes
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5 tracking-tight"
        >
          Encuentra tu próximo lugar favorito
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Estancias verificadas, precios transparentes y anfitriones de confianza
          en todo México. Así debería sentirse viajar.
        </motion.p>

        {/* Buscador */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-1 max-w-3xl mx-auto"
        >
          {/* Destino */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <MapPin size={18} className="text-orange-500 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-gray-700">Destino</p>
              <input
                type="text"
                placeholder="¿A dónde vas?"
                className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="hidden md:block w-px bg-gray-200 my-2" />

          {/* Fechas */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Calendar size={18} className="text-orange-500 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-gray-700">Fechas</p>
              <button className="text-sm text-gray-400 text-left">
                Llegada — Salida
              </button>
            </div>
          </div>

          <div className="hidden md:block w-px bg-gray-200 my-2" />

          {/* Huéspedes */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Users size={18} className="text-orange-500 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-gray-700">Huéspedes</p>
              <button className="text-sm text-gray-400 text-left">
                Agrega huéspedes
              </button>
            </div>
          </div>

          {/* Botón buscar */}
          <button
            onClick={scrollToStays}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 transition-all hover:shadow-lg hover:shadow-orange-500/30 shrink-0"
          >
            <Search size={16} />
            Buscar
          </button>
        </motion.div>
      </div>
    </section>
  )
}