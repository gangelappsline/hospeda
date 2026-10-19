import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Upload, Check, Loader2 } from 'lucide-react'
import {
  createServiceCategory,
  updateServiceCategory,
} from '@/api/serviceCategories'
import type {
  ServiceCategory,
  ServiceCategoryPayload,
} from '@/types/serviceCategory'

interface Props {
  isOpen: boolean
  onClose: () => void
  category?: ServiceCategory | null
}

export default function ServiceCategoryModal({
  isOpen,
  onClose,
  category,
}: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!category

  const [name, setName] = useState('')
  const [hint, setHint] = useState('')
  const [example, setExample] = useState('')
  const [active, setActive] = useState(true)
  const [icon, setIcon] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '')
      setHint(category?.hint || '')
      setExample(category?.example || '')
      setActive(category ? Boolean(category.active) : true)
      setIcon(null)
      setIconPreview(category?.icon_url || category?.logo_url || null)
      setErrors({})
    }
  }, [isOpen, category])

  const mutation = useMutation({
    mutationFn: (payload: ServiceCategoryPayload) =>
      isEditing
        ? updateServiceCategory(category!.id, payload)
        : createServiceCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] })
      queryClient.invalidateQueries({ queryKey: ['service-categories-new'] })
      toast.success(
        isEditing ? 'Categoría actualizada' : 'Categoría creada',
        {
          description: isEditing
            ? 'Los cambios se guardaron correctamente.'
            : 'La nueva categoría se agregó al catálogo.',
        }
      )
      onClose()
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]: any) => {
          fieldErrors[key] = Array.isArray(messages) ? messages[0] : String(messages)
        })
        if (fieldErrors.logo && !fieldErrors.icon) {
          fieldErrors.icon = fieldErrors.logo
        }
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'El icono no debe superar 2 MB.',
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
    if (!hint.trim()) newErrors.hint = 'El hint es obligatorio'
    if (!example.trim()) newErrors.example = 'El ejemplo es obligatorio'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate({
      name: name.trim(),
      hint: hint.trim(),
      example: example.trim(),
      icon: icon ?? undefined,
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
              {isEditing ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              La información se reflejará en el catálogo de servicios.
            </p>
          </div>
          <button
            type="button"
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
              maxLength={255}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="Ej. Transporte"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Hint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hint <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={hint}
              onChange={(e) => {
                setHint(e.target.value)
                if (errors.hint) setErrors((prev) => ({ ...prev, hint: '' }))
              }}
              placeholder="Ej. Indica el tipo de servicio de transporte"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.hint
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {errors.hint && (
              <p className="mt-1 text-xs text-red-500">{errors.hint}</p>
            )}
          </div>

          {/* Ejemplo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ejemplo <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={example}
              onChange={(e) => {
                setExample(e.target.value)
                if (errors.example)
                  setErrors((prev) => ({ ...prev, example: '' }))
              }}
              placeholder="Ej. Traslado privado al aeropuerto"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.example
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {errors.example && (
              <p className="mt-1 text-xs text-red-500">{errors.example}</p>
            )}
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Icono{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
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
              className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                errors.icon
                  ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Upload size={20} className="text-orange-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {icon ? icon.name : 'Haz clic para seleccionar el icono'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Se recomienda un archivo cuadrado (WebP, PNG, SVG). Máximo 2 MB.
                </p>
              </div>
            </div>
            {errors.icon && (
              <p className="mt-1 text-xs text-red-500">{errors.icon}</p>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Estado activo</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Activa o desactiva esta categoría para nuevos servicios.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
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
              {isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
