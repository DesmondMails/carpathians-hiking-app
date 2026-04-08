import { FC } from 'react'
import type { ComponentProps } from 'react'

import { StyleSheet, Pressable, TextInput, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'



type FeatherIconName = ComponentProps<typeof Feather>['name']

interface AppSearchProps {
  placeholder: string
  preIconName: FeatherIconName
  postIconName?: FeatherIconName
  onFilterPress?: () => void
  onSearchPress?: () => void
}

export const AppSearch: FC<AppSearchProps> = ({
  placeholder,
  preIconName,
  postIconName,
  onFilterPress,
  onSearchPress,
}) => {
  return (
    <View style={styles.searchWrapper}>
      <Pressable style={styles.searchBar} onPress={onSearchPress}>
        {preIconName && (
          <Feather name={preIconName} size={18} color={colors.gray400} />
        )}
        <TextInput
          onPress={onSearchPress}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
        />
        {postIconName && (
          <Pressable style={styles.filterButton} onPress={onFilterPress}>
            <Feather name={postIconName} size={18} color={colors.textPrimary} />
          </Pressable>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  searchWrapper: {
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    padding: 2,
  },
})
