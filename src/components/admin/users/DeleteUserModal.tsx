import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { deleteUser } from '@/api/users'
import type { AdminUser } from '@/types/user'

interface Props {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
}

export default function DeleteUserModal({ isOpen, onClose, user }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUser(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario eliminado', {
        description: `"${user?.name}" se eliminó correctamente.`,
      })
      onClose()
    },
    onError: (error: any) => {
      toast.error('No se pudo eliminar', {
        description:
          error.status === 409
            ? 'Este usuario tiene reservaciones o propiedades asociadas.'
            : error.message || 'Intente nuevamente.',
      })
    },
  })

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-vivid-tangerine-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-vivid-tangerine-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-cool-steel-900">
              ¿Eliminar usuario?
            </h3>
            <p className="text-sm text-cool-steel-500 mt-1">
              Estás a punto de eliminar{' '}
              <span className="font-medium text-cool-steel-700">"{user.name}"</span>{' '}
              ({user.email}). Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-cool-steel-700 hover:bg-cool-steel-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-tangerine-500 text-sm font-medium text-white hover:bg-vivid-tangerine-600 transition-colors disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}