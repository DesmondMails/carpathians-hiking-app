import React from 'react'

import { Image, Pressable, StyleSheet, View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'

import { AuthWrapper } from '@/src/features/auth/components'
import { useAuth } from '@/src/features/auth/hooks/useAuth'
import {
  RegisterFormValues,
  registerSchema,
} from '@/src/features/auth/schemas/register.schema'
import { AppButton } from '@/src/shared/components/AppButton'
import { AppInput } from '@/src/shared/components/AppInput'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

export default function SignupNewScreen() {
  const router = useRouter()

  const { signup, signInWithGoogle } = useAuth()

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async ({ email, password }: RegisterFormValues) => {
    try {
      const trimmedEmail = email.trim()

      await signup({ email: trimmedEmail, password })

      router.push({
        pathname: '/(auth)/verify-code',
        params: { email: trimmedEmail },
      })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Щось пішло не так. Спробуйте знову.'
      setError('email', {
        message: Array.isArray(message) ? message.join(', ') : message,
      })
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Щось пішло не так. Спробуйте знову.'
      setError('email', {
        message: Array.isArray(message) ? message.join(', ') : message,
      })
    }
  }

  const handleSignIn = () => {
    router.replace('/(auth)/login')
  }

  return (
    <AuthWrapper title='Зареєструйтесь та розпочніть свою подорож'>
      <View style={styles.socialRow}>
        <AppButton
          title='Увійти з Google'
          onPress={handleGoogle}
          size='large'
          variant='outline'
          style={styles.socialButton}
          icon={<Image source={require('@/assets/images/google_logo.png')} />}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText variant='caption' color={colors.textSecondary}>
          Або зареєструйтесь з email
        </AppText>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              placeholder='Введіть ваш email'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              helperText={errors.email?.message}
              status={errors.email ? 'error' : 'default'}
            />
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              placeholder='Введіть ваш пароль'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry={true}
              helperText={errors.password?.message}
              status={errors.password ? 'error' : 'default'}
            />
          )}
        />

        <Controller
          control={control}
          name='confirmPassword'
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              placeholder='Підтвердіть ваш пароль'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry={true}
              helperText={errors.confirmPassword?.message}
              status={errors.confirmPassword ? 'error' : 'default'}
            />
          )}
        />
      </View>

      <AppButton
        title='Зареєструватись'
        onPress={handleSubmit(onSubmit)}
        size='large'
        variant='primary'
        style={styles.registerButton}
        disabled={!isValid || isSubmitting}
      />

      <View style={styles.footer}>
        <AppText variant='body' color={colors.textSecondary}>
          Вже маєте акаунт?{' '}
        </AppText>

        <Pressable onPress={handleSignIn}>
          <AppText variant='bodyMedium' color={colors.primary}>
            Увійти
          </AppText>
        </Pressable>
      </View>
    </AuthWrapper>
  )
}

const styles = StyleSheet.create({
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButton: {
    width: '100%',
    height: 56,

    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  inputContainer: {
    gap: spacing.md,
  },
  registerButton: {
    marginTop: spacing.xl,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
