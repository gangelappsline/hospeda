import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { Home as HomeIcon } from 'lucide-react'
import LandingNavbar from '@/components/landing/LandingNavbar'
import Hero from '@/components/landing/Hero'
import HeroSearchResults from '@/components/landing/HeroSearchResults'
import FeaturedStays from '@/components/landing/FeaturedStays'
import Features from '@/components/landing/Features'
import HostCTA from '@/components/landing/HostCTA'
import {
  createEmptyDraft,
  draftToFilters,
  filtersToQueryString,
  hasActiveSearch,
  type HomeSearchDraft,
} from '@/utils/homeSearch'
import type { LodgingSearchFilters } from '@/types/public'

interface AppliedSearch {
  filters: LodgingSearchFilters
  /** Copia del formulario al momento de buscar (para los chips). */
  draft: HomeSearchDraft
}

export default function Home() {
  const [draft, setDraft] = useState<HomeSearchDraft>(createEmptyDraft)
  const [applied, setApplied] = useState<AppliedSearch | null>(null)

  // Los resultados se consultan en la misma página (sin navegar).
  const isSearching = useIsFetching({ queryKey: ['search-lodgings'] }) > 0

  const handleChange = useCallback((updates: Partial<HomeSearchDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = useCallback(() => {
    setApplied({ filters: draftToFilters(draft), draft })
  }, [draft])

  /** Búsqueda inmediata (chips de destinos populares). */
  const handleQuickSearch = useCallback(
    (destination: string) => {
      const next = { ...draft, destination }
      setDraft(next)
      setApplied({ filters: draftToFilters(next), draft: next })
    },
    [draft]
  )

  const handleClear = useCallback(() => {
    setDraft(createEmptyDraft())
    setApplied(null)
  }, [])

  // Lleva al usuario a los resultados después de buscar.
  useEffect(() => {
    if (!applied) return
    const timer = window.setTimeout(() => {
      document
        .getElementById('resultados')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [applied])

  // Parámetros que se comparten con /alojamientos desde "Ver todas".
  const seeAllQuery = useMemo(() => {
    if (applied) return filtersToQueryString(applied.filters)
    return hasActiveSearch(draft)
      ? filtersToQueryString(draftToFilters(draft))
      : ''
  }, [applied, draft])

  return (
    <div className="min-h-screen bg-parchment-50">
      <LandingNavbar />

      <main>
        <Hero
          draft={draft}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onQuickSearch={handleQuickSearch}
          onClear={handleClear}
          isSearching={isSearching}
        />

        {applied && (
          <HeroSearchResults
            filters={applied.filters}
            draft={applied.draft}
            onClear={handleClear}
          />
        )}

        <FeaturedStays seeAllQuery={seeAllQuery} />
        <Features />
        <HostCTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-cool-steel-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-vivid-tangerine-500">
              <HomeIcon size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-cool-steel-900">Hospeda</span>
          </div>
          <p className="text-sm text-cool-steel-400">
            © 2026 Hospeda. Hecho en México.
          </p>
        </div>
      </footer>
    </div>
  )
}
