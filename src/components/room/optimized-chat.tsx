'use client'

import { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_MESSAGE_LENGTH } from '@/lib/chat-filter'
import { performanceMonitor } from '@/lib/performance'
import {
  VirtualizedList,
  DebouncedInput,
} from '@/components/common/performance-optimized'

// Типы сообщений (оптимизированные)
interface BaseMessage {
  id: string
  content: string
  timestamp: number // Используем timestamp для лучшей производительности
  type: 'user' | 'system'
}

interface UserMessage extends BaseMessage {
  type: 'user'
  userId: string
  userName: string
  userAvatar?: string
}

interface SystemMessage extends BaseMessage {
  type: 'system'
}

type ChatMessage = UserMessage | SystemMessage

interface OptimizedChatProps {
  messages: ChatMessage[]
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
  onSendMessage?: (content: string) => Promise<void>
  className?: string
  isTyping?: boolean
  maxMessages?: number
}

// Мемоизированный компонент сообщения
const MessageItem = memo(
  ({
    message,
    currentUserId,
    isOwn,
  }: {
    message: ChatMessage
    currentUserId?: string
    isOwn: boolean
  }) => {
    const formattedTime = useMemo(() => {
      const date = new Date(message.timestamp)
      const now = new Date()

      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      }

      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return `Вчера ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }

      return date.toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }, [message.timestamp])

    if (message.type === 'system') {
      return (
        <div className="flex justify-center">
          <div className="bg-muted rounded-lg px-3 py-2 text-center text-sm text-muted-foreground max-w-[80%]">
            <div>{message.content}</div>
            <div className="text-xs opacity-70 mt-1">{formattedTime}</div>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : '')}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.userAvatar} alt={message.userName} />
          <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'max-w-[80%] rounded-lg px-3 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted rounded-bl-none'
          )}
        >
          <div className="text-xs font-medium mb-1">{message.userName}</div>
          <div className="break-words">{message.content}</div>
          <div className="text-xs opacity-70 mt-1">{formattedTime}</div>
        </div>
      </div>
    )
  }
)

MessageItem.displayName = 'MessageItem'

// Индикатор печати (мемоизированный)
const TypingIndicator = memo(() => (
  <div className="flex gap-2">
    <Avatar className="h-8 w-8">
      <AvatarFallback>...</AvatarFallback>
    </Avatar>
    <div className="bg-muted rounded-lg px-3 py-2 rounded-bl-none">
      <div className="text-xs font-medium mb-1">Пользователь печатает</div>
      <div className="flex items-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  </div>
))

TypingIndicator.displayName = 'TypingIndicator'

// Основной компонент оптимизированного чата
export const OptimizedChat = memo(
  ({
    messages,
    currentUser,
    onSendMessage,
    className,
    isTyping,
    maxMessages = 1000,
  }: OptimizedChatProps) => {
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const lastMessageTimeRef = useRef<number>(0)

    // Оптимизированный список сообщений (ограничиваем количество для производительности)
    const optimizedMessages = useMemo(() => {
      return messages.slice(-maxMessages)
    }, [messages, maxMessages])

    // Мемоизированная функция отправки сообщения
    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()

        if (!message.trim() || isSending) return

        if (message.length > MAX_MESSAGE_LENGTH) {
          setError(
            `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)`
          )
          return
        }

        if (!onSendMessage) return

        const startTime = performance.now()
        setIsSending(true)
        setError('')

        try {
          await onSendMessage(message.trim())

          // Измеряем задержку отправки сообщения
          const endTime = performance.now()
          const latency = endTime - startTime
          performanceMonitor.measureChatLatency(startTime, endTime)

          // Логируем медленные отправки
          if (latency > 500) {
            console.warn(`Slow message send: ${latency}ms`)
          }

          setMessage('')

          // Фокус обратно на поле ввода
          setTimeout(() => inputRef.current?.focus(), 0)
        } catch (error) {
          console.error('Failed to send message:', error)
          setError('Не удалось отправить сообщение. Попробуйте еще раз.')
        } finally {
          setIsSending(false)
        }
      },
      [message, isSending, onSendMessage]
    )

    // Оптимизированный обработчик изменения текста
    const handleInputChange = useCallback(
      (value: string) => {
        setMessage(value)

        // Очищаем ошибку при вводе
        if (error && value.trim()) {
          setError('')
        }

        // Проверяем длину сообщения
        if (value.length > MAX_MESSAGE_LENGTH) {
          setError(
            `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)`
          )
        } else if (error.includes('слишком длинное')) {
          setError('')
        }
      },
      [error]
    )

    // Оптимизированный автоскролл
    useEffect(() => {
      const now = Date.now()

      // Ограничиваем частоту скроллинга для производительности
      if (now - lastMessageTimeRef.current > 100) {
        lastMessageTimeRef.current = now
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, [optimizedMessages.length, isTyping])

    // Фокус на поле ввода при монтировании
    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    // Рендер элемента сообщения для виртуализации
    const renderMessage = useCallback(
      (msg: ChatMessage, index: number) => (
        <MessageItem
          key={msg.id}
          message={msg}
          currentUserId={currentUser?.id}
          isOwn={msg.type === 'user' && msg.userId === currentUser?.id}
        />
      ),
      [currentUser?.id]
    )

    // Определяем, нужна ли виртуализация
    const shouldVirtualize = optimizedMessages.length > 100

    return (
      <Card className={cn('flex flex-col h-full', className)}>
        <CardHeader className="border-b flex-shrink-0">
          <h3 className="font-semibold">Чат комнаты</h3>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4">
          {shouldVirtualize ? (
            <VirtualizedList
              items={optimizedMessages}
              renderItem={renderMessage}
              itemHeight={80} // Примерная высота сообщения
              containerHeight={400} // Высота контейнера
              overscan={10}
            />
          ) : (
            <div className="h-full overflow-y-auto space-y-4">
              {optimizedMessages.map((msg, index) => renderMessage(msg, index))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
            {error && (
              <div className="text-sm text-red-500 animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <DebouncedInput
                value={message}
                onChange={handleInputChange}
                delay={0} // Без задержки для чата
                placeholder="Написать сообщение..."
                className="flex-1"
              />

              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || isSending}
                className="flex-shrink-0"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-right">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </form>
        </CardFooter>
      </Card>
    )
  }
)

OptimizedChat.displayName = 'OptimizedChat'
