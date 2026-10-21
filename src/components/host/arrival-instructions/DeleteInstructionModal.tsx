import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  isDeleting?: boolean
}

export default function DeleteInstructionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-vivid-tangerine-100 flex items-center justify-center text-vivid-tangerine-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-cool-steel-900">
                Eliminar instrucción de llegada
              </h3>
              <p className="text-xs text-cool-steel-500">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <p className="text-sm text-cool-steel-600 mb-6">
            ¿Estás seguro de que deseas eliminar la instrucción{' '}
            <span className="font-semibold text-cool-steel-900">"{title}"</span>?
            El huésped ya no podrá ver esta indicación de acceso.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar instrucción'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
