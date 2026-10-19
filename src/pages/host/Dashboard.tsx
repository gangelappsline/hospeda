import { DollarSign, CalendarCheck, Building2, Users } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import TopProperties from '@/components/dashboard/TopProperties'
import RecentBookings from '@/components/dashboard/RecentBookings'
import type { User } from '@/types/auth'
import { getUser } from '@/utils/authStorage'

export default function Dashboard() {
  const user: User | null = getUser()

  const firstName = user?.name?.split(' ')[0] || 'Usuario'

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cool-steel-900">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm text-cool-steel-500 mt-1">
            Este es el resumen de tu operación en Hospeda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-cool-steel-200 bg-white text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-50 transition-colors">
            Últimos 30 días
          </button>
          <button className="px-4 py-2 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors">
            Nueva propiedad
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<DollarSign size={20} />}
          label="Ingresos totales"
          value="$1,284,500"
          change={12.5}
        />
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Reservaciones activas"
          value="342"
          change={8.2}
        />
        <StatCard
          icon={<Building2 size={20} />}
          label="Propiedades"
          value="1,847"
          change={4.1}
          subtitle="publicadas y en revisión"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Usuarios registrados"
          value="12,490"
          change={-1.8}
        />
      </div>

      {/* Gráfico + Propiedades destacadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <TopProperties />
        </div>
      </div>

      {/* Reservaciones recientes */}
      <RecentBookings />
    </div>
  )
}