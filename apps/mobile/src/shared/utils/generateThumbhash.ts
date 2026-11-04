import { Image } from 'expo-image'

// The preview is optional, so a failure here must never block the upload
export const generateThumbhash = async (
  uri: string,
): Promise<string | undefined> => {
  try {
    return await Image.generateThumbhashAsync(uri)
  } catch (error) {
    console.warn('Thumbhash generation failed', error)
    return undefined
  }
}
