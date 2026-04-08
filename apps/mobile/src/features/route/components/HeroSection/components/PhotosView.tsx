import { FC, useCallback, useRef, useState } from 'react'

import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native'

import { Image } from 'expo-image'

import { colors } from '@/src/theme/colors'

interface PhotosViewProps {
  imageUris: string[]
  height: number
}

export const PhotosView: FC<PhotosViewProps> = ({ imageUris, height }) => {
  const { width } = useWindowDimensions()

  const [activeIndex, setActiveIndex] = useState(0)
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 })
  const flatListRef = useRef<FlatList<string>>(null)

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index)
      }
    },
    [],
  )

  const handleDotPress = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index })
  }, [])

  return (
    <View style={StyleSheet.absoluteFill}>
      <FlatList
        data={imageUris}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate='fast'
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height }}
            contentFit='cover'
          />
        )}
        ref={flatListRef}
      />

      {imageUris.length > 1 && (
        <View style={styles.dots}>
          {imageUris.map((_, i) => (
            <Pressable
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
              onPress={() => handleDotPress(i)}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLightGray,
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
})
