import * as Linking from 'expo-linking'

export const buildRouteLink = (routeId: string): string => {
  return Linking.createURL(`/routes/${routeId}`)
}
