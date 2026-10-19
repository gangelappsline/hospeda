import { Pencil, Trash2 } from 'lucide-react'
import type { Settlement } from '@/types/settlement'

interface Props {
  settlement: Settlement
  country?: string
  onEdit: (settlement: Settlement) => void
  onDelete: (settlement: Settlement) => void
}

export default function SettlementRow({ settlement, country, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-cool-steel-100 last:border-0 hover:bg-cool-steel-50/70 transition-colors">
      {/* Colonia */}
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-cool-steel-900">{settlement.name}</p>
        <p className="text-xs text-cool-steel-400 mt-0.5">ID: {settlement.id}</p>
      </td>

      {/* Código postal */}
      <td className="px-5 py-4">
        <span className="inline-flex px-2.5 py-1 rounded-md bg-cool-steel-100 text-xs font-mono font-medium text-cool-steel-700">
          {settlement.zip_code}
        </span>
      </td>

      {/* Ciudad */}
      <td className="px-5 py-4 text-sm text-cool-steel-600">
        {settlement.city?.name || '—'}
      </td>

      {/* Estado */}
      <td className="px-5 py-4 text-sm text-cool-steel-600">
        {settlement.state?.name || '—'}
      </td>

      {/* País */}
      <td className="px-5 py-4 text-sm text-cool-steel-600">
        {country || settlement.country?.name || '—'}
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onEdit(settlement)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-cool-steel-100 hover:text-cool-steel-700 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(settlement)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-500 hover:bg-vivid-tangerine-50 hover:text-vivid-tangerine-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}