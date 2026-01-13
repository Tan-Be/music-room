'use client'

import { AnimatedBackground } from '@/components/common/animated-background'
import { useState } from 'react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают!')
      return
    }

    // Здесь будет логика регистрации
    console.log('Регистрация:', formData)
    alert('Регистрация пока не реализована. Это демо-версия.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
          border: '2px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem', 
            color: '#22c55e',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
          }}>
            ✨ Регистрация
          </h1>
          
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem', 
            color: '#a1a1aa',
            textAlign: 'center'
          }}>
            Создайте аккаунт для Music Room
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '0.9rem'
              }}>
                Имя пользователя
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(34, 197, 94, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '0.9rem'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(34, 197, 94, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '0.9rem'
              }}>
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(34, 197, 94, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#e2e8f0',
                fontSize: '0.9rem'
              }}>
                Подтвердите пароль
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(34, 197, 94, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.4)'
              }}
            >
              Создать аккаунт
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem'
          }}>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Уже есть аккаунт?
            </p>
            <a
              href="/login"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
              }}
            >
              Войти в аккаунт
            </a>
          </div>

          <div style={{ 
            marginTop: '1rem', 
            textAlign: 'center'
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