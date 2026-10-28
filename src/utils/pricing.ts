import type { LodgingDetail } from '@/types/public'
import { diffInNights } from './dates'

export interface Occupancy {
  adults: number
  children: number
  pets: number
}

export const EMPTY_OCCUPANCY: Occupancy = { adults: 1, children: 0, pets: 0 }

export interface PricingRules {
  basePrice: number
  cleaningFee: number
  serviceFee: number
  securityDeposit: number
  /** Capacidad máxima de huéspedes (adultos + menores). */
  maxGuests: number
  /** Huéspedes incluidos en la tarifa base por noche. */
  includedGuests: number
  /** Cargo extra, por huésped adicional y por noche. */
  extraGuestFeePerNight: number
  /** Cargo por mascota (por estancia). */
  petFee: number
  acceptsPets: boolean
  maxPets: number
  minNights: number
  maxNights: number
}

export interface QuoteLineItem {
  key: string
  label: string
  hint?: string
  amount: number
}

export interface Quote {
  nights: number
  guests: number
  extraGuests: number
  lodgingTotal: number
  extraGuestsTotal: number
  cleaningFee: number
  serviceFee: number
  petFee: number
  total: number
  securityDeposit: number
  lineItems: QuoteLineItem[]
  errors: string[]
  isValid: boolean
}

/** Redondea al múltiplo de `step` más cercano (por ejemplo, a decenas). */
function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

function amenitiesIncludePets(detail: LodgingDetail): boolean {
  const names = (detail.amenities ?? []).map((a) =>
    `${a.name ?? ''}`.toLowerCase()
  )
  return names.some(
    (name) => name.includes('mascota') || name.includes('pet friendly')
  )
}

/**
 * Resuelve las reglas de cobro del alojamiento.
 *
 * La API pública aún no expone todos los campos de tarificación, por lo que
 * aquí se aplican valores por defecto razonables y documentados:
 *  - `included_guests`: 2 huéspedes (o la capacidad total si es menor).
 *  - `extra_guest_fee`: 12 % de la tarifa base por noche, redondeado a decenas.
 *  - `min_nights` / `max_nights`: 1 / 90 noches.
 *
 * En cuanto el backend envíe esos campos, se toman automáticamente.
 */
export function resolvePricingRules(detail: LodgingDetail): PricingRules {
  const maxGuests = Math.max(1, detail.guests || 1)
  const basePrice = Math.max(0, detail.base_price || 0)

  const includedGuests = Math.min(
    maxGuests,
    Math.max(1, detail.included_guests ?? Math.min(maxGuests, 2))
  )

  const extraGuestFeePerNight =
    detail.extra_guest_fee !== undefined && detail.extra_guest_fee !== null
      ? Math.max(0, detail.extra_guest_fee)
      : basePrice > 0
        ? Math.max(50, roundTo(basePrice * 0.12, 10))
        : 0

  const acceptsPets =
    detail.accepts_pets ?? amenitiesIncludePets(detail)

  return {
    basePrice,
    cleaningFee: Math.max(0, detail.cleaning_fee || 0),
    serviceFee: Math.max(0, detail.service_fee || 0),
    securityDeposit: Math.max(0, detail.security_deposit || 0),
    maxGuests,
    includedGuests,
    extraGuestFeePerNight,
    petFee: Math.max(0, detail.pet_fee ?? 0),
    acceptsPets,
    maxPets: acceptsPets ? Math.max(1, detail.max_pets ?? 2) : 0,
    minNights: Math.max(1, detail.min_nights ?? 1),
    maxNights: Math.max(1, detail.max_nights ?? 90),
  }
}

export function countGuests(occupancy: Occupancy): number {
  return occupancy.adults + occupancy.children
}

export function calculateQuote(
  rules: PricingRules,
  params: {
    checkIn: Date | null
    checkOut: Date | null
    occupancy: Occupancy
  }
): Quote {
  const { checkIn, checkOut, occupancy } = params
  const guests = countGuests(occupancy)
  const extraGuests = Math.max(0, guests - rules.includedGuests)
  const nights =
    checkIn && checkOut ? Math.max(0, diffInNights(checkIn, checkOut)) : 0

  const lodgingTotal = rules.basePrice * nights
  const extraGuestsTotal = rules.extraGuestFeePerNight * extraGuests * nights
  const petFee = rules.acceptsPets && occupancy.pets > 0 ? rules.petFee : 0
  const cleaningFee = nights > 0 ? rules.cleaningFee : 0
  const serviceFee = nights > 0 ? rules.serviceFee : 0
  const total = lodgingTotal + extraGuestsTotal + cleaningFee + serviceFee + petFee

  const errors: string[] = []
  if (!checkIn || !checkOut) {
    errors.push('Selecciona tus fechas de llegada y salida')
  } else if (nights <= 0) {
    errors.push('La fecha de salida debe ser posterior a la llegada')
  } else if (nights < rules.minNights) {
    errors.push(
      `La estancia mínima es de ${rules.minNights} noche${
        rules.minNights === 1 ? '' : 's'
      }`
    )
  } else if (nights > rules.maxNights) {
    errors.push(`La estancia máxima es de ${rules.maxNights} noches`)
  }

  if (guests > rules.maxGuests) {
    errors.push(`Este alojamiento admite hasta ${rules.maxGuests} huéspedes`)
  }

  if (occupancy.pets > 0 && !rules.acceptsPets) {
    errors.push('Este alojamiento no admite mascotas')
  } else if (occupancy.pets > rules.maxPets) {
    errors.push(`Máximo ${rules.maxPets} mascota${rules.maxPets === 1 ? '' : 's'}`)
  }

  const lineItems: QuoteLineItem[] = []
  if (nights > 0) {
    lineItems.push({
      key: 'lodging',
      label: `${formatMoney(rules.basePrice)} × ${nights} noche${
        nights === 1 ? '' : 's'
      }`,
      amount: lodgingTotal,
    })
  }
  if (extraGuestsTotal > 0) {
    lineItems.push({
      key: 'extra-guests',
      label: `Huéspedes adicionales (${extraGuests})`,
      hint: `${formatMoney(rules.extraGuestFeePerNight)} por huésped · noche`,
      amount: extraGuestsTotal,
    })
  }
  if (cleaningFee > 0) {
    lineItems.push({
      key: 'cleaning',
      label: 'Tarifa de limpieza',
      hint: 'Cargo único por estancia',
      amount: cleaningFee,
    })
  }
  if (serviceFee > 0) {
    lineItems.push({
      key: 'service',
      label: 'Tarifa de servicio',
      amount: serviceFee,
    })
  }
  if (petFee > 0) {
    lineItems.push({
      key: 'pets',
      label: `Mascotas (${occupancy.pets})`,
      hint: 'Cargo único por estancia',
      amount: petFee,
    })
  }

  return {
    nights,
    guests,
    extraGuests,
    lodgingTotal,
    extraGuestsTotal,
    cleaningFee,
    serviceFee,
    petFee,
    total,
    securityDeposit: rules.securityDeposit,
    lineItems,
    errors,
    isValid: errors.length === 0,
  }
}

export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString('es-MX')}`
}
