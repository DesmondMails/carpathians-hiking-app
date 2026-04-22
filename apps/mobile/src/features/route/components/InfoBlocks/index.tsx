import { FC, useState } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import type { RouteDetails } from '@hiking/shared'

import { AppText } from '@/src/shared/components/AppText'
import { colors } from '@/src/theme/colors'
import { spacing } from '@/src/theme/spacing'
import { fontFamily } from '@/src/theme/typography'

import { TransportSection } from '../Transport'
import { About, Weather } from './components'

type InfoTabId = 'transport' | 'weather' | 'about'

const TABS: { id: InfoTabId; label: string }[] = [
  { id: 'transport', label: 'Як добратись' },
  { id: 'weather', label: 'Погода' },
  { id: 'about', label: 'Про маршрут' },
]

interface InfoBlocksProps {
  route: RouteDetails
}

export const InfoBlocks: FC<InfoBlocksProps> = ({ route }) => {
  const [tab, setTab] = useState<InfoTabId>('transport')

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map(({ id, label }) => {
          const active = tab === id
          return (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <AppText
                style={[styles.tabLabel, active && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {label}
              </AppText>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.panel}>
        {tab === 'transport' ? <TransportSection embedded /> : null}

        {tab === 'weather' ? <Weather /> : null}

        {tab === 'about' && route.createdBy ? (
          <About
            createdBy={route.createdBy.name}
            gpxAvailable={route.gpxAvailable}
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textPrimary,
  },
  panel: {
    minHeight: 120,
  },
})
