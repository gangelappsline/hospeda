import { useEffect, useRef } from 'react'

/**
 * Cierra un popover al hacer clic fuera del contenedor o al presionar Escape.
 * Devuelve la ref que debe colocarse en el contenedor que incluye tanto al
 * disparador como al panel.
 */
export function useDismissable(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const node = containerRef.current
      if (node && !node.contains(event.target as Node)) {
        onCloseRef.current()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return containerRef
}

/** Bloquea el scroll del body (modales, lightbox, hojas inferiores). */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [locked])
}
