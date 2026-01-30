'use client'

import { AnimatedBackground } from '@/components/common/animated-background'
import { GitHubButton } from '@/components/auth/github-button'
import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    getSession().then((session) => {
      if (session) {
        router.push('/')
      } else {
        setIsLoading(false)
      }
    })
  }, [router])

  if (isLoading) {
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
          <div style={{ color: '#e2e8f0', fontSize: '1.2rem' }}>
            Загрузка...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem', 
            color: '#3b82f6',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}>
            🔐 Вход в Music Room
          </h1>
          
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem', 
            color: '#a1a1aa'
          }}>
            Войдите в свой аккаунт для доступа к музыкальным комнатам
          </p>

          <GitHubButton mode="login" />

          <div style={{ 
            marginTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem'
          }}>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Нет аккаунта?
            </p>
            <a
              href="/register"
              style={{
                color: '#22c55e',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
              }}
            >
              Зарегистрироваться
            </a>
          </div>

          <div style={{ 
            marginTop: '1rem'
          }}>
            <a
              href="/"
              style={{
                color: '#8b5cf6',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a855f7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b5cf6'
              }}
            >
              ← Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}