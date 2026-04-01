export type Difficulty = 'Легкий' | 'Помірний' | 'Складний' | 'Екстрем'

export type Category = { label: string; icon: string }

export type Route = {
  id: string
  title: string
  region: string
  distanceKm: number
  elevationM: number
  durationH: number
  difficulty: Difficulty
  rating: number
  reviewCount: number
  distanceFromUserKm: number
  imageUri: string
  poi?: { water?: number; shelter?: number; viewpoint?: number }
}
