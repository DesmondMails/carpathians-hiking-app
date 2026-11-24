import { FC } from 'react'

import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import { Image, ImageProps } from 'expo-image'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

const DEFAULT_HERO_IMAGE = require('@/assets/images/hoverla.jpeg')

interface HeroCardLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  cardStyle?: StyleProp<ViewStyle>
  image?: ImageProps['source']
  imageProps?: Omit<ImageProps, 'source'>
}

export const HeroCardLayout: FC<HeroCardLayoutProps> = ({
  title,
  subtitle,
  children,
  cardStyle,
  image = DEFAULT_HERO_IMAGE,
  imageProps,
}) => {
  return (
    <View style={styles.container}>
      <Image
        contentFit='cover'
        cachePolicy='memory-disk'
        transition={200}
        {...imageProps}
        source={image}
        style={[styles.hero, imageProps?.style]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomWrap}
      >
        <View style={[styles.card, cardStyle]}>
          {!!title && (
            <AppText variant='title' style={styles.title}>
              {title}
            </AppText>
          )}

          {!!subtitle && (
            <AppText variant='body' style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}

          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    ...StyleSheet.absoluteFillObject,
    // Same box as the previous `flex: 1` + `top: -150`: full container size, shifted up by 150.
    top: -150,
    bottom: 150,
  },
  bottomWrap: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
})
