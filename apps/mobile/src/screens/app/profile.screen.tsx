import { ScrollView, StyleSheet } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import {
  ProfileInfo,
  Logout,
  MyReviewsBtn,
} from '@/src/features/profile/components'
import { AppText } from '@/src/shared/components'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'

const TAB_BAR_HEIGHT = 68

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant='h1' style={styles.heading} accessibilityRole='header'>
          Профіль
        </AppText>

        <ProfileInfo />

        <MyReviewsBtn />

        <Logout />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 32,
    paddingBottom: TAB_BAR_HEIGHT + spacing.xxl,
  },
  heading: {
    fontSize: 32,
    lineHeight: 40,
  },
})
