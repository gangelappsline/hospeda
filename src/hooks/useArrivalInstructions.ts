import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import {
  getArrivalInstructions,
  createArrivalInstruction,
  updateArrivalInstruction,
  deleteArrivalInstruction,
} from '@/api/arrivalInstructions'
import type {
  ArrivalInstructionPayload,
} from '@/types/arrivalInstruction'

export const arrivalInstructionsKey = (lodgingId: number | string | null | undefined) =>
  ['arrival-instructions', lodgingId] as const

export function useArrivalInstructions(lodgingId: number | string | null | undefined) {
  return useQuery({
    queryKey: arrivalInstructionsKey(lodgingId),
    queryFn: () => getArrivalInstructions(lodgingId!),
    enabled: !!lodgingId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateArrivalInstruction(lodgingId: number | string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ArrivalInstructionPayload) => {
      if (!lodgingId) throw new Error('ID de alojamiento requerido')
      return createArrivalInstruction(lodgingId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrivalInstructionsKey(lodgingId),
      })
      toast.success('Instrucción guardada', {
        description: 'La indicación de llegada fue agregada correctamente.',
      })
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data?.message as string) || error.message
          : error instanceof Error
            ? error.message
            : 'Error al guardar la instrucción'
      toast.error('Error al guardar instrucción', { description: msg })
    },
  })
}

export function useUpdateArrivalInstruction(lodgingId: number | string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      instructionId,
      payload,
    }: {
      instructionId: number | string
      payload: Partial<ArrivalInstructionPayload>
    }) => {
      if (!lodgingId) throw new Error('ID de alojamiento requerido')
      return updateArrivalInstruction(lodgingId, instructionId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrivalInstructionsKey(lodgingId),
      })
      toast.success('Instrucción actualizada', {
        description: 'Los cambios fueron guardados correctamente.',
      })
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data?.message as string) || error.message
          : error instanceof Error
            ? error.message
            : 'Error al actualizar la instrucción'
      toast.error('Error al actualizar', { description: msg })
    },
  })
}

export function useDeleteArrivalInstruction(lodgingId: number | string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (instructionId: number | string) => {
      if (!lodgingId) throw new Error('ID de alojamiento requerido')
      return deleteArrivalInstruction(lodgingId, instructionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrivalInstructionsKey(lodgingId),
      })
      toast.success('Instrucción eliminada', {
        description: 'La indicación fue eliminada de la lista.',
      })
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data?.message as string) || error.message
          : error instanceof Error
            ? error.message
            : 'Error al eliminar la instrucción'
      toast.error('Error al eliminar', { description: msg })
    },
  })
}
