import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  Plus,
  ChevronRight,
  Search,
  MapPin,
  RefreshCw,
  Info,
} from 'lucide-react'
import { getCountries } from '@/api/countries'
import { getStatesByCountry } from '@/api/states'
import { getCitiesByState } from '@/api/cities'
import { getSettlementsByCity } from '@/api/settlements'
import type { Settlement } from '@/types/settlement'
import SettlementRow from '@/components/admin/settlements/SettlementRow'
import SettlementModal from '@/components/admin/settlements/SettlementModal'
import DeleteSettlementModal from '@/components/admin/settlements/DeleteSettlementModal'

export default function Settlements() {
  // Estado de filtros en cascada
  const [countryId, setCountryId] = useState<number | null>(null)
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)

  // Búsqueda local
  const [search, setSearch] = useState('')

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null)
  const [deletingSettlement, setDeletingSettlement] = useState<Settlement | null>(null)

  // Países
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 5 * 60 * 1000,
  })

  // Estados (dependen del país)
  const { data: states = [], isFetching: loadingStates } = useQuery({
    queryKey: ['states', countryId],
    queryFn: () => getStatesByCountry(countryId!),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
  })

  // Ciudades (dependen del estado)
  const { data: cities = [], isFetching: loadingCities } = useQuery({
    queryKey: ['cities', stateId],
    queryFn: () => getCitiesByState(stateId!),
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
  })

  // Colonias (dependen de la ciudad)
  const {
    data: settlements = [],
    isLoading: loadingSettlements,
    isFetching: fetchingSettlements,
    refetch,
  } = useQuery({
    queryKey: ['settlements', cityId],
    queryFn: () => getSettlementsByCity(cityId!),
    enabled: !!cityId,
  })

  // Resetear dependencias al cambiar el padre
  useEffect(() => {
    setStateId(null)
    setCityId(null)
  }, [countryId])

  useEffect(() => {
    setCityId(null)
  }, [stateId])

  // Limpiar búsqueda al cambiar ciudad
  useEffect(() => {
    setSearch('')
  }, [cityId])

  // Filtrado local por búsqueda
  const filteredSettlements = useMemo(() => {
    if (!search.trim()) return settlements
    const term = search.toLowerCase()
    return settlements.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.zip_code.includes(term)
    )
  }, [settlements, search])

  // Nombres seleccionados para mostrar
  const selectedCountry = countries.find((c) => c.id === countryId)
  const selectedState = states.find((s) => s.id === stateId)
  const selectedCity = cities.find((c) => c.id === cityId)

  // ¿Está completa la selección en cascada?
  const canCreate = !!(countryId && stateId && cityId)

  const handleCreate = () => {
    if (!canCreate) return
    setEditingSettlement(null)
    setIsModalOpen(true)
  }

  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement)
    setIsModalOpen(true)
  }

  const handleDelete = (settlement: Settlement) => {
    setDeletingSettlement(settlement)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/admin/settings" className="hover:text-gray-700">
          Configuración
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Colonias</span>
      </nav>

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colonias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las colonias donde se encuentran tus alojamientos.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={!canCreate}
          title={
            !canCreate
              ? 'Selecciona país, estado y ciudad primero'
              : 'Crear nueva colonia'
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Nueva colonia
        </button>
      </div>

      {/* Banner del catálogo */}
      <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/50 px-5 py-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center">
            <MapPin size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Catálogo de colonias
            </p>
            <p className="text-xs text-gray-500">
              {cityId
                ? `${settlements.length} ${
                    settlements.length === 1
                      ? 'registro encontrado'
                      : 'registros encontrados'
                  }`
                : 'Selecciona una ubicación para ver colonias'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Los campos con <span className="text-orange-500">*</span> son obligatorios
        </p>
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Search size={13} />
            Filtros de ubicación
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* País */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                País
              </label>
              <select
                value={countryId ?? ''}
                onChange={(e) =>
                  setCountryId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Todos los países</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Estado
              </label>
              <select
                value={stateId ?? ''}
                onChange={(e) =>
                  setStateId(e.target.value ? Number(e.target.value) : null)
                }
                disabled={!countryId || loadingStates}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingStates ? 'Cargando...' : 'Todos los estados'}
                </option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Ciudad
              </label>
              <select
                value={cityId ?? ''}
                onChange={(e) =>
                  setCityId(e.target.value ? Number(e.target.value) : null)
                }
                disabled={!stateId || loadingCities}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCities ? 'Cargando...' : 'Todas las ciudades'}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje de ayuda si faltan filtros */}
          {!canCreate && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3.5 py-2.5">
              <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Selecciona país, estado y ciudad para poder agregar nuevas colonias.
              </p>
            </div>
          )}

          {/* Buscador + Refrescar (solo si hay ciudad seleccionada) */}
          {cityId && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar colonia o código postal..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <button
                onClick={() => refetch()}
                disabled={fetchingSettlements}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={fetchingSettlements ? 'animate-spin text-orange-500' : ''}
                />
                Refrescar
              </button>
            </div>
          )}
        </div>

        {/* Tabla */}
        {!cityId ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <MapPin size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Selecciona una ubicación
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Elige un país, estado y ciudad para consultar las colonias disponibles.
            </p>
          </div>
        ) : loadingSettlements ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredSettlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <MapPin size={22} className="text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search
                ? 'No hay colonias que coincidan con los filtros seleccionados.'
                : 'No hay colonias registradas en esta ciudad.'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              {search
                ? `No se encontraron resultados para "${search}".`
                : 'Crea la primera colonia para esta ciudad.'}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Crear primera colonia
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Colonia
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Código postal
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ciudad
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettlements.map((settlement) => (
                    <SettlementRow
                      key={settlement.id}
                      settlement={settlement}
                      country={selectedCountry?.name}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer con contador */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Mostrando {filteredSettlements.length}{' '}
                {filteredSettlements.length === 1 ? 'registro' : 'registros'}
                {search && settlements.length !== filteredSettlements.length && (
                  <> de {settlements.length}</>
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <SettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settlement={editingSettlement}
        cityId={cityId!}
        stateId={stateId!}
        countryName={selectedCountry?.name}
        stateName={selectedState?.name}
        cityName={selectedCity?.name}
      />
      <DeleteSettlementModal
        isOpen={!!deletingSettlement}
        onClose={() => setDeletingSettlement(null)}
        settlement={deletingSettlement}
        cityId={cityId!}
      />
    </div>
  )
}