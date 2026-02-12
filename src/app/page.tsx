'use client'

import { AnimatedBackground } from '@/components/common/animated-background'
import { BackgroundMusicPlayer } from '@/components/common/background-music-player'
import { GitHubButton } from '@/components/auth/github-button'
import { useSession, signOut } from 'next-auth/react'

const mockRooms = [
  {
    id: '1',
    name: 'Chill Vibes',
    description: 'Расслабляющая музыка для работы и отдыха',
    participants: 12,
  },
  {
    id: '2',
    name: 'Party Hits',
    description: 'Лучшие хиты для вечеринок',
    participants: 8,
  },
  {
    id: '3',
    name: 'Indie Discoveries',
    description: 'Новые инди-треки и артисты',
    participants: 5,
  },
]

export default function Home() {
  const { data: session } = useSession()
  
  return (
    <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground />
      <BackgroundMusicPlayer />
      
      <div style={{ position: 'relative', zIndex: 20, textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem', 
          color: '#8b5cf6',
          textShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
        }}>
          Music Room
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '3rem', 
          color: '#e2e8f0',
          textShadow: '0 0 10px rgba(226, 232, 240, 0.3)'
        }}>
          Совместное прослушивание музыки
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {mockRooms.map(room => (
            <div
              key={room.id}
              style={{
                border: '2px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
              }}
            >
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.5rem',
                color: '#e2e8f0'
              }}>
                {room.name}
              </h3>
              <p style={{ 
                color: '#a1a1aa', 
                marginBottom: '1rem' 
              }}>
                {room.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                  {room.participants} участников
                </span>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                    transition: 'all 0.2s ease',
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
                  Присоединиться
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <a
            href="/rooms"
            style={{
              display: 'block',
              padding: '1.5rem',
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
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>🎵 Комнаты</h3>
            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0 }}>
              Все музыкальные комнаты
            </p>
          </a>

          <a
            href="/login"
            style={{
              display: 'block',
              padding: '1.5rem',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>🔐 Войти</h3>
            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0 }}>
              Вход в аккаунт
            </p>
          </a>

          <a
            href="/register"
            style={{
              display: 'block',
              padding: '1.5rem',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>✨ Регистрация</h3>
            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0 }}>
              Создать новый аккаунт
            </p>
          </a>
        </div>

        {/* GitHub OAuth Section */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          maxWidth: '400px',
          margin: '3rem auto 0',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem', 
            color: '#e2e8f0',
            textShadow: '0 0 10px rgba(226, 232, 240, 0.3)'
          }}>
            {session ? '👋 Вы вошли в систему' : 'Быстрый вход'}
          </h3>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#a1a1aa', 
            marginBottom: '1.5rem' 
          }}>
            {session ? 'Нажмите кнопку ниже для выхода' : 'Войдите или зарегистрируйтесь через GitHub'}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                }}
              >
                🚪 Выйти
              </button>
            ) : (
              <>
                <GitHubButton mode="login" />
                <GitHubButton mode="register" />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}