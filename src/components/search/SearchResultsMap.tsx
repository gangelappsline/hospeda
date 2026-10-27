import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Star, X, Maximize2, ArrowUpRight } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'
import { resolveStayCoordinates } from '@/utils/exploreFallback'

interface Props {
  lodgings: FeaturedStay[]
  highlightedId?: number | null
  selectedStayId?: number | null
  onSelectStay?: (stayId: number | null) => void
}

const MEXICO_CENTER: [number, number] = [21.0, -101.0]

export default function SearchResultsMap({
  lodgings,
  highlightedId = null,
  selectedStayId = null,
  onSelectStay,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markersByIdRef = useRef<Map<number, L.Marker>>(new Map())

  const staysWithCoords = useMemo(
    () =>
      lodgings.map((stay) => ({
        stay,
        coords: resolveStayCoordinates(stay),
      })),
    [lodgings]
  )

  const selectedStay = useMemo(
    () => lodgings.find((s) => s.id === selectedStayId) ?? null,
    [lodgings, selectedStayId]
  )

  // Inicializar instancia de Leaflet una sola vez
  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, {
      center: MEXICO_CENTER,
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    })

    L.control.zoom({ position: 'topright' }).addTo(map)

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map)

    const layer = L.layerGroup().addTo(map)
    const markersById = markersByIdRef.current
    mapRef.current = map
    markersLayerRef.current = layer

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(el)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
      markersById.clear()
    }
  }, [])

  // Sincronizar markers cuando cambian los alojamientos encontrados
  useEffect(() => {
    const map = mapRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    markersByIdRef.current.clear()

    if (staysWithCoords.length === 0) {
      map.setView(MEXICO_CENTER, 5)
      return
    }

    const bounds = L.latLngBounds([])

    staysWithCoords.forEach(({ stay, coords }) => {
      bounds.extend(coords)

      const marker = L.marker(coords, {
        icon: createPricePinIcon(stay.price, false),
      })

      marker.on('click', () => {
        onSelectStay?.(stay.id)
        map.panTo(coords, { animate: true })
      })

      marker.addTo(layer)
      markersByIdRef.current.set(stay.id, marker)
    })

    if (staysWithCoords.length === 1) {
      map.setView(staysWithCoords[0].coords, 13)
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 13 })
    }
  }, [staysWithCoords, onSelectStay])

  // Actualizar apariencia de markers activos/resaltados sin reconstruir el mapa
  useEffect(() => {
    staysWithCoords.forEach(({ stay, coords }) => {
      const marker = markersByIdRef.current.get(stay.id)
      if (!marker) return
      const isActive =
        stay.id === highlightedId || stay.id === selectedStayId
      marker.setIcon(createPricePinIcon(stay.price, isActive))
      marker.setZIndexOffset(isActive ? 1000 : 0)

      if (stay.id === selectedStayId && mapRef.current) {
        mapRef.current.panTo(coords, { animate: true })
      }
    })
  }, [staysWithCoords, highlightedId, selectedStayId])

  const fitAllResults = () => {
    const map = mapRef.current
    if (!map || staysWithCoords.length === 0) return
    if (staysWithCoords.length === 1) {
      map.setView(staysWithCoords[0].coords, 13, { animate: true })
      return
    }
    const bounds = L.latLngBounds(staysWithCoords.map((item) => item.coords))
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 13, animate: true })
    }
  }

  return (
    <div className="relative w-full h-full bg-pacific-blue-50 overflow-hidden isolate">
      {/* Fondo decorativo de respaldo con tokens del tema */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, var(--color-pacific-blue-200) 0%, transparent 40%), radial-gradient(circle at 70% 60%, var(--color-vivid-tangerine-200) 0%, transparent 40%), radial-gradient(circle at 50% 80%, var(--color-parchment-200) 0%, transparent 40%)',
        }}
      />

      {/* Lienzo del mapa interactivo */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Controles superiores */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-cool-steel-200 text-xs font-semibold text-cool-steel-800 shadow-sm">
          <MapPin size={13} className="text-vivid-tangerine-500" />
          {lodgings.length}{' '}
          {lodgings.length === 1 ? 'alojamiento' : 'alojamientos'}
        </span>

        {lodgings.length > 0 && (
          <button
            type="button"
            onClick={fitAllResults}
            title="Ajustar mapa a los resultados"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur border border-cool-steel-200 text-xs font-medium text-cool-steel-700 hover:text-cool-steel-900 hover:bg-white shadow-sm transition-colors cursor-pointer"
          >
            <Maximize2 size={12} />
            <span>Ver todos</span>
          </button>
        )}
      </div>

      {/* Estado vacío sobre el mapa */}
      {lodgings.length === 0 && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none p-4">
          <div className="px-4 py-3 rounded-xl bg-white/95 backdrop-blur border border-cool-steel-200 shadow-sm text-center">
            <p className="text-xs font-medium text-cool-steel-600">
              Sin alojamientos para mostrar en el mapa
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta flotante del marker seleccionado */}
      {selectedStay && (
        <div className="absolute bottom-3 left-3 right-3 z-[500]">
          <div className="rounded-2xl bg-white border border-cool-steel-200 shadow-xl p-2.5 flex items-center gap-3">
            <Link
              to={`/alojamiento/${selectedStay.slug}`}
              className="w-20 h-20 rounded-xl overflow-hidden bg-cool-steel-100 shrink-0 block"
            >
              {(selectedStay.photos?.[0]?.thumbnail ??
                selectedStay.photos?.[0]?.photo) && (
                <img
                  src={
                    selectedStay.photos[0].thumbnail ??
                    selectedStay.photos[0].photo
                  }
                  alt={selectedStay.title}
                  className="w-full h-full object-cover"
                />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-[11px] font-medium text-cool-steel-500 truncate">
                  {[selectedStay.address?.city, selectedStay.address?.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectStay?.(null)}
                  aria-label="Cerrar vista previa"
                  className="p-0.5 rounded-full text-cool-steel-400 hover:text-cool-steel-800 hover:bg-cool-steel-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <Link
                to={`/alojamiento/${selectedStay.slug}`}
                className="text-xs font-semibold text-cool-steel-900 hover:text-vivid-tangerine-600 line-clamp-1 mt-0.5 block"
              >
                {selectedStay.title}
              </Link>

              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cool-steel-900">
                    ${selectedStay.price.toLocaleString('es-MX')}
                    <span className="font-normal text-cool-steel-500">
                      {' '}
                      / noche
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-cool-steel-700">
                    <Star
                      size={10}
                      className="fill-cool-steel-900 text-cool-steel-900"
                    />
                    {selectedStay.rating.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/alojamiento/${selectedStay.slug}`}
                  className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-[11px] font-semibold transition-colors shrink-0"
                >
                  <span>Ver</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function createPricePinIcon(price: number, isActive: boolean): L.DivIcon {
  const formatted = `$${price.toLocaleString('es-MX')}`
  const pillClasses = isActive
    ? 'bg-vivid-tangerine-500 text-white border-vivid-tangerine-600 scale-110 shadow-lg'
    : 'bg-white text-cool-steel-900 border-cool-steel-900 hover:bg-cool-steel-900 hover:text-white shadow-md'

  return L.divIcon({
    className: 'hospeda-price-pin',
    html: `<div class="inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap transition-transform cursor-pointer ${pillClasses}">${formatted}</div>`,
    iconSize: [76, 30],
    iconAnchor: [38, 15],
  })
}
