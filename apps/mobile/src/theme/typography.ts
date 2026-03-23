export const fontFamily = {
  headingBold: 'Mont-Bold',
  bodyRegular: 'Poppins-Regular',
  bodyMedium: 'Poppins-Medium',
  bodySemiBold: 'Poppins-SemiBold',
} as const

export const typography = {
  h1: {
    fontFamily: fontFamily.headingBold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontFamily.headingBold,
    fontSize: 24,
    lineHeight: 32,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  },
} as const

export type TypographyVariant = keyof typeof typography
