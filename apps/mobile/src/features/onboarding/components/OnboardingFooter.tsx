import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText, AppButton } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'

interface OnboardingFooterProps {
  title?: string
  isBtnDisabled?: boolean
  buttonAccessibilityLabel?: string
  onNextPress: () => void
}

export const OnboardingFooter: FC<OnboardingFooterProps> = ({
  title,
  isBtnDisabled,
  buttonAccessibilityLabel = 'Перейти до наступного кроку',
  onNextPress,
}) => {
  return (
    <View style={styles.onboardingFooter}>
      {title ? (
        <AppText variant='caption' color={colors.textSecondary}>
          {title}
        </AppText>
      ) : null}

      <AppButton
        size='medium'
        icon={<Feather name='arrow-right' size={24} color={colors.white} />}
        shape='circle'
        disabled={isBtnDisabled}
        onPress={onNextPress}
        accessibilityLabel={buttonAccessibilityLabel}
        style={!title ? styles.iconOnlyButton : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  onboardingFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconOnlyButton: {
    marginLeft: 'auto',
  },
})
