import type {
  AffiliateStatus,
  CommissionStatus,
  PayoutStatus,
  ReferralLevel,
} from '@/types/affiliate'
import {
  AFFILIATE_STATUS_LABELS,
  COMMISSION_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
} from '@/types/affiliate'

type Kind = 'affiliate' | 'commission' | 'payout'

const AFFILIATE_STYLES: Record<AffiliateStatus, string> = {
  pending: 'bg-parchment-50 text-parchment-600 border-parchment-200',
  active: 'bg-pacific-blue-50 text-pacific-blue-700 border-pacific-blue-200',
  suspended:
    'bg-cool-steel-100 text-cool-steel-600 border-cool-steel-200',
  rejected:
    'bg-vivid-tangerine-50 text-vivid-tangerine-600 border-vivid-tangerine-200',
}

const COMMISSION_STYLES: Record<CommissionStatus, string> = {
  pending: 'bg-parchment-50 text-parchment-600 border-parchment-200',
  approved: 'bg-pacific-blue-50 text-pacific-blue-700 border-pacific-blue-200',
  paid: 'bg-pacific-blue-100 text-pacific-blue-800 border-pacific-blue-300',
  cancelled:
    'bg-vivid-tangerine-50 text-vivid-tangerine-600 border-vivid-tangerine-200',
}

const PAYOUT_STYLES: Record<PayoutStatus, string> = {
  requested: 'bg-parchment-50 text-parchment-600 border-parchment-200',
  processing:
    'bg-tangerine-dream-50 text-tangerine-dream-600 border-tangerine-dream-200',
  paid: 'bg-pacific-blue-50 text-pacific-blue-700 border-pacific-blue-200',
  rejected:
    'bg-vivid-tangerine-50 text-vivid-tangerine-600 border-vivid-tangerine-200',
}

interface Props {
  kind: Kind
  status: AffiliateStatus | CommissionStatus | PayoutStatus
}

export default function StatusBadge({ kind, status }: Props) {
  const { label, styles } = resolveStatus(kind, status)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      {label}
    </span>
  )
}

function resolveStatus(
  kind: Kind,
  status: AffiliateStatus | CommissionStatus | PayoutStatus
): { label: string; styles: string } {
  if (kind === 'affiliate') {
    const s = status as AffiliateStatus
    return {
      label: AFFILIATE_STATUS_LABELS[s] ?? status,
      styles: AFFILIATE_STYLES[s] ?? '',
    }
  }
  if (kind === 'commission') {
    const s = status as CommissionStatus
    return {
      label: COMMISSION_STATUS_LABELS[s] ?? status,
      styles: COMMISSION_STYLES[s] ?? '',
    }
  }
  const s = status as PayoutStatus
  return {
    label: PAYOUT_STATUS_LABELS[s] ?? status,
    styles: PAYOUT_STYLES[s] ?? '',
  }
}

/**
 * Distintivo de nivel en la red: 1 = hijo, 2 = nieto.
 */
export function LevelBadge({ level }: { level: ReferralLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        level === 1
          ? 'bg-vivid-tangerine-50 text-vivid-tangerine-600 border border-vivid-tangerine-200'
          : 'bg-parchment-50 text-parchment-600 border border-parchment-200'
      }`}
    >
      Nivel {level}
      <span className="font-normal opacity-75">
        · {level === 1 ? 'Hijo' : 'Nieto'}
      </span>
    </span>
  )
}
