import { Link } from 'react-router-dom'
import { Heart, Home as HomeIcon, Search } from 'lucide-react'
import LandingNavbar from '@/components/landing/LandingNavbar'
import FavoritesList from '@/components/favorites/FavoritesList'
import { useFavorites } from '@/hooks/useFavorites'

/** Página pública de favoritos para cualquier usuario con sesión iniciada. */
export default function Favorites() {
  const { favorites } = useFavorites()

  return (
    <div className="min-h-screen bg-surface-warm">
      <LandingNavbar />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-vivid-tangerine-600">
              <Heart size={12} className="fill-vivid-tangerine-500 text-vivid-tangerine-500" />
              Tu lista de deseos
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-cool-steel-900">
              Mis favoritos
            </h1>
            <p className="mt-1 text-sm text-cool-steel-500">
              {favorites.length > 0
                ? `${favorites.length} alojamiento${
                    favorites.length === 1 ? '' : 's'
                  } guardado${favorites.length === 1 ? '' : 's'} para tu próximo viaje`
                : 'Guarda los alojamientos que te inspiren y compáralos aquí'}
            </p>
          </div>

          <Link
            to="/alojamientos"
            className="inline-flex items-center gap-2 rounded-xl bg-vivid-tangerine-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-vivid-tangerine-500/20 transition-colors hover:bg-vivid-tangerine-600"
          >
            <Search size={15} />
            Explorar alojamientos
          </Link>
        </div>

        <FavoritesList />

        <footer className="mt-16 border-t border-cool-steel-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-vivid-tangerine-500">
                <HomeIcon size={14} className="text-white" />
              </div>
              <span className="text-base font-bold text-cool-steel-900">Hospeda</span>
            </div>
            <p className="text-sm text-cool-steel-400">
              © 2026 Hospeda. Hecho en México.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
