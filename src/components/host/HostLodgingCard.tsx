import { Link } from 'react-router-dom'
import {
  MoreVertical,
  Star,
  MapPin,
  Users,
  BedDouble,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Compass,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { HostLodging } from '@/types/hostLodgings'
import { useDeleteHostLodging, useToggleHostLodgingStatus } from '@/hooks/useHostLodgings'

interface Props {
  lodging: HostLodging
}

export default function HostLodgingCard({ lodging }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const del = useDeleteHostLodging()
  const toggle = useToggleHostLodgingStatus()

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleDelete = () => {
    setMenuOpen(false)
    if (window.confirm(`¿Eliminar "${lodging.title}"? Esta acción no se puede deshacer.`)) {
      del.mutate(lodging.id)
    }
  }

  const handleToggle = () => {
    setMenuOpen(false)
    toggle.mutate({
      id: lodging.id,
      status: lodging.status === 'published' ? 'draft' : 'published',
    })
  }

  const isPublished = lodging.status === 'published'

  return (
    <article className="bg-white rounded-xl border border-cool-steel-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Imagen + estado */}
      <div className="relative aspect-[4/3] bg-cool-steel-100">
        {lodging.cover ? (
          <img
            src={lodging.cover}
            alt={lodging.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cool-steel-300 text-sm">
            Sin foto
          </div>
        )}

        {/* Badge de estado */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
            isPublished
              ? 'bg-pacific-blue-100 text-pacific-blue-800'
              : 'bg-tangerine-dream-100 text-tangerine-dream-800'
          }`}
        >
          {isPublished ? 'Publicado' : 'Borrador'}
        </span>

        {/* Menú de acciones */}
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm"
            aria-label="Acciones"
          >
            <MoreVertical size={16} className="text-cool-steel-700" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-cool-steel-200 py-1 z-20">
              <Link
                to={`/host/lodgings/${lodging.id}/edit`}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cool-steel-700 hover:bg-cool-steel-50"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil size={14} />
                Editar
              </Link>

              <Link
                to={`/host/lodgings/${lodging.id}/edit?step=6`}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-pacific-blue-700 hover:bg-pacific-blue-50"
                onClick={() => setMenuOpen(false)}
              >
                <Compass size={14} />
                Instrucciones de llegada
              </Link>

              <button
                onClick={handleToggle}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cool-steel-700 hover:bg-cool-steel-50"
              >
                {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                {isPublished ? 'Despublicar' : 'Publicar'}
              </button>

              {lodging.slug && (
                <a
                  href={`/alojamiento/${lodging.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cool-steel-700 hover:bg-cool-steel-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink size={14} />
                  Ver en el sitio
                </a>
              )}

              <div className="border-t border-cool-steel-100 my-1" />

              <button
                onClick={handleDelete}
                disabled={del.isPending}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-vivid-tangerine-600 hover:bg-vivid-tangerine-50 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-cool-steel-900 truncate">
            {lodging.title}
          </h3>
          {lodging.reviews > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="fill-cool-steel-900 text-cool-steel-900" />
              <span className="text-xs font-medium text-cool-steel-900">
                {lodging.rating.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {lodging.address && (
          <p className="text-xs text-cool-steel-500 flex items-center gap-1 truncate mb-2">
            <MapPin size={11} className="shrink-0" />
            {lodging.address.formatted_address}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-cool-steel-500 mb-3">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {lodging.guests}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble size={11} />
            {lodging.bedrooms} rec
          </span>
          <span className="ml-auto text-cool-steel-700 font-medium">
            ${lodging.base_price.toLocaleString('es-MX')}/noche
          </span>
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center gap-2 pt-3 border-t border-cool-steel-100">
          <Link
            to={`/host/lodgings/${lodging.id}/edit`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-cool-steel-100 hover:bg-cool-steel-200 text-cool-steel-900 transition-colors"
          >
            Editar
          </Link>
          <Link
            to={`/host/lodgings/${lodging.id}`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-cool-steel-300 hover:bg-cool-steel-50 text-cool-steel-700 transition-colors"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  )
}