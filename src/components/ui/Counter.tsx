import { Minus, Plus } from 'lucide-react'

interface Props {
  icon?: React.ReactNode
  label: string
  hint?: string
  value: number
  min: number
  max: number
  disabled?: boolean
  decreaseLabel?: string
  increaseLabel?: string
  onChange: (next: number) => void
}

/**
 * Contador compacto con botones − / +. Se usa en el buscador del hero y en
 * cualquier selector de cantidades.
 */
export default function Counter({
  icon,
  label,
  hint,
  value,
  min,
  max,
  disabled = false,
  decreaseLabel,
  increaseLabel,
  onChange,
}: Props) {
  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && value < max

  return (
    <div
      className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-55' : ''}`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cool-steel-100 bg-cool-steel-50 text-cool-steel-600">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cool-steel-900">{label}</p>
          {hint && (
            <p className="mt-0.5 text-[11px] leading-snug text-cool-steel-500">
              {hint}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={!canDecrease}
          aria-label={decreaseLabel ?? `Quitar ${label.toLowerCase()}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-cool-steel-300 text-cool-steel-700 transition-colors hover:border-cool-steel-400 hover:bg-cool-steel-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-cool-steel-300 disabled:hover:bg-white"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums text-cool-steel-900">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={!canIncrease}
          aria-label={increaseLabel ?? `Agregar ${label.toLowerCase()}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-cool-steel-300 text-cool-steel-700 transition-colors hover:border-cool-steel-400 hover:bg-cool-steel-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-cool-steel-300 disabled:hover:bg-white"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
