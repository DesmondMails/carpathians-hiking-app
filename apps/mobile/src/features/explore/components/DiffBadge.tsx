import { AppText } from '@/src/shared/components/AppText'
import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { getDifficultyColor } from '../utills/diificulties-colors'
import { typography } from '@/src/theme/typography'
import { Difficulty } from '../types'

interface DiffBadgeProps {
  difficulty: Difficulty
}

export const DiffBadge: FC<DiffBadgeProps> = ({ difficulty }) => {
  return (
    <View
      style={[
        db.badge,
        {
          backgroundColor: getDifficultyColor(difficulty) + '22',
          borderColor: getDifficultyColor(difficulty) + '55',
        },
      ]}
    >
      <AppText style={[db.text, { color: getDifficultyColor(difficulty) }]}>
        {difficulty}
      </AppText>
    </View>
  )
}

const db = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 11 },
})
