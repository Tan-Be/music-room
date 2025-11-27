import { supabase } from '@/lib/supabase'
import { ChatMessage } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  filterProfanity,
  validateMessage,
  MIN_MESSAGE_INTERVAL,
} from '@/lib/chat-filter'
import { retrySupabaseQuery, retryMutation } from '@/lib/retry'

// Типы для realtime чата
export type ChatMessageWithUserInfo = ChatMessage & {
  profiles: {
    username: string
    avatar_url: string | null
  } | null
}

export type ChatCallback = (messages: ChatMessageWithUserInfo[]) => void
export type NewMessageCallback = (message: ChatMessageWithUserInfo) => void

// Класс для управления realtime чатом
class ChatRealtimeService {
  private roomId: string | null = null
  private channel: any = null
  private onMessagesCallback: ChatCallback | null = null
  private onNewMessageCallback: NewMessageCallback | null = null
  private messageBuffer: ChatMessageWithUserInfo[] = []
  private isSubscribed = false
  private userMessageTimes: Map<string, number> = new Map() // Для отслеживания частоты сообщений пользователей

  // Подписка на сообщения комнаты
  subscribeToRoom(
    roomId: string,
    onMessages: ChatCallback,
    onNewMessage?: NewMessageCallback
  ) {
    this.roomId = roomId
    this.onMessagesCallback = onMessages
    this.onNewMessageCallback = onNewMessage || null

    // Отписываемся от предыдущей комнаты, если была подписка
    if (this.channel) {
      this.unsubscribe()
    }

    // Создаем канал для подписки на realtime обновления
    this.channel = supabase
      .channel(`room:${roomId}:chat`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async payload => {
          try {
            // Получаем информацию о пользователе для нового сообщения
            const message = payload.new as ChatMessage
            const userMessage = await this.getMessageWithUserInfo(message)

            if (userMessage) {
              // Вызываем callback для нового сообщения
              if (this.onNewMessageCallback) {
                this.onNewMessageCallback(userMessage)
              }

              // Добавляем в буфер и вызываем общий callback
              this.messageBuffer.push(userMessage)
              if (this.onMessagesCallback) {
                this.onMessagesCallback([...this.messageBuffer])
              }
            }
          } catch (error) {
            console.error('Error processing new message:', error)
            toast.error('Ошибка при обработке нового сообщения')
          }
        }
      )
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true
          console.log(`Subscribed to chat for room ${roomId}`)

          // Загружаем последние сообщения при успешной подписке
          await this.loadRecentMessages()
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Channel error for room ${roomId}`)
          toast.error('Ошибка подключения к чату')
        } else if (status === 'CLOSED') {
          console.log(`Channel closed for room ${roomId}`)
          this.isSubscribed = false
        }
      })
  }

  // Загрузка последних сообщений комнаты
  async loadRecentMessages(limit = 50) {
    if (!this.roomId) return

    const roomId = this.roomId // Сохраняем в локальную переменную для TypeScript
    const data = await retrySupabaseQuery(async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(
          `
          *,
          profiles (username, avatar_url)
        `
        )
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    })

    if (data) {
      // Преобразуем сообщения в правильный формат
      const messagesWithUserInfo = (data as any[]).map(msg => ({
        ...msg,
        profiles: msg.profiles || null,
      })) as ChatMessageWithUserInfo[]

      // Сохраняем сообщения в буфер (в обратном порядке, чтобы новые были в конце)
      this.messageBuffer = messagesWithUserInfo.reverse()

      // Вызываем callback с сообщениями
      if (this.onMessagesCallback) {
        this.onMessagesCallback([...this.messageBuffer])
      }
    }
  }

  // Получение информации о пользователе для сообщения
  private async getMessageWithUserInfo(
    message: ChatMessage
  ): Promise<ChatMessageWithUserInfo | null> {
    const profileData = await retrySupabaseQuery(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', message.user_id)
        .single()

      if (error) throw error
      return data
    })

    return {
      ...message,
      profiles: profileData || null,
    }
  }

  // Проверка, не отправляет ли пользователь сообщения слишком часто
  private isUserSendingTooFast(userId: string): boolean {
    const lastMessageTime = this.userMessageTimes.get(userId) || 0
    const now = Date.now()
    return now - lastMessageTime < MIN_MESSAGE_INTERVAL
  }

  // Обновление времени последнего сообщения пользователя
  private updateUserMessageTime(userId: string): void {
    this.userMessageTimes.set(userId, Date.now())
  }

  // Отправка нового сообщения
  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    lastMessageTime: number = 0
  ): Promise<boolean> {
    try {
      // Проверяем, не отправляет ли текущий пользователь сообщения слишком часто
      if (this.isUserSendingTooFast(userId)) {
        toast.error(
          `Пожалуйста, подождите перед отправкой следующего сообщения`
        )
        return false
      }

      // Валидация сообщения
      const validation = validateMessage(content, lastMessageTime)
      if (!validation.isValid) {
        toast.error(validation.error || 'Ошибка валидации сообщения')
        return false
      }

      // Фильтрация нецензурной лексики
      const filteredContent = filterProfanity(content)

      const success = await retryMutation(async () => {
        const { error } = await supabase.from('chat_messages').insert({
          room_id: roomId,
          user_id: userId,
          message: filteredContent.trim(),
        } as any)

        if (error) throw error
      })

      if (success) {
        // Обновляем время последнего сообщения пользователя
        this.updateUserMessageTime(userId)
      }

      return success
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Ошибка при отправке сообщения')
      return false
    }
  }

  // Отписка от комнаты
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
      this.roomId = null
      this.messageBuffer = []
      this.isSubscribed = false
      this.userMessageTimes.clear()
      console.log('Unsubscribed from chat')
    }
  }

  // Проверка статуса подписки
  isCurrentlySubscribed(): boolean {
    return this.isSubscribed && this.channel !== null
  }

  // Получение текущего ID комнаты
  getCurrentRoomId(): string | null {
    return this.roomId
  }
}

// Экспортируем singleton инстанс сервиса
export const chatRealtimeService = new ChatRealtimeService()
