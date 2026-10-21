import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Compass,
  CheckCircle2,
  Upload,
  Trash2,
} from 'lucide-react'
import {
  getHostLodging,
  createHostLodging,
  updateHostLodging,
} from '@/api/host'
import { getLodgingTypes } from '@/api/lodgingTypes'
import { getAmenities } from '@/api/amenities'
import { createArrivalInstruction } from '@/api/arrivalInstructions'
import type { LodgingStatus } from '@/types/hostLodgings'
import type { StagedArrivalInstruction } from '@/types/arrivalInstruction'
import ArrivalInstructionsStep from '@/components/host/arrival-instructions/ArrivalInstructionsStep'

const LODGING_STEPS = [
  { id: 1, label: 'Información básica', short: 'Básicos' },
  { id: 2, label: 'Ubicación', short: 'Ubicación' },
  { id: 3, label: 'Capacidad y espacios', short: 'Capacidad' },
  { id: 4, label: 'Tarifas y precios', short: 'Precios' },
  { id: 5, label: 'Fotos y amenidades', short: 'Fotos' },
  { id: 6, label: 'Instrucciones de llegada', short: 'Llegada' }, // Paso extra antes del último
  { id: 7, label: 'Confirmación y publicación', short: 'Confirmar' }, // Último paso
] as const

interface FormState {
  title: string
  description: string
  type_id: number | null
  lodging_scope: 'entire_place' | 'private_room' | 'shared_room'
  // Ubicación
  street: string
  city: string
  state: string
  country: string
  zip_code: string
  // Capacidad
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  // Precios
  base_price: string
  cleaning_fee: string
  service_fee: string
  security_deposit: string
  // Estado
  status: LodgingStatus
  // Amenidades seleccionadas (IDs)
  amenity_ids: number[]
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  type_id: null,
  lodging_scope: 'entire_place',
  street: '',
  city: '',
  state: '',
  country: 'México',
  zip_code: '',
  capacity: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  base_price: '',
  cleaning_fee: '0',
  service_fee: '0',
  security_deposit: '0',
  status: 'published',
  amenity_ids: [],
}

interface Props {
  initialStep?: number
}

export default function LodgingForm({ initialStep }: Props) {
  const { id } = useParams<{ id: string }>()
  const lodgingId = id ? Number(id) : null
  const isEditing = !!lodgingId
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlStep = Number(searchParams.get('step')) || initialStep || 1
  const [step, setStep] = useState<number>(urlStep >= 1 && urlStep <= 7 ? urlStep : 1)

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fotos locales
  const [localPhotos, setLocalPhotos] = useState<Array<{ file: File; preview: string; cover: boolean }>>([])
  const [existingPhotos, setExistingPhotos] = useState<Array<{ id: number; photo: string; thumbnail: string; cover: number }>>([])

  // Instrucciones locales staged (para creación)
  const [stagedInstructions, setStagedInstructions] = useState<StagedArrivalInstruction[]>([])

  // Cargar catálogo de tipos de alojamiento y amenidades
  const { data: lodgingTypes = [] } = useQuery({
    queryKey: ['lodging-types'],
    queryFn: getLodgingTypes,
  })

  const { data: amenitiesList = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  })

  // Cargar datos del alojamiento si es edición
  const { data: existingLodging, isLoading: isLoadingLodging } = useQuery({
    queryKey: ['host-lodgings', lodgingId],
    queryFn: () => getHostLodging(lodgingId!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (existingLodging) {
      setForm({
        title: existingLodging.title || '',
        description: existingLodging.description || '',
        type_id: existingLodging.type?.id || null,
        lodging_scope: existingLodging.lodging_scope || 'entire_place',
        street: existingLodging.address?.street || '',
        city: existingLodging.address?.city || '',
        state: existingLodging.address?.state || '',
        country: existingLodging.address?.country || 'México',
        zip_code: existingLodging.address?.zip_code || '',
        capacity: existingLodging.guests || 2,
        bedrooms: existingLodging.bedrooms || 1,
        beds: existingLodging.beds || 1,
        bathrooms: existingLodging.bathrooms || 1,
        base_price: String(existingLodging.base_price || ''),
        cleaning_fee: String(existingLodging.cleaning_fee || '0'),
        service_fee: String(existingLodging.service_fee || '0'),
        security_deposit: String(existingLodging.security_deposit || '0'),
        status: existingLodging.status || 'published',
        amenity_ids: [],
      })
      setExistingPhotos(existingLodging.photos || [])
    }
  }, [existingLodging])

  // Sincronizar step con URL
  const changeStep = (newStep: number) => {
    setStep(newStep)
    setSearchParams({ step: String(newStep) }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Validación de cada paso
  const validateCurrentStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!form.title.trim()) newErrors.title = 'El título del alojamiento es requerido'
      if (!form.description.trim()) newErrors.description = 'La descripción es requerida'
      if (!form.type_id) newErrors.type_id = 'Selecciona un tipo de propiedad'
    } else if (stepNumber === 2) {
      if (!form.city.trim()) newErrors.city = 'La ciudad es requerida'
      if (!form.country.trim()) newErrors.country = 'El país es requerido'
    } else if (stepNumber === 3) {
      if (form.capacity <= 0) newErrors.capacity = 'Al menos 1 huésped'
      if (form.beds <= 0) newErrors.beds = 'Al menos 1 cama'
      if (form.bathrooms <= 0) newErrors.bathrooms = 'Al menos 1 baño'
    } else if (stepNumber === 4) {
      if (!form.base_price || Number(form.base_price) <= 0) {
        newErrors.base_price = 'Ingresa un precio base por noche válido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep(step)) {
      changeStep(Math.min(step + 1, LODGING_STEPS.length))
    } else {
      toast.error('Campos obligatorios incompletos', {
        description: 'Revisa los campos requeridos antes de continuar.',
      })
    }
  }

  const handlePrev = () => {
    changeStep(Math.max(step - 1, 1))
  }

  // Subida de fotos local
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPhotos = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      cover: localPhotos.length === 0 && existingPhotos.length === 0 && idx === 0,
    }))
    setLocalPhotos((prev) => [...prev, ...newPhotos])
  }

  const handleRemoveLocalPhoto = (index: number) => {
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Alternar amenidad
  const toggleAmenity = (amenityId: number) => {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter((id) => id !== amenityId)
        : [...prev.amenity_ids, amenityId],
    }))
  }

  // Mutación para guardar el alojamiento
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        type_id: form.type_id,
        lodging_scope: form.lodging_scope,
        capacity: form.capacity,
        bedrooms: form.bedrooms,
        beds: form.beds,
        bathrooms: form.bathrooms,
        base_price: Number(form.base_price),
        cleaning_fee: Number(form.cleaning_fee) || 0,
        service_fee: Number(form.service_fee) || 0,
        security_deposit: Number(form.security_deposit) || 0,
        status: form.status,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          zip_code: form.zip_code,
        },
        amenities: form.amenity_ids,
      }

      let savedId = lodgingId

      if (isEditing) {
        await updateHostLodging(lodgingId!, payload)
      } else {
        const created = await createHostLodging(payload)
        savedId = created.id
      }

      // Si teníamos instrucciones de llegada staged (creación de nuevo alojamiento),
      // guardarlas en la API para el alojamiento creado
      if (!isEditing && savedId && stagedInstructions.length > 0) {
        for (const inst of stagedInstructions) {
          try {
            await createArrivalInstruction(savedId, {
              title: inst.title,
              description: inst.description,
              photo: inst.photoFile,
              order: inst.order,
            })
          } catch (e) {
            console.error('Error guardando instrucción de llegada:', e)
          }
        }
      }

      return savedId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-lodgings'] })
      toast.success(
        isEditing ? 'Alojamiento actualizado con éxito' : 'Alojamiento creado con éxito',
        {
          description:
            form.status === 'published'
            ? 'Tu propiedad ya está disponible para recibir reservaciones.'
            : 'Tu propiedad ha sido guardada en estado borrador.',
        }
      )
      navigate('/host/lodgings')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      toast.error('Error al guardar el alojamiento', {
        description: msg,
      })
    },
  })

  const progress = useMemo(() => (step / LODGING_STEPS.length) * 100, [step])

  if (isEditing && isLoadingLodging) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-vivid-tangerine-500 mb-3" />
        <p className="text-sm text-cool-steel-600">Cargando datos del alojamiento...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Barra superior de navegación */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/host/lodgings"
          className="inline-flex items-center gap-2 text-sm font-medium text-cool-steel-600 hover:text-cool-steel-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a mis alojamientos
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cool-steel-100 text-cool-steel-700">
          Paso {step} de {LODGING_STEPS.length}
        </span>
      </div>

      {/* Título de la página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cool-steel-900">
          {isEditing ? `Editar: ${form.title || 'Alojamiento'}` : 'Crear nuevo alojamiento'}
        </h1>
        <p className="text-sm text-cool-steel-500 mt-1">
          Completa los datos de la propiedad para publicar tu espacio y recibir huéspedes.
        </p>
      </div>

      {/* Indicador de pasos visual */}
      <div className="bg-white rounded-2xl border border-cool-steel-200 p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
          {LODGING_STEPS.map((s, i) => {
            const isCompleted = step > s.id
            const isCurrent = step === s.id
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-[70px] last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id < step || validateCurrentStep(step)) {
                      changeStep(s.id)
                    }
                  }}
                  className="flex flex-col items-center group w-full focus:outline-none"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-pacific-blue-500 text-white shadow-sm'
                        : isCurrent
                          ? 'bg-vivid-tangerine-500 text-white ring-4 ring-vivid-tangerine-100'
                          : 'bg-cool-steel-100 text-cool-steel-400 group-hover:bg-cool-steel-200'
                    }`}
                  >
                    {isCompleted ? <Check size={16} /> : s.id}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium whitespace-nowrap text-center ${
                      isCurrent
                        ? 'text-vivid-tangerine-600 font-semibold'
                        : isCompleted
                          ? 'text-pacific-blue-600'
                          : 'text-cool-steel-400'
                    }`}
                  >
                    {s.short}
                  </span>
                </button>
                {i < LODGING_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mb-4 rounded transition-colors ${
                      step > s.id ? 'bg-pacific-blue-300' : 'bg-cool-steel-100'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Barra de progreso */}
        <div className="mt-2 h-1.5 rounded-full bg-cool-steel-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vivid-tangerine-400 to-vivid-tangerine-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Contenedor del paso activo */}
      <div className="bg-white rounded-2xl border border-cool-steel-200 p-6 sm:p-8 shadow-sm">
        {/* ============================================================ */}
        {/* PASO 1: DATOS BÁSICOS */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <Building2 size={20} className="text-vivid-tangerine-500" />
                Información básica
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Dale un nombre atractivo y describe las cualidades únicas de tu espacio.
              </p>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Título del alojamiento <span className="text-vivid-tangerine-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Cabaña acogedora frente al lago con chimenea"
                className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.title}</p>}
            </div>

            {/* Tipo de alojamiento y alcance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Tipo de propiedad <span className="text-vivid-tangerine-500">*</span>
                </label>
                <select
                  value={form.type_id || ''}
                  onChange={(e) => setForm({ ...form, type_id: Number(e.target.value) || null })}
                  className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors bg-white focus:outline-none focus:ring-2 ${
                    errors.type_id
                      ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  }`}
                >
                  <option value="">Selecciona el tipo</option>
                  {lodgingTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.type_id && <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.type_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Alcance del alojamiento
                </label>
                <select
                  value={form.lodging_scope}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lodging_scope: e.target.value as FormState['lodging_scope'],
                    })
                  }
                  className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm transition-colors bg-white focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                >
                  <option value="entire_place">Alojamiento entero</option>
                  <option value="private_room">Habitación privada</option>
                  <option value="shared_room">Habitación compartida</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Descripción detallada <span className="text-vivid-tangerine-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe tu espacio, el ambiente, qué incluye y qué lo hace especial..."
                rows={5}
                className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors resize-none focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.description}</p>}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 2: UBICACIÓN */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <MapPin size={20} className="text-vivid-tangerine-500" />
                Ubicación del alojamiento
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Indica dónde está situado tu espacio para que los viajeros puedan encontrarlo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                Calle y número exterior / interior
              </label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="Ej. Av. Francisco I. Madero 450, Int. 3B"
                className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Ciudad o municipio <span className="text-vivid-tangerine-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Ej. Cancún, Guadalajara, Tulum..."
                  className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.city
                      ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                      : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  }`}
                />
                {errors.city && <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Estado o provincia
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Ej. Quintana Roo, Jalisco..."
                  className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  País <span className="text-vivid-tangerine-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="México"
                  className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Código postal
                </label>
                <input
                  type="text"
                  value={form.zip_code}
                  onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                  placeholder="Ej. 77500"
                  className="w-full rounded-lg border border-cool-steel-300 py-2.5 px-3.5 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 3: CAPACIDAD Y ESPACIOS */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <Users size={20} className="text-vivid-tangerine-500" />
                Capacidad y distribución
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Especifica cuántos huéspedes caben cómodamente y cuántos espacios tiene tu propiedad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Huéspedes */}
              <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-cool-steel-900">Huéspedes máximos</p>
                  <p className="text-xs text-cool-steel-500">Capacidad total</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, capacity: Math.max(1, form.capacity - 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-cool-steel-900">{form.capacity}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, capacity: form.capacity + 1 })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Recámaras */}
              <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-cool-steel-900">Recámaras</p>
                  <p className="text-xs text-cool-steel-500">Habitaciones privadas</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bedrooms: Math.max(0, form.bedrooms - 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-cool-steel-900">{form.bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bedrooms: form.bedrooms + 1 })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Camas */}
              <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-cool-steel-900">Camas</p>
                  <p className="text-xs text-cool-steel-500">Total de camas</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, beds: Math.max(1, form.beds - 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-cool-steel-900">{form.beds}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, beds: form.beds + 1 })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Baños */}
              <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-cool-steel-900">Baños</p>
                  <p className="text-xs text-cool-steel-500">Completos o medios baños</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bathrooms: Math.max(1, form.bathrooms - 1) })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-cool-steel-900">{form.bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bathrooms: form.bathrooms + 1 })}
                    className="w-8 h-8 rounded-lg bg-white border border-cool-steel-300 text-cool-steel-700 font-bold hover:bg-cool-steel-50 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 4: TARIFAS Y PRECIOS */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <DollarSign size={20} className="text-vivid-tangerine-500" />
                Tarifas y precios
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Establece el precio base por noche y los cargos adicionales del alojamiento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio base */}
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Precio por noche (MXN) <span className="text-vivid-tangerine-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cool-steel-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    placeholder="1500.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.base_price
                        ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                        : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                    }`}
                  />
                </div>
                {errors.base_price && (
                  <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.base_price}</p>
                )}
              </div>

              {/* Tarifa de limpieza */}
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Tarifa de limpieza (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cool-steel-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cleaning_fee}
                    onChange={(e) => setForm({ ...form, cleaning_fee: e.target.value })}
                    placeholder="300.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-cool-steel-300 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                  />
                </div>
              </div>

              {/* Tarifa de servicio */}
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Tarifa de servicio (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cool-steel-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.service_fee}
                    onChange={(e) => setForm({ ...form, service_fee: e.target.value })}
                    placeholder="150.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-cool-steel-300 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                  />
                </div>
              </div>

              {/* Depósito de seguridad */}
              <div>
                <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
                  Depósito de seguridad (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cool-steel-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.security_deposit}
                    onChange={(e) => setForm({ ...form, security_deposit: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-cool-steel-300 text-sm transition-colors focus:border-vivid-tangerine-500 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 5: FOTOS Y AMENIDADES */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <ImageIcon size={20} className="text-vivid-tangerine-500" />
                Fotos y amenidades
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Muestra fotografías de calidad y selecciona los servicios que ofreces a tus huéspedes.
              </p>
            </div>

            {/* Subida de fotos */}
            <div>
              <label className="block text-sm font-medium text-cool-steel-700 mb-2">
                Fotos del alojamiento
              </label>
              <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors border-cool-steel-200 hover:border-vivid-tangerine-300 hover:bg-vivid-tangerine-50/20 group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-vivid-tangerine-50 text-vivid-tangerine-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-semibold text-cool-steel-900">
                  Haz clic para subir fotos o arrástralas aquí
                </p>
                <p className="text-xs text-cool-steel-400 mt-1">
                  Formatos recomendados: JPG, PNG o WebP.
                </p>
              </label>

              {/* Grid de previsualización */}
              {(localPhotos.length > 0 || existingPhotos.length > 0) && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-video rounded-lg overflow-hidden border border-cool-steel-200 group bg-cool-steel-100"
                    >
                      <img
                        src={photo.thumbnail || photo.photo}
                        alt="Foto existente"
                        className="w-full h-full object-cover"
                      />
                      {photo.cover === 1 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-vivid-tangerine-500 text-white">
                          Portada
                        </span>
                      )}
                    </div>
                  ))}

                  {localPhotos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden border border-cool-steel-200 group bg-cool-steel-100"
                    >
                      <img
                        src={p.preview}
                        alt="Foto nueva"
                        className="w-full h-full object-cover"
                      />
                      {p.cover && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-vivid-tangerine-500 text-white">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocalPhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-vivid-tangerine-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Quitar foto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenidades */}
            <div className="pt-4 border-t border-cool-steel-100">
              <label className="block text-sm font-medium text-cool-steel-700 mb-2">
                Amenidades disponibles
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {amenitiesList.map((amenity) => {
                  const isChecked = form.amenity_ids.includes(amenity.id)
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                        isChecked
                          ? 'border-pacific-blue-500 bg-pacific-blue-50/50 text-pacific-blue-900 font-medium'
                          : 'border-cool-steel-200 hover:border-cool-steel-300 text-cool-steel-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 ${
                          isChecked
                            ? 'bg-pacific-blue-500 text-white'
                            : 'border border-cool-steel-300'
                        }`}
                      >
                        {isChecked && <Check size={12} />}
                      </div>
                      <span className="text-xs truncate">{amenity.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 6: INSTRUCCIONES DE LLEGADA (EL PASO EXTRA ANTES DEL ÚLTIMO) */}
        {/* ============================================================ */}
        {step === 6 && (
          <ArrivalInstructionsStep
            lodgingId={lodgingId}
            stagedInstructions={stagedInstructions}
            onStagedInstructionsChange={setStagedInstructions}
          />
        )}

        {/* ============================================================ */}
        {/* PASO 7: CONFIRMACIÓN Y PUBLICACIÓN (EL ÚLTIMO PASO) */}
        {/* ============================================================ */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="border-b border-cool-steel-100 pb-4">
              <h2 className="text-lg font-bold text-cool-steel-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-pacific-blue-500" />
                Revisión y confirmación
              </h2>
              <p className="text-sm text-cool-steel-500 mt-0.5">
                Revisa todos los datos antes de guardar o publicar tu alojamiento.
              </p>
            </div>

            {/* Resumen en tarjeta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda: Información general */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 space-y-3">
                  <h3 className="text-sm font-bold text-cool-steel-900 flex items-center justify-between">
                    <span>Propiedad</span>
                    <button
                      type="button"
                      onClick={() => changeStep(1)}
                      className="text-xs text-vivid-tangerine-600 hover:underline font-normal"
                    >
                      Editar
                    </button>
                  </h3>
                  <div>
                    <p className="text-base font-bold text-cool-steel-900">{form.title || 'Sin título'}</p>
                    <p className="text-xs text-cool-steel-500 line-clamp-2 mt-1">{form.description}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-cool-steel-200/60 text-xs text-cool-steel-600">
                    <MapPin size={13} className="text-cool-steel-400" />
                    <span>
                      {form.city}, {form.state} {form.country}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-cool-steel-200 bg-cool-steel-50/50 space-y-2">
                  <h3 className="text-sm font-bold text-cool-steel-900 flex items-center justify-between">
                    <span>Capacidad y precios</span>
                    <button
                      type="button"
                      onClick={() => changeStep(3)}
                      className="text-xs text-vivid-tangerine-600 hover:underline font-normal"
                    >
                      Editar
                    </button>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-cool-steel-700">
                    <div>
                      <span className="text-cool-steel-500">Huéspedes:</span> {form.capacity}
                    </div>
                    <div>
                      <span className="text-cool-steel-500">Recámaras:</span> {form.bedrooms}
                    </div>
                    <div>
                      <span className="text-cool-steel-500">Camas:</span> {form.beds}
                    </div>
                    <div>
                      <span className="text-cool-steel-500">Baños:</span> {form.bathrooms}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cool-steel-200/60 flex items-center justify-between text-sm">
                    <span className="text-cool-steel-600">Precio base:</span>
                    <span className="font-bold text-cool-steel-900">
                      ${Number(form.base_price || 0).toLocaleString('es-MX')} MXN/noche
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Resumen de instrucciones de llegada */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-pacific-blue-200 bg-pacific-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-pacific-blue-900 flex items-center gap-1.5">
                      <Compass size={16} className="text-pacific-blue-600" />
                      Instrucciones de llegada
                    </h3>
                    <button
                      type="button"
                      onClick={() => changeStep(6)}
                      className="text-xs text-pacific-blue-700 hover:underline font-medium"
                    >
                      Configurar
                    </button>
                  </div>

                  {/* Número de instrucciones */}
                  <div className="text-xs text-pacific-blue-800">
                    {isEditing ? (
                      <p>
                        Instrucciones sincronizadas con la API para los huéspedes de esta propiedad.
                      </p>
                    ) : (
                      <p>
                        {stagedInstructions.length}{' '}
                        {stagedInstructions.length === 1
                          ? 'instrucción configurada'
                          : 'instrucciones configuradas'}{' '}
                        para agregarse al guardar.
                      </p>
                    )}
                  </div>

                  {/* Lista previa rápida */}
                  {!isEditing && stagedInstructions.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {stagedInstructions.map((inst, idx) => (
                        <div
                          key={inst.tempId}
                          className="bg-white p-2 rounded-lg border border-pacific-blue-100 flex items-center gap-2 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-pacific-blue-100 text-pacific-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-cool-steel-900 truncate flex-1">
                            {inst.title}
                          </span>
                          {inst.photoFile && (
                            <span className="text-[10px] text-pacific-blue-600 bg-pacific-blue-50 px-1.5 py-0.5 rounded">
                              Con foto
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isEditing && stagedInstructions.length === 0 && (
                    <p className="text-xs text-cool-steel-500 italic">
                      No agregaste instrucciones de llegada. Podrás añadirlas en cualquier momento desde este paso o editando la propiedad.
                    </p>
                  )}
                </div>

                {/* Selección de estado de publicación */}
                <div className="p-4 rounded-xl border border-cool-steel-200 bg-white space-y-3">
                  <h3 className="text-sm font-bold text-cool-steel-900">
                    Estado de publicación
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: 'published' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.status === 'published'
                          ? 'border-pacific-blue-500 bg-pacific-blue-50/50 text-pacific-blue-900 font-semibold ring-2 ring-pacific-blue-100'
                          : 'border-cool-steel-200 hover:border-cool-steel-300 text-cool-steel-700'
                      }`}
                    >
                      <span className="text-xs block font-bold">Publicado</span>
                      <span className="text-[11px] text-cool-steel-500 font-normal">
                        Visible para reservas
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: 'draft' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.status === 'draft'
                          ? 'border-vivid-tangerine-500 bg-vivid-tangerine-50/50 text-vivid-tangerine-900 font-semibold ring-2 ring-vivid-tangerine-100'
                          : 'border-cool-steel-200 hover:border-cool-steel-300 text-cool-steel-700'
                      }`}
                    >
                      <span className="text-xs block font-bold">Borrador</span>
                      <span className="text-[11px] text-cool-steel-500 font-normal">
                        Solo visible para ti
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* BOTONES INFERIORES DE NAVEGACIÓN */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-cool-steel-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || saveMutation.isPending}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              step === 1
                ? 'opacity-0 pointer-events-none'
                : 'text-cool-steel-700 hover:bg-cool-steel-100'
            }`}
          >
            <ArrowLeft size={16} />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            {step < LODGING_STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors shadow-sm"
              >
                Siguiente
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-semibold text-white hover:bg-vivid-tangerine-600 transition-colors shadow-md disabled:opacity-60"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {isEditing ? 'Guardar cambios' : 'Finalizar y publicar'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
