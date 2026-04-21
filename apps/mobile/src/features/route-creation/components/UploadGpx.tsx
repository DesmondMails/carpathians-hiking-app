import { useState } from 'react'

import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'

import { AppButton, AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { useCreateRoute } from '../hooks/useCreateRoute'

const ICON_CIRCLE_SIZE = 160
const ICON_SIZE = 72

export const UploadGpx = () => {
  const router = useRouter()
  const { uploadGpx, isLoading } = useCreateRoute()

  const [pickingFile, setPickingFile] = useState(false)

  const handleUploadGpx = async () => {
    try {
      setPickingFile(true)

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/gpx+xml', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      })

      if (result.canceled) {
        return
      }

      const asset = result.assets[0]

      if (!asset) {
        return
      }

      const isGpx =
        asset.name?.toLowerCase().endsWith('.gpx') ||
        asset.mimeType === 'application/gpx+xml'

      if (!isGpx) {
        Alert.alert(
          'Невірний формат файлу',
          'Будь ласка, оберіть файл у форматі GPX.',
        )
        return
      }

      const draft = await uploadGpx({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      })

      router.push({
        pathname: '/(modals)/create-route/finalize',
        params: { draftId: draft.id },
      })
    } catch (error) {
      Alert.alert(
        'Помилка завантаження',
        'Не вдалося завантажити файл. Спробуйте ще раз.',
      )
      console.error('Upload GPX error', error)
    } finally {
      setPickingFile(false)
    }
  }

  const buttonLoading = isLoading || pickingFile

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.content}
        disabled={buttonLoading}
        onPress={handleUploadGpx}
      >
        <View style={styles.iconCircle}>
          <Feather
            name='upload-cloud'
            size={ICON_SIZE}
            color={colors.primary}
          />
        </View>

        <View style={styles.texts}>
          <AppText variant='h2' color={colors.textPrimary} style={styles.title}>
            Завантажте GPX файл
          </AppText>

          <AppText
            variant='body'
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            Оберіть файл GPX з вашого пристрою, щоб створити новий маршрут
          </AppText>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
})
