import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Upload, Check, Loader2 } from 'lucide-react'
import { createService, updateService } from '@/api/services'
import { getServiceCategories } from '@/api/serviceCategories'
import type { Service, ServicePayload } from '@/types/service'

interface Props {
  isOpen: boolean
  onClose: () => void
  service?: Service | null
}

export default function ServiceModal({ isOpen, onClose, service }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!service

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [active, setActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    queryFn: getServiceCategories,
  })

  useEffect(() => {
    if (isOpen) {
      setName(service?.name || '')
      setDescription(service?.description || '')
      setPrice(service ? String(service.price) : '')
      setCategoryId(service?.category_id ?? null)
      setActive(service?.active ?? true)
      setImage(null)
      setImagePreview(service?.image_url || null)
      setErrors({})
    }
  }, [isOpen, service])

  const mutation = useMutation({
    mutationFn: (payload: ServicePayload) =>
      isEditing
        ? updateService(service!.id, payload)
        : createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success(
        isEditing ? 'Servicio actualizado' : 'Servicio creado',
        {
          description: isEditing
            ? 'Los cambios se guardaron correctamente.'
            : 'El nuevo servicio se agregó al catálogo.',
        }
      )
      onClose()
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]: any) => {
          fieldErrors[key] = messages[0]
        })
        setErrors(fieldErrors)
        toast.error('Datos incompletos', {
          description: 'Verifique los campos marcados en rojo.',
        })
      } else {
        toast.error('Error al guardar', {
          description: error.message || 'Intente nuevamente.',
        })
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'La imagen no debe superar 5 MB.',
      })
      return
    }

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, image: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!price || Number(price) <= 0) newErrors.price = 'El precio debe ser mayor a 0'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      category_id: categoryId,
      image: image ?? undefined,
      active,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              La información se reflejará en el catálogo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Traslado al aeropuerto"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente este servicio..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 py-2.5 px-3.5 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio (MXN) <span className="text-orange-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.price
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría
            </label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 py-2.5 px-3.5 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Imagen
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
            >
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={20} className="text-orange-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {image ? image.name : 'Haz clic para seleccionar una imagen'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  JPG, PNG o WebP. Máximo 5 MB.
                </p>
              </div>
            </div>
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Estado</p>
              <p className="text-xs text-gray-500">Activa o desactiva este servicio.</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                active ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isEditing ? 'Guardar cambios' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
