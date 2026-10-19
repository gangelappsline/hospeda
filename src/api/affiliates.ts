import apiClient from './axios'
import type {
  Affiliate,
  AffiliatePayload,
  AffiliateRegistrationPayload,
  AffiliateRegistrationResponse,
  AffiliateSettings,
  AffiliateStats,
  Commission,
  Payout,
  PayoutRequestPayload,
  ReferralsResponse,
} from '@/types/affiliate'

/**
 * API del afiliado (registro público + autoservicio del panel de afiliado).
 *
 * El contrato completo (incluyendo los ajustes que debe hacer el backend)
 * está documentado en docs/afiliados/SISTEMA_DE_AFILIADOS.md
 */

// ─── PÚBLICO ────────────────────────────────────────────────────────────────

/**
 * Configuración pública del programa.
 * Alimenta la landing y el formulario de registro con los porcentajes vigentes.
 */
export const getAffiliateSettings = async (): Promise<AffiliateSettings> => {
  const response = await apiClient.get('/affiliates/settings')
  return response.data.data ?? response.data
}

/**
 * Vista previa del afiliado que invita (para mostrar "Te invita: Ana").
 */
export const getReferrerPreview = async (
  code: string
): Promise<{ name: string; code: string } | null> => {
  try {
    const response = await apiClient.get(
      `/affiliates/referrers/${encodeURIComponent(code)}`
    )
    return response.data.data ?? response.data
  } catch {
    // Un código inválido no debe romper el formulario
    return null
  }
}

/**
 * Registro profesional de un nuevo afiliado.
 * Crea el usuario con rol `affiliate` + su perfil de afiliado y, si viene
 * `referral_code`, lo enlaza a la red de quien lo invitó.
 */
export const registerAffiliate = async (
  payload: AffiliateRegistrationPayload
): Promise<AffiliateRegistrationResponse> => {
  const response = await apiClient.post('/affiliates/register', payload)
  return response.data.data ?? response.data
}

// ─── PANEL DEL AFILIADO (autenticado) ───────────────────────────────────────

const BASE = '/web/affiliate'

export const getMyAffiliateProfile = async (): Promise<Affiliate> => {
  const response = await apiClient.get(`${BASE}/profile`)
  return response.data.data ?? response.data
}

export const updateMyAffiliateProfile = async (
  payload: AffiliatePayload
): Promise<Affiliate> => {
  const response = await apiClient.put(`${BASE}/profile`, payload)
  return response.data.data ?? response.data
}

export const getMyAffiliateStats = async (): Promise<AffiliateStats> => {
  const response = await apiClient.get(`${BASE}/stats`)
  return response.data.data ?? response.data
}

/**
 * Red de referidos: primer nivel ("hijos") con sus hijos anidados
 * (segundo nivel / "nietos"). Anchura ilimitada en ambos niveles.
 */
export const getMyReferrals = async (params?: {
  search?: string
  level?: 1 | 2
}): Promise<ReferralsResponse> => {
  const response = await apiClient.get(`${BASE}/referrals`, { params })
  return response.data.data ?? response.data
}

export const getMyCommissions = async (params?: {
  status?: string
  level?: 1 | 2
  page?: number
}): Promise<{ items: Commission[]; total: number; pending_amount: number }> => {
  const response = await apiClient.get(`${BASE}/commissions`, { params })
  return response.data.data ?? response.data
}

export const getMyPayouts = async (): Promise<Payout[]> => {
  const response = await apiClient.get(`${BASE}/payouts`)
  return response.data.data ?? response.data
}

export const requestPayout = async (
  payload: PayoutRequestPayload
): Promise<Payout> => {
  const response = await apiClient.post(`${BASE}/payouts`, payload)
  return response.data.data ?? response.data
}
