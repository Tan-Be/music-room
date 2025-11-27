// @ts-nocheck
import { supabase } from './supabase'
import { Profile } from './supabase'
import { retrySupabaseQuery, retryMutation } from './retry'

// Функции аутентификации
export const auth = {
  // Регистрация с помощью email и пароля
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    })

    if (error) {
      throw error
    }

    // Создаем профиль пользователя если регистрация прошла успешно
    if (data.user) {
      const success = await retryMutation(async () => {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: username,
          avatar_url: null,
          spotify_id: null,
          tracks_added_today: 0,
          last_track_date: new Date().toISOString().split('T')[0],
        })

        if (profileError) {
          // Игнорируем ошибку, если профиль уже существует (может быть создан триггером)
          if (profileError.code !== '23505') {
            throw profileError
          }
        }
      })

      if (!success) {
        console.warn('Failed to create profile, but user was registered')
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
    return await retrySupabaseQuery(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data as Profile
    })
  },

  // Обновление профиля пользователя
  updateUserProfile: async (userId: string, updates: Partial<Profile>) => {
    const success = await retryMutation(async () => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) {
        throw error
      }
    })

    return success
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
