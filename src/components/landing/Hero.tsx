import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MapPin, Calendar, Users, Search, TrendingUp, ChevronDown } from 'lucide-react'
import DateRangeCalendar, {
  type DateRange,
} from '@/components/booking/DateRangeCalendar'
import { useDismissable } from '@/hooks/useUiHelpers'
import { formatDayMonth, toISODate } from '@/utils/dates'

export default function Hero() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null })
  const [guests, setGuests] = useState('')
  const [datesOpen, setDatesOpen] = useState(false)
  const datesRef = useDismissable(datesOpen, () => setDatesOpen(false))

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (range.checkIn) params.set('check_in', toISODate(range.checkIn))
    if (range.checkOut) params.set('check_out', toISODate(range.checkOut))
    if (guests && Number(guests) > 0) params.set('guests', guests)
    const qs = params.toString()
    navigate(`/alojamientos${qs ? `?${qs}` : ''}`)
  }

  return (
    <section className="relative min-h-[680px] flex items-center justify-center">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
          alt="Hospedaje de lujo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cool-steel-950/50 via-cool-steel-950/30 to-cool-steel-950/60" />
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
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-1 max-w-3xl mx-auto"
        >
          {/* Destino */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cool-steel-50 transition-colors">
            <MapPin size={18} className="text-vivid-tangerine-500 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-cool-steel-700">Destino</p>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="¿A dónde vas?"
                className="w-full text-sm text-cool-steel-900 placeholder-cool-steel-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="hidden md:block w-px bg-cool-steel-200 my-2" />

          {/* Fechas */}
          <div ref={datesRef} className="relative flex-1">
            <button
              type="button"
              onClick={() => setDatesOpen((open) => !open)}
              aria-expanded={datesOpen}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                datesOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
              }`}
            >
              <Calendar size={18} className="text-vivid-tangerine-500 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-cool-steel-700">
                  Fechas
                </span>
                <span
                  className={`block truncate text-sm ${
                    range.checkIn
                      ? 'text-cool-steel-900 font-medium'
                      : 'text-cool-steel-400'
                  }`}
                >
                  {range.checkIn
                    ? `${formatDayMonth(range.checkIn)} → ${
                        range.checkOut
                          ? formatDayMonth(range.checkOut)
                          : 'Salida'
                      }`
                    : 'Llegada y salida'}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-cool-steel-400 transition-transform ${
                  datesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {datesOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-[640px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-cool-steel-200 bg-white p-4 text-left shadow-2xl shadow-cool-steel-950/25">
                <DateRangeCalendar
                  value={range}
                  onChange={setRange}
                  numberOfMonths={2}
                  compact
                />
                <button
                  type="button"
                  onClick={() => setDatesOpen(false)}
                  className="mt-3 w-full rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800 cursor-pointer"
                >
                  Listo
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-cool-steel-200 my-2" />

          {/* Huéspedes */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cool-steel-50 transition-colors">
            <Users size={18} className="text-vivid-tangerine-500 shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-cool-steel-700">Huéspedes</p>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="¿Cuántos viajan?"
                className="w-full text-sm text-cool-steel-900 placeholder-cool-steel-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Botón buscar */}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-all hover:shadow-lg hover:shadow-vivid-tangerine-500/30 shrink-0 cursor-pointer"
          >
            <Search size={16} />
            Buscar
          </button>
        </motion.form>
      </div>
    </section>
  )
}
