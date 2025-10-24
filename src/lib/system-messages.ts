import { supabase } from './supabase'
import { SystemMessage } from './supabase'
import { toast } from 'sonner'

// Типы системных сообщений
export type SystemMessageType = 
  | 'user_joined'
  | 'user_left'
  | 'track_added'
  | 'track_removed'
  | 'playback_started'
  | 'playback_paused'
  | 'track_skipped'
  | 'user_kicked'
  | 'user_banned'
  | 'room_created'
  | 'room_deleted'

// Интерфейс для системного сообщения
export interface SystemMessageData {
  id: string
  room_id: string
  type: SystemMessageType
  content: string
  created_at: string
}

// Сервис для работы с системными сообщениями
export const systemMessages = {
  // Создание системного сообщения
  createMessage: async (
    roomId: string,
    type: SystemMessageType,
    content: string
  ): Promise<{ data: SystemMessageData | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('system_messages')
        .insert({
          room_id: roomId,
          type,
          content
        } as any)
        .select()
      
      if (error) {
        throw new Error(error.message)
      }
      
      return { data: data[0] as SystemMessageData, error: null }
    } catch (error: any) {
      console.error('Error creating system message:', error)
      return { data: null, error: error.message }
    }
  },

  // Получение системных сообщений для комнаты
  getMessages: async (
    roomId: string,
    limit: number = 50
  ): Promise<{ data: SystemMessageData[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('system_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Возвращаем сообщения в правильном порядке (новые в конце)
      return { data: (data as SystemMessageData[]).reverse(), error: null }
    } catch (error: any) {
      console.error('Error fetching system messages:', error)
      return { data: [], error: error.message }
    }
  },

  // Подписка на системные сообщения в реальном времени
  subscribeToMessages: (
    roomId: string,
    callback: (message: SystemMessageData) => void
  ) => {
    const channel = supabase
      .channel(`room:${roomId}:system_messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          callback(payload.new as SystemMessageData)
        }
      )
      .subscribe()
    
    return channel
  },

  // Генерация сообщений для различных событий
  generateUserJoinedMessage: (username: string): string => {
    return `${username} присоединился к комнате`
  },

  generateUserLeftMessage: (username: string): string => {
    return `${username} покинул комнату`
  },

  generateTrackAddedMessage: (username: string, trackTitle: string): string => {
    return `${username} добавил трек "${trackTitle}"`
  },

  generateTrackRemovedMessage: (username: string, trackTitle: string): string => {
    return `${username} удалил трек "${trackTitle}"`
  },

  generatePlaybackStartedMessage: (): string => {
    return 'Воспроизведение начато'
  },

  generatePlaybackPausedMessage: (): string => {
    return 'Воспроизведение приостановлено'
  },

  generateTrackSkippedMessage: (username: string): string => {
    return `${username} пропустил трек`
  },

  generateUserKickedMessage: (kickedUsername: string, kickerUsername: string): string => {
    return `${kickedUsername} был исключен из комнаты пользователем ${kickerUsername}`
  },

  generateUserBannedMessage: (bannedUsername: string, bannerUsername: string): string => {
    return `${bannedUsername} был забанен пользователем ${bannerUsername}`
  },

  generateRoomCreatedMessage: (roomName: string, creatorUsername: string): string => {
    return `Комната "${roomName}" создана пользователем ${creatorUsername}`
  },

  generateRoomDeletedMessage: (roomName: string): string => {
    return `Комната "${roomName}" удалена`
  }
}