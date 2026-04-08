import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { MOCK_START_POINT, MOCK_TRANSPORT_OPTIONS } from './mock-transport'
import { StartPointCard } from './StartPointCard'
import { TransportOptionCard } from './TransportOptionCard'
import type { TransportOption, TransportSectionProps } from './types'

export const TransportSection: FC<Partial<TransportSectionProps>> = ({
  title = 'How to get there',
  subtitle = 'Public transport and meeting the trailhead',
  options = MOCK_TRANSPORT_OPTIONS,
  startPoint = MOCK_START_POINT,
  embedded = false,
}) => {
  return (
    <View style={embedded ? styles.embedded : styles.container}>
      {!embedded ? (
        <View style={styles.header}>
          <AppText style={styles.title}>{title}</AppText>
          {subtitle !== '' ? (
            <AppText style={styles.headerSubtitle}>{subtitle}</AppText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.list}>
        {options.map((item: TransportOption) => (
          <TransportOptionCard key={item.id} option={item} />
        ))}

        <StartPointCard point={startPoint} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  embedded: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  list: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
})
