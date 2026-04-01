import { FC } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'

interface SaveButtonProps {
  saved: boolean
  onPress: () => void
}

export const SaveButton: FC<SaveButtonProps> = ({ saved, onPress }) => {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={18}
        color={saved ? colors.primary : colors.gray400}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
})
