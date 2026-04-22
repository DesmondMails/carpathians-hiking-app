import { FC, useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import type { RouteDetails } from '@hiking/shared'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

interface DescriptionBlockProps {
  route: RouteDetails
}

export const DescriptionBlock: FC<DescriptionBlockProps> = ({ route }) => {
  const [expanded, setExpanded] = useState(false)

  const isLong = route.description && route.description?.length > 160

  if (!route.description) return null

  return (
    <View style={styles.container}>
      <AppText style={styles.sectionTitle}>Опис маршруту</AppText>

      <AppText
        style={styles.description}
        numberOfLines={expanded || !isLong ? undefined : 4}
      >
        {route.description}
      </AppText>

      {isLong && (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
          <AppText style={styles.readMore}>
            {expanded ? 'Згорнути' : 'Читати далі'}
          </AppText>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  readMore: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.primary,
    marginTop: spacing.sm,
  },
})
