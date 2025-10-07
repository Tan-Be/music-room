export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
  confirmPassword: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  lastLoginAt?: Date
  isOnline: boolean
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}