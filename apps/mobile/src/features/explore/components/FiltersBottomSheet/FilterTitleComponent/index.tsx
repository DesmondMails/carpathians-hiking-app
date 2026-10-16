import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

type FilterTitleComponentProps = {
  leftText: string
  rightText?: string
}

export const FilterTitleComponent: FC<FilterTitleComponentProps> = ({
  leftText,
  rightText,
}) => (
  <View style={styles.titleWrapper}>
    <AppText variant='button' style={styles.title}>
      {leftText}
    </AppText>

    {rightText ? (
      <AppText variant='caption' color={colors.textSecondary}>
        {rightText}
      </AppText>
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  title: { flexShrink: 1 },
  titleWrapper: {
    gap: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
})
