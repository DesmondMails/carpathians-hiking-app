import { StyleSheet, View } from 'react-native'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { typography } from '@/src/theme/typography'

import { InfoRow } from './InfoRow'

export const Weather = () => (
  <View style={styles.weatherCard}>
    <AppText style={styles.weatherHint}>
      Орієнтовний прогноз для регіону маршруту (без API)
    </AppText>
    <InfoRow
      icon='sun'
      label='Сьогодні'
      value='Хмарно з проясненнями, без опадів'
      iconColor={colors.warning}
    />
    <InfoRow
      icon='thermometer'
      label='Температура'
      value='На висоті старту ~14°C, на вершині ~8°C'
    />
    <InfoRow
      icon='wind'
      label='Вітер'
      value='Помірний, пориви до 35 км/год на гребені'
    />
    <InfoRow
      icon='cloud-rain'
      label='Наступні дні'
      value='Невеликий дощ можливий у четвер'
      isLast
    />
  </View>
)

const styles = StyleSheet.create({
  weatherCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  weatherHint: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
})
