import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Star,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Wifi,
  Waves,
  Car,
  UtensilsCrossed,
  KeyRound,
  CalendarCheck,
  CalendarX,
  ShieldCheck,
  Award,
  MapPin,
  BadgeCheck,
  Sparkles,
  Compass,
} from 'lucide-react'
import { getLodgingBySlug } from '@/api/public'
import type { LodgingAmenity, LodgingDetail as LodgingDetailType } from '@/types/public'
import Skeleton from '@/components/ui/Skeleton'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { Home as HomeIcon } from 'lucide-react'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export default function LodgingDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lodging', slug],
    queryFn: () => getLodgingBySlug(slug!),
    enabled: !!slug,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })

  // ---------- Loading ----------
  if (isLoading) return <LodgingDetailSkeleton />

  // ---------- Error ----------
  if (isError || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-cool-steel-500 mb-4">No pudimos cargar este alojamiento.</p>
        <Link
          to="/"
          className="text-sm font-medium text-vivid-tangerine-500 hover:text-vivid-tangerine-600"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  const cover = data.photos[0]?.photo ?? data.photos[0]?.thumbnail
  const gallery = data.photos.slice(1, 5)
  const visibleAmenities = showAllAmenities
    ? data.amenities
    : data.amenities.slice(0, 6)
  const description =
    data.description.length > 400 && !showFullDescription
      ? data.description.slice(0, 400) + '…'
      : data.description

  return (
    <div className="min-h-screen bg-surface-warm">
          <LandingNavbar />
    <div className="bg-surface-warm pt-20">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ---------- Título + meta ---------- */}
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-cool-steel-900 mb-2">
            {data.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cool-steel-700">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-cool-steel-900 text-cool-steel-900" />
              <span className="font-medium">{data.rating.toFixed(2)}</span>
              <span className="text-cool-steel-500">·</span>
              <span className="underline">{data.reviews} reseñas</span>
            </span>
            {data.is_superhost && (
              <>
                <span className="text-cool-steel-400">·</span>
                <span className="flex items-center gap-1">
                  <Award size={14} className="text-cool-steel-900" />
                  <span className="underline">Superanfitrión</span>
                </span>
              </>
            )}
            {data.address && (
              <>
                <span className="text-cool-steel-400">·</span>
                <span className="underline">
                  {data.address.city}, {data.address.state}, {data.address.country}
                </span>
              </>
            )}
          </div>
        </header>

        {/* ---------- Galería ---------- */}
        <Gallery
          cover={cover}
          gallery={gallery}
          totalPhotos={data.photos.length}
          title={data.title}
        />

        {/* ---------- Layout 2 columnas ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 mt-8">
          {/* ============ COLUMNA IZQUIERDA ============ */}
          <div className="space-y-8">
            {/* --- Encabezado del tipo + specs --- */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-cool-steel-200">
              <div>
                <h2 className="text-xl font-semibold text-cool-steel-900">
                  {data.type.name} entero en {data.address?.city ?? 'ubicación desconocida'}
                </h2>
                <p className="text-sm text-cool-steel-600 mt-1">
                  {data.guests} huéspedes · {data.bedrooms} recámaras ·{' '}
                  {data.beds} camas · {data.bathrooms} baño{data.bathrooms !== 1 ? 's' : ''}
                </p>
              </div>
              {data.owner.photo && (
                <img
                  src={data.owner.photo}
                  alt={data.owner.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              )}
            </div>

            {/* --- Badges destacados --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-cool-steel-200">
              <Badge
                icon={<KeyRound size={20} />}
                title="Llegada autónoma"
                subtitle="Accede sin llaves con cerradura inteligente"
              />
              <Badge
                icon={<Sparkles size={20} />}
                title="Estancia cómoda"
                subtitle="Huéspedes recientes calificaron con 5 estrellas"
              />
              <Badge
                icon={<CalendarX size={20} />}
                title="Cancelación flexible"
                subtitle="Reembolso total hasta 24 h antes"
              />
            </div>

            {/* --- Descripción --- */}
            <div className="pb-6 border-b border-cool-steel-200">
              <p className="text-cool-steel-700 whitespace-pre-line leading-relaxed">
                {description}
              </p>
              {data.description.length > 400 && (
                <button
                  onClick={() => setShowFullDescription((v) => !v)}
                  className="mt-3 text-sm font-semibold text-cool-steel-900 underline hover:text-cool-steel-700"
                >
                  {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
                </button>
              )}
            </div>

            {/* --- Amenidades --- */}
            {data.amenities.length > 0 && (
              <div className="pb-6 border-b border-cool-steel-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-cool-steel-900">
                    Lo que ofrece este lugar
                  </h3>
                  {data.amenities.length > 6 && (
                    <button
                      onClick={() => setShowAllAmenities((v) => !v)}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-cool-steel-100 hover:bg-cool-steel-200 text-cool-steel-800 transition-colors"
                    >
                      {showAllAmenities
                        ? 'Ver menos'
                        : `${data.amenities.length} amenidades`}
                    </button>
                  )}
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {visibleAmenities.map((amenity) => (
                    <AmenityRow key={amenity.id} amenity={amenity} />
                  ))}
                </ul>
                {data.amenities.length > 6 && (
                  <button
                    onClick={() => setShowAllAmenities((v) => !v)}
                    className="mt-5 px-4 py-2.5 rounded-lg border border-cool-steel-300 text-sm font-medium hover:bg-cool-steel-50 transition-colors"
                  >
                    {showAllAmenities
                      ? 'Ver menos amenidades'
                      : `Ver las ${data.amenities.length} amenidades`}
                  </button>
                )}
              </div>
            )}

            {/* --- Calendario --- */}
            <div className="pb-6 border-b border-cool-steel-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-cool-steel-900">
                    Disponibilidad en {data.address?.city ?? 'el alojamiento'}
                  </h3>
                  <p className="text-sm text-cool-steel-500 mt-1">
                    Estancia mínima: 1 noche
                  </p>
                </div>
                <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-cool-steel-100 hover:bg-cool-steel-200 text-cool-steel-800 transition-colors">
                  Selecciona tu fecha
                </button>
              </div>
              <AvailabilityCalendar />
            </div>

            {/* --- Rating + reviews --- */}
            <div className="pb-6 border-b border-cool-steel-200">
              <div className="flex items-center gap-3 mb-6">
                <Star size={22} className="fill-cool-steel-900 text-cool-steel-900" />
                <span className="text-2xl font-semibold">
                  {data.rating.toFixed(2)}
                </span>
                <span className="text-cool-steel-400">·</span>
                <span className="text-lg font-medium">
                  {data.reviews} reseñas
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-cool-steel-300">
                  <BadgeCheck size={14} className="text-cool-steel-700" />
                  Solo las reseñas verificadas
                </span>
              </div>

              <RatingBreakdown />

              {/* Reseñas */}
              <div className="mt-8 space-y-6">
                {(data.reviews_list ?? []).slice(0, showAllReviews ? undefined : 2).map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
                {!data.reviews_list && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PlaceholderReview name="Mariana" location="Guadalajara" rating={5} />
                    <PlaceholderReview name="Carlos" location="Ciudad de México" rating={5} />
                  </div>
                )}
              </div>

              {data.reviews > 2 && (
                <button
                  onClick={() => setShowAllReviews((v) => !v)}
                  className="mt-6 px-4 py-2.5 rounded-lg border border-cool-steel-300 text-sm font-medium hover:bg-cool-steel-50 transition-colors"
                >
                  {showAllReviews
                    ? 'Mostrar menos reseñas'
                    : `Mostrar las ${data.reviews} reseñas`}
                </button>
              )}
            </div>

            {/* --- Dónde vas a estar --- */}
            <div className="pb-10">
              <h3 className="text-xl font-semibold text-cool-steel-900 mb-1">
                Dónde vas a estar
              </h3>
              <p className="text-sm text-cool-steel-500 mb-4">
                {data.address?.city}, {data.address?.state}
              </p>
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-pacific-blue-100 mb-4">
                {/* Placeholder de mapa: pon aquí un <Map> real (Leaflet / Google Maps) */}
                <div className="absolute inset-0 flex items-center justify-center text-pacific-blue-700 text-sm font-medium">
                  <MapPin size={20} className="mr-2" />
                  {data.address?.formatted_address ?? 'Ubicación aproximada'}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-cool-steel-700">
                <NearbyItem icon={<MapPin size={16} />} label="Playa" value="A 5 min caminando" />
                <NearbyItem icon={<UtensilsCrossed size={16} />} label="Restaurantes" value="A 10 min caminando" />
                <NearbyItem icon={<Car size={16} />} label="Aeropuerto" value="A 25 min en auto" />
              </div>
            </div>

            {/* --- Instrucciones de llegada para huéspedes --- */}
            {data.arrival_instructions && data.arrival_instructions.length > 0 && (
              <div className="pb-10 border-b border-cool-steel-200">
                <h3 className="text-xl font-semibold text-cool-steel-900 mb-1 flex items-center gap-2">
                  <Compass size={22} className="text-vivid-tangerine-500" />
                  Instrucciones de llegada y acceso
                </h3>
                <p className="text-sm text-cool-steel-500 mb-6">
                  Indicaciones paso a paso proporcionadas por el anfitrión para acceder a la propiedad.
                </p>
                <div className="space-y-4">
                  {data.arrival_instructions.map((inst, idx) => (
                    <div
                      key={inst.id ?? idx}
                      className="p-4 rounded-xl border border-cool-steel-200 bg-white flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-pacific-blue-100 text-pacific-blue-800 font-bold text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      {(inst.photo_url || inst.photo) && (
                        <img
                          src={inst.photo_url || (inst.photo as string)}
                          alt={inst.title}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-cool-steel-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-cool-steel-900 mb-1">
                          {inst.title}
                        </h4>
                        <p className="text-sm text-cool-steel-600 whitespace-pre-line leading-relaxed">
                          {inst.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============ COLUMNA DERECHA (BOOKING CARD) ============ */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <BookingCard detail={data} />
          </aside>
        </div>
      </div>
    </div>
    {/* Footer */}
      <footer className="border-t border-cool-steel-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-vivid-tangerine-500 flex items-center justify-center">
              <HomeIcon size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-cool-steel-900">Hospeda</span>
          </div>
          <p className="text-sm text-cool-steel-400">
            © 2026 Hospeda. Hecho en México.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

function Gallery({
  cover,
  gallery,
  totalPhotos,
  title,
}: {
  cover?: string
  gallery: Array<{ id: number; thumbnail: string }>
  totalPhotos: number
  title: string
}) {
  return (
    <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px]">
      {/* Imagen grande: ocupa 2x2 */}
      <div className="col-span-2 row-span-2 bg-cool-steel-100">
        {cover && (
          <img src={cover} alt={title} className="w-full h-full object-cover" />
        )}
      </div>

      {/* 4 miniaturas */}
      {Array.from({ length: 4 }).map((_, i) => {
        const photo = gallery[i]
        return (
          <div key={i} className="bg-cool-steel-100">
            {photo && (
              <img
                src={photo.thumbnail}
                alt={`${title} ${i + 2}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )
      })}

      {/* Botón "Ver todas las fotos" */}
      {totalPhotos > 1 && (
        <button className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-cool-steel-900 text-sm font-medium hover:bg-cool-steel-50 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3h5v5H2zM9 3h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
          </svg>
          Ver las {totalPhotos} fotos
        </button>
      )}
    </div>
  )
}

function Badge({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="w-9 h-9 rounded-lg border border-cool-steel-300 flex items-center justify-center text-cool-steel-700">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-cool-steel-900">{title}</p>
        <p className="text-xs text-cool-steel-500 mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </div>
  )
}

function AmenityRow({ amenity }: { amenity: LodgingAmenity }) {
  // Puedes mapear amenity.icon a un componente lucide según prefieras
  const iconMap: Record<string, React.ReactNode> = {
    Wifi: <Wifi size={20} />,
    'Internet de alta velocidad': <Wifi size={20} />,
    Cocina: <UtensilsCrossed size={20} />,
    Refrigerador: <UtensilsCrossed size={20} />,
    Estacionamiento: <Car size={20} />,
    'Vista al mar': <Waves size={20} />,
  }
  const icon = iconMap[amenity.name] ?? <BadgeCheck size={20} />

  return (
    <li className="flex items-center gap-4">
      <span className="text-cool-steel-700 shrink-0">{icon}</span>
      <span className="text-sm text-cool-steel-700">{amenity.name}</span>
    </li>
  )
}

function AvailabilityCalendar() {
  // Placeholder: aquí conectarás tu librería de calendario (react-day-picker, etc.)
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-xl border border-cool-steel-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button className="p-1.5 rounded-full hover:bg-cool-steel-100">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-cool-steel-900">
          {MONTH_NAMES[month]} {year}
        </p>
        <button className="p-1.5 rounded-full hover:bg-cool-steel-100">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <span key={i} className="text-xs font-medium text-cool-steel-500 py-1">
            {d}
          </span>
        ))}
        {days.map((day, i) => (
          <button
            key={i}
            disabled={day === null}
            className={`aspect-square rounded-full text-sm ${
              day === null
                ? ''
                : 'hover:bg-cool-steel-100 text-cool-steel-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}

function RatingBreakdown() {
  const rows = [
    { label: 'Limpieza', value: 5.0 },
    { label: 'Ubicación', value: 5.0 },
    { label: 'Veracidad', value: 5.0 },
    { label: 'Comunicación', value: 5.0 },
    { label: 'Llegada', value: 5.0 },
    { label: 'Calidad-precio', value: 5.0 },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="text-sm text-cool-steel-700 w-32 shrink-0">{r.label}</span>
          <div className="flex-1 h-1 bg-cool-steel-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-cool-steel-900"
              style={{ width: `${(r.value / 5) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-cool-steel-700 w-8 text-right">
            {r.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
}: {
  review: {
    id: number
    author_name: string
    author_photo: string | null
    author_location?: string
    rating: number
    comment: string
    created_at: string
  }
}) {
  const date = new Date(review.created_at)
  const monthYear = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {review.author_photo ? (
          <img
            src={review.author_photo}
            alt={review.author_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-cool-steel-200" />
        )}
        <div>
          <p className="text-sm font-semibold text-cool-steel-900">
            {review.author_name}
          </p>
          <p className="text-xs text-cool-steel-500">
            {review.author_location ?? ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < Math.round(review.rating)
                ? 'fill-cool-steel-900 text-cool-steel-900'
                : 'fill-cool-steel-300 text-cool-steel-300'
            }
          />
        ))}
        <span className="text-xs text-cool-steel-500 ml-1">· {monthYear}</span>
      </div>
      <p className="text-sm text-cool-steel-700 leading-relaxed">{review.comment}</p>
    </div>
  )
}

function PlaceholderReview({
  name,
  location,
  rating,
}: {
  name: string
  location: string
  rating: number
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-cool-steel-200" />
        <div>
          <p className="text-sm font-semibold text-cool-steel-900">{name}</p>
          <p className="text-xs text-cool-steel-500">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < rating
                ? 'fill-cool-steel-900 text-cool-steel-900'
                : 'fill-cool-steel-300 text-cool-steel-300'
            }
          />
        ))}
      </div>
      <p className="text-sm text-cool-steel-700 leading-relaxed">
        Excelente estancia. El lugar es tal cual se ve en las fotos, muy limpio
        y bien ubicado. La comunicación con el anfitrión fue impecable.
      </p>
    </div>
  )
}

function NearbyItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-cool-steel-500 shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-medium text-cool-steel-900">{label}</p>
        <p className="text-cool-steel-500 text-xs">{value}</p>
      </div>
    </div>
  )
}

function BookingCard({ detail }: { detail: LodgingDetailType }) {
  const [guests, setGuests] = useState(1)
  // Precio total estimado (1 noche, sin impuestos):
  const subtotal = detail.base_price
  const total = subtotal + detail.cleaning_fee + detail.service_fee

  return (
    <div className="rounded-2xl border border-cool-steel-300 shadow-lg p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <span className="text-2xl font-semibold text-cool-steel-900">
            ${detail.base_price.toLocaleString('es-MX')}
          </span>
          <span className="text-cool-steel-500 text-sm ml-1">noche</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Star size={12} className="fill-cool-steel-900 text-cool-steel-900" />
          <span className="font-medium">{detail.rating.toFixed(2)}</span>
          <span className="text-cool-steel-400">·</span>
          <span className="underline text-cool-steel-500">
            {detail.reviews} reseñas
          </span>
        </div>
      </div>

      {/* Caja de fechas + huéspedes */}
      <div className="border border-cool-steel-300 rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-cool-steel-300">
          <button className="p-3 text-left hover:bg-cool-steel-50">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
              Llegada
            </div>
            <div className="text-sm text-cool-steel-400 mt-0.5">Selecciona</div>
          </button>
          <button className="p-3 text-left hover:bg-cool-steel-50">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
              Salida
            </div>
            <div className="text-sm text-cool-steel-400 mt-0.5">Selecciona</div>
          </button>
        </div>
        <div className="border-t border-cool-steel-300 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
              Huéspedes
            </div>
            <div className="text-sm text-cool-steel-800 mt-0.5">
              {guests} huésped{guests !== 1 ? 'es' : ''}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-7 h-7 rounded-full border border-cool-steel-300 flex items-center justify-center hover:bg-cool-steel-50"
            >
              −
            </button>
            <button
              onClick={() =>
                setGuests((g) => Math.min(detail.guests, g + 1))
              }
              className="w-7 h-7 rounded-full border border-cool-steel-300 flex items-center justify-center hover:bg-cool-steel-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-vivid-tangerine-500 to-vivid-tangerine-600 text-white font-semibold hover:opacity-90 transition-opacity mb-4">
        Reservar ahora
      </button>

      <p className="text-center text-xs text-cool-steel-500 mb-5">
        No se te cobrará nada todavía
      </p>

      {/* Desglose */}
      <div className="space-y-2 text-sm text-cool-steel-700 pt-4 border-t border-cool-steel-200">
        <div className="flex justify-between">
          <span className="underline">
            ${detail.base_price.toLocaleString('es-MX')} × 1 noche
          </span>
          <span>${subtotal.toLocaleString('es-MX')}</span>
        </div>
        {detail.cleaning_fee > 0 && (
          <div className="flex justify-between">
            <span className="underline">Tarifa de limpieza</span>
            <span>${detail.cleaning_fee.toLocaleString('es-MX')}</span>
          </div>
        )}
        {detail.service_fee > 0 && (
          <div className="flex justify-between">
            <span className="underline">Tarifa de servicio</span>
            <span>${detail.service_fee.toLocaleString('es-MX')}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 mt-2 border-t border-cool-steel-200 font-semibold text-cool-steel-900 text-base">
          <span>Total</span>
          <span>${total.toLocaleString('es-MX')}</span>
        </div>
      </div>

      {/* Badges inferiores */}
      <div className="mt-5 space-y-2 text-xs text-cool-steel-600">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-pacific-blue-600 shrink-0" />
          <span>Garantía de protección de pago</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarCheck size={14} className="text-cool-steel-500 shrink-0" />
          <span>Política de cancelación flexible</span>
        </div>
      </div>

      <button className="mt-5 w-full flex items-center justify-between px-4 py-3 rounded-lg border border-cool-steel-300 hover:bg-cool-steel-50 text-sm font-medium">
        <span className="flex items-center gap-2">
          <Heart size={16} />
          Guardar
        </span>
        <ChevronDown size={14} className="text-cool-steel-500" />
      </button>
    </div>
  )
}

function LodgingDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-2/3 mb-4" />
      <Skeleton className="h-4 w-1/3 mb-6" />
      <Skeleton className="h-[420px] w-full rounded-2xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}