import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
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
          zoom: 14,
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
      <div className="relative w-full h-72 rounded-xl overflow-hidden bg-pacific-blue-100 mb-4">
        <div className="absolute inset-0 flex items-center justify-center text-pacific-blue-700 text-sm font-medium px-4 text-center">
          <MapPin size={20} className="mr-2 shrink-0" />
          <span>{address?.formatted_address ?? 'Ubicación aproximada'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden bg-pacific-blue-100 border border-cool-steel-200 mb-4">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
