import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: any | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setProfile: (profile: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      profile: null,
      isLoading: false,
      error: null,
      setUser: user => set({ user }),
      setProfile: profile => set({ profile }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      signOut: () => set({ user: null, profile: null, error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
