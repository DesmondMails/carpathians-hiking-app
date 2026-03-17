import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/src/features/auth/hooks/useAuth'

export default function HomeScreen() {
  const { user, logout } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hiking App</Text>
      <Text style={styles.subtitle}>Ласкаво просимо!</Text>

      {user && (
        <View style={styles.userCard}>
          <Text style={styles.label}>Обліковий запис</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Вийти</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
    marginBottom: 32,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#d9534f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: {
    color: '#d9534f',
    fontSize: 15,
    fontWeight: '600',
  },
})
