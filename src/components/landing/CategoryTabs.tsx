import type { StayCategory } from '@/types/public'

interface Props {
  active: StayCategory
  onChange: (category: StayCategory) => void
}

const CATEGORIES: { value: StayCategory; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'Casa', label: 'Casas' },
  { value: 'Cabaña', label: 'Cabañas' },
  { value: 'Villa', label: 'Villas' },
  { value: 'Apartamento', label: 'Apartamentos' },
  { value: 'Loft', label: 'Lofts' },
  { value: 'Glamping', label: 'Glamping' },
  { value: 'Estudio', label: 'Estudios' },
  { value: 'Oficina', label: 'Oficinas' },
]

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
      {CATEGORIES.map((category) => {
        const isActive = active === category.value
        return (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
              isActive
                ? 'bg-cool-steel-900 text-white shadow-sm'
                : 'bg-white text-cool-steel-600 border border-cool-steel-200 hover:border-cool-steel-300 hover:bg-cool-steel-50'
            }`}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}