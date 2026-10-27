import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, X, Maximize2, ArrowUpRight, KeyRound } from 'lucide-react'
import type { FeaturedStay } from '@/types/public'
import { resolveStayCoordinates } from '@/utils/exploreFallback'
import {
  hasGoogleMapsApiKey,
  loadGoogleMapsApi,
  onGoogleMapsAuthFailure,
} from '@/utils/googleMapsLoader'

interface Props {
  lodgings: FeaturedStay[]
  highlightedId?: number | null
  selectedStayId?: number | null
  onSelectStay?: (stayId: number | null) => void
}

interface PriceOverlayHandle {
  setActive: (active: boolean) => void
  remove: () => void
}

const MEXICO_CENTER: google.maps.LatLngLiteral = { lat: 21.0, lng: -101.0 }

export default function SearchResultsMap({
  lodgings,
  highlightedId = null,
  selectedStayId = null,
  onSelectStay,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const gmapsRef = useRef<typeof google.maps | null>(null)
  const overlaysByIdRef = useRef<Map<number, PriceOverlayHandle>>(new Map())

  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const apiKeyPresent = hasGoogleMapsApiKey()
  const useFallbackMap = !apiKeyPresent || Boolean(mapError)

  const staysWithCoords = useMemo(
    () =>
      lodgings.map((stay) => {
        const [lat, lng] = resolveStayCoordinates(stay)
        return {
          stay,
          coords: { lat, lng },
        }
      }),
    [lodgings]
  )

  const selectedStay = useMemo(
    () => lodgings.find((s) => s.id === selectedStayId) ?? null,
    [lodgings, selectedStayId]
  )

  // Posiciones normalizadas (15%–85%) para el modo visual de respaldo cuando aún no hay API key
  const fallbackPositions = useMemo(() => {
    if (staysWithCoords.length === 0) return []
    if (staysWithCoords.length === 1) {
      return [{ stay: staysWithCoords[0].stay, top: '50%', left: '50%' }]
    }

    const lats = staysWithCoords.map((s) => s.coords.lat)
    const lngs = staysWithCoords.map((s) => s.coords.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const latSpan = Math.max(maxLat - minLat, 0.02)
    const lngSpan = Math.max(maxLng - minLng, 0.02)

    return staysWithCoords.map(({ stay, coords }) => {
      const normY = 1 - (coords.lat - minLat) / latSpan
      const normX = (coords.lng - minLng) / lngSpan
      const topPct = 18 + normY * 62
      const leftPct = 16 + normX * 68
      return {
        stay,
        top: `${topPct.toFixed(1)}%`,
        left: `${leftPct.toFixed(1)}%`,
      }
    })
  }, [staysWithCoords])

  // Escuchar fallos de autenticación de Google Maps (ej. API key inválida o dominio restringido)
  useEffect(() => {
    return onGoogleMapsAuthFailure(() => {
      setMapError('Verifica la configuración de tu clave de Google Maps.')
    })
  }, [])

  // Cargar e inicializar Google Maps cuando existe VITE_GOOGLE_MAPS_API_KEY
  useEffect(() => {
    if (!apiKeyPresent || mapError) return

    let cancelled = false
    const overlaysById = overlaysByIdRef.current

    loadGoogleMapsApi()
      .then((gmaps) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        gmapsRef.current = gmaps
        const map = new gmaps.Map(containerRef.current, {
          center: MEXICO_CENTER,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          zoomControl: true,
          zoomControlOptions: {
            position: gmaps.ControlPosition.RIGHT_TOP,
          },
        })

        mapRef.current = map
        setMapReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setMapError('No se pudo cargar Google Maps.')
        }
      })

    return () => {
      cancelled = true
      overlaysById.forEach((overlay) => overlay.remove())
      overlaysById.clear()
      mapRef.current = null
      gmapsRef.current = null
    }
  }, [apiKeyPresent, mapError])

  // Sincronizar markers sobre Google Maps cuando cambian los alojamientos encontrados
  useEffect(() => {
    const map = mapRef.current
    const gmaps = gmapsRef.current
    if (!mapReady || !map || !gmaps) return

    const overlaysById = overlaysByIdRef.current
    overlaysById.forEach((overlay) => overlay.remove())
    overlaysById.clear()

    if (staysWithCoords.length === 0) {
      map.setCenter(MEXICO_CENTER)
      map.setZoom(5)
      return
    }

    const bounds = new gmaps.LatLngBounds()

    staysWithCoords.forEach(({ stay, coords }) => {
      bounds.extend(coords)

      const overlay = createPricePinOverlay(
        gmaps,
        map,
        coords,
        Number(stay.price) || 0,
        false,
        () => {
          onSelectStay?.(stay.id)
          map.panTo(coords)
        }
      )

      overlaysById.set(stay.id, overlay)
    })

    if (staysWithCoords.length === 1) {
      map.setCenter(staysWithCoords[0].coords)
      map.setZoom(14)
    } else if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 })
      gmaps.event.addListenerOnce(map, 'idle', () => {
        const currentZoom = map.getZoom()
        if (typeof currentZoom === 'number' && currentZoom > 15) {
          map.setZoom(15)
        }
      })
    }
  }, [mapReady, staysWithCoords, onSelectStay])

  // Actualizar estado activo/resaltado de los markers sin recrear el mapa
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    staysWithCoords.forEach(({ stay, coords }) => {
      const overlay = overlaysByIdRef.current.get(stay.id)
      if (!overlay) return
      const isActive =
        stay.id === highlightedId || stay.id === selectedStayId
      overlay.setActive(isActive)

      if (stay.id === selectedStayId) {
        map.panTo(coords)
      }
    })
  }, [mapReady, staysWithCoords, highlightedId, selectedStayId])

  const fitAllResults = () => {
    const map = mapRef.current
    const gmaps = gmapsRef.current
    if (!map || !gmaps || staysWithCoords.length === 0) return

    if (staysWithCoords.length === 1) {
      map.panTo(staysWithCoords[0].coords)
      map.setZoom(14)
      return
    }

    const bounds = new gmaps.LatLngBounds()
    staysWithCoords.forEach(({ coords }) => bounds.extend(coords))
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 })
    }
  }

  return (
    <div className="relative w-full h-full bg-pacific-blue-50 overflow-hidden isolate">
      {/* Fondo decorativo con tokens del sistema de diseño */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, var(--color-pacific-blue-200) 0%, transparent 40%), radial-gradient(circle at 70% 60%, var(--color-vivid-tangerine-200) 0%, transparent 40%), radial-gradient(circle at 50% 80%, var(--color-parchment-200) 0%, transparent 40%)',
        }}
      />

      {useFallbackMap ? (
        <div className="relative w-full h-full">
          {/* Cuadrícula cartográfica de respaldo */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hospeda-map-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="var(--color-cool-steel-300)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hospeda-map-grid)" />
          </svg>

          {/* Markers interactivos mientras se configura la API key */}
          {fallbackPositions.map(({ stay, top, left }) => {
            const isActive =
              stay.id === highlightedId || stay.id === selectedStayId
            return (
              <button
                key={stay.id}
                type="button"
                onClick={() => onSelectStay?.(stay.id)}
                style={{ top, left, zIndex: isActive ? 30 : 10 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap transition-transform cursor-pointer ${
                  isActive
                    ? 'bg-vivid-tangerine-500 text-white border-vivid-tangerine-600 scale-110 shadow-lg'
                    : 'bg-white text-cool-steel-900 border-cool-steel-900 hover:bg-cool-steel-900 hover:text-white shadow-md'
                }`}
              >
                ${(Number(stay.price) || 0).toLocaleString('es-MX')}
              </button>
            )
          })}

          {!selectedStay && (
            <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-cool-steel-200 text-[11px] font-medium text-cool-steel-600 shadow-sm">
                <KeyRound size={12} className="text-vivid-tangerine-500 shrink-0" />
                {mapError ??
                  'Agrega VITE_GOOGLE_MAPS_API_KEY en .env para activar Google Maps'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full z-0" />
      )}

      {/* Controles superiores */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-cool-steel-200 text-xs font-semibold text-cool-steel-800 shadow-sm">
          <MapPin size={13} className="text-vivid-tangerine-500" />
          {lodgings.length}{' '}
          {lodgings.length === 1 ? 'alojamiento' : 'alojamientos'}
        </span>

        {!useFallbackMap && lodgings.length > 0 && (
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
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
          <div className="px-4 py-3 rounded-xl bg-white/95 backdrop-blur border border-cool-steel-200 shadow-sm text-center">
            <p className="text-xs font-medium text-cool-steel-600">
              Sin alojamientos para mostrar en el mapa
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta flotante del marker seleccionado */}
      {selectedStay && (
        <div className="absolute bottom-3 left-3 right-3 z-40">
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
                    ${(Number(selectedStay.price) || 0).toLocaleString('es-MX')}
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
                    {(Number(selectedStay.rating) || 0).toFixed(2)}
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

function getPinClassName(active: boolean): string {
  const base =
    'absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap transition-transform cursor-pointer select-none'
  return active
    ? `${base} bg-vivid-tangerine-500 text-white border-vivid-tangerine-600 scale-110 shadow-lg`
    : `${base} bg-white text-cool-steel-900 border-cool-steel-900 hover:bg-cool-steel-900 hover:text-white shadow-md`
}

function createPricePinOverlay(
  gmaps: typeof google.maps,
  map: google.maps.Map,
  coords: google.maps.LatLngLiteral,
  price: number,
  initialActive: boolean,
  onClick: () => void
): PriceOverlayHandle {
  class PricePinOverlay extends gmaps.OverlayView {
    private buttonEl: HTMLButtonElement | null = null
    private isActive: boolean = initialActive

    onAdd() {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = `$${price.toLocaleString('es-MX')}`
      btn.className = getPinClassName(this.isActive)
      btn.style.zIndex = this.isActive ? '1000' : '10'
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        onClick()
      })

      this.buttonEl = btn
      const panes = this.getPanes()
      panes?.overlayMouseTarget.appendChild(btn)
    }

    draw() {
      if (!this.buttonEl) return
      const projection = this.getProjection()
      if (!projection) return
      const point = projection.fromLatLngToDivPixel(new gmaps.LatLng(coords))
      if (!point) return
      this.buttonEl.style.left = `${point.x}px`
      this.buttonEl.style.top = `${point.y}px`
    }

    onRemove() {
      if (this.buttonEl?.parentNode) {
        this.buttonEl.parentNode.removeChild(this.buttonEl)
      }
      this.buttonEl = null
    }

    updateActive(active: boolean) {
      this.isActive = active
      if (this.buttonEl) {
        this.buttonEl.className = getPinClassName(active)
        this.buttonEl.style.zIndex = active ? '1000' : '10'
      }
    }
  }

  const instance = new PricePinOverlay()
  instance.setMap(map)

  return {
    setActive: (active: boolean) => instance.updateActive(active),
    remove: () => instance.setMap(null),
  }
}
