export interface ArrivalInstruction {
  id: number
  lodging_id: number
  title: string
  description: string
  photo?: string | null
  photo_url?: string | null
  order?: number
  created_at?: string
  updated_at?: string
}

export interface ArrivalInstructionPayload {
  title: string
  description: string
  photo?: File | null
  order?: number
}

export interface StagedArrivalInstruction {
  tempId: string
  id?: number
  title: string
  description: string
  photoFile?: File | null
  photoPreview?: string | null
  existingPhotoUrl?: string | null
  order?: number
}
