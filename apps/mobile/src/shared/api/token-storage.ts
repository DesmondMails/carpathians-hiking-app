import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const tokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  },

  async setAccessToken(token: string) {
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
  },

  async removeAccessToken() {
    return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
  },

  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  },

  async setRefreshToken(token: string) {
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
  },

  async removeRefreshToken() {
    return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ])
  },
}
