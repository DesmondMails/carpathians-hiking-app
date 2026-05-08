import { RouteDraftPreview } from './route-draft-preview'

export interface RouteDraft {
  id: string
  title: string
  description?: string
  createdByUserId: string
  sourceFileName: string
  gpxStorageKey?: string
  previewJson?: RouteDraftPreview
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export const DIFFICULTY_VALUES = [
  'EASY',
  'MODERATE',
  'HARD',
  'EXTREME',
] as const
export type Difficulty = (typeof DIFFICULTY_VALUES)[number]

export interface FinalizeRouteDraftPayload {
  title: string
  description?: string
  region?: string
  difficulty?: Difficulty
  imageIds?: string[]
  coverImageId?: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  imageId: string
  storageKey: string
}

export interface GetPresignedUrlPayload {
  fileName: string
  contentType: string
}

export interface CompleteUploadPayload {
  imageId: string
  storageKey: string
  sortOrder?: number
}
