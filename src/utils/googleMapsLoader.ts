export const GOOGLE_MAPS_API_KEY = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
).trim()

export function hasGoogleMapsApiKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0
}

declare global {
  interface Window {
    google?: typeof google
    gm_authFailure?: () => void
  }
}

let loaderPromise: Promise<typeof google.maps> | null = null
const authFailureListeners = new Set<() => void>()

export function onGoogleMapsAuthFailure(callback: () => void): () => void {
  authFailureListeners.add(callback)
  return () => {
    authFailureListeners.delete(callback)
  }
}

export function loadGoogleMapsApi(): Promise<typeof google.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps requiere entorno de navegador'))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error('Falta configurar VITE_GOOGLE_MAPS_API_KEY')
    )
  }

  if (loaderPromise) {
    return loaderPromise
  }

  window.gm_authFailure = () => {
    authFailureListeners.forEach((listener) => listener())
  }

  loaderPromise = new Promise<typeof google.maps>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-hospeda-google-maps="true"]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google.maps)
        else reject(new Error('No se pudo inicializar Google Maps'))
      })
      existingScript.addEventListener('error', () => {
        loaderPromise = null
        reject(new Error('Error de red al cargar Google Maps'))
      })
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&v=weekly&language=es&region=MX`
    script.async = true
    script.defer = true
    script.dataset.hospedaGoogleMaps = 'true'

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps)
      } else {
        loaderPromise = null
        reject(new Error('Google Maps no expuso window.google.maps'))
      }
    }

    script.onerror = () => {
      loaderPromise = null
      reject(new Error('No se pudo cargar el script de Google Maps'))
    }

    document.head.appendChild(script)
  })

  return loaderPromise
}
