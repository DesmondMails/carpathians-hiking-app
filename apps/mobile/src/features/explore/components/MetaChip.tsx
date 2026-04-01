import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'
import { Feather } from '@expo/vector-icons'
import { FC } from 'react'
import { StyleSheet, View } from 'react-native'

interface MetaChipProps {
  icon: string
  label: string
}

export const MetaChip: FC<MetaChipProps> = ({ icon, label }) => {
  return (
    <View style={mc.chip}>
      <Feather name={icon as any} size={11} color={colors.gray500} />
      <AppText style={mc.label}>{label}</AppText>
    </View>
  )
}

const mc = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  label: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.gray500,
  },
})
