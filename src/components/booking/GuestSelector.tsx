import { Minus, Plus, PawPrint, Users, Baby, Check } from 'lucide-react'
import { type Occupancy, type PricingRules, formatMoney } from '@/utils/pricing'

interface Props {
  occupancy: Occupancy
  onChange: (next: Occupancy) => void
  rules: PricingRules
  className?: string
}

interface StepperRowProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onIncrease: () => void
  onDecrease: () => void
}

function StepperRow({
  icon,
  title,
  subtitle,
  value,
  min,
  max,
  disabled = false,
  onIncrease,
  onDecrease,
}: StepperRowProps) {
  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && value < max

  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        disabled ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-0.5 w-8 h-8 rounded-lg bg-cool-steel-50 border border-cool-steel-100 flex items-center justify-center text-cool-steel-600 shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cool-steel-900">{title}</p>
          <p className="text-xs text-cool-steel-500 leading-snug mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onDecrease}
          disabled={!canDecrease}
          aria-label={`Quitar ${title.toLowerCase()}`}
          className="w-8 h-8 rounded-full border border-cool-steel-300 text-cool-steel-700 flex items-center justify-center transition-colors hover:border-cool-steel-400 hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-cool-steel-300 cursor-pointer"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums text-cool-steel-900">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label={`Agregar ${title.toLowerCase()}`}
          className="w-8 h-8 rounded-full border border-cool-steel-300 text-cool-steel-700 flex items-center justify-center transition-colors hover:border-cool-steel-400 hover:bg-cool-steel-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-cool-steel-300 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function GuestSelector({
  occupancy,
  onChange,
  rules,
  className = '',
}: Props) {
  const totalGuests = occupancy.adults + occupancy.children
  const extraGuests = Math.max(0, totalGuests - rules.includedGuests)

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-cool-steel-100">
        <div>
          <p className="text-sm font-semibold text-cool-steel-900">
            ¿Quién viaja?
          </p>
          <p className="text-xs text-cool-steel-500 mt-0.5">
            Máximo {rules.maxGuests} huésped{rules.maxGuests === 1 ? '' : 'es'}{' '}
            en este alojamiento
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cool-steel-50 border border-cool-steel-100 px-2.5 py-1 text-[11px] font-semibold text-cool-steel-700">
          <Users size={12} />
          {totalGuests}/{rules.maxGuests}
        </span>
      </div>

      <div className="divide-y divide-cool-steel-100">
        <StepperRow
          icon={<Users size={15} />}
          title="Adultos"
          subtitle="13 años o más"
          value={occupancy.adults}
          min={1}
          max={rules.maxGuests - occupancy.children}
          onDecrease={() =>
            onChange({ ...occupancy, adults: Math.max(1, occupancy.adults - 1) })
          }
          onIncrease={() =>
            onChange({
              ...occupancy,
              adults: Math.min(
                rules.maxGuests - occupancy.children,
                occupancy.adults + 1
              ),
            })
          }
        />

        <StepperRow
          icon={<Baby size={15} />}
          title="Menores"
          subtitle="De 0 a 12 años"
          value={occupancy.children}
          min={0}
          max={Math.max(0, rules.maxGuests - occupancy.adults)}
          onDecrease={() =>
            onChange({
              ...occupancy,
              children: Math.max(0, occupancy.children - 1),
            })
          }
          onIncrease={() =>
            onChange({
              ...occupancy,
              children: Math.min(
                rules.maxGuests - occupancy.adults,
                occupancy.children + 1
              ),
            })
          }
        />

        <StepperRow
          icon={<PawPrint size={15} />}
          title="Mascotas"
          subtitle={
            rules.acceptsPets
              ? rules.petFee > 0
                ? `${formatMoney(rules.petFee)} por estancia · hasta ${
                    rules.maxPets
                  } mascota${rules.maxPets === 1 ? '' : 's'}`
                : `Sin cargo · hasta ${rules.maxPets} mascota${
                    rules.maxPets === 1 ? '' : 's'
                  }`
              : 'Este alojamiento no admite mascotas'
          }
          value={occupancy.pets}
          min={0}
          max={rules.maxPets}
          disabled={!rules.acceptsPets}
          onDecrease={() =>
            onChange({ ...occupancy, pets: Math.max(0, occupancy.pets - 1) })
          }
          onIncrease={() =>
            onChange({
              ...occupancy,
              pets: Math.min(rules.maxPets, occupancy.pets + 1),
            })
          }
        />
      </div>

      <div className="mt-3 rounded-xl bg-cool-steel-50/80 border border-cool-steel-100 px-3 py-2.5 space-y-1">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-cool-steel-700">
          <Check size={12} className="text-pacific-blue-700 shrink-0" />
          {rules.includedGuests} huésped
          {rules.includedGuests === 1 ? '' : 'es'} incluido
          {rules.includedGuests === 1 ? '' : 's'} en la tarifa base
        </p>
        {rules.extraGuestFeePerNight > 0 && (
          <p className="text-[11px] text-cool-steel-500 pl-4.5">
            Cada huésped adicional cuesta{' '}
            <span className="font-semibold text-cool-steel-800">
              {formatMoney(rules.extraGuestFeePerNight)}
            </span>{' '}
            por noche
            {extraGuests > 0
              ? ` · ahora aplica${extraGuests === 1 ? '' : 'n'} ${extraGuests} huésped${
                  extraGuests === 1 ? '' : 'es'
                } extra`
              : ''}
          </p>
        )}
      </div>
    </div>
  )
}
