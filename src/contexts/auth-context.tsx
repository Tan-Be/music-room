'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithSpotify: () => Promise<void>
  refreshProfile: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем сессию при загрузке приложения
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          // Получаем профиль пользователя
          try {
            const userProfile = await auth.getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError)
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Подписываемся на изменения аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Получаем профиль пользователя
        try {
          const userProfile = await auth.getUserProfile(session.user.id)
          setProfile(userProfile)
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await auth.signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await auth.signUp(email, password, username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithSpotify = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await auth.signInWithSpotify()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const userProfile = await auth.getUserProfile(user.id)
      setProfile(userProfile)
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh profile')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signIn,
        signUp,
        signOut,
        signInWithSpotify,
        refreshProfile,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
