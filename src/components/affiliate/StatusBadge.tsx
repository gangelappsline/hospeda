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
  pending: 'bg-pending-soft text-pending border-pending-line',
  active: 'bg-success-soft text-success border-success-line',
  suspended:
    'bg-cool-steel-100 text-cool-steel-600 border-cool-steel-200',
  rejected:
    'bg-danger-soft text-danger border-danger-line',
}

const COMMISSION_STYLES: Record<CommissionStatus, string> = {
  pending: 'bg-pending-soft text-pending border-pending-line',
  approved: 'bg-success-soft text-success border-success-line',
  paid: 'bg-success-soft text-success border-success-line',
  cancelled:
    'bg-danger-soft text-danger border-danger-line',
}

const PAYOUT_STYLES: Record<PayoutStatus, string> = {
  requested: 'bg-pending-soft text-pending border-pending-line',
  processing:
    'bg-warning-soft text-warning border-warning-line',
  paid: 'bg-success-soft text-success border-success-line',
  rejected:
    'bg-danger-soft text-danger border-danger-line',
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
          ? 'bg-brand-soft text-brand-deep border border-brand-line'
          : 'bg-pending-soft text-pending border border-pending-line'
      }`}
    >
      Nivel {level}
      <span className="font-normal opacity-75">
        · {level === 1 ? 'Hijo' : 'Nieto'}
      </span>
    </span>
  )
}
