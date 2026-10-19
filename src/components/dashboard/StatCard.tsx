import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change?: number
  subtitle?: string
}

export default function StatCard({
  icon,
  label,
  value,
  change,
  subtitle = 'vs. mes anterior',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Icono + badge de cambio */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-vivid-tangerine-50 flex items-center justify-center text-vivid-tangerine-500">
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isPositive
                ? 'bg-pacific-blue-50 text-pacific-blue-600'
                : 'bg-vivid-tangerine-50 text-vivid-tangerine-500'
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}
            {change}%
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-sm text-cool-steel-500 mb-1">{label}</p>

      {/* Valor */}
      <p className="text-2xl font-bold text-cool-steel-900 mb-1">{value}</p>

      {/* Subtitle */}
      <p className="text-xs text-cool-steel-400">{subtitle}</p>
    </div>
  )
}