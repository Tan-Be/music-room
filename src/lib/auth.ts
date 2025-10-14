import { supabase } from './supabase'

// Функции аутентификации
export const auth = {
  // Регистрация с помощью email и пароля
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
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

  // Вход через Spotify (заглушка для будущей реализации)
  signInWithSpotify: async () => {
    // This will be implemented when we set up Spotify OAuth
    throw new Error('Spotify OAuth not implemented yet')
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
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}