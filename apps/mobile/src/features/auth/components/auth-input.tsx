import { StyleSheet, TextInput, type TextInputProps } from 'react-native'

interface AuthInputProps extends TextInputProps {
  editable?: boolean
}

export function AuthInput({ style, ...props }: AuthInputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor='#9BA1A6'
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E6E8EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
})
