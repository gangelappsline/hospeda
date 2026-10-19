import apiClient from './axios'
import type {
  Affiliate,
  AffiliateSettings,
  AffiliateStatus,
  Commission,
  CommissionStatus,
  Payout,
} from '@/types/affiliate'

/**
 * API de administración del sistema de afiliados.
 * Usada por el panel /admin/affiliates (solo rol administrator).
 *
 * Documentación del contrato: docs/afiliados/SISTEMA_DE_AFILIADOS.md
 */

const BASE = '/web/admin'

// ─── Afiliados ──────────────────────────────────────────────────────────────

export const getAffiliates = async (params?: {
  status?: AffiliateStatus | 'all'
  search?: string
}): Promise<Affiliate[]> => {
  const response = await apiClient.get(`${BASE}/affiliates`, { params })
  return response.data.data ?? response.data
}

export const getAffiliateById = async (id: number): Promise<Affiliate> => {
  const response = await apiClient.get(`${BASE}/affiliates/${id}`)
  return response.data.data ?? response.data
}

/**
 * Aprueba, suspende o rechaza un afiliado.
 */
export const updateAffiliateStatus = async (
  id: number,
  status: AffiliateStatus
): Promise<Affiliate> => {
  const response = await apiClient.patch(`${BASE}/affiliates/${id}/status`, {
    status,
  })
  return response.data.data ?? response.data
}

// ─── Configuración de comisiones (todo configurable desde la API) ───────────

export const getAdminAffiliateSettings =
  async (): Promise<AffiliateSettings> => {
    const response = await apiClient.get(`${BASE}/affiliate-settings`)
    return response.data.data ?? response.data
  }

export const updateAffiliateSettings = async (
  payload: Partial<AffiliateSettings>
): Promise<AffiliateSettings> => {
  const response = await apiClient.put(`${BASE}/affiliate-settings`, payload)
  return response.data.data ?? response.data
}

// ─── Comisiones ─────────────────────────────────────────────────────────────

export const getAdminCommissions = async (params?: {
  status?: CommissionStatus | 'all'
  level?: 1 | 2
  affiliate_id?: number
  page?: number
}): Promise<{ items: Commission[]; total: number }> => {
  const response = await apiClient.get(`${BASE}/commissions`, { params })
  return response.data.data ?? response.data
}

export const updateCommissionStatus = async (
  id: number,
  status: CommissionStatus
): Promise<Commission> => {
  const response = await apiClient.patch(`${BASE}/commissions/${id}`, {
    status,
  })
  return response.data.data ?? response.data
}

// ─── Retiros ────────────────────────────────────────────────────────────────

export const getAdminPayouts = async (params?: {
  status?: string
  page?: number
}): Promise<{ items: Payout[]; total: number }> => {
  const response = await apiClient.get(`${BASE}/payouts`, { params })
  return response.data.data ?? response.data
}

export const markPayoutAsPaid = async (id: number): Promise<Payout> => {
  const response = await apiClient.patch(`${BASE}/payouts/${id}/pay`)
  return response.data.data ?? response.data
}

export const rejectPayout = async (
  id: number,
  notes?: string
): Promise<Payout> => {
  const response = await apiClient.patch(`${BASE}/payouts/${id}/reject`, {
    notes,
  })
  return response.data.data ?? response.data
}
