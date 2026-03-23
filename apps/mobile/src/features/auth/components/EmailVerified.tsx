import { useEffect } from 'react'

import { Image, StyleSheet, View } from 'react-native'

import { AuthWrapper } from '@/src/features/auth/components/AuthWrapper'
import { AppButton } from '@/src/shared/components/AppButton'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

import { useAuth } from '../hooks/useAuth'


export const EmailVerified = () => {
  const { confirmAuthentication } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      confirmAuthentication()
    }, 2000)
  }, [confirmAuthentication])

  return (
    <AuthWrapper title=''>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/email_verified.png')}
          style={styles.icon}
          resizeMode='contain'
        />

        <AppText variant='h2' style={styles.title}>
          Email підтверджено
        </AppText>

        <AppText
          variant='body'
          color={colors.textSecondary}
          style={styles.subtitle}
        >
          Ваша наступна подорож починається тут
        </AppText>

        <AppButton
          title='Продовжити'
          onPress={confirmAuthentication}
          size='large'
          variant='primary'
        />
      </View>
    </AuthWrapper>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  icon: {
    width: 96,
    height: 96,
    marginBottom: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
})
