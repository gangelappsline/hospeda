import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { deleteExperienceCategory } from '@/api/experienceCategories'
import type { ExperienceCategory } from '@/types/experienceCategory'

interface Props {
  isOpen: boolean
  onClose: () => void
  category: ExperienceCategory | null
}

export default function DeleteExperienceCategoryModal({ isOpen, onClose, category }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteExperienceCategory(category!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience-categories'] })
      toast.success('Categoría eliminada', {
        description: `"${category?.name}" se eliminó del catálogo.`,
      })
      onClose()
    },
    onError: (error: any) => {
      toast.error('No se pudo eliminar', {
        description:
          error.status === 409
            ? 'Esta categoría está en uso por una o más experiencias.'
            : error.message || 'Intente nuevamente.',
      })
    },
  })

  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              ¿Eliminar categoría de experiencia?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Estás a punto de eliminar{' '}
              <span className="font-medium text-gray-700">"{category.name}"</span>.
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
