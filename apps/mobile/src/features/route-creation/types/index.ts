export type DraftImageStatus = 'uploading' | 'uploaded' | 'failed'

export interface DraftImageItem {
  localId: string
  localUri: string
  fileName: string
  mimeType: string
  imageId?: string
  storageKey?: string
  sortOrder: number
  status: DraftImageStatus
  isCover: boolean
}

export type ImageStatusMeta = {
  label: string
  backgroundColor: string
  textColor: string
}
