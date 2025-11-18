import { createClient } from '@supabase/supabase-js'

// Типы для Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          spotify_id: string | null
          tracks_added_today: number
          last_track_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          spotify_id?: string | null
          tracks_added_today?: number
          last_track_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          spotify_id?: string | null
          tracks_added_today?: number
          last_track_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_public?: boolean
          password_hash?: string | null
          max_participants?: number
          owner_id: string
          current_track_id?: string | null
          is_playing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          password_hash?: string | null
          max_participants?: number
          owner_id?: string
          current_track_id?: string | null
          is_playing?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          artist: string
          duration: number
          thumbnail_url: string | null
          spotify_id: string | null
          youtube_id: string | null
          added_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          duration: number
          thumbnail_url?: string | null
          spotify_id?: string | null
          youtube_id?: string | null
          added_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          duration?: number
          thumbnail_url?: string | null
          spotify_id?: string | null
          youtube_id?: string | null
          added_by?: string
          created_at?: string
        }
      }
      room_queue: {
        Row: {
          id: string
          room_id: string
          track_id: string
          added_by: string
          position: number
          votes_up: number
          votes_down: number
          added_at: string
        }
        Insert: {
          id?: string
          room_id: string
          track_id: string
          added_by: string
          position: number
          votes_up?: number
          votes_down?: number
          added_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          track_id?: string
          added_by?: string
          position?: number
          votes_up?: number
          votes_down?: number
          added_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
      }
      system_messages: {
        Row: {
          id: string
          room_id: string
          type: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          type: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          type?: string
          content?: string
          created_at?: string
        }
      }
      track_votes: {
        Row: {
          id: string
          user_id: string
          room_id: string
          track_id: string
          vote_value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          track_id: string
          vote_value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          track_id?: string
          vote_value?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Получаем URL и ключ из переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Проверяем, что URL валиден
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('Invalid Supabase URL. Please check your .env.local file.')
  console.error('Current URL value:', supabaseUrl)
}

// Проверяем, что ключ не пустой
if (!supabaseAnonKey) {
  console.error('Missing Supabase anon key. Please check your .env.local file.')
  console.error('Current key value:', supabaseAnonKey)
}

// Создаем клиент Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Экспортируем типы для использования в приложении
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomInsert = Database['public']['Tables']['rooms']['Insert']
export type RoomUpdate = Database['public']['Tables']['rooms']['Update']
export type RoomParticipant =
  Database['public']['Tables']['room_participants']['Row']
export type Track = Database['public']['Tables']['tracks']['Row']
export type RoomQueueItem = Database['public']['Tables']['room_queue']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type SystemMessage =
  Database['public']['Tables']['system_messages']['Row']
export type TrackVote = Database['public']['Tables']['track_votes']['Row']
