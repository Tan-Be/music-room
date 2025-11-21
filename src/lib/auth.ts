// @ts-nocheck
import { supabase } from './supabase'
import { Profile } from './supabase'

// Функции аутентификации
export const auth = {
  // Регистрация с помощью email и пароля
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Создаем профиль пользователя если регистрация прошла успешно
    if (data.user) {
      const { error: profileError } = await supabase.rpc(
        'create_user_profile',
        {
          user_id: data.user.id,
          user_name: username,
        }
      )

      if (profileError) {
        throw profileError
      }
    }

    return data
  },

  // Вход с помощью email и пароля
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  },

  // Получение профиля пользователя
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return data as Profile
  },

  // Обновление профиля пользователя
  updateUserProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      throw error
    }

    return data
  },

  // Вход через Spotify
  signInWithSpotify: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes:
          'user-read-email,user-read-private,user-library-read,user-top-read,playlist-read-private,playlist-read-collaborative,user-read-playback-state,user-modify-playback-state',
      },
    })

    if (error) {
      throw error
    }

    return data
  },

  // Вход через Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      throw error
    }

    return data
  },

  // Вход через GitHub
  signInWithGithub: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return data
  },

  // Выход
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  },

  // Получение текущего пользователя
  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },
}
