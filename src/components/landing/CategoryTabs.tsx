import { usePublicLodgingCategories } from '@/hooks/usePublicCategories'
import Skeleton from '@/components/ui/Skeleton'
import type { PublicCategory, StayCategory } from '@/types/public'

interface Props {
  active: StayCategory
  onChange: (category: StayCategory, categoryObj?: PublicCategory | null) => void
}

export default function CategoryTabs({ active, onChange }: Props) {
  const { data: categories = [], isLoading } = usePublicLodgingCategories()

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
      <button
        type="button"
        onClick={() => onChange('all', null)}
        className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer ${
          active === 'all'
            ? 'bg-cool-steel-900 text-white shadow-sm'
            : 'bg-white text-cool-steel-600 border border-cool-steel-200 hover:border-cool-steel-300 hover:bg-cool-steel-50'
        }`}
      >
        Todos
      </button>

      {isLoading &&
        Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`cat-skeleton-${index}`}
            className="h-9 w-24 rounded-full shrink-0"
          />
        ))}

      {!isLoading &&
        categories.map((category) => {
          const isActive = active === category.name
          return (
            <button
              key={category.id || category.name}
              type="button"
              title={category.description ?? undefined}
              onClick={() => onChange(category.name, category)}
              className={`relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cool-steel-900 text-white shadow-sm'
                  : 'bg-white text-cool-steel-600 border border-cool-steel-200 hover:border-cool-steel-300 hover:bg-cool-steel-50'
              }`}
            >
              {category.icon_url && (
                <img
                  src={category.icon_url}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className={`w-4 h-4 object-contain shrink-0 ${
                    isActive ? 'brightness-0 invert' : ''
                  }`}
                />
              )}
              <span>{category.name}</span>
            </button>
          )
        })}
    </div>
  )
}
