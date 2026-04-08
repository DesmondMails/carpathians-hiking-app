import { FC } from 'react'

import { StyleSheet, View } from 'react-native'

import { colors } from '@/src/theme/colors'

import { InfoRow } from './InfoRow'


interface AboutProps {
  createdBy: string
  gpxAvailable: boolean
}

export const About: FC<AboutProps> = ({ createdBy, gpxAvailable }) => (
  <View style={styles.aboutCard}>
    <InfoRow
      icon='user'
      label='Автор'
      value={createdBy}
      iconColor={colors.textSecondary}
    />
    <InfoRow
      icon='file-text'
      label='GPX-файл'
      value={gpxAvailable ? 'Доступний для завантаження' : 'Недоступний'}
      iconColor={gpxAvailable ? colors.success : colors.gray400}
      isLast
    />
  </View>
)

const styles = StyleSheet.create({
  aboutCard: {
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
})
