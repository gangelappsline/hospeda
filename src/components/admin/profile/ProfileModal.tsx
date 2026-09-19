import { useState, useEffect, useRef, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  X,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Mail,
  Phone,
  Shield,
} from 'lucide-react'
import { getProfile, updateProfile } from '@/api/profile'
import { updateStoredUser } from '@/utils/authStorage'
import type { ProfilePayload } from '@/types/profile'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/webp', 'image/jpeg', 'image/png']

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ProfileModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Datos del perfil traídos de la API
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: isOpen,
    staleTime: 0,
  })

  // Estado del formulario
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos al abrir
  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name)
      setPassword('')
      setPasswordConfirmation('')
      setAvatar(null)
      setAvatarPreview(profile.photo || null)
      setShowPassword(false)
      setShowConfirmation(false)
      setErrors({})
    }
  }, [isOpen, profile])

  // Detectar si hubo cambios reales
  const hasChanges = useMemo(() => {
    if (!profile) return false
    if (name.trim() !== profile.name) return true
    if (password) return true
    if (avatar) return true
    return false
  }, [name, password, avatar, profile])

  const mutation = useMutation({
    mutationFn: (payload: ProfilePayload) => updateProfile(payload),
    onSuccess: (updated) => {
      // Refrescar datos en el storage
      updateStoredUser(updated)
      // Invalidar caché
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      toast.success('Perfil actualizado', {
        description: 'Tus datos se guardaron correctamente.',
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
        toast.error('Datos inválidos', {
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

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato no válido', {
        description: 'Solo se permiten imágenes WebP, JPG o PNG.',
      })
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Archivo muy grande', {
        description: 'La imagen no debe superar 2 MB.',
      })
      return
    }

    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, avatar: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    // Validaciones de contraseña (solo si se escribió algo)
    if (password) {
      if (password.length < 8) {
        newErrors.password = 'Mínimo 8 caracteres'
      }
      if (password !== passwordConfirmation) {
        newErrors.password_confirmation = 'Las contraseñas no coinciden'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: ProfilePayload = {}
    if (name.trim() !== profile?.name) payload.name = name.trim()
    if (password) {
      payload.password = password
      payload.password_confirmation = passwordConfirmation
    }
    if (avatar) payload.avatar = avatar

    mutation.mutate(payload)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mi perfil</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Actualiza tu foto, nombre o contraseña.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-5">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 animate-pulse" />
            </div>
            <div className="h-11 bg-gray-50 rounded-lg animate-pulse" />
            <div className="h-11 bg-gray-50 rounded-lg animate-pulse" />
            <div className="h-11 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-4 border-white shadow-md">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-orange-600">
                      {getInitials(name || profile?.name || 'U')}
                    </span>
                  )}
                </div>

                {/* Botón cambiar foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                  aria-label="Cambiar foto"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <Upload size={14} />
                {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
              </button>

              <p className="text-xs text-gray-400 mt-1">
                WebP, JPG o PNG · Máx. 2 MB
              </p>
              {errors.avatar && (
                <p className="mt-1 text-xs text-red-500">{errors.avatar}</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Angel García"
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

            {/* Campos no editables */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={profile?.phone || 'Sin teléfono'}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Rol
                </label>
                <div className="relative">
                  <Shield
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={
                      profile?.role === 'admin'
                        ? 'Administrador'
                        : profile?.role === 'host'
                          ? 'Anfitrión'
                          : profile?.role === 'guest'
                            ? 'Huésped'
                            : profile?.role || '—'
                    }
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-500 cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cambiar contraseña
                </span>
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar en blanco para no cambiar"
                  className={`w-full rounded-lg border py-2.5 pl-3.5 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmation ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  disabled={!password}
                  className={`w-full rounded-lg border py-2.5 pl-3.5 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 ${
                    errors.password_confirmation
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  disabled={!password}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  tabIndex={-1}
                >
                  {showConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
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
                disabled={mutation.isPending || !hasChanges}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}