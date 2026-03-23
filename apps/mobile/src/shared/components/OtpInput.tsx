import React, { useRef } from 'react'

import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native'

import { colors } from '@/src/theme/colors'
import { otpConfig } from '@/src/theme/otp'
import { typography } from '@/src/theme/typography'

type OtpInputProps = {
  value: string[]
  onChange: (value: string[]) => void
  boxSize?: number
  length?: number
}

export function OtpInput({
  value,
  onChange,
  boxSize = otpConfig.boxSize,
  length = otpConfig.length,
}: OtpInputProps) {
  const refs = useRef<(TextInput | null)[]>([])

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1)
    const next = [...value]
    next[index] = char
    onChange(next)

    if (char && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!value[index]

        return (
          <TextInput
            key={index}
            ref={(el) => {
              refs.current[index] = el
            }}
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType='number-pad'
            maxLength={1}
            textAlign='center'
            style={[
              styles.box,
              {
                borderColor: isFilled ? colors.primary : colors.border,
                color: colors.primary,
              },
              { width: boxSize, height: boxSize },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  box: {
    width: otpConfig.boxSize,
    height: otpConfig.boxSize,
    borderWidth: otpConfig.borderWidth,
    borderRadius: otpConfig.borderRadius,
    backgroundColor: colors.white,
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
  },
})
