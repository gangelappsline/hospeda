import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Minus, Plus, ExternalLink, Lock } from 'lucide-react'
import type { LodgingAddress } from '@/types/public'
import { resolveStayCoordinates } from '@/utils/exploreFallback'
import {
  hasGoogleMapsApiKey,
  loadGoogleMapsApi,
  onGoogleMapsAuthFailure,
} from '@/utils/googleMapsLoader'

interface Props {
  id: number
  title: string
  address: LodgingAddress | null
}

const TILE_SIZE = 256
const DEFAULT_ZOOM = 15
const MIN_ZOOM = 12
const MAX_ZOOM = 18

function latToTileY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  )
}

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * Math.pow(2, zoom)
}

/**
 * Mapa estático de respaldo (sin API key de Google): muestra mosaicos de
 * OpenStreetMap centrados en el alojamiento. No se puede arrastrar; solo
 * permite acercar y alejar con los controles.
 */
function StaticTileMap({
  coords,
  label,
}: {
  coords: { lat: number; lng: number }
  label: string
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const tiles = useMemo(() => {
    const centerX = lngToTileX(coords.lng, zoom)
    const centerY = latToTileY(coords.lat, zoom)
    const baseX = Math.floor(centerX)
    const baseY = Math.floor(centerY)
    const max = Math.pow(2, zoom) - 1

    const list: Array<{ key: string; x: number; y: number; left: number; top: number }> = []
    // Mosaico 5x3 alrededor del centro (cubre el ancho del contenedor).
    for (let row = -1; row <= 1; row += 1) {
      for (let column = -2; column <= 2; column += 1) {
        const tileX = ((baseX + column) % (max + 1) + (max + 1)) % (max + 1)
        const tileY = Math.min(Math.max(baseY + row, 0), max)
        list.push({
          key: `${zoom}-${tileX}-${tileY}`,
          x: tileX,
          y: tileY,
          left: column * TILE_SIZE,
          top: row * TILE_SIZE,
        })
      }
    }
    return list
  }, [coords.lat, coords.lng, zoom])

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-cool-steel-100 border border-cool-steel-200 mb-4">
      {/* Fondo tipo plano (visible si los mosaicos no cargan) */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(22,73,92,.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,73,92,.10) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          backgroundColor: '#dbe7e4',
        }}
      />

      {/* Mosaicos: contenedor centrado y sin interacción de arrastre */}
      <div className="absolute inset-0 overflow-hidden select-none">
        <div className="absolute left-1/2 top-1/2 w-0 h-0">
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
              alt=""
              draggable={false}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden'
              }}
              className="absolute pointer-events-none opacity-95"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: tile.left - TILE_SIZE / 2,
                top: tile.top - TILE_SIZE / 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Marcador central */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-md">
        <span className="w-9 h-9 rounded-full bg-vivid-tangerine-500 border-2 border-white flex items-center justify-center shadow-lg">
          <MapPin size={18} className="text-white" />
        </span>
      </div>
      <span className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vivid-tangerine-500/30 ring-2 ring-vivid-tangerine-500/20" />

      {/* Controles de zoom (única interacción permitida) */}
      <div className="absolute right-3 top-3 flex flex-col rounded-xl bg-white shadow-md border border-cool-steel-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + 1))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Acercar mapa"
          className="w-9 h-9 flex items-center justify-center text-cool-steel-800 transition-colors hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus size={16} />
        </button>
        <span className="h-px bg-cool-steel-200" />
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - 1))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Alejar mapa"
          className="w-9 h-9 flex items-center justify-center text-cool-steel-800 transition-colors hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Etiqueta de dirección */}
      <div className="absolute left-3 top-3 right-16 flex">
        <span className="inline-flex items-start gap-1.5 rounded-lg bg-white/95 backdrop-blur px-2.5 py-1.5 text-[11px] font-medium text-cool-steel-800 shadow-sm border border-cool-steel-200">
          <MapPin size={12} className="mt-0.5 shrink-0 text-vivid-tangerine-500" />
          <span className="line-clamp-2">{label}</span>
        </span>
      </div>

      {/* Pie del mapa */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg border border-cool-steel-200 bg-white/95 px-2 py-1 text-[10px] font-medium text-cool-steel-700 shadow-sm">
          <Lock size={10} />
          Mapa estático
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-cool-steel-200 bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-cool-steel-900 shadow-sm transition-colors hover:bg-white"
        >
          Abrir en Google Maps
          <ExternalLink size={10} />
        </a>
      </div>

      <span className="absolute right-3 top-1/2 -translate-y-14 text-[9px] text-cool-steel-500/80">
        © OpenStreetMap
      </span>
    </div>
  )
}

export default function LodgingLocationMap({ id, title, address }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  const apiKeyPresent = hasGoogleMapsApiKey()
  const useFallback = !apiKeyPresent || failed

  const coords = useMemo(() => {
    const [lat, lng] = resolveStayCoordinates({
      id,
      title,
      slug: '',
      address,
      rating: 5,
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      price: 0,
      photos: [],
      type: { id: 0, name: 'Alojamiento' },
      is_superhost: false,
      latitude: address?.latitude,
      longitude: address?.longitude,
    })
    return { lat, lng }
  }, [id, title, address])

  useEffect(() => {
    return onGoogleMapsAuthFailure(() => {
      setFailed(true)
    })
  }, [])

  useEffect(() => {
    if (!apiKeyPresent || failed) return

    let cancelled = false
    let marker: google.maps.Marker | null = null

    loadGoogleMapsApi()
      .then((gmaps) => {
        if (cancelled || !containerRef.current) return

        const map = new gmaps.Map(containerRef.current, {
          center: coords,
          zoom: 15,
          // ── Mapa estático: sin arrastre ni gestos; solo zoom ──
          draggable: false,
          gestureHandling: 'none',
          scrollwheel: false,
          disableDoubleClickZoom: true,
          keyboardShortcuts: false,
          zoomControl: true,
          zoomControlOptions: {
            position: gmaps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        })

        marker = new gmaps.Marker({
          position: coords,
          map,
          title,
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (marker) {
        marker.setMap(null)
      }
    }
  }, [apiKeyPresent, failed, coords, title])

  if (useFallback) {
    return (
      <StaticTileMap
        coords={coords}
        label={address?.formatted_address ?? 'Ubicación aproximada'}
      />
    )
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-cool-steel-100 border border-cool-steel-200 mb-4">
      <div ref={containerRef} className="w-full h-full" />

      <div className="pointer-events-none absolute left-3 bottom-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-cool-steel-800 shadow-sm">
          <Lock size={10} />
          Mapa estático · solo zoom
        </span>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-cool-steel-900 shadow-sm hover:bg-white"
      >
        Abrir en Google Maps
        <ExternalLink size={10} />
      </a>
    </div>
  )
}
