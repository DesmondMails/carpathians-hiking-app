import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'

import { AppButton } from './AppButton'
import { AppText } from './AppText'

interface ErrorStateProps {
  title?: string
  description?: string
  retryTitle?: string
  onRetry: () => void
  loading?: boolean
}

export const ErrorState: FC<ErrorStateProps> = ({
  title = 'Щось пішло не так',
  description = 'Перевірте зʼєднання з інтернетом і спробуйте ще раз.',
  retryTitle = 'Спробувати ще',
  onRetry,
  loading = false,
}) => {
  return (
    <View style={styles.container} accessibilityLiveRegion='polite'>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility='no-hide-descendants'
      >
        <Feather name='wifi-off' size={24} color={colors.primary} />
      </View>
      <AppText variant='bodyMedium' style={styles.title}>
        {title}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.description}>
        {description}
      </AppText>
      <AppButton
        title={retryTitle}
        onPress={onRetry}
        loading={loading}
        size='medium'
        variant='outline'
        fullWidth={false}
        style={styles.button}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center', marginBottom: 8 },
  description: { maxWidth: 280, textAlign: 'center', marginBottom: 20 },
  button: { paddingHorizontal: 24 },
})
