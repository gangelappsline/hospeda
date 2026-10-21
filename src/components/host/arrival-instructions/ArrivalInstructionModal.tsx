import { useState, useEffect, useRef } from 'react'
import { X, Check, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type {
  ArrivalInstruction,
  StagedArrivalInstruction,
} from '@/types/arrivalInstruction'

interface Props {
  isOpen: boolean
  onClose: () => void
  instruction?: ArrivalInstruction | StagedArrivalInstruction | null
  onSave: (data: {
    title: string
    description: string
    photoFile?: File | null
    removePhoto?: boolean
  }) => Promise<void> | void
  isSubmitting?: boolean
}

export default function ArrivalInstructionModal({
  isOpen,
  onClose,
  instruction,
  onSave,
  isSubmitting = false,
}: Props) {
  const isEditing = !!instruction

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(instruction?.title || '')
      setDescription(instruction?.description || '')
      setPhotoFile(null)
      setRemovePhoto(false)
      setErrors({})

      const existingUrl = instruction
        ? 'photo_url' in instruction && instruction.photo_url
          ? instruction.photo_url
          : 'photo' in instruction && typeof instruction.photo === 'string'
            ? instruction.photo
            : 'photoPreview' in instruction && instruction.photoPreview
              ? instruction.photoPreview
              : 'existingPhotoUrl' in instruction && instruction.existingPhotoUrl
                ? instruction.existingPhotoUrl
                : null
        : null

      setPhotoPreview(existingUrl)
    }
  }, [isOpen, instruction])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Formato no válido', {
        description: 'Por favor selecciona un archivo de imagen (JPG, PNG, WebP).',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'La imagen no debe superar los 5 MB.',
      })
      return
    }

    setPhotoFile(file)
    setRemovePhoto(false)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, photo: '' }))
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoFile(null)
    setPhotoPreview(null)
    setRemovePhoto(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'El título de la instrucción es obligatorio'
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres'
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción de las indicaciones es obligatoria'
    } else if (description.trim().length < 5) {
      newErrors.description = 'Describe detalladamente la indicación para el huésped'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        photoFile,
        removePhoto,
      })
      onClose()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        setErrors((err as { errors: Record<string, string> }).errors)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-cool-steel-100">
          <div>
            <h2 className="text-lg font-bold text-cool-steel-900">
              {isEditing ? 'Editar indicación de llegada' : 'Nueva indicación de llegada'}
            </h2>
            <p className="text-sm text-cool-steel-500 mt-0.5">
              Instrucciones y detalles que verá el huésped para acceder a la propiedad.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cool-steel-400 hover:bg-cool-steel-100 hover:text-cool-steel-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Título de la indicación <span className="text-vivid-tangerine-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Código de acceso para la cerradura inteligente"
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-cool-steel-400">
              Usa un título claro y conciso para este paso.
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Descripción e indicaciones detalladas <span className="text-vivid-tangerine-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica detalladamente cómo debe proceder el huésped: ej. Al llegar frente al portón gris, ingresa el código 4829# en el teclado numérico. La puerta se desbloqueará durante 10 segundos..."
              rows={4}
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm transition-colors resize-none focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-cool-steel-400">
              Proporciona pasos claros para que el huésped no tenga dudas ni contratiempos.
            </p>
          </div>

          {/* Foto (opcional) */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Foto o imagen de referencia{' '}
              <span className="text-cool-steel-400 font-normal">(opcional)</span>
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
              className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors border-cool-steel-200 hover:border-vivid-tangerine-300 hover:bg-vivid-tangerine-50/30 group"
            >
              <div className="w-16 h-16 rounded-lg bg-cool-steel-50 border border-cool-steel-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-cool-steel-400 group-hover:text-vivid-tangerine-500 transition-colors" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cool-steel-900 truncate">
                  {photoFile ? photoFile.name : photoPreview ? 'Imagen actual cargada' : 'Selecciona una fotografía'}
                </p>
                <p className="text-xs text-cool-steel-500 mt-0.5">
                  Foto de la cerradura, fachada, estacionamiento o llave. JPG, PNG o WebP (máx. 5 MB).
                </p>
              </div>

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Quitar foto"
                  className="p-2 rounded-lg text-cool-steel-400 hover:text-vivid-tangerine-600 hover:bg-vivid-tangerine-50 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cool-steel-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isEditing ? 'Guardar cambios' : 'Agregar indicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
