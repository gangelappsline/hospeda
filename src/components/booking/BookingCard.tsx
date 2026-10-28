import { useMemo, useState } from 'react'
import {
  Star,
  ShieldCheck,
  CalendarCheck,
  ChevronDown,
  CalendarDays,
  Users,
  Sparkles,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import DateRangeCalendar, { type DateRange } from './DateRangeCalendar'
import GuestSelector from './GuestSelector'
import FavoriteButton from '@/components/ui/FavoriteButton'
import { useDismissable } from '@/hooks/useUiHelpers'
import {
  calculateQuote,
  resolvePricingRules,
  type Occupancy,
  formatMoney,
} from '@/utils/pricing'
import {
  formatDayMonth,
  formatNights,
  formatShortDate,
} from '@/utils/dates'
import type { LodgingDetail } from '@/types/public'

interface Props {
  detail: LodgingDetail
  range: DateRange
  onRangeChange: (range: DateRange) => void
  occupancy: Occupancy
  onOccupancyChange: (occupancy: Occupancy) => void
}

export default function BookingCard({
  detail,
  range,
  onRangeChange,
  occupancy,
  onOccupancyChange,
}: Props) {
  const [dateOpen, setDateOpen] = useState(false)
  const [guestsOpen, setGuestsOpen] = useState(false)

  const dateRef = useDismissable(dateOpen, () => setDateOpen(false))
  const guestsRef = useDismissable(guestsOpen, () => setGuestsOpen(false))

  const rules = useMemo(() => resolvePricingRules(detail), [detail])
  const quote = useMemo(
    () => calculateQuote(rules, { ...range, occupancy }),
    [rules, range, occupancy]
  )

  const totalGuests = occupancy.adults + occupancy.children
  const guestsLabel = [
    `${totalGuests} huésped${totalGuests === 1 ? '' : 'es'}`,
    occupancy.pets > 0
      ? `${occupancy.pets} mascota${occupancy.pets === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const handleReserve = () => {
    if (!range.checkIn || !range.checkOut) {
      setDateOpen(true)
      toast.error('Elige tus fechas', {
        description: 'Selecciona la llegada y la salida para calcular el total.',
      })
      return
    }

    if (!quote.isValid) {
      toast.error('Revisa tu selección', {
        description: quote.errors[0],
      })
      return
    }

    // TODO: conectar con el endpoint de reservas cuando esté disponible.
    toast.success('Resumen de tu reserva', {
      description: `${formatShortDate(range.checkIn)} → ${formatShortDate(
        range.checkOut
      )} · ${formatNights(quote.nights)} · ${guestsLabel} · Total ${formatMoney(
        quote.total
      )} MXN`,
    })
  }

  return (
    <div className="rounded-2xl border border-cool-steel-200 bg-white shadow-xl shadow-cool-steel-900/5 p-6">
      {/* Precio + rating */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <span className="text-2xl font-semibold text-cool-steel-900">
            {formatMoney(rules.basePrice)}
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

      {/* Selector de fechas + huéspedes */}
      <div className="rounded-xl border border-cool-steel-300 overflow-visible">
        <div className="grid grid-cols-2 divide-x divide-cool-steel-300">
          {/* Llegada */}
          <div ref={dateRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setGuestsOpen(false)
                setDateOpen((open) => !open)
              }}
              aria-expanded={dateOpen}
              className={`w-full p-3 text-left rounded-tl-xl transition-colors cursor-pointer ${
                dateOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
                Llegada
              </span>
              <span
                className={`mt-0.5 flex items-center gap-1.5 text-sm ${
                  range.checkIn
                    ? 'font-medium text-cool-steel-900'
                    : 'text-cool-steel-400'
                }`}
              >
                <CalendarDays size={13} className="text-cool-steel-400" />
                {range.checkIn ? formatDayMonth(range.checkIn) : 'Selecciona'}
              </span>
            </button>

            {dateOpen && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar calendario"
                  onClick={() => setDateOpen(false)}
                  className="fixed inset-0 z-[105] bg-cool-steel-950/40 sm:hidden cursor-default"
                />
                <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:left-0 sm:right-auto sm:bottom-auto sm:top-full sm:w-[332px] sm:z-50 sm:mt-2">
                  <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-cool-steel-200 shadow-2xl shadow-cool-steel-950/20 p-4 max-h-[88vh] sm:max-h-[calc(100vh-11rem)] overflow-y-auto overscroll-contain">
                    <div className="flex items-center justify-between mb-1 sm:hidden">
                      <p className="text-sm font-semibold text-cool-steel-900">
                        Fechas de tu estancia
                      </p>
                      <button
                        type="button"
                        onClick={() => setDateOpen(false)}
                        className="text-xs font-semibold text-vivid-tangerine-600 cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>

                    <DateRangeCalendar
                      value={range}
                      onChange={onRangeChange}
                      numberOfMonths={1}
                      showHeader={false}
                      minNights={rules.minNights}
                      maxNights={rules.maxNights}
                      compact
                    />

                    <button
                      type="button"
                      onClick={() => setDateOpen(false)}
                      className="mt-3 w-full rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800 cursor-pointer"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Salida */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setGuestsOpen(false)
                setDateOpen(true)
              }}
              aria-expanded={dateOpen}
              className={`w-full p-3 text-left rounded-tr-xl transition-colors cursor-pointer ${
                dateOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
                Salida
              </span>
              <span
                className={`mt-0.5 flex items-center gap-1.5 text-sm ${
                  range.checkOut
                    ? 'font-medium text-cool-steel-900'
                    : 'text-cool-steel-400'
                }`}
              >
                <CalendarDays size={13} className="text-cool-steel-400" />
                {range.checkOut ? formatDayMonth(range.checkOut) : 'Selecciona'}
              </span>
            </button>
          </div>
        </div>

        {/* Huéspedes */}
        <div ref={guestsRef} className="relative border-t border-cool-steel-300">
          <button
            type="button"
            onClick={() => {
              setDateOpen(false)
              setGuestsOpen((open) => !open)
            }}
            aria-expanded={guestsOpen}
            className={`w-full flex items-center justify-between gap-3 p-3 text-left rounded-b-xl transition-colors cursor-pointer ${
              guestsOpen ? 'bg-cool-steel-50' : 'hover:bg-cool-steel-50'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wide font-semibold text-cool-steel-700">
                Huéspedes
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-cool-steel-800">
                <Users size={13} className="text-cool-steel-400 shrink-0" />
                <span className="truncate">{guestsLabel}</span>
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-cool-steel-500 shrink-0 transition-transform ${
                guestsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {guestsOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar selector de huéspedes"
                onClick={() => setGuestsOpen(false)}
                className="fixed inset-0 z-[105] bg-cool-steel-950/40 sm:hidden cursor-default"
              />
              <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-full sm:z-50 sm:mt-2">
                <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-cool-steel-200 shadow-2xl shadow-cool-steel-950/20 p-4 max-h-[85vh] overflow-y-auto">
                  <GuestSelector
                    occupancy={occupancy}
                    onChange={onOccupancyChange}
                    rules={rules}
                  />
                  <button
                    type="button"
                    onClick={() => setGuestsOpen(false)}
                    className="mt-4 w-full rounded-xl bg-cool-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cool-steel-800 cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleReserve}
        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-vivid-tangerine-500 to-vivid-tangerine-600 text-white font-semibold shadow-md shadow-vivid-tangerine-500/25 hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
      >
        {range.checkIn && range.checkOut
          ? `Reservar · ${formatMoney(quote.total)}`
          : 'Reservar ahora'}
      </button>

      <p className="text-center text-xs text-cool-steel-500 mt-2.5">
        No se te cobrará nada todavía
      </p>

      {/* Desglose */}
      {quote.nights > 0 ? (
        <div className="space-y-2.5 text-sm text-cool-steel-700 pt-5 mt-5 border-t border-cool-steel-200">
          <div className="flex items-center justify-between text-xs font-medium text-cool-steel-500 mb-1">
            <span className="capitalize">
              {formatDayMonth(range.checkIn!)} →{' '}
              {formatDayMonth(range.checkOut!)}
            </span>
            <span>{formatNights(quote.nights)}</span>
          </div>

          {quote.lineItems.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                {item.hint && (
                  <span className="block text-[11px] text-cool-steel-400 mt-0.5">
                    {item.hint}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatMoney(item.amount)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-cool-steel-200 font-semibold text-cool-steel-900 text-base">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(quote.total)}</span>
          </div>

          {quote.nights > 1 && (
            <p className="text-[11px] text-cool-steel-500 text-right">
              Promedio {formatMoney(quote.total / quote.nights)} por noche
            </p>
          )}

          {quote.securityDeposit > 0 && (
            <p className="flex items-start gap-1.5 rounded-lg bg-cool-steel-50 border border-cool-steel-100 px-2.5 py-2 text-[11px] text-cool-steel-600">
              <Info size={12} className="mt-0.5 shrink-0" />
              Depósito de garantía reembolsable de{' '}
              {formatMoney(quote.securityDeposit)}; no se cobra ahora.
            </p>
          )}

          {quote.errors.length > 0 && (
            <p className="rounded-lg bg-vivid-tangerine-50 border border-vivid-tangerine-200 px-2.5 py-2 text-[11px] font-medium text-vivid-tangerine-700">
              {quote.errors[0]}
            </p>
          )}
        </div>
      ) : (
        <div className="pt-5 mt-5 border-t border-cool-steel-200 space-y-2 text-sm text-cool-steel-600">
          <p className="flex items-start gap-2 text-xs">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-vivid-tangerine-500" />
            Agrega tus fechas y huéspedes para ver el precio total de la estancia.
          </p>
          {rules.cleaningFee > 0 && (
            <p className="text-[11px] text-cool-steel-500">
              + {formatMoney(rules.cleaningFee)} de limpieza
              {rules.serviceFee > 0
                ? ` · ${formatMoney(rules.serviceFee)} de servicio`
                : ''}
            </p>
          )}
        </div>
      )}

      {/* Favoritos */}
      <div className="mt-5">
        <FavoriteButton
          stay={{
            id: detail.id,
            slug: detail.slug,
            title: detail.title,
            cover: detail.photos[0]?.thumbnail ?? null,
            city: detail.address?.city ?? '',
            price: detail.base_price,
            rating: detail.rating,
            reviews: detail.reviews,
            guests: detail.guests,
            bedrooms: detail.bedrooms,
          }}
          variant="outline"
          savedLabel="Guardado en favoritos"
        />
      </div>

      {/* Garantías */}
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
    </div>
  )
}
