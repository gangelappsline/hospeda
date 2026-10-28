import { Images, Maximize2 } from 'lucide-react'
import FavoriteButton, {
  type FavoriteStaySummary,
} from '@/components/ui/FavoriteButton'
import type { LodgingPhoto } from '@/types/public'

interface Props {
  photos: LodgingPhoto[]
  stay: FavoriteStaySummary
  onOpen: (index: number) => void
}

export default function PhotoGallery({ photos, stay, onOpen }: Props) {
  if (photos.length === 0) {
    return (
      <div className="h-[280px] sm:h-[420px] rounded-2xl bg-cool-steel-100 flex items-center justify-center text-sm text-cool-steel-500">
        Este alojamiento aún no tiene fotos
      </div>
    )
  }

  const cover = photos[0]
  const thumbs = photos.slice(1, 5)

  return (
    <div className="relative">
      <div className="relative grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2 rounded-2xl overflow-hidden h-[260px] sm:h-[420px]">
        {/* Imagen principal */}
        <button
          type="button"
          onClick={() => onOpen(0)}
          aria-label="Ver foto de portada en tamaño completo"
          className="group relative col-span-2 row-span-2 bg-cool-steel-100 overflow-hidden cursor-zoom-in"
        >
          <img
            src={cover.photo || cover.thumbnail}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute inset-0 bg-cool-steel-950/0 transition-colors group-hover:bg-cool-steel-950/10" />
          <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-cool-steel-800 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 size={13} />
            Ver en tamaño completo
          </span>
        </button>

        {/* Miniaturas */}
        {Array.from({ length: 4 }).map((_, index) => {
          const photo = thumbs[index]
          if (!photo) {
            return (
              <div
                key={`empty-${index}`}
                className="hidden sm:block bg-cool-steel-100/70"
              />
            )
          }

          return (
            <button
              key={photo.id ?? index}
              type="button"
              onClick={() => onOpen(index + 1)}
              aria-label={`Ver foto ${index + 2} de ${photos.length}`}
              className={`group relative bg-cool-steel-100 overflow-hidden cursor-zoom-in ${
                index > 0 ? 'hidden sm:block' : ''
              }`}
            >
              <img
                src={photo.thumbnail || photo.photo}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-0 bg-cool-steel-950/0 transition-colors group-hover:bg-cool-steel-950/10" />
            </button>
          )
        })}
      </div>

      {/* Favorito */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          stay={stay}
          variant="overlay"
          size="md"
          savedLabel="Guardado"
        />
      </div>

      {/* Ver todas */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-xl border border-cool-steel-900/10 bg-white px-3.5 py-2 text-xs font-semibold text-cool-steel-900 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          <Images size={15} />
          Ver las {photos.length} fotos
        </button>
      )}
    </div>
  )
}
