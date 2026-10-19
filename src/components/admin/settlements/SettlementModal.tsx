import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Check, Loader2 } from 'lucide-react'
import { createSettlement, updateSettlement } from '@/api/settlements'
import type { Settlement, SettlementPayload } from '@/types/settlement'

interface Props {
  isOpen: boolean
  onClose: () => void
  settlement?: Settlement | null
  cityId: number
  stateId: number
  countryName?: string
  stateName?: string
  cityName?: string
}

export default function SettlementModal({
  isOpen,
  onClose,
  settlement,
  cityId,
  stateId,
  countryName,
  stateName,
  cityName,
}: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!settlement

  const [name, setName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setName(settlement?.name || '')
      setZipCode(settlement?.zip_code || '')
      setErrors({})
    }
  }, [isOpen, settlement])

  const mutation = useMutation({
    mutationFn: (payload: SettlementPayload) =>
      isEditing
        ? updateSettlement(settlement!.id, payload)
        : createSettlement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', cityId] })
      toast.success(isEditing ? 'Colonia actualizada' : 'Colonia creada', {
        description: isEditing
          ? 'Los cambios se guardaron correctamente.'
          : 'La nueva colonia se agregó al catálogo.',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!zipCode.trim()) {
      newErrors.zip_code = 'El código postal es obligatorio'
    } else if (!/^\d{4,6}$/.test(zipCode.trim())) {
      newErrors.zip_code = 'Debe contener entre 4 y 6 dígitos'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate({
      name: name.trim(),
      zip_code: zipCode.trim(),
      city_id: cityId,
      state_id: stateId,
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
              {isEditing ? 'Editar colonia' : 'Nueva colonia'}
            </h2>
            <p className="text-sm text-cool-steel-500 mt-0.5">
              {countryName && stateName && cityName
                ? `${cityName}, ${stateName}, ${countryName}`
                : 'Completa los datos de la colonia.'}
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
              Nombre de la colonia <span className="text-vivid-tangerine-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Roma Norte"
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

          {/* Código postal */}
          <div>
            <label className="block text-sm font-medium text-cool-steel-700 mb-1.5">
              Código postal <span className="text-vivid-tangerine-500">*</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej. 06700"
              maxLength={6}
              className={`w-full rounded-lg border py-2.5 px-3.5 text-sm font-mono transition-colors focus:outline-none focus:ring-2 ${
                errors.zip_code
                  ? 'border-vivid-tangerine-400 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
                  : 'border-cool-steel-300 focus:border-vivid-tangerine-500 focus:ring-vivid-tangerine-100'
              }`}
            />
            {errors.zip_code && (
              <p className="mt-1 text-xs text-vivid-tangerine-500">{errors.zip_code}</p>
            )}
          </div>

          {/* Info de ubicación */}
          {(countryName || stateName || cityName) && (
            <div className="rounded-lg bg-cool-steel-50 border border-cool-steel-100 p-4 space-y-2">
              <p className="text-xs font-semibold text-cool-steel-500 uppercase tracking-wider mb-2">
                Ubicación
              </p>
              {countryName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cool-steel-500">País</span>
                  <span className="font-medium text-cool-steel-900">{countryName}</span>
                </div>
              )}
              {stateName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cool-steel-500">Estado</span>
                  <span className="font-medium text-cool-steel-900">{stateName}</span>
                </div>
              )}
              {cityName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cool-steel-500">Ciudad</span>
                  <span className="font-medium text-cool-steel-900">{cityName}</span>
                </div>
              )}
            </div>
          )}

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
              {isEditing ? 'Guardar cambios' : 'Crear colonia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}