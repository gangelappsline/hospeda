import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Compass,
  Check,
} from 'lucide-react'
import { getExperiences } from '@/api/experiences'
import type { Experience } from '@/types/experience'
import ExperienceRow from '@/components/admin/experiences/ExperienceRow'
import ExperienceModal from '@/components/admin/experiences/ExperienceModal'
import DeleteExperienceModal from '@/components/admin/experiences/DeleteExperienceModal'

export default function ExperienceList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null)
  const [search, setSearch] = useState('')

  const { data: experiences = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['experiences'],
    queryFn: getExperiences,
  })

  const filteredExperiences = useMemo(() => {
    if (!search.trim()) return experiences
    const term = search.toLowerCase()
    return experiences.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        (e.category?.name ?? '').toLowerCase().includes(term)
    )
  }, [experiences, search])

  const activeCount = experiences.filter((e) => e.active).length

  const handleCreate = () => {
    setEditingExperience(null)
    setIsModalOpen(true)
  }

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience)
    setIsModalOpen(true)
  }

  const handleDelete = (experience: Experience) => {
    setDeletingExperience(experience)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/experiences" className="hover:text-gray-700">
          Experiencias
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Lista</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Experiencias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las experiencias disponibles para los huéspedes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin text-orange-500' : ''}
            />
            Refrescar
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Nueva experiencia
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center">
            <Compass size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Catálogo de experiencias
            </p>
            <p className="text-xs text-gray-500">
              {experiences.length}{' '}
              {experiences.length === 1
                ? 'experiencia registrada'
                : 'experiencias registradas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold text-orange-600">
            {activeCount} activas
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Buscador */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar experiencia..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Compass size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search
                ? 'Sin resultados'
                : 'Aún no hay experiencias registradas'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron experiencias que coincidan con "${search}".`
                : 'Crea tu primera experiencia para ofrecer actividades a los huéspedes.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primera experiencia
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Experiencia
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExperiences.map((experience) => (
                  <ExperienceRow
                    key={experience.id}
                    experience={experience}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        experience={editingExperience}
      />
      <DeleteExperienceModal
        isOpen={!!deletingExperience}
        onClose={() => setDeletingExperience(null)}
        experience={deletingExperience}
      />
    </div>
  )
}
