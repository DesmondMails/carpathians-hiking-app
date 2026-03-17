import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native'

interface AuthButtonProps extends PressableProps {
  label: string
  isLoading?: boolean
}

export function AuthButton({ label, isLoading, style, ...props }: AuthButtonProps) {
  return (
    <Pressable
      style={[styles.button, isLoading && styles.buttonDisabled, style as object]}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color='#fff' />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
