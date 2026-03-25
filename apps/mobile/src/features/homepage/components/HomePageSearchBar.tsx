import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import { Feather } from '@expo/vector-icons'
import { StyleSheet, TextInput, View } from 'react-native'
import { Pressable } from 'react-native'

export const HomePageSearchBar = () => {
  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <Feather name='search' size={18} color={colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder='Відкрийте для себе нову пригоду'
          placeholderTextColor={colors.gray400}
        />
        <Pressable style={styles.filterButton}>
          <Feather name='sliders' size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
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
