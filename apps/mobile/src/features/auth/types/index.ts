export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface ResendCodePayload {
  email: string
}
