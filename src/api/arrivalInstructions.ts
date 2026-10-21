import apiClient from './axios'
import type {
  ArrivalInstruction,
  ArrivalInstructionPayload,
} from '@/types/arrivalInstruction'

const buildBaseUrl = (lodgingId: number | string) =>
  `/host/lodgings/${lodgingId}/arrival-instructions`

/**
 * Obtener listado de instrucciones de llegada de un alojamiento
 * GET /host/lodgings/{lodging}/arrival-instructions
 */
export const getArrivalInstructions = async (
  lodgingId: number | string
): Promise<ArrivalInstruction[]> => {
  const response = await apiClient.get(buildBaseUrl(lodgingId))
  const data = response.data?.data ?? response.data
  return Array.isArray(data) ? data : []
}

/**
 * Crear una nueva instrucción de llegada para un alojamiento
 * POST /host/lodgings/{lodging}/arrival-instructions
 * Campos: title (req), description (req), photo (opcional, File)
 */
export const createArrivalInstruction = async (
  lodgingId: number | string,
  payload: ArrivalInstructionPayload
): Promise<ArrivalInstruction> => {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('description', payload.description)

  if (payload.photo instanceof File) {
    formData.append('photo', payload.photo)
  }

  if (payload.order !== undefined) {
    formData.append('order', String(payload.order))
  }

  const response = await apiClient.post(buildBaseUrl(lodgingId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data?.data ?? response.data
}

/**
 * Actualizar una instrucción de llegada existente
 * POST /host/lodgings/{lodging}/arrival-instructions/{id} con _method=PUT para soporte de archivos en Laravel
 */
export const updateArrivalInstruction = async (
  lodgingId: number | string,
  instructionId: number | string,
  payload: Partial<ArrivalInstructionPayload>
): Promise<ArrivalInstruction> => {
  const formData = new FormData()
  formData.append('_method', 'PUT')

  if (payload.title !== undefined) {
    formData.append('title', payload.title)
  }
  if (payload.description !== undefined) {
    formData.append('description', payload.description)
  }
  if (payload.photo instanceof File) {
    formData.append('photo', payload.photo)
  }
  if (payload.order !== undefined) {
    formData.append('order', String(payload.order))
  }

  const response = await apiClient.post(
    `${buildBaseUrl(lodgingId)}/${instructionId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  return response.data?.data ?? response.data
}

/**
 * Eliminar una instrucción de llegada
 * DELETE /host/lodgings/{lodging}/arrival-instructions/{id}
 */
export const deleteArrivalInstruction = async (
  lodgingId: number | string,
  instructionId: number | string
): Promise<void> => {
  await apiClient.delete(`${buildBaseUrl(lodgingId)}/${instructionId}`)
}
