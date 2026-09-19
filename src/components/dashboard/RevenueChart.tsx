import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Ene', ingresos: 85000 },
  { month: 'Feb', ingresos: 92000 },
  { month: 'Mar', ingresos: 78000 },
  { month: 'Abr', ingresos: 105000 },
  { month: 'May', ingresos: 118000 },
  { month: 'Jun', ingresos: 142000 },
  { month: 'Jul', ingresos: 168000 },
  { month: 'Ago', ingresos: 155000 },
  { month: 'Sep', ingresos: 185000 },
]

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Ingresos por mes</h3>
          <p className="text-sm text-gray-500">
            Comportamiento de los últimos 9 meses
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-600">
          2026
        </span>
      </div>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#colorIngresos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}