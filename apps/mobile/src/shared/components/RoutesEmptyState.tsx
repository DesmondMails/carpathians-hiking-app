import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText } from '@/src/shared/components/AppText'
import {
  ROUTES_EMPTY_STATE_DESCRIPTION,
  ROUTES_EMPTY_STATE_TITLE,
} from '@/src/shared/constants'
import { colors } from '@/src/theme/colors'

interface IRoutesEmptyState {
  titleText?: string
  descriptionText?: string
}

export const RoutesEmptyState: FC<IRoutesEmptyState> = ({
  titleText = ROUTES_EMPTY_STATE_TITLE,
  descriptionText = ROUTES_EMPTY_STATE_DESCRIPTION,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility='no-hide-descendants'
      >
        <Feather name='map' size={24} color={colors.primary} />
      </View>
      <AppText variant='bodyMedium' style={styles.title}>
        {titleText}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.description}>
        {descriptionText}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 102,
    height: '100%',
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center', marginBottom: 8 },
  description: { maxWidth: 280, textAlign: 'center' },
})
