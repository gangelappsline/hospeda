import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getHostLodgings,
  deleteHostLodging,
  toggleHostLodgingStatus,
} from '@/api/host'
import type { HostLodging } from '@/types/hostLodgings'

export const hostLodgingsKey = ['host-lodgings'] as const

// ---- Lista ----
export function useHostLodgings() {
  return useQuery({
    queryKey: hostLodgingsKey,
    queryFn: getHostLodgings,
    staleTime: 1000 * 60 * 2,
  })
}

// ---- Eliminar ----
export function useDeleteHostLodging() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteHostLodging(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostLodgingsKey })
      toast.success('Alojamiento eliminado')
    },
    onError: (err: Error) => {
      toast.error('No se pudo eliminar', { description: err.message })
    },
  })
}

// ---- Publicar / despublicar (optimistic) ----
export function useToggleHostLodgingStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: 'published' | 'draft'
    }) => toggleHostLodgingStatus(id, status),

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: hostLodgingsKey })
      const previous =
        qc.getQueryData<HostLodging[]>(hostLodgingsKey) ?? []

      qc.setQueryData<HostLodging[]>(hostLodgingsKey, (old = []) =>
        old.map((l) => (l.id === id ? { ...l, status } : l))
      )

      return { previous }
    },

    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(hostLodgingsKey, ctx.previous)
      }
      toast.error('No se pudo actualizar el estado', {
        description: err.message,
      })
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: hostLodgingsKey })
    },

    onSuccess: (updated) => {
      toast.success(
        updated.status === 'published'
          ? 'Alojamiento publicado'
          : 'Alojamiento despublicado'
      )
    },
  })
}