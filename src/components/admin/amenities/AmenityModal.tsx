import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Upload, Check, Loader2 } from 'lucide-react'
import { createAmenity, updateAmenity } from '@/api/amenities'
import type { Amenity, AmenityPayload } from '@/types/amenity'

interface Props {
  isOpen: boolean
  onClose: () => void
  amenity?: Amenity | null
}

export default function AmenityModal({ isOpen, onClose, amenity }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!amenity

  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [icon, setIcon] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(amenity?.name || '')
      setActive(amenity?.active ?? true)
      setIcon(null)
      setIconPreview(amenity?.icon_url || null)
      setErrors({})
    }
  }, [isOpen, amenity])

  const mutation = useMutation({
    mutationFn: (payload: AmenityPayload) =>
      isEditing
        ? updateAmenity(amenity!.id, payload)
        : createAmenity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      toast.success(isEditing ? 'Amenidad actualizada' : 'Amenidad creada', {
        description: isEditing
          ? 'Los cambios se guardaron correctamente.'
          : 'La nueva amenidad se agregó al catálogo.',
      })
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

    if (file.type !== 'image/webp') {
      toast.error('Formato no válido', {
        description: 'Solo se permiten imágenes WebP (.webp).',
      })
      return
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'El icono no debe superar 1 MB.',
      })
      return
    }

    setIcon(file)
    setIconPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, icon: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!isEditing && !icon) newErrors.icon = 'El icono es obligatorio'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate({
      name: name.trim(),
      icon: icon as File,
      active,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-cool-steel-100">
          <div>
            <h2 className="text-lg font-bold text-cool-steel-900">
              {isEditing ? 'Editar amenidad' : 'Nueva amenidad'}
            </h2>
            <p className="text-sm text-cool-steel-500 mt-0.5">
              Define el nombre, icono y disponibilidad.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-400 hover:bg-cool-steel-100 hover:text-cool-steel-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Nombre <span className="text-vivid-tangerine-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. WiFi"
              autoFocus
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.name}</p>
            )}
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Icono <span className="text-vivid-tangerine-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                errors.icon
                  ? 'border-vivid-tangerine-300 bg-vivid-tangerine-50/50 hover:bg-vivid-tangerine-50'
                  : 'border-cool-steel-200 hover:border-vivid-tangerine-300 hover:bg-vivid-tangerine-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-lg bg-white border border-cool-steel-200 flex items-center justify-center shrink-0 overflow-hidden">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <Upload size={20} className="text-vivid-tangerine-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cool-steel-900">
                  {icon ? icon.name : 'Selecciona el icono'}
                </p>
                <p className="text-xs text-cool-steel-500 mt-0.5">
                  Solo archivos WebP (.webp). Máximo 1 MB.
                </p>
              </div>
            </div>
            {errors.icon && (
              <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.icon}</p>
            )}
          </div>

          {/* Estado activo */}
          <div className="rounded-lg border border-cool-steel-200 p-4">
            <label className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-cool-steel-900">
                  Amenidad activa
                </p>
                <p className="text-xs text-cool-steel-500 mt-0.5">
                  Disponible para nuevos alojamientos.
                </p>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-cool-steel-300 text-vivid-tangerine-500 focus:ring-vivid-tangerine-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cool-steel-100">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isEditing ? 'Guardar cambios' : 'Crear amenidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}