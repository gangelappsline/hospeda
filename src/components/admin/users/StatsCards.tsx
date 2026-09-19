import { User as UserIcon, Search, ShieldCheck } from 'lucide-react'

interface Props {
  total: number
  admins: number
  visible: number
}

export default function StatsCards({ total, admins, visible }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Usuarios registrados */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-gray-500">Usuarios registrados</p>
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
            <UserIcon size={16} className="text-gray-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{total}</p>
      </div>

      {/* Administradores */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-gray-500">Administradores</p>
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <ShieldCheck size={16} className="text-orange-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{admins}</p>
      </div>

      {/* Resultados visibles */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-gray-500">Resultados visibles</p>
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
            <Search size={16} className="text-gray-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{visible}</p>
      </div>
    </div>
  )
}