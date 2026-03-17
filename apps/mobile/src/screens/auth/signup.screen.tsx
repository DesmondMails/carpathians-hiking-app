import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/src/features/auth/hooks/useAuth'
import { AuthInput, AuthButton } from '@/src/features/auth/components'

export default function SignupScreen() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async () => {
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Email та пароль обовʼязкові')
      return
    }

    try {
      const trimmedEmail = email.trim()
      await signup({ email: trimmedEmail, password })
      router.push({ pathname: '/(auth)/verify-code', params: { email: trimmedEmail } })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Щось пішло не так. Спробуйте знову.'
      setError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Реєстрація</Text>

        <AuthInput
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          autoComplete='email'
          editable={!isLoading}
        />

        <AuthInput
          placeholder='Пароль'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete='new-password'
          editable={!isLoading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton
          label='Зареєструватись'
          isLoading={isLoading}
          onPress={handleSignup}
        />

        <Pressable
          style={styles.switchLink}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.switchText}>
            Вже є акаунт? <Text style={styles.switchTextAccent}>Увійти</Text>
          </Text>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: '#d9534f',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#687076',
  },
  switchTextAccent: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
})
