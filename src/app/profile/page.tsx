'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AnimatedBackground } from '@/components/common/animated-background'
import { supabase, isSupabaseConfigured, profilesApi } from '@/lib/supabase'

interface HistoryItem {
  id: string
  track_id: string
  room_id: string
  played_at: string
  duration_played: number
  rooms?: {
    id: string
    name: string
  }
  tracks?: {
    id: string
    title: string
    artist: string
    thumbnail_url: string | null
  }
}

interface FavoriteRoom {
  id: string
  name: string
  description: string | null
  added_at: string
}

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  spotify_id: string | null
  tracks_added_today: number
  last_track_date: string
  created_at: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'settings'>('history')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [favoriteRooms, setFavoriteRooms] = useState<FavoriteRoom[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    if (session?.user && isSupabaseConfigured()) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [session])

  const loadProfile = async () => {
    if (!session?.user) return
    
    if (!isSupabaseConfigured()) {
      const savedFavorites = localStorage.getItem('favoriteRooms')
      if (savedFavorites) {
        setFavoriteRooms(JSON.parse(savedFavorites))
      }
      setProfile(null)
      setHistory([])
      setLoading(false)
      setIsDemoMode(true)
      return
    }
    
    try {
      const userId = (session.user as any).id
      
      const [profileData, historyData] = await Promise.all([
        profilesApi.getProfile(userId),
        supabase
          .from('playback_history')
          .select('*, rooms(name), tracks(title, artist, thumbnail_url)')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .limit(50)
      ])

      setProfile(profileData)
      setHistory(historyData.data || [])
      
      const savedFavorites = localStorage.getItem('favoriteRooms')
      if (savedFavorites) {
        setFavoriteRooms(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setIsDemoMode(true)
    } finally {
      setLoading(false)
    }
  }

  const updateUsername = async () => {
    if (!newUsername.trim() || !session?.user) return
    
    try {
      const userId = (session.user as any).id
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', userId)

      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null)
      setEditingUsername(false)
    } catch (error) {
      console.error('Failed to update username:', error)
      alert('Не удалось обновить имя пользователя')
    }
  }

  const removeFromFavorites = (roomId: string) => {
    const updated = favoriteRooms.filter(r => r.id !== roomId)
    setFavoriteRooms(updated)
    localStorage.setItem('favoriteRooms', JSON.stringify(updated))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!session) {
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
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '2px solid rgba(139, 92, 246, 0.3)'
          }}>
            <h2 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>🔐 Войдите в аккаунт</h2>
            <p style={{ color: '#a1a1aa' }}>Для просмотра профиля необходимо войти в систему</p>
            <a 
              href="/auth/signin"
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              Войти
            </a>
          </div>
        </div>
      </main>
    )
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
            <p>Загрузка профиля...</p>
          </div>
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
          <a 
            href="/"
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              color: '#8b5cf6',
              textDecoration: 'none'
            }}
          >
            ← На главную
          </a>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            color: '#8b5cf6',
            textShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
          }}>
            👤 Профиль
          </h1>
        </div>

        {/* Profile Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: 'white'
          }}>
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              session.user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            {editingUsername ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Новое имя"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={updateUsername}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingUsername(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ color: '#e2e8f0', margin: 0, fontSize: '1.8rem' }}>
                  {profile?.username || session.user?.name || 'Пользователь'}
                </h2>
                {profile && (
                  <button
                    onClick={() => {
                      setNewUsername(profile?.username || '')
                      setEditingUsername(true)
                    }}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      backgroundColor: 'transparent',
                      color: '#8b5cf6',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Изменить
                  </button>
                )}
              </div>
            )}
            <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>
              {session.user?.email}
            </p>
            <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Участник с {profile?.created_at ? formatDate(profile.created_at) : 'неизвестно'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
          paddingBottom: '0.5rem'
        }}>
          {[
            { key: 'history', label: '📜 История' },
            { key: 'favorites', label: '⭐ Избранное' },
            { key: 'settings', label: '⚙️ Настройки' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab.key 
                  ? 'rgba(139, 92, 246, 0.3)' 
                  : 'transparent',
                color: activeTab === tab.key ? '#e2e8f0' : '#a1a1aa',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              История прослушиваний ({history.length} треков)
            </h3>
            
            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(139, 92, 246, 0.2)'
              }}>
                <p style={{ color: '#a1a1aa' }}>Вы ещё не слушали треки в комнатах</p>
                <a 
                  href="/rooms"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    borderRadius: '8px',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  Найти комнату
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    {item.tracks?.thumbnail_url ? (
                      <img 
                        src={item.tracks.thumbnail_url} 
                        alt={item.tracks.title}
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        🎵
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#e2e8f0', margin: 0, fontWeight: 'bold' }}>
                        {item.tracks?.title || 'Неизвестный трек'}
                      </p>
                      <p style={{ color: '#a1a1aa', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        {item.tracks?.artist || 'Неизвестный исполнитель'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.85rem' }}>
                        {item.rooms?.name || 'Комната удалена'}
                      </p>
                      <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                        {formatDate(item.played_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              Избранные комнаты ({favoriteRooms.length})
            </h3>
            
            {favoriteRooms.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(139, 92, 246, 0.2)'
              }}>
                <p style={{ color: '#a1a1aa' }}>У вас пока нет избранных комнат</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Добавляйте комнаты в избранное, нажимая на ⭐ в комнате
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {favoriteRooms.map(room => (
                  <div
                    key={room.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ color: '#e2e8f0', margin: 0 }}>{room.name}</h4>
                        <p style={{ color: '#a1a1aa', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          {room.description || 'Нет описания'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromFavorites(room.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <a
                      href={`/room/${room.id}`}
                      style={{
                        display: 'block',
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        borderRadius: '6px',
                        color: 'white',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                      }}
                    >
                      Присоединиться
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Настройки аккаунта</h3>
            
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              marginBottom: '1rem'
            }}>
              <h4 style={{ color: '#e2e8f0', margin: '0 0 1rem 0' }}>Информация профиля</h4>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Имя пользователя</label>
                  <p style={{ color: '#e2e8f0', margin: '0.25rem 0 0 0' }}>
                    {profile?.username || 'Не установлено'}
                  </p>
                </div>
                
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Email</label>
                  <p style={{ color: '#e2e8f0', margin: '0.25rem 0 0 0' }}>
                    {session.user?.email}
                  </p>
                </div>
                
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Дата регистрации</label>
                  <p style={{ color: '#e2e8f0', margin: '0.25rem 0 0 0' }}>
                    {profile?.created_at ? formatDate(profile.created_at) : 'Неизвестно'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <h4 style={{ color: '#e2e8f0', margin: '0 0 1rem 0' }}>Опасная зона</h4>
              
              <button
                onClick={() => {
                  if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                    signOut({ callbackUrl: '/' })
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(239, 68, 68, 0.5)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}
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

import { signOut } from 'next-auth/react'
