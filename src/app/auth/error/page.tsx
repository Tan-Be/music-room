'use client'

import { AnimatedBackground } from '@/components/common/animated-background'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Ошибка конфигурации OAuth. Проверьте настройки GitHub App.'
      case 'AccessDenied':
        return 'Доступ запрещен. Вы отклонили авторизацию через GitHub.'
      case 'Verification':
        return 'Ошибка верификации. Попробуйте еще раз.'
      default:
        return 'Произошла неизвестная ошибка при входе через GitHub.'
    }
  }

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(239, 68, 68, 0.2)',
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
        color: '#ef4444',
        textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
      }}>
        ❌ Ошибка входа
      </h1>
      
      <p style={{ 
        fontSize: '1rem', 
        marginBottom: '2rem', 
        color: '#a1a1aa'
      }}>
        {getErrorMessage(error)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <a
          href="/auth/signin"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Попробовать снова
        </a>

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
  )
}

export default function AuthErrorPage() {
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
        <Suspense fallback={
          <div style={{ color: '#e2e8f0', fontSize: '1.2rem' }}>
            Загрузка...
          </div>
        }>
          <ErrorContent />
        </Suspense>
      </div>
    </main>
  )
}