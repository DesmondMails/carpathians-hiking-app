import { Platform } from 'react-native'

const DEV_MACHINE_IP = process.env.EXPO_PUBLIC_LOCAL_MAC_IP

export const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return `http://${DEV_MACHINE_IP}:3000`
    }
    return 'http://localhost:3000'
  }

  return process.env.EXPO_PUBLIC_API_URL
}
