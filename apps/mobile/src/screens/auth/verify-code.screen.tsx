import { useEffect, useRef, useState } from 'react'

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import { AuthWrapper } from '@/src/features/auth/components/AuthWrapper'
import { EmailVerified } from '@/src/features/auth/components/EmailVerified'
import { useAuth } from '@/src/features/auth/hooks/useAuth'
import { AppButton } from '@/src/shared/components/AppButton'
import { AppText } from '@/src/shared/components/AppText'
import { OtpInput } from '@/src/shared/components/OtpInput'
import { colors } from '@/src/theme/colors'


const CODE_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

export default function VerifyCodeNewScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { verifyEmail, resendCode, isLoading } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const inputRefs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleVerify = async () => {
    const code = digits.join('')

    if (code.length < CODE_LENGTH) {
      setError('Введіть 6-значний код для підтвердження')
      return
    }

    setError(null)

    try {
      await verifyEmail({ email, code })
      setIsVerified(true)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Невірний або застарілий код'
      setError(Array.isArray(message) ? message.join(', ') : message)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)
    setError(null)

    try {
      await resendCode({ email })
      setCooldown(RESEND_COOLDOWN_SEC)
    } catch {
      setError('Не вдалося надіслати код. Спробуйте пізніше.')
    } finally {
      setIsResending(false)
    }
  }

  const code = digits.join('')
  const isComplete = code.length === CODE_LENGTH

  if (isVerified) {
    return <EmailVerified />
  }

  return (
    <AuthWrapper
      title='Підтвердження email'
      subtitle='Ми надіслали 6-значний код на ваш email'
    >
      <View style={styles.codeRow}>
        <OtpInput
          value={digits}
          onChange={setDigits}
          length={CODE_LENGTH}
          boxSize={48}
        />
      </View>

      {error && (
        <AppText variant='body' color={colors.warning}>
          {error}
        </AppText>
      )}

      <View style={styles.resendRow}>
        <AppText variant='body' color={colors.textSecondary}>
          Не отримали код?
        </AppText>

        {isResending ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : cooldown > 0 ? (
          <AppText variant='bodyMedium' color={colors.textSecondary}>
            Надіслати знову через {cooldown}с
          </AppText>
        ) : (
          <Pressable onPress={handleResend}>
            <AppText variant='bodyMedium' color={colors.primary}>
              Надіслати код знову
            </AppText>
          </Pressable>
        )}
      </View>

      <AppButton
        title='Підтвердити'
        onPress={handleVerify}
        size='large'
        variant='primary'
        style={styles.verifyButton}
        disabled={!isComplete || isLoading}
      />
    </AuthWrapper>
  )
}

const styles = StyleSheet.create({
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  verifyButton: {
    marginTop: 20,
  },
})
