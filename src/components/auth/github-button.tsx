'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'

interface GitHubButtonProps {
  mode: 'login' | 'register'
  className?: string
}

export function GitHubButton({ mode, className = '' }: GitHubButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  // Проверяем, настроен ли GitHub OAuth
  const isGitHubConfigured = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && 
                            process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID !== 'demo_client_id'

  const handleGitHubAuth = async () => {
    if (!isGitHubConfigured) {
      alert('GitHub OAuth не настроен. Создайте GitHub OAuth приложение.')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await signIn('github', {
        callbackUrl: '/',
        redirect: false,
      })

      if (result?.error) {
        alert(`Ошибка ${mode === 'login' ? 'входа' : 'регистрации'}: ${result.error}`)
      } else if (result?.url) {
        window.location.href = result.url
      }
      
    } catch (error) {
      console.error('GitHub auth error:', error)
      alert('Ошибка при подключении к GitHub')
    } finally {
      setIsLoading(false)
    }
  }

  // Если пользователь уже авторизован
  if (session) {
    return (
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#22c55e'
      }}>
        ✅ Вы вошли как {session.user?.name || session.user?.email}
      </div>
    )
  }

  // Если GitHub OAuth не настроен
  if (!isGitHubConfigured) {
    return (
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#ffc107'
      }}>
        ⚠️ GitHub OAuth требует настройки
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#a1a1aa' }}>
          Создайте GitHub OAuth App для активации
        </div>
      </div>
    )
  }

  const buttonText = mode === 'login' ? 'Войти через GitHub' : 'Зарегистрироваться через GitHub'
  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )

  return (
    <button
      onClick={handleGitHubAuth}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-3 w-full px-4 py-3 
        bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600
        text-white font-medium rounded-lg
        border border-gray-700 hover:border-gray-600
        transition-all duration-200 ease-in-out
        disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: isLoading ? '#4b5563' : '#111827',
        borderColor: isLoading ? '#6b7280' : '#374151',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#1f2937'
          e.currentTarget.style.borderColor = '#4b5563'
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#111827'
          e.currentTarget.style.borderColor = '#374151'
        }
      }}
    >
      {isLoading ? (
        <>
          <div 
            className="spinner"
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span>Подключение...</span>
        </>
      ) : (
        <>
          {icon}
          <span>{buttonText}</span>
        </>
      )}
    </button>
  )
}