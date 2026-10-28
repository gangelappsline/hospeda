import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { useLockBodyScroll } from '@/hooks/useUiHelpers'
import type { LodgingPhoto } from '@/types/public'

interface Props {
  photos: LodgingPhoto[]
  open: boolean
  initialIndex?: number
  title?: string
  onClose: () => void
}

export default function PhotoLightbox({
  photos,
  open,
  initialIndex = 0,
  title,
  onClose,
}: Props) {
  useLockBodyScroll(open)

  if (!open || photos.length === 0) return null

  return (
    <LightboxDialog
      // Remonta el visor cuando cambia la foto inicial o se vuelve a abrir.
      key={`${initialIndex}-${photos.length}`}
      photos={photos}
      initialIndex={Math.min(initialIndex, photos.length - 1)}
      title={title}
      onClose={onClose}
    />
  )
}

function LightboxDialog({
  photos,
  initialIndex,
  title,
  onClose,
}: {
  photos: LodgingPhoto[]
  initialIndex: number
  title?: string
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const goNext = useCallback(() => {
    if (photos.length < 2) return
    setIndex((current) => (current + 1) % photos.length)
  }, [photos.length])

  const goPrev = useCallback(() => {
    if (photos.length < 2) return
    setIndex((current) => (current - 1 + photos.length) % photos.length)
  }, [photos.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  // Precarga la siguiente imagen para que el cambio sea instantáneo.
  useEffect(() => {
    if (photos.length < 2) return
    const nextPhoto = photos[(index + 1) % photos.length]
    if (nextPhoto?.photo) {
      const image = new Image()
      image.src = nextPhoto.photo
    }
  }, [index, photos])

  const current = photos[index]
  const src = current.photo || current.thumbnail

  return createPortal(
    <div
      className="fixed inset-0 z-[130] bg-cool-steel-950/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const delta =
          (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current
        if (Math.abs(delta) > 60) {
          if (delta < 0) goNext()
          else goPrev()
        }
        touchStartX.current = null
      }}
    >
      {/* Barra superior */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-white">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Galería
          </p>
          <p className="text-sm font-medium truncate max-w-[70vw]">
            {title ?? 'Fotos del alojamiento'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar galería"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center transition-colors hover:bg-white/20 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-16 pb-2">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <img
          key={index}
          src={src}
          alt={`${title ?? 'Alojamiento'} — foto ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none animate-[photoIn_.28s_ease-out]"
          draggable={false}
        />

        {photos.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Foto siguiente"
            className="absolute right-2 sm:right-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Miniaturas */}
      <div className="relative z-10 px-4 sm:px-6 pb-5 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1.5 justify-start sm:justify-center [scrollbar-width:thin]">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.id ?? photoIndex}
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={`Ver foto ${photoIndex + 1}`}
              aria-current={photoIndex === index}
              className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                photoIndex === index
                  ? 'ring-2 ring-vivid-tangerine-400 opacity-100'
                  : 'opacity-55 hover:opacity-90'
              }`}
            >
              <img
                src={photo.thumbnail || photo.photo}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/50">
          <Maximize2 size={12} />
          Usa las flechas del teclado para navegar · Esc para cerrar
        </p>
      </div>

      <style>{`
        @keyframes photoIn {
          from { opacity: 0; transform: scale(0.985); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}
