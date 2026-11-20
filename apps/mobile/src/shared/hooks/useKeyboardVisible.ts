import { useEffect, useState } from 'react'

import { Keyboard, Platform } from 'react-native'

// iOS fires "will" events in sync with the keyboard animation;
// Android only reliably fires "did" events.
const SHOW_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const HIDE_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

export const useKeyboardVisible = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener(SHOW_EVENT, () =>
      setIsVisible(true)
    )
    const hideSubscription = Keyboard.addListener(HIDE_EVENT, () =>
      setIsVisible(false)
    )

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return isVisible
}
