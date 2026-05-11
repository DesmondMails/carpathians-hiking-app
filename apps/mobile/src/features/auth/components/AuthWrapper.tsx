import { FC } from 'react'

import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

interface AuthWrapperProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  cardStyle?: ViewStyle
}

export const AuthWrapper: FC<AuthWrapperProps> = ({
  title,
  subtitle,
  children,
  cardStyle,
}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/hoverla.jpeg')}
        resizeMode='cover'
        style={styles.hero}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomWrap}
      >
        <View style={[styles.card, cardStyle]}>
          <AppText variant='title' style={styles.title}>
            {title}
          </AppText>

          {subtitle && (
            <AppText variant='body' style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}

          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    flex: 1,
    position: 'relative',
    top: -150,
  },
  bottomWrap: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
})
