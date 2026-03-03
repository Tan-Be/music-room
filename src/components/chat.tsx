'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { isSupabaseConfigured } from '@/lib/supabase'

interface Message {
  id: string
  room_id: string
  user_id: string
  message: string
  created_at: string
  profiles?: {
    username: string
    avatar_url: string | null
  }
}

interface ChatProps {
  roomId: string
}

export function Chat({ roomId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (roomId && isSupabaseConfigured()) {
      loadMessages()
      startPolling()
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startPolling = () => {
    pollingRef.current = setInterval(() => {
      loadMessages(false)
    }, 3000)
  }

  const loadMessages = async (showLoading = true) => {
    if (!roomId || !isSupabaseConfigured()) return

    try {
      if (showLoading) setLoading(true)
      const response = await fetch(`/api/chat?roomId=${roomId}&limit=50`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return

    const userId = (session.user as any).id
    
    try {
      setSending(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId,
          message: newMessage
        })
      })

      const data = await response.json()

      if (data.message) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isSupabaseConfigured()) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a1a1aa',
        fontSize: '0.9rem'
      }}>
        Чат недоступен (Supabase не настроен)
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#e2e8f0', 
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💬 Чат
        </h3>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '2rem' }}>
            Загрузка сообщений...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#a1a1aa', 
            padding: '2rem',
            fontSize: '0.9rem'
          }}>
            Пока нет сообщений. Будьте первым!
          </div>
        ) : (
          messages.map(msg => {
            const isOwnMessage = session?.user && (session.user as any).id === msg.user_id
            
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  gap: '0.25rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ 
                    color: '#8b5cf6', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {msg.profiles?.username || 'Пользователь'}
                  </span>
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '0.7rem' 
                  }}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div style={{
                  maxWidth: '80%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '12px',
                  backgroundColor: isOwnMessage 
                    ? 'rgba(139, 92, 246, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {session ? (
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: sending || !newMessage.trim()
                ? 'rgba(139, 92, 246, 0.3)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            {sending ? '...' : '→'}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
          textAlign: 'center',
          color: '#a1a1aa',
          fontSize: '0.85rem'
        }}>
          Войдите, чтобы писать в чат
        </div>
      )}
    </div>
  )
}
