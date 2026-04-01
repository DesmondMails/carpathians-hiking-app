import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

interface ExploreHeaderProps {
  name: string
  location: string
}

export const ExploreHeader: FC<ExploreHeaderProps> = ({ name, location }) => {
  return (
    <View style={styles.header}>
      <View>
        {/* <AppText style={styles.greeting}>Привіт, {name} 👋</AppText> */}
        <AppText style={styles.subtitle}>
          Знайди маршрут для наступної пригоди
        </AppText>
      </View>
      <View style={styles.locationChip}>
        <Feather name='map-pin' size={12} color={colors.primary} />
        <AppText style={styles.locationText}>{location}</AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  greeting: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  locationText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: colors.primary,
  },
})
