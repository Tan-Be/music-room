'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { MAX_MESSAGE_LENGTH } from '@/lib/chat-filter'

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

interface ChatProps {
  messages: ChatMessage[]
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
  onSendMessage?: (content: string) => void
  className?: string
  isTyping?: boolean
}

// Функция для форматирования времени сообщения
function formatMessageTime(date: Date): string {
  const now = new Date()
  const messageDate = new Date(date)

  // Если сообщение сегодня, показываем только время
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Если сообщение вчера, показываем "Вчера" и время
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Вчера ${messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  // Для более старых сообщений показываем дату и время
  return messageDate.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Chat({
  messages,
  currentUser,
  onSendMessage,
  className,
  isTyping,
}: ChatProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      setError('Сообщение не может быть пустым')
      return
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)`
      )
      return
    }

    if (onSendMessage) {
      onSendMessage(message.trim())
      setMessage('')
      setError('')
    }
  }

  // Обработчик ввода текста
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
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
  }

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Фокус на поле ввода при монтировании
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="border-b">
        <h3 className="font-semibold">Чат комнаты</h3>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => {
          if (message.type === 'system') {
            // Отображение системного сообщения
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-muted rounded-lg px-3 py-2 text-center text-sm text-muted-foreground max-w-[80%]">
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            )
          } else {
            // Отображение пользовательского сообщения
            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.userId === currentUser?.id ? 'flex-row-reverse' : ''
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={message.userAvatar}
                    alt={message.userName}
                  />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2',
                    message.userId === currentUser?.id
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  )}
                >
                  <div className="text-xs font-medium mb-1">
                    {message.userName}
                  </div>
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            )
          }
        })}

        {isTyping && (
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>...</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-3 py-2 rounded-bl-none">
              <div className="text-xs font-medium mb-1">
                Пользователь печатает
              </div>
              <div className="flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              placeholder="Написать сообщение..."
              className="flex-1"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <Button type="submit" size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
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
