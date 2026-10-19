import type { AffiliateSettings } from '@/types/affiliate'

/**
 * Valores por defecto del Programa de Afiliados.
 * Se usan cuando la API de configuración aún no responde (o no existe),
 * de modo que la landing y el formulario siempre muestren el programa.
 *
 * Estos valores NO son la fuente de verdad: el backend expone
 * GET /api/affiliates/settings y los porcentajes reales se configuran
 * desde el panel de administración (PUT /api/web/admin/affiliate-settings).
 */
export const AFFILIATE_SETTINGS_FALLBACK: AffiliateSettings = {
  level1_percent: 3,
  level2_percent: 2,
  max_levels: 2,
  min_payout_amount: 500,
  cookie_days: 30,
  currency: 'MXN',
  commission_base: 'booking_total',
  auto_approve: false,
  payout_methods: ['paypal', 'spei', 'bank_transfer', 'oxxo'],
  terms_url: null,
}

export function getAffiliateSettingsFallback(): AffiliateSettings {
  return AFFILIATE_SETTINGS_FALLBACK
}
