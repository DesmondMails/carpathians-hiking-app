type UploadAsset = {
  uri: string
  mimeType?: string
}

export const uploadAssetToPresignedUrl = async (
  uploadUrl: string,
  asset: UploadAsset,
): Promise<void> => {
  const fileResponse = await fetch(asset.uri)
  const fileBlob = await fileResponse.blob()

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': asset.mimeType ?? 'image/jpeg',
    },
    body: fileBlob,
  })

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status ${uploadResponse.status}`)
  }
}
