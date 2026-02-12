'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AnimatedBackground } from '@/components/common/animated-background'
import { roomsApi, isSupabaseConfigured } from '@/lib/supabase'
import MusicPlayer from '@/components/music-player'

interface Room {
  id: string
  name: string
  description: string | null
  is_public: boolean
  owner_id: string
  max_participants: number
  created_at: string
  profiles?: {
    username: string
  }
  room_participants?: Array<{
    id: string
    user_id: string
    role: string
    profiles?: {
      username: string
      avatar_url: string | null
    }
  }>
}

export default function RoomPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const roomId = params.id as string

  useEffect(() => {
    if (roomId) {
      loadRoom()
    }
  }, [roomId])

  const loadRoom = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsDemoMode(false)
      
      // Проверяем, настроен ли Supabase
      if (!isSupabaseConfigured()) {
        setIsDemoMode(true)
        loadDemoRoom()
        return
      }
      
      // Пробуем загрузить из Supabase
      try {
        const data = await roomsApi.getRoomById(roomId)
        
        if (!data) {
          throw new Error('Комната не найдена')
        }
        
        setRoom(data)
        setLoading(false)
      } catch (supabaseError: any) {
        // Если ошибка сети - переключаемся в демо-режим
        setIsDemoMode(true)
        loadDemoRoom()
      }
    } catch (err: any) {
      setIsDemoMode(true)
      loadDemoRoom()
    }
  }
  
  const loadDemoRoom = () => {
    setRoom({
      id: roomId,
      name: `Комната #${roomId.slice(0, 8)}`,
      description: 'Демо-комната',
      is_public: true,
      owner_id: 'demo',
      max_participants: 10,
      created_at: new Date().toISOString(),
      profiles: { username: 'Demo User' },
      room_participants: []
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
        <AnimatedBackground />
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(139, 92, 246, 0.3)',
              borderTop: '3px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ fontSize: '1.2rem' }}>Загрузка комнаты...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    )
  }

  if (error || !room) {
    return (
      <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
        <AnimatedBackground />
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: '800px', 
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '20vh'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            color: '#ef4444' 
          }}>
            ⚠️ Ошибка
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '2rem' }}>
            {error || 'Комната не найдена'}
          </p>
          <a
            href="/rooms"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}
          >
            ← Назад к комнатам
          </a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <p style={{ 
                color: '#f59e0b', 
                fontWeight: 'bold', 
                margin: '0 0 0.25rem 0',
                fontSize: '1rem'
              }}>
                Демо-режим
              </p>
              <p style={{ 
                color: '#d97706', 
                margin: 0,
                fontSize: '0.9rem'
              }}>
                Supabase не подключен. Данные сохраняются только локально.
              </p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '0.5rem', 
              color: '#8b5cf6',
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}>
              🎵 {room.name}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa' }}>
              {room.description || 'Нет описания'}
            </p>
          </div>
          
          <a
            href="/rooms"
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.05)'
            }}
          >
            ← Назад
          </a>
        </div>

        {/* Room Info */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Main Content */}
          <div style={{ 
            gridColumn: 'span 2',
            border: '2px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            minHeight: '400px'
          }}>
            <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>
              🎶 Музыкальный плеер
            </h2>
            <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '4rem 0' }}>
              Функционал плеера в разработке...
            </p>
          </div>

          {/* Participants */}
          <div style={{ 
            border: '2px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              👥 Участники ({room.room_participants?.length || 0}/{room.max_participants})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {room.room_participants?.map((participant) => (
                <div 
                  key={participant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>
                    {participant.profiles?.avatar_url || '👤'}
                  </span>
                  <div>
                    <p style={{ color: '#e2e8f0', margin: 0 }}>
                      {participant.profiles?.username || 'Неизвестно'}
                    </p>
                    <p style={{ color: '#8b5cf6', fontSize: '0.8rem', margin: 0 }}>
                      {participant.role === 'owner' ? '👑 Создатель' : '👤 Участник'}
                    </p>
                  </div>
                </div>
              )) || (
                <p style={{ color: '#a1a1aa', textAlign: 'center' }}>
                  Нет участников
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
