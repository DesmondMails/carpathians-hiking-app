import { GoogleSignin } from '@react-native-google-signin/google-signin'

let configured = false

export const signInWithGoogle = async () => {
  if (!configured) {
    GoogleSignin.configure({
      offlineAccess: true,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    })
    configured = true
  }

  await GoogleSignin.hasPlayServices()

  const userInfo = await GoogleSignin.signIn()

  return {
    idToken: userInfo.data?.idToken,
  }
}
