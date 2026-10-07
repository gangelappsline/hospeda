import { MapPin } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'

interface Props {
  lodgings: FeaturedStay[]
}

export default function SearchResultsMap({ lodgings }: Props) {
  // Distribución pseudo-aleatoria sobre un grid de posiciones fijas
  const positions = [
    { top: '20%', left: '30%' },
    { top: '35%', left: '55%' },
    { top: '50%', left: '20%' },
    { top: '60%', left: '70%' },
    { top: '75%', left: '40%' },
    { top: '15%', left: '65%' },
    { top: '80%', left: '75%' },
    { top: '45%', left: '85%' },
  ]

  return (
    <div className="relative w-full h-full bg-sky-50 overflow-hidden">
      {/* Fondo tipo mapa */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, #bae6fd 0%, transparent 40%), radial-gradient(circle at 70% 60%, #a7f3d0 0%, transparent 40%), radial-gradient(circle at 50% 80%, #fef3c7 0%, transparent 40%)',
        }}
      />

      {/* Grid líneas sutiles */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Pines de precio */}
      {lodgings.slice(0, 8).map((stay, i) => {
        const pos = positions[i % positions.length]
        return (
          <button
            key={stay.id}
            style={{ top: pos.top, left: pos.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-white border border-gray-900 text-xs font-semibold text-gray-900 shadow-md hover:bg-gray-900 hover:text-white transition-colors"
          >
            ${Math.round(stay.price / 10) * 10}
          </button>
        )
      })}

      {lodgings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-500">Sin alojamientos para mostrar</p>
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs text-gray-700 shadow-sm">
          <MapPin size={12} />
          {lodgings.length} alojamiento{lodgings.length !== 1 ? 's' : ''} en el mapa
        </span>
      </div>
    </div>
  )
}