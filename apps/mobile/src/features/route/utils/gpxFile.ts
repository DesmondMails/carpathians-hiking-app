import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const GPX_DIR = 'gpx'
const GPX_MIME = 'application/gpx+xml'
const GPX_UTI = 'com.topografix.gpx'

export const ensureGpxFile = async (
  filename: string,
  resolveUrl: () => Promise<string>,
): Promise<File> => {
  const dir = new Directory(Paths.cache, GPX_DIR)
  if (!dir.exists) dir.create({ intermediates: true })

  const file = new File(dir, `${filename}.gpx`)
  if (file.exists) return file

  const url = await resolveUrl()

  await File.downloadFileAsync(url, file)

  return file
}

export const shareGpxFile = async (
  file: File,
  dialogTitle: string,
): Promise<void> => {
  const isSharingAvailable = await Sharing.isAvailableAsync()

  if (!isSharingAvailable) return

  await Sharing.shareAsync(file.uri, {
    mimeType: GPX_MIME,
    UTI: GPX_UTI,
    dialogTitle,
  })
}
