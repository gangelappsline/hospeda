import { Link } from 'react-router-dom'
import { Heart, Search } from 'lucide-react'
import FavoritesList from '@/components/favorites/FavoritesList'
import { useFavorites } from '@/hooks/useFavorites'

export default function GuestFavorites() {
  const { favorites } = useFavorites()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-cool-steel-900">
            <Heart size={22} className="fill-vivid-tangerine-500 text-vivid-tangerine-500" />
            Mis favoritos
          </h1>
          <p className="mt-1 text-sm text-cool-steel-500">
            {favorites.length > 0
              ? `${favorites.length} alojamiento${
                  favorites.length === 1 ? '' : 's'
                } guardado${favorites.length === 1 ? '' : 's'} en tu cuenta`
              : 'Guarda los alojamientos que te gusten para compararlos después'}
          </p>
        </div>

        <Link
          to="/alojamientos"
          className="inline-flex items-center gap-2 rounded-lg bg-vivid-tangerine-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vivid-tangerine-600"
        >
          <Search size={15} />
          Explorar alojamientos
        </Link>
      </div>

      <FavoritesList />
    </div>
  )
}
