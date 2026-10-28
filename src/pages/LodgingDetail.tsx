import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Star,
  Wifi,
  Waves,
  Car,
  UtensilsCrossed,
  KeyRound,
  CalendarX,
  CalendarDays,
  Award,
  MapPin,
  BadgeCheck,
  Sparkles,
  Compass,
  Users,
  ArrowRight,
} from 'lucide-react'
import { getLodgingBySlug } from '@/api/public'
import type { LodgingAmenity } from '@/types/public'
import Skeleton from '@/components/ui/Skeleton'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LodgingLocationMap from '@/components/search/LodgingLocationMap'
import PhotoGallery from '@/components/booking/PhotoGallery'
import PhotoLightbox from '@/components/booking/PhotoLightbox'
import BookingCard from '@/components/booking/BookingCard'
import DateRangeCalendar, { type DateRange } from '@/components/booking/DateRangeCalendar'
import {
  calculateQuote,
  formatMoney,
  resolvePricingRules,
  type Occupancy,
} from '@/utils/pricing'
import {
  formatDayMonth,
  formatNights,
  parseISODate,
} from '@/utils/dates'
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

  // Selección compartida entre el calendario de la página y la tarjeta de reserva.
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null })
  const [occupancy, setOccupancy] = useState<Occupancy>({
    adults: 1,
    children: 0,
    pets: 0,
  })
  const [lightbox, setLightbox] = useState({ open: false, index: 0 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lodging', slug],
    queryFn: () => getLodgingBySlug(slug!),
    enabled: !!slug,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })

  const rules = useMemo(
    () => (data ? resolvePricingRules(data) : null),
    [data]
  )

  const quote = useMemo(
    () => (rules ? calculateQuote(rules, { ...range, occupancy }) : null),
    [rules, range, occupancy]
  )

  const blockedDates = useMemo(() => {
    const raw = data?.blocked_dates ?? []
    return raw
      .map((value) => parseISODate(value))
      .filter((date): date is Date => date !== null)
  }, [data?.blocked_dates])

  const favoriteStay = useMemo(() => {
    if (!data) return null
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      cover: data.photos[0]?.thumbnail ?? null,
      city: data.address?.city ?? '',
      price: data.base_price,
      rating: data.rating,
      reviews: data.reviews,
      guests: data.guests,
      bedrooms: data.bedrooms,
    }
  }, [data])

  const scrollToBooking = () => {
    document
      .getElementById('reserva')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ---------- Loading ----------
  if (isLoading) return <LodgingDetailSkeleton />

  // ---------- Error ----------
  if (isError || !data || !rules || !quote || !favoriteStay) {
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

  const visibleAmenities = showAllAmenities
    ? data.amenities
    : data.amenities.slice(0, 6)
  const description =
    data.description.length > 400 && !showFullDescription
      ? data.description.slice(0, 400) + '…'
      : data.description

  return (
    <div className="min-h-screen bg-surface-warm pb-24 lg:pb-0">
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
          <PhotoGallery
            photos={data.photos}
            stay={favoriteStay}
            onOpen={(index) => setLightbox({ open: true, index })}
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

              {/* --- Disponibilidad (calendario compartido) --- */}
              <div id="disponibilidad" className="pb-6 border-b border-cool-steel-200">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-cool-steel-900">
                      Disponibilidad en {data.address?.city ?? 'el alojamiento'}
                    </h3>
                    <p className="text-sm text-cool-steel-500 mt-1">
                      Estancia mínima: {formatNights(rules.minNights)}
                      {rules.maxNights < 90
                        ? ` · máxima ${formatNights(rules.maxNights)}`
                        : ''}
                    </p>
                  </div>

                  {quote.nights > 0 && (
                    <div className="rounded-xl border border-vivid-tangerine-200 bg-vivid-tangerine-50 px-3.5 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-vivid-tangerine-700">
                        {formatNights(quote.nights)}
                      </p>
                      <p className="text-sm font-semibold text-cool-steel-900">
                        {formatMoney(quote.total)}{' '}
                        <span className="text-[11px] font-normal text-cool-steel-500">
                          total
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-cool-steel-200 bg-white p-4 sm:p-5 shadow-sm">
                  <DateRangeCalendar
                    value={range}
                    onChange={setRange}
                    numberOfMonths={2}
                    minNights={rules.minNights}
                    maxNights={rules.maxNights}
                    blockedDates={blockedDates}
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cool-steel-100 pt-4">
                    <p className="text-xs text-cool-steel-500">
                      {quote.nights > 0 && range.checkIn && range.checkOut
                        ? `${formatDayMonth(range.checkIn)} → ${formatDayMonth(
                            range.checkOut
                          )} · ${quote.guests} huésped${
                            quote.guests === 1 ? '' : 'es'
                          }`
                        : 'Selecciona tus fechas para continuar'}
                    </p>
                    <button
                      type="button"
                      onClick={scrollToBooking}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cool-steel-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-cool-steel-800 cursor-pointer"
                    >
                      Continuar con la reserva
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
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
                <LodgingLocationMap
                  id={data.id}
                  title={data.title}
                  address={data.address}
                />
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
            <aside id="reserva" className="lg:sticky lg:top-24 h-fit scroll-mt-24">
              <BookingCard
                detail={data}
                range={range}
                onRangeChange={setRange}
                occupancy={occupancy}
                onOccupancyChange={setOccupancy}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* ---------- Barra de reserva móvil ---------- */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-cool-steel-200 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cool-steel-900 truncate">
              {quote.nights > 0
                ? `${formatMoney(quote.total)} total`
                : `${formatMoney(rules.basePrice)} / noche`}
            </p>
            <p className="text-[11px] text-cool-steel-500 flex items-center gap-1 truncate">
              <CalendarDays size={11} className="shrink-0" />
              {range.checkIn && range.checkOut
                ? `${formatDayMonth(range.checkIn)} → ${formatDayMonth(
                    range.checkOut
                  )} · ${formatNights(quote.nights)}`
                : 'Selecciona tus fechas'}
              <span className="mx-1">·</span>
              <Users size={11} className="shrink-0" />
              {occupancy.adults + occupancy.children}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="shrink-0 rounded-xl bg-vivid-tangerine-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-vivid-tangerine-500/25 transition-colors hover:bg-vivid-tangerine-600 cursor-pointer"
          >
            Reservar
          </button>
        </div>
      </div>

      {/* ---------- Lightbox ---------- */}
      <PhotoLightbox
        photos={data.photos}
        open={lightbox.open}
        initialIndex={lightbox.index}
        title={data.title}
        onClose={() => setLightbox((current) => ({ ...current, open: false }))}
      />

      {/* Footer */}
      <footer className="border-t border-cool-steel-100 py-8 bg-surface-warm">
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
  const monthYear = Number.isNaN(date.getTime())
    ? review.created_at
    : `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`

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
