'use client'

import { useState, useEffect } from 'react'
import { AnimatedBackground } from '@/components/common/animated-background'
import { isSupabaseConfigured } from '@/lib/supabase'

interface Room {
  id: string
  name: string
  description: string | null
  participants: number
  is_public: boolean
  owner: string
  created_at: string
  rating?: number
  likes?: number
  dislikes?: number
}

export default function RatingPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = () => {
    setLoading(true)
    
    // Загружаем из localStorage
    const savedRooms = localStorage.getItem('demoRooms')
    if (savedRooms) {
      try {
        const parsed = JSON.parse(savedRooms)
        // Сортируем по рейтингу (убывание)
        const sorted = parsed.sort((a: Room, b: Room) => (b.rating || 0) - (a.rating || 0))
        setRooms(sorted)
      } catch (e) {
        console.error('Ошибка загрузки:', e)
        setRooms([])
      }
    } else {
      setRooms([])
    }
    
    setLoading(false)
  }

  const getRankStyle = (index: number) => {
    return {
      color: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : '#6b7280'
    }
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const deleteRoom = (roomId: string) => {
    if (!confirm('Удалить эту комнату?')) return
    const updated = rooms.filter(r => r.id !== roomId)
    setRooms(updated)
    localStorage.setItem('demoRooms', JSON.stringify(updated))
  }

  if (loading) {
    return (
      <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
        <AnimatedBackground />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingTop: '20vh' }}>
          <p style={{ color: '#e2e8f0', fontSize: '1.2rem' }}>Загрузка рейтинга...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            color: '#f59e0b',
            textShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
          }}>
            🏆 Рейтинг комнат
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#a1a1aa' }}>
            Топ самых популярных музыкальных комнат
          </p>
        </div>

        {/* Back button */}
        <div style={{ marginBottom: '2rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.05)'
            }}
          >
            ← На главную
          </a>
        </div>

        {/* Rating List */}
        {rooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px'
          }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '1rem' }}>
              📊 Пока нет данных
            </h3>
            <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
              Создайте комнаты и голосуйте за них, чтобы сформировать рейтинг!
            </p>
            <a
              href="/rooms"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.1rem'
              }}
            >
              🎵 Перейти к комнатам
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rooms.map((room, index) => {
              const rankStyle = getRankStyle(index)
              return (
                <div
                  key={room.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: index < 3 ? '1.5rem' : '1.2rem',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    ...rankStyle
                  }}>
                    {getRankIcon(index)}
                  </div>

                    {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#e2e8f0', 
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.2rem'
                    }}>
                      {room.name}
                    </h3>
                    <p style={{ 
                      color: '#a1a1aa', 
                      margin: 0,
                      fontSize: '0.9rem'
                    }}>
                      {room.description || 'Нет описания'} • 👤 {room.owner}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteRoom(room.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      marginLeft: '0.5rem'
                    }}
                    title="Удалить"
                  >
                    🗑
                  </button>

                  {/* Stats */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#fbbf24',
                      fontWeight: 'bold',
                      fontSize: '1.3rem'
                    }}>
                      ⭐ {room.rating || 0}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: '#a1a1aa'
                    }}>
                      <span>👍 {room.likes || 0}</span>
                      <span>👎 {room.dislikes || 0}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <a
                    href={`/room/${room.id}`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Войти
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Total count */}
        {rooms.length > 0 && (
          <p style={{ 
            textAlign: 'center', 
            color: '#a1a1aa', 
            marginTop: '2rem',
            fontSize: '0.9rem'
          }}>
            Всего в рейтинге: {rooms.length} комнат
          </p>
        )}
      </div>
    </main>
  )
}
