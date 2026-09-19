import type { StayCategory } from '@/types/public'

interface Props {
  active: StayCategory
  onChange: (category: StayCategory) => void
}

const CATEGORIES: { value: StayCategory; label: string }[] = [
  { value: 'all', label: 'Frente al mar' },
  { value: 'cabins', label: 'Cabañas' },
  { value: 'incredible', label: 'Albercas increíbles' },
  { value: 'design', label: 'Diseño' },
  { value: 'city', label: 'Ciudad' },
  { value: 'haciendas', label: 'Haciendas' },
  { value: 'views', label: 'Vistas panorámicas' },
  { value: 'pets', label: 'Mascotas bienvenidas' },
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
                ? 'bg-[#1a2740] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}