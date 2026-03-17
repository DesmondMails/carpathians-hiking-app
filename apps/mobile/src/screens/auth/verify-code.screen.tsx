import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/src/features/auth/hooks/useAuth'
import { AuthButton } from '@/src/features/auth/components'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

export default function VerifyCodeScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const { verifyEmail, resendCode, isLoading } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const inputRefs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(null)

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = digits.join('')

    if (code.length < CODE_LENGTH) {
      setError('Введіть 6-значний код')
      return
    }

    setError(null)

    try {
      await verifyEmail({ email, code })
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Підтвердження email</Text>

        <Text style={styles.subtitle}>
          Ми надіслали 6-значний код на{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.codeRow}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref }}
              style={[
                styles.digitInput,
                digit ? styles.digitInputFilled : undefined,
                error ? styles.digitInputError : undefined,
              ]}
              value={digit}
              onChangeText={(v) => handleDigitChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType='number-pad'
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton
          label='Підтвердити'
          isLoading={isLoading}
          onPress={handleVerify}
          disabled={!isComplete || isLoading}
        />

        <Pressable
          style={styles.resendRow}
          onPress={handleResend}
          disabled={cooldown > 0 || isResending}
        >
          {isResending ? (
            <ActivityIndicator size='small' color='#0a7ea4' />
          ) : cooldown > 0 ? (
            <Text style={styles.resendCooldown}>
              Надіслати знову через{' '}
              <Text style={styles.resendCooldownTimer}>{cooldown}с</Text>
            </Text>
          ) : (
            <Text style={styles.resendLink}>Надіслати код знову</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backLink}
          onPress={() => router.replace('/(auth)/signup')}
        >
          <Text style={styles.backLinkText}>← Змінити email</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emailHighlight: {
    color: '#11181C',
    fontWeight: '600',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  digitInput: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: '#E6E8EA',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#11181C',
    backgroundColor: '#fafafa',
  },
  digitInputFilled: {
    borderColor: '#0a7ea4',
    backgroundColor: '#f0f9ff',
  },
  digitInputError: {
    borderColor: '#d9534f',
    backgroundColor: '#fff5f5',
  },
  error: {
    color: '#d9534f',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  resendRow: {
    marginTop: 20,
    alignItems: 'center',
    minHeight: 24,
  },
  resendLink: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  resendCooldown: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  resendCooldownTimer: {
    fontWeight: '600',
    color: '#687076',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: '#687076',
  },
})
