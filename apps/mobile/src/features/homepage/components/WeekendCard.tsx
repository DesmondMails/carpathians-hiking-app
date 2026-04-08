import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

const WEEKEND_IMAGE =
  'https://www.figma.com/api/mcp/asset/ba4d91a7-0cb1-4846-841e-07fd8844fb27'

const GRADIENT_STEPS = [0.05, 0.15, 0.28, 0.42, 0.54, 0.62]

export const WeekendCard = () => {
  return (
    <Pressable style={styles.card}>
      <Image
        source={{ uri: WEEKEND_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit='cover'
      />
      {GRADIENT_STEPS.map((opacity, i) => (
        <View
          key={i}
          pointerEvents='none'
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: `rgba(10,40,20,${opacity})`,
              top: `${i * (100 / GRADIENT_STEPS.length)}%`,
            },
          ]}
        />
      ))}
      <View style={styles.content}>
        <View style={styles.tag}>
          <AppText style={styles.tagText}>Вихідні</AppText>
        </View>
        <AppText style={styles.title}>
          Маршрути з найкращими краєвидами
        </AppText>
        <AppText style={styles.sub}>
          6 підібраних треків · Карпати та Крим
        </AppText>
        <View style={styles.cta}>
          <AppText style={styles.ctaText}>Переглянути підбірку</AppText>
          <Feather name='arrow-right' size={14} color={colors.white} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  content: { padding: 16, gap: 6 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  tagText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: colors.white,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: colors.white,
  },
  sub: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ctaText: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: colors.white,
  },
})
