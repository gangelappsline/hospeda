import { useState } from 'react'
import {
  Compass,
  Plus,
  Pencil,
  Trash2,
  Info,
  MapPin,
  ImageIcon,
  Maximize2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type {
  ArrivalInstruction,
  StagedArrivalInstruction,
} from '@/types/arrivalInstruction'
import {
  useArrivalInstructions,
  useCreateArrivalInstruction,
  useUpdateArrivalInstruction,
  useDeleteArrivalInstruction,
} from '@/hooks/useArrivalInstructions'
import ArrivalInstructionModal from './ArrivalInstructionModal'
import DeleteInstructionModal from './DeleteInstructionModal'
import Skeleton from '@/components/ui/Skeleton'

interface Props {
  lodgingId?: number | string | null
  stagedInstructions?: StagedArrivalInstruction[]
  onStagedInstructionsChange?: (instructions: StagedArrivalInstruction[]) => void
}

function getInstructionPhoto(
  inst: ArrivalInstruction | StagedArrivalInstruction
): string | null {
  if ('photo_url' in inst && inst.photo_url) return inst.photo_url
  if ('photo' in inst && typeof inst.photo === 'string') return inst.photo
  if ('photoPreview' in inst && inst.photoPreview) return inst.photoPreview
  if ('existingPhotoUrl' in inst && inst.existingPhotoUrl) return inst.existingPhotoUrl
  return null
}

function getInstructionKey(
  inst: ArrivalInstruction | StagedArrivalInstruction,
  index: number
): string | number {
  if ('id' in inst && inst.id) return inst.id
  if ('tempId' in inst && inst.tempId) return inst.tempId
  return index
}

export default function ArrivalInstructionsStep({
  lodgingId,
  stagedInstructions = [],
  onStagedInstructionsChange,
}: Props) {
  // Queries y mutaciones si ya existe un ID de lodging
  const isApiMode = !!lodgingId
  const { data: apiInstructions = [], isLoading, isError } = useArrivalInstructions(
    isApiMode ? lodgingId : null
  )

  const createMutation = useCreateArrivalInstruction(lodgingId)
  const updateMutation = useUpdateArrivalInstruction(lodgingId)
  const deleteMutation = useDeleteArrivalInstruction(lodgingId)

  // Estado del modal de crear / editar
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInstruction, setEditingInstruction] = useState<
    ArrivalInstruction | StagedArrivalInstruction | null
  >(null)

  // Estado del modal de eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingInstruction, setDeletingInstruction] = useState<
    ArrivalInstruction | StagedArrivalInstruction | null
  >(null)

  // Estado de vista ampliada de imagen (Lightbox)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Lista unificada
  const instructionsList: Array<ArrivalInstruction | StagedArrivalInstruction> = isApiMode
    ? apiInstructions
    : stagedInstructions

  const handleOpenCreate = () => {
    setEditingInstruction(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (
    instruction: ArrivalInstruction | StagedArrivalInstruction
  ) => {
    setEditingInstruction(instruction)
    setModalOpen(true)
  }

  const handleOpenDelete = (
    instruction: ArrivalInstruction | StagedArrivalInstruction
  ) => {
    setDeletingInstruction(instruction)
    setDeleteModalOpen(true)
  }

  // Guardar (Crear / Editar)
  const handleSave = async (data: {
    title: string
    description: string
    photoFile?: File | null
    removePhoto?: boolean
  }) => {
    if (isApiMode) {
      if (editingInstruction && 'id' in editingInstruction && editingInstruction.id) {
        // Actualizar existente vía API
        await updateMutation.mutateAsync({
          instructionId: editingInstruction.id,
          payload: {
            title: data.title,
            description: data.description,
            photo: data.photoFile,
          },
        })
      } else {
        // Crear nueva vía API
        await createMutation.mutateAsync({
          title: data.title,
          description: data.description,
          photo: data.photoFile,
          order: apiInstructions.length + 1,
        })
      }
    } else {
      // Modo local/staged (creación de alojamiento)
      if (editingInstruction && 'tempId' in editingInstruction) {
        // Editar instrucción en la lista local
        const updated = stagedInstructions.map((item) => {
          if (item.tempId === (editingInstruction as StagedArrivalInstruction).tempId) {
            const preview = data.photoFile
              ? URL.createObjectURL(data.photoFile)
              : data.removePhoto
                ? null
                : item.photoPreview

            return {
              ...item,
              title: data.title,
              description: data.description,
              photoFile: data.photoFile !== undefined ? data.photoFile : item.photoFile,
              photoPreview: preview,
            }
          }
          return item
        })
        onStagedInstructionsChange?.(updated)
        toast.success('Instrucción actualizada')
      } else {
        // Agregar nueva a la lista local
        const newStaged: StagedArrivalInstruction = {
          tempId: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: data.title,
          description: data.description,
          photoFile: data.photoFile,
          photoPreview: data.photoFile ? URL.createObjectURL(data.photoFile) : null,
          order: stagedInstructions.length + 1,
        }
        onStagedInstructionsChange?.([...stagedInstructions, newStaged])
        toast.success('Instrucción agregada a la lista')
      }
    }
  }

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deletingInstruction) return

    if (isApiMode && 'id' in deletingInstruction && deletingInstruction.id) {
      await deleteMutation.mutateAsync(deletingInstruction.id)
    } else if ('tempId' in deletingInstruction) {
      const filtered = stagedInstructions.filter(
        (item) => item.tempId !== (deletingInstruction as StagedArrivalInstruction).tempId
      )
      onStagedInstructionsChange?.(filtered)
      toast.success('Instrucción eliminada')
    }

    setDeleteModalOpen(false)
    setDeletingInstruction(null)
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-6">
      {/* Encabezado del paso */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pacific-blue-50 text-pacific-blue-600">
              <Compass size={18} />
            </span>
            <h2 className="text-xl font-bold text-cool-steel-900">
              Instrucciones de llegada
            </h2>
          </div>
          <p className="text-sm text-cool-steel-500 mt-1 max-w-2xl">
            Proporciona las indicaciones paso a paso para que tus huéspedes sepan cómo
            llegar al alojamiento y acceder a las instalaciones una vez reservado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors shrink-0 shadow-sm"
        >
          <Plus size={16} />
          Agregar indicación
        </button>
      </div>

      {/* Banner informativo */}
      <div className="p-4 rounded-xl bg-pacific-blue-50 border border-pacific-blue-200 flex items-start gap-3">
        <Info size={18} className="text-pacific-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-pacific-blue-900 leading-relaxed">
          <span className="font-semibold">¿Por qué es importante?</span>{' '}
          Los huéspedes consultarán estas indicaciones antes y durante su llegada.
          Puedes añadir varios pasos: por ejemplo, cómo llegar desde el aeropuerto o terminal,
          dónde dejar el vehículo, códigos de cerraduras electrónicas o cómo recoger la llave física.
        </div>
      </div>

      {/* Estado de carga */}
      {isApiMode && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-cool-steel-200 bg-white flex gap-4"
            >
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error de carga en API */}
      {isApiMode && isError && (
        <div className="p-6 text-center rounded-xl border border-vivid-tangerine-200 bg-vivid-tangerine-50/50">
          <p className="text-sm text-vivid-tangerine-700">
            No se pudieron cargar las instrucciones existentes de llegada.
          </p>
        </div>
      )}

      {/* Lista de instrucciones */}
      {(!isApiMode || !isLoading) && (
        <>
          {instructionsList.length === 0 ? (
            /* Estado vacío */
            <div className="text-center py-12 px-4 bg-white rounded-xl border-2 border-dashed border-cool-steel-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-cool-steel-100 flex items-center justify-center mb-3">
                <MapPin size={24} className="text-cool-steel-400" />
              </div>
              <h3 className="text-base font-semibold text-cool-steel-900 mb-1">
                Sin instrucciones de llegada aún
              </h3>
              <p className="text-sm text-cool-steel-500 mb-5 max-w-md mx-auto">
                Facilita la experiencia de tus huéspedes agregando indicaciones paso a paso
                de acceso, rutas o códigos de cerraduras.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-tangerine-500 hover:bg-vivid-tangerine-600 text-white text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={16} />
                Agregar primera indicación
              </button>
            </div>
          ) : (
            /* Tarjetas de instrucciones */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-cool-steel-500 px-1">
                <span>
                  {instructionsList.length}{' '}
                  {instructionsList.length === 1
                    ? 'indicación configurada'
                    : 'indicaciones configuradas'}
                </span>
                <span>Paso a paso para el huésped</span>
              </div>

              {instructionsList.map((inst, index) => {
                const photoSrc = getInstructionPhoto(inst)

                return (
                  <article
                    key={getInstructionKey(inst, index)}
                    className="group bg-white rounded-xl border border-cool-steel-200 p-4 hover:border-cool-steel-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Número de paso */}
                      <div className="w-8 h-8 rounded-lg bg-cool-steel-100 text-cool-steel-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>

                      {/* Foto si existe */}
                      {photoSrc ? (
                        <div
                          onClick={() => setPreviewImage(photoSrc)}
                          className="relative w-20 h-20 rounded-lg bg-cool-steel-100 overflow-hidden shrink-0 cursor-pointer border border-cool-steel-200 group/img"
                          title="Click para ver en tamaño completo"
                        >
                          <img
                            src={photoSrc}
                            alt={inst.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-overlay/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-cool-steel-50 border border-cool-steel-200 flex items-center justify-center shrink-0 text-cool-steel-300">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-cool-steel-900 mb-1">
                          {inst.title}
                        </h4>
                        <p className="text-sm text-cool-steel-600 whitespace-pre-line leading-relaxed">
                          {inst.description}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(inst)}
                          className="p-2 rounded-lg text-cool-steel-500 hover:text-cool-steel-900 hover:bg-cool-steel-100 transition-colors"
                          title="Editar indicación"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(inst)}
                          className="p-2 rounded-lg text-cool-steel-400 hover:text-vivid-tangerine-600 hover:bg-vivid-tangerine-50 transition-colors"
                          title="Eliminar indicación"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}

              {/* Botón inferior para agregar más */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-cool-steel-300 hover:bg-cool-steel-50 text-cool-steel-700 text-xs font-medium transition-colors"
                >
                  <Plus size={14} />
                  Agregar otra indicación
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para crear o editar */}
      <ArrivalInstructionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        instruction={editingInstruction}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteInstructionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deletingInstruction?.title || 'esta instrucción'}
        isDeleting={isSubmitting}
      />

      {/* Lightbox / Vista previa de imagen ampliada */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-cool-steel-700 hover:bg-white flex items-center justify-center shadow-md transition-colors"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Vista previa ampliada"
              className="max-h-[80vh] w-auto object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}
