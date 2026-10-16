import { StyleSheet } from 'react-native'

import { colors } from '@/src/theme/colors'

export const filterStyles = StyleSheet.create({
  section: {
    width: '100%',
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sliderGroup: { gap: 0 },
})
