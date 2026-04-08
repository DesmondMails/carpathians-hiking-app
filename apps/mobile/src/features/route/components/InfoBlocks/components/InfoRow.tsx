import { FC } from 'react'

import { StyleSheet , View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'


interface InfoRowProps {
  icon: string
  label: string
  value: string
  iconColor?: string
  isLast?: boolean
}

export const InfoRow: FC<InfoRowProps> = ({
  icon,
  label,
  value,
  iconColor = colors.primary,
  isLast,
}) => (
  <>
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
        <Feather name={icon as any} size={14} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <AppText style={styles.rowLabel}>{label}</AppText>
        <AppText style={styles.rowValue}>{value}</AppText>
      </View>
    </View>
    {!isLast && <View style={styles.separator} />}
  </>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rowValue: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: spacing.md + 32 + spacing.md,
  },
})
