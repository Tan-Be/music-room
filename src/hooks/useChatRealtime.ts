import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  chatRealtimeService,
  ChatMessageWithUserInfo,
} from '@/lib/chat-realtime'
import { systemMessages, SystemMessageData } from '@/lib/system-messages'
import { toast } from 'sonner'

// Тип для пользовательских сообщений
interface UserMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  type: 'user'
}

// Тип для системных сообщений
interface SystemMessage {
  id: string
  content: string
  timestamp: Date
  type: 'system'
}

// Объединенный тип для всех сообщений
type ChatMessage = UserMessage | SystemMessage

export function useChatRealtime(roomId: string) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const lastMessageTime = useRef(0)
  const systemChannelRef = useRef<any>(null)

  // Подписка на сообщения в реальном времени
  useEffect(() => {
    if (user && roomId) {
      // Подписываемся на пользовательские сообщения
      chatRealtimeService.subscribeToRoom(
        roomId,
        chatMessages => {
          // Преобразуем пользовательские сообщения из формата Supabase в формат для UI
          const userMessages: UserMessage[] = chatMessages.map(msg => ({
            id: msg.id,
            userId: msg.user_id,
            userName: msg.profiles?.username || 'Пользователь',
            userAvatar: msg.profiles?.avatar_url || undefined,
            content: msg.message,
            timestamp: new Date(msg.created_at),
            type: 'user',
          }))

          // Получаем системные сообщения
          systemMessages
            .getMessages(roomId)
            .then(({ data: systemMessagesData }) => {
              const systemMsgs: SystemMessage[] = systemMessagesData.map(
                msg => ({
                  id: msg.id,
                  content: msg.content,
                  timestamp: new Date(msg.created_at),
                  type: 'system',
                })
              )

              // Объединяем и сортируем все сообщения
              const allMessages: ChatMessage[] = [
                ...userMessages,
                ...systemMsgs,
              ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

              setMessages(allMessages)
              setIsLoading(false)
            })
        },
        newMessage => {
          // Обработка новых пользовательских сообщений
          const userMsg: UserMessage = {
            id: newMessage.id,
            userId: newMessage.user_id,
            userName: newMessage.profiles?.username || 'Пользователь',
            userAvatar: newMessage.profiles?.avatar_url || undefined,
            content: newMessage.message,
            timestamp: new Date(newMessage.created_at),
            type: 'user',
          }

          setMessages(prev => [...prev, userMsg])
        }
      )

      // Подписываемся на системные сообщения
      systemChannelRef.current = systemMessages.subscribeToMessages(
        roomId,
        systemMessage => {
          const systemMsg: SystemMessage = {
            id: systemMessage.id,
            content: systemMessage.content,
            timestamp: new Date(systemMessage.created_at),
            type: 'system',
          }

          setMessages(prev => [...prev, systemMsg])
        }
      )
    }

    // Отписываемся при размонтировании компонента
    return () => {
      chatRealtimeService.unsubscribe()
      if (systemChannelRef.current) {
        systemChannelRef.current.unsubscribe()
      }
    }
  }, [user, roomId])

  // Отправка сообщения
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !user || !roomId) {
        return false
      }

      try {
        const success = await chatRealtimeService.sendMessage(
          roomId,
          user.id,
          content,
          lastMessageTime.current
        )

        if (success) {
          // Обновляем время последнего сообщения
          lastMessageTime.current = Date.now()
        } else {
          toast.error('Не удалось отправить сообщение')
          return false
        }

        return true
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Ошибка при отправке сообщения')
        return false
      }
    },
    [user, roomId]
  )

  // Создание системного сообщения
  const sendSystemMessage = useCallback(
    async (type: any, content: string) => {
      if (!roomId) return false

      try {
        const { data, error } = await systemMessages.createMessage(
          roomId,
          type,
          content
        )

        if (error) {
          console.error('Error sending system message:', error)
          return false
        }

        return true
      } catch (error) {
        console.error('Error sending system message:', error)
        return false
      }
    },
    [roomId]
  )

  // Проверка статуса подключения
  const isSubscribed = chatRealtimeService.isCurrentlySubscribed()

  return {
    messages,
    isLoading,
    isSubscribed,
    sendMessage,
    sendSystemMessage,
  }
}
