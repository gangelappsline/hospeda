import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { createService, updateService } from '@/api/setting_services'
import { ServiceCategory  } from '@/types/settingServices'

interface Props {
  isOpen: boolean
  onClose: () => void
  category: ServiceCategory | null
}

export default function ServiceCategoryModal({ isOpen, onClose, category }: Props) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [hint, setHint] = useState('')
  const [example, setExample] = useState('')
  const [active, setActive] = useState(true)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? '')
      setHint(category?.hint ?? '')
      setExample(category?.example ?? '')
      setActive(category?.active ?? true)
      setIconFile(null)
      setPreview(category?.logo ? `/storage/${category.logo}` : null)
      setErrors({})
    }
  }, [isOpen, category])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      // Nota: el payload requiere "logo" obligatorio en create.
      // Si es edición y no se sube nuevo archivo, pasamos el existente o string vacío.
      const payload = {
        name,
        hint,
        example,
        active,
        icon: iconFile ?? (category?.logo ? category.logo : new File([], '')),
      } as any

      if (category) {
        console.log('Updating category:', category)
        // En update solo enviamos los campos que cambian
        const updatePayload: any = { name, hint, example, active }
        if (iconFile) updatePayload.icon = iconFile
        return updateService(category.id, updatePayload)
      }
      console.log('Creating new category with payload:', payload)
      return createService(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] })
      onClose()
    },
    onError: (error: any) => {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors ?? {})
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    mutation.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  Subir imagen
                </button>
                <p className="text-xs text-gray-500 mt-1">Se convertirá a WebP automáticamente.</p>
              </div>
            </div>
            {errors.icon && <p className="text-xs text-red-500 mt-1">{errors.icon[0]}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          {/* Hint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hint</label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            {errors.hint && <p className="text-xs text-red-500 mt-1">{errors.hint[0]}</p>}
          </div>

          {/* Ejemplo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ejemplo</label>
            <input
              type="text"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            {errors.example && <p className="text-xs text-red-500 mt-1">{errors.example[0]}</p>}
          </div>

          {/* Switch Activo */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Estado</p>
              <p className="text-xs text-gray-500">Activa o desactiva esta categoría.</p>
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

          {mutation.isError && !Object.keys(errors).length && (
            <p className="text-sm text-red-500">Ocurrió un error al guardar. Intenta de nuevo.</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {mutation.isPending ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}