import { motion } from 'motion/react'
import { ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Reservas protegidas',
    description:
      'Cada pago está resguardado hasta 24 horas después del check-in. Si el lugar no coincide, te devolvemos el dinero.',
  },
  {
    icon: BadgeCheck,
    title: 'Anfitriones verificados',
    description:
      'Validamos identidad, escrituras y calidad del inmueble antes de publicar cualquier propiedad.',
  },
  {
    icon: Sparkles,
    title: 'Precios sin sorpresas',
    description:
      'Mostramos el total con impuestos y limpieza desde el primer momento. Sin cargos ocultos al final.',
  },
]

export default function Features() {
  return (
    <section id="por-que" className="bg-parchment-100/60 py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-cool-steel-900 mb-3">
            Lo que hacemos diferente
          </h2>
          <p className="text-base text-cool-steel-500 leading-relaxed">
            Tomamos lo mejor del hospedaje entre particulares y arreglamos lo que
            siempre incomodó a viajeros y anfitriones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-cool-steel-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-vivid-tangerine-500" />
                </div>
                <h3 className="text-base font-semibold text-cool-steel-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-cool-steel-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}