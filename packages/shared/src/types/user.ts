export interface PublicUser {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  name: string | null
  onboardedAt: Date | null
}
