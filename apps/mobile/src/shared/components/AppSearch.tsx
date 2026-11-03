import { FC } from 'react'
import type { ComponentProps } from 'react'

import {
  ActivityIndicator,
  StyleSheet,
  Pressable,
  TextInput,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'

import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

type FeatherIconName = ComponentProps<typeof Feather>['name']

interface AppSearchProps {
  placeholder: string
  preIconName: FeatherIconName
  text?: string
  postIconName?: FeatherIconName
  editable?: boolean
  // Replaces the leading icon with a spinner; the input stays editable
  isLoading?: boolean
  // Highlights the filter button when non-default filters are applied
  isFilterActive?: boolean
  onFilterPress?: () => void
  onSearchPress?: () => void
  onTextChange?: (newText: string) => void
}

export const AppSearch: FC<AppSearchProps> = ({
  placeholder,
  preIconName,
  postIconName,
  text,
  editable = true,
  isLoading = false,
  isFilterActive = false,
  onFilterPress,
  onSearchPress,
  onTextChange,
}) => {
  return (
    <View style={styles.searchWrapper}>
      <Pressable style={styles.searchBar} onPress={onSearchPress}>
        <View style={styles.preIcon}>
          {isLoading ? (
            <ActivityIndicator
              size='small'
              color={colors.primary}
              accessibilityLabel='Завантаження'
            />
          ) : (
            preIconName && (
              <Feather name={preIconName} size={18} color={colors.gray400} />
            )
          )}
        </View>
        <TextInput
          value={text}
          editable={editable}
          onPress={onSearchPress}
          onChangeText={onTextChange}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
        />
        {editable && !!text && onTextChange && (
          <Pressable
            style={styles.clearButton}
            onPress={() => onTextChange('')}
            hitSlop={8}
            accessibilityRole='button'
            accessibilityLabel='Очистити пошук'
          >
            <Feather name='x' size={14} color={colors.textSecondary} />
          </Pressable>
        )}
        {postIconName && (
          <Pressable
            style={[
              styles.filterButton,
              isFilterActive && styles.filterButtonActive,
            ]}
            onPress={onFilterPress}
            accessibilityRole='button'
            accessibilityLabel='Фільтри'
            accessibilityState={{ selected: isFilterActive }}
          >
            <Feather
              name={postIconName}
              size={18}
              color={isFilterActive ? colors.primary : colors.textPrimary}
            />
            {isFilterActive && <View style={styles.filterBadge} />}
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
  preIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    padding: 2,
    borderRadius: 6,
  },
  filterButtonActive: { backgroundColor: colors.primaryLight },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
})
