import { FC, ReactNode, RefObject, useCallback } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/src/theme/colors'

import { AppText } from './AppText'

type BottomSheetProps = {
  title: string
  ref: RefObject<BottomSheetModal | null>
  children: ReactNode
  footer?: ReactNode
  snapPoints?: (number | string)[]
  enableContentPanningGesture?: boolean
  onAnimate?: (fromIndex: number, toIndex: number) => void
}

const DEFAULT_SNAP_POINTS = ['90%']

export const BottomSheet: FC<BottomSheetProps> = ({
  title,
  ref,
  children,
  footer,
  snapPoints = DEFAULT_SNAP_POINTS,
  enableContentPanningGesture = true,
  onAnimate,
}) => {
  const insets = useSafeAreaInsets()
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  )

  return (
    <BottomSheetModal
      ref={ref}
      onAnimate={onAnimate}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      topInset={insets.top}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={enableContentPanningGesture}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="h2">{title}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрити фільтри"
            onPress={() => ref.current?.dismiss()}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
          >
            <Feather name="x" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <BottomSheetScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </BottomSheetScrollView>
        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          {footer}
        </View>
      </View>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { backgroundColor: colors.white, borderRadius: 28 },
  handle: { width: 36, height: 4, backgroundColor: colors.gray300 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.65 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 8 },
})
