import Constants from 'expo-constants'

const API_PORT = 3000

const getDevMachineIp = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) {
    return hostUri.split(':')[0]
  }
  return process.env.EXPO_PUBLIC_LOCAL_MAC_IP ?? null
}

export const getBaseUrl = () => {
  if (__DEV__) {
    const ip = getDevMachineIp()
    if (!ip) {
      console.warn('Could not detect dev machine IP. Falling back to localhost.')
      return `http://localhost:${API_PORT}`
    }
    return `http://${ip}:${API_PORT}`
  }

  return process.env.EXPO_PUBLIC_API_URL
}
