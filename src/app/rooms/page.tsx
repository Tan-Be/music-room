'use client'

import { useState } from 'react'
import { AnimatedBackground } from '@/components/common/animated-background'

interface Room {
  id: string
  name: string
  description: string
  participants: number
  isPublic: boolean
  owner: string
}

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Chill Vibes',
    description: 'Расслабляющая музыка для работы и отдыха',
    participants: 12,
    isPublic: true,
    owner: 'user1'
  },
  {
    id: '2',
    name: 'Party Hits',
    description: 'Лучшие хиты для вечеринок',
    participants: 8,
    isPublic: true,
    owner: 'user2'
  },
  {
    id: '3',
    name: 'Indie Discoveries',
    description: 'Новые инди-треки и артисты',
    participants: 5,
    isPublic: true,
    owner: 'user3'
  },
]

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPublic: true,
    password: ''
  })

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      alert('Введите название комнаты')
      return
    }

    const room: Room = {
      id: Date.now().toString(),
      name: newRoom.name,
      description: newRoom.description,
      participants: 1,
      isPublic: newRoom.isPublic,
      owner: 'current_user'
    }

    setRooms([room, ...rooms])
    setNewRoom({ name: '', description: '', isPublic: true, password: '' })
    setShowCreateDialog(false)
    
    // Переход в созданную комнату
    window.location.href = `/room/${room.id}`
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
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
              🎵 Музыкальные комнаты
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#a1a1aa'
            }}>
              Найдите комнату или создайте свою
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)'
            }}
          >
            ✨ Создать комнату
          </button>
        </div>

        {/* Rooms Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {rooms.map(room => (
            <div
              key={room.id}
              style={{
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 15px 45px rgba(139, 92, 246, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
              }}
              onClick={() => window.location.href = `/room/${room.id}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  color: '#e2e8f0',
                  margin: 0
                }}>
                  {room.name}
                </h3>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  backgroundColor: room.isPublic ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: room.isPublic ? '#22c55e' : '#ef4444',
                  border: `1px solid ${room.isPublic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {room.isPublic ? '🌍 Публичная' : '🔒 Приватная'}
                </div>
              </div>
              
              <p style={{ 
                color: '#a1a1aa', 
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}>
                {room.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                    👥 {room.participants} участников
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                    👑 {room.owner}
                  </span>
                </div>
                
                <button
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.4)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/room/${room.id}`
                  }}
                >
                  Присоединиться
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>

      {/* Create Room Dialog */}
      {showCreateDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1.5rem', 
              color: '#8b5cf6',
              textAlign: 'center'
            }}>
              ✨ Создать новую комнату
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '1rem'
              }}>
                Название комнаты *
              </label>
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="Например: Chill Vibes"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '1rem'
              }}>
                Описание
              </label>
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Расскажите о вашей комнате..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#e2e8f0',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={newRoom.isPublic}
                  onChange={(e) => setNewRoom({ ...newRoom, isPublic: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#8b5cf6'
                  }}
                />
                🌍 Публичная комната (видна всем)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowCreateDialog(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                }}
              >
                Отмена
              </button>
              
              <button
                onClick={handleCreateRoom}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'
                }}
              >
                Создать комнату
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}