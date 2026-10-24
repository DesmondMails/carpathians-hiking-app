import { FC } from 'react'

import { Platform, Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import { AppText, Slider } from '@/src/shared/components'
import type { LocationStatus } from '@/src/shared/hooks'
import { colors } from '@/src/theme/colors'

import {
  MIN_NEAR_DISTANCE_KM,
  MAX_NEAR_DISTANCE_KM,
  locationHints,
} from '../../../constants'
import { filterStyles } from '../styles'

type NearDistanceProps = {
  value?: number
  onChange: (value: number) => void
  nearMe: boolean
  onNearMeChange: (value: boolean) => void
  locationStatus: LocationStatus
  onRecoverLocation: () => Promise<void>
}

export const NearDistance: FC<NearDistanceProps> = ({
  value,
  onChange,
  nearMe,
  onNearMeChange,
  locationStatus,
  onRecoverLocation,
}) => {
  const locationAvailable = locationStatus === 'available'
  const isLoading = locationStatus === 'loading'
  const enabled = locationAvailable && nearMe
  const showWarning = !locationAvailable && !isLoading
  const hintColor = showWarning ? colors.warning : colors.textSecondary
  const hint = locationHints[locationStatus]

  return (
    <View style={filterStyles.section}>
      <View style={filterStyles.row}>
        <AppText
          variant='button'
          style={styles.title}
          color={locationAvailable ? colors.textPrimary : colors.textDisabled}
        >
          Поруч зі мною
        </AppText>

        <Pressable
          accessibilityRole='checkbox'
          accessibilityLabel='Шукати поруч'
          accessibilityState={{
            checked: enabled,
            disabled: !locationAvailable,
          }}
          disabled={!locationAvailable}
          onPress={() => onNearMeChange(!nearMe)}
          style={[styles.checkboxRow, !locationAvailable && styles.disabled]}
        >
          <View style={[styles.checkbox, enabled && styles.checkboxActive]}>
            {enabled && <Feather name='check' size={14} color={colors.white} />}
          </View>
          <AppText variant='caption'>Шукати поруч</AppText>
        </Pressable>
      </View>

      <View style={filterStyles.row}>
        <AppText variant='caption' color={colors.textSecondary}>
          До старту маршруту
        </AppText>
        <AppText
          variant='bodyMedium'
          color={enabled ? colors.textPrimary : colors.textDisabled}
        >
          {enabled && value !== undefined ? `До ${value} км` : 'Будь-де'}
        </AppText>
      </View>

      <View style={[filterStyles.sliderGroup, !enabled && styles.disabled]}>
        <Slider
          value={value ?? 50}
          minimumValue={MIN_NEAR_DISTANCE_KM}
          maximumValue={MAX_NEAR_DISTANCE_KM}
          enabled={enabled}
          onValueChange={onChange}
        />
        <View style={filterStyles.row}>
          <AppText variant='caption' color={colors.textSecondary}>
            {MIN_NEAR_DISTANCE_KM} км
          </AppText>
          <AppText variant='caption' color={colors.textSecondary}>
            {MAX_NEAR_DISTANCE_KM} км
          </AppText>
        </View>
      </View>
      <View style={styles.description}>
        <Feather
          name={
            isLoading ? 'clock' : showWarning ? 'alert-circle' : 'crosshair'
          }
          size={14}
          color={hintColor}
        />
        <AppText
          variant='caption'
          color={hintColor}
          style={styles.hint}
          accessibilityLiveRegion='polite'
        >
          {hint.text}
        </AppText>
      </View>
      {hint.action && (
        <Pressable
          accessibilityRole='button'
          onPress={() => void onRecoverLocation()}
          style={styles.recoveryAction}
        >
          <AppText
            variant='caption'
            color={colors.primary}
            style={styles.actionText}
          >
            {hint.action}
          </AppText>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { flexShrink: 1 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  description: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hint: { flex: 1 },
  recoveryAction: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  actionText: { textDecorationLine: 'underline' },
  disabled: { opacity: 0.45 },
})
