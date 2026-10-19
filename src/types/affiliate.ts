/**
 * Tipos del Sistema de Afiliados de Hospeda
 *
 * Modelo de negocio:
 * - Cada afiliado puede referir infinitos usuarios de primer nivel ("hijos").
 * - Cada usuario de primer nivel puede referir infinitos usuarios de segundo
 *   nivel ("nietos" del afiliado original).
 * - El afiliado gana un porcentaje por cada transacción generada por su
 *   red: N% por primer nivel y M% por segundo nivel.
 * - Ambos porcentajes (y el resto de reglas) son configurables vía API.
 */

// ─── Configuración (editable desde la API) ──────────────────────────────────

export type CommissionBase = 'booking_total' | 'net_revenue'

export type PayoutMethod = 'paypal' | 'bank_transfer' | 'spei' | 'oxxo'

export interface AffiliateSettings {
  /** Porcentaje de comisión por referidos de primer nivel (hijos). Ej. 3 */
  level1_percent: number
  /** Porcentaje de comisión por referidos de segundo nivel (nietos). Ej. 2 */
  level2_percent: number
  /** Niveles de comisión habilitados (máximo soportado: 2) */
  max_levels: 1 | 2
  /** Monto mínimo para solicitar un retiro */
  min_payout_amount: number
  /** Días que dura la atribución de la cookie de referido */
  cookie_days: number
  /** Moneda de las comisiones (ISO 4217) */
  currency: string
  /** Base de cálculo de la comisión */
  commission_base: CommissionBase
  /** Si true, los afiliados se aprueban automáticamente al registrarse */
  auto_approve: boolean
  /** Métodos de pago habilitados para retiros */
  payout_methods: PayoutMethod[]
  /** URL pública de los términos del programa */
  terms_url: string | null
}

// ─── Afiliado ────────────────────────────────────────────────────────────────

export type AffiliateStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  suspended: 'Suspendido',
  rejected: 'Rechazado',
}

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  paypal: 'PayPal',
  bank_transfer: 'Transferencia bancaria',
  spei: 'SPEI / CLABE',
  oxxo: 'OXXO Pay',
}

/** Tamaños de audiencia ofrecidos en el registro */
export const AUDIENCE_SIZE_OPTIONS = [
  'Menos de 1,000',
  '1,000 – 5,000',
  '5,000 – 20,000',
  '20,000 – 100,000',
  'Más de 100,000',
] as const

export type AudienceSize = (typeof AUDIENCE_SIZE_OPTIONS)[number]

/** Canales de promoción ofrecidos en el registro */
export const CHANNEL_TYPE_OPTIONS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Facebook',
  'X (Twitter)',
  'LinkedIn',
  'Blog / Sitio web',
  'Podcast',
  'Comunidad / Grupo',
  'Otro',
] as const

export type ChannelType = (typeof CHANNEL_TYPE_OPTIONS)[number]

export interface AffiliateReferrer {
  id: number
  name: string
  code: string
}

export interface Affiliate {
  id: number
  user_id: number
  name: string
  email: string
  phone: string | null
  /** Código único de referido (se usa en el enlace: /afiliados/registro?ref=CODIGO) */
  code: string
  status: AffiliateStatus
  channel_type: string | null
  channel_url: string | null
  audience_size: string | null
  website: string | null
  motivation: string | null
  payout_method: PayoutMethod | null
  payout_details: Record<string, string> | null
  /** Referidos directos (primer nivel / "hijos") — ilimitados */
  level1_count: number
  /** Referidos de segundo nivel ("nietos") — ilimitados */
  level2_count: number
  /** Saldo disponible para retiro */
  balance: number
  /** Comisiones generadas históricamente */
  total_earned: number
  /** Quién lo invitó (null si llegó orgánico) */
  referrer: AffiliateReferrer | null
  created_at: string
  updated_at: string
}

export interface AffiliatePayload {
  name?: string
  phone?: string
  channel_type?: string
  channel_url?: string
  audience_size?: string
  website?: string
  payout_method?: PayoutMethod
  payout_details?: Record<string, string>
}

// ─── Registro público de afiliado ───────────────────────────────────────────

export interface AffiliateRegistrationPayload {
  // Datos personales
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string

  // Presencia digital
  channel_type: string
  channel_url: string
  audience_size?: string
  website?: string
  motivation?: string

  // Datos de pago
  payout_method: PayoutMethod
  payout_details: Record<string, string>

  // Atribución de referido (código del afiliado que lo invita)
  referral_code?: string | null

  // Consentimientos
  accept_terms: boolean
  accept_privacy: boolean
}

export interface AffiliateRegistrationResponse {
  affiliate: Affiliate
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  message: string
}

// ─── Red de referidos (2 niveles, anchura ilimitada) ────────────────────────

export type ReferralLevel = 1 | 2

export interface ReferralStats {
  /** Reservas/acciones generadas por este referido */
  conversions: number
  /** Monto sobre el que se calculó la comisión */
  generated_amount: number
  /** Comisión que esto generó para el afiliado */
  my_commission: number
}

export interface ReferralNode {
  id: number
  name: string
  email: string
  level: ReferralLevel
  joined_at: string
  status: AffiliateStatus
  channel_type: string | null
  stats: ReferralStats
  /**
   * Solo aplica a nodos de nivel 1: sus propios referidos directos,
   * que para el afiliado consultante son nivel 2 ("nietos").
   * Cantidad ilimitada.
   */
  children?: ReferralNode[]
}

export interface ReferralsResponse {
  /** Primer nivel ("hijos") — cantidad ilimitada */
  level1: ReferralNode[]
  /** Totales ya agregados por la API */
  totals: {
    level1: number
    level2: number
  }
}

// ─── Comisiones ─────────────────────────────────────────────────────────────

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled'

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  paid: 'Pagada',
  cancelled: 'Cancelada',
}

export interface Commission {
  id: number
  affiliate_id: number
  /** Nivel de la red que originó la comisión (1 = hijo, 2 = nieto) */
  level: ReferralLevel
  /** Porcentaje aplicado (instantánea al momento del cálculo) */
  percent: number
  /** Monto base (total de la reserva o ingreso neto, según configuración) */
  base_amount: number
  /** Comisión ganada = base_amount * percent / 100 */
  amount: number
  currency: string
  status: CommissionStatus
  /** Código de referencia (ej. número de reserva) */
  reference: string | null
  referred_user: { id: number; name: string } | null
  created_at: string
  paid_at: string | null
}

// ─── Retiros / pagos ────────────────────────────────────────────────────────

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'rejected'

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  requested: 'Solicitado',
  processing: 'En proceso',
  paid: 'Pagado',
  rejected: 'Rechazado',
}

export interface Payout {
  id: number
  affiliate_id: number
  amount: number
  currency: string
  method: PayoutMethod
  status: PayoutStatus
  requested_at: string
  paid_at: string | null
  notes: string | null
}

export interface PayoutRequestPayload {
  amount: number
  method: PayoutMethod
  payout_details?: Record<string, string>
}

// ─── Estadísticas del afiliado ──────────────────────────────────────────────

export interface MonthlyPoint {
  /** YYYY-MM */
  month: string
  referrals: number
  earnings: number
}

export interface AffiliateStats {
  total_referrals: number
  level1_referrals: number
  level2_referrals: number
  active_referrals: number
  total_earned: number
  pending_amount: number
  approved_amount: number
  paid_amount: number
  available_balance: number
  /** % de referidos que generaron al menos una conversión */
  conversion_rate: number
  /** Serie mensual para gráficos (últimos 6 meses) */
  monthly: MonthlyPoint[]
}

// ─── Utilidades ─────────────────────────────────────────────────────────────

export function formatMoney(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value}%`
}
