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
      <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-cool-steel-500">Usuarios registrados</p>
          <div className="w-9 h-9 rounded-lg bg-cool-steel-50 flex items-center justify-center">
            <UserIcon size={16} className="text-cool-steel-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-cool-steel-900">{total}</p>
      </div>

      {/* Administradores */}
      <div className="bg-white rounded-xl border-2 border-vivid-tangerine-200 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-cool-steel-500">Administradores</p>
          <div className="w-9 h-9 rounded-lg bg-vivid-tangerine-50 flex items-center justify-center">
            <ShieldCheck size={16} className="text-vivid-tangerine-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-cool-steel-900">{admins}</p>
      </div>

      {/* Resultados visibles */}
      <div className="bg-white rounded-xl border border-cool-steel-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <p className="text-sm text-cool-steel-500">Resultados visibles</p>
          <div className="w-9 h-9 rounded-lg bg-cool-steel-50 flex items-center justify-center">
            <Search size={16} className="text-cool-steel-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-cool-steel-900">{visible}</p>
      </div>
    </div>
  )
}