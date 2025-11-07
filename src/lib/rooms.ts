// @ts-nocheck
import { supabase } from './supabase'
import { Room } from './supabase'

// Функции для работы с комнатами
export const rooms = {
  // Создание новой комнаты
  createRoom: async (roomData: {
    name: string
    description?: string | null
    is_public: boolean
    password_hash?: string | null
    max_participants: number
    owner_id: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return { data: data?.[0] as Room || null, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },
  
  // Добавление участника в комнату
  addParticipant: async (participantData: {
    room_id: string
    user_id: string
    role: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .insert([participantData])
      
      if (error) {
        // Если пользователь уже участник, возвращаем успех
        if (error.code === '23505') { // duplicate key value violates unique constraint
          return { data: null, error: null }
        }
        throw new Error(error.message)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },
  
  // Получение участников комнаты
  getRoomParticipants: async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (id, username, avatar_url)
        `)
        .eq('room_id', roomId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },
  
  // Удаление участника из комнаты
  removeParticipant: async (participantId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .delete()
        .eq('id', participantId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },
  
  // Обновление роли участника
  updateParticipantRole: async (participantId: string, role: string) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .update({ role })
        .eq('id', participantId)
        .select()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },
  
  // Проверка лимита участников
  checkParticipantLimit: async (roomId: string) => {
    try {
      // Получаем максимальное количество участников для комнаты
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('max_participants')
        .eq('id', roomId)
        .single()
      
      if (roomError) {
        throw new Error(roomError.message)
      }
      
      // Получаем текущее количество участников
      const { count, error: countError } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
      
      if (countError) {
        throw new Error(countError.message)
      }
      
      const isLimitReached = count >= roomData.max_participants
      
      return { 
        isLimitReached, 
        currentCount: count, 
        maxCount: roomData.max_participants,
        error: null 
      }
    } catch (error) {
      return { 
        isLimitReached: false, 
        currentCount: 0, 
        maxCount: 0, 
        error: error.message 
      }
    }
  }
}