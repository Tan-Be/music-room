import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Проверяем, настроен ли Supabase корректно
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url' &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl.startsWith('https://')
  )
}

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase не настроен. Установите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Типы для базы данных
export interface Room {
  id: string
  name: string
  description: string | null
  is_public: boolean
  password_hash: string | null
  max_participants: number
  owner_id: string
  current_track_id: string | null
  is_playing: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  spotify_id: string | null
  tracks_added_today: number
  last_track_date: string
  created_at: string
  updated_at: string
}

// Функции для работы с комнатами
export const roomsApi = {
  // Получить все публичные комнаты
  async getPublicRooms() {
    // Если Supabase не настроен, сразу выбрасываем ошибку
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase не настроен. Проверьте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          profiles:owner_id (username),
          room_participants (id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase getPublicRooms error:', JSON.stringify(error, null, 2))
        throw new Error(error.message || error.code || 'Ошибка при загрузке комнат')
      }
      return data || []
    } catch (err: any) {
      console.error('Error in getPublicRooms:', err?.message || err)
      throw err
    }
  },

  // Создать новую комнату
  async createRoom(roomData: {
    name: string
    description?: string
    is_public: boolean
    password?: string
    owner_id: string
  }) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        name: roomData.name,
        description: roomData.description || null,
        is_public: roomData.is_public,
        password_hash: roomData.password || null,
        owner_id: roomData.owner_id,
        max_participants: 10
      }])
      .select()
      .single()

    if (error) throw error

    // Добавить создателя как участника
    await supabase
      .from('room_participants')
      .insert([{
        room_id: data.id,
        user_id: roomData.owner_id,
        role: 'owner'
      }])

    return data
  },

  // Получить комнату по ID
  async getRoomById(roomId: string) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          profiles:owner_id (username),
          room_participants (
            id,
            user_id,
            role,
            joined_at,
            profiles:user_id (username, avatar_url)
          )
        `)
        .eq('id', roomId)
        .single()

      if (error) {
        console.error('Supabase getRoomById error:', error)
        throw new Error(error.message || 'Ошибка базы данных')
      }
      
      return data
    } catch (err: any) {
      console.error('Error in getRoomById:', err)
      throw err
    }
  },

  // Присоединиться к комнате
  async joinRoom(roomId: string, userId: string) {
    const { data, error } = await supabase
      .from('room_participants')
      .insert([{
        room_id: roomId,
        user_id: userId,
        role: 'member'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Покинуть комнату
  async leaveRoom(roomId: string, userId: string) {
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw error
  }
}

// Функции для работы с профилями
export const profilesApi = {
  // Получить профиль пользователя
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Создать профиль пользователя
  async createProfile(profileData: {
    id: string
    username: string
    avatar_url?: string
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: profileData.id,
        username: profileData.username,
        avatar_url: profileData.avatar_url || null
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}