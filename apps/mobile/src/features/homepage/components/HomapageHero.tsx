import { StyleSheet, View } from 'react-native'

import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuthStore } from '@/src/features/auth/store/auth.store'
import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { typography } from '@/src/theme/typography'

export const HomapageHero = () => {
  const insets = useSafeAreaInsets()
  const name = useAuthStore((state) => state.user?.name)

  const HERO_HEIGHT = 240 + insets.top

  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      <Image
        source={require('@/assets/images/sunset.jpeg')}
        style={StyleSheet.absoluteFill}
        contentFit='cover'
      />
      {/* dark gradient overlay via layered views */}
      {[0.05, 0.1, 0.17, 0.25, 0.33].map((opacity, i) => (
        <View
          key={i}
          pointerEvents='none'
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: `rgba(10,30,18,${opacity})`,
              top: `${i * 30}%`,
            },
          ]}
        />
      ))}

      <View style={[styles.heroContent, { paddingTop: insets.top + 20 }]}>
        <AppText style={styles.heroTitle}>
          {name ? `Привіт, ${name}!` : 'Привіт, мандрівнику!'}
        </AppText>
        <AppText style={styles.heroSubtitle}>Готові до нових пригод?</AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 6,
  },
  heroTitle: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 36,
    color: colors.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
})
