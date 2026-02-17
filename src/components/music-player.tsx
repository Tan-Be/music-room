'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
}

interface Track {
  id: string
  title: string
  artist: string
  youtubeId: string
  addedBy: string
  addedAt: string
  comments?: Comment[]
}

interface MusicPlayerProps {
  roomId: string
  isDemoMode: boolean
}

// Функция для извлечения YouTube ID из разных форматов ссылок
const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

export default function MusicPlayer({ roomId, isDemoMode }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '' })
  const [commentText, setCommentText] = useState('')
  const [activeCommentTrack, setActiveCommentTrack] = useState<string | null>(null)

  // Загрузка треков из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`roomTracks-${roomId}`)
    if (saved) {
      try {
        setTracks(JSON.parse(saved))
      } catch (e) {
        console.error('Ошибка загрузки треков:', e)
      }
    }
  }, [roomId])

  // Сохранение треков
  useEffect(() => {
    if (tracks.length > 0) {
      localStorage.setItem(`roomTracks-${roomId}`, JSON.stringify(tracks))
    }
  }, [tracks, roomId])

  const handleAddTrack = () => {
    if (!newTrack.title.trim() || !newTrack.url.trim()) {
      alert('Введите название трека и ссылку на YouTube')
      return
    }

    // Извлекаем YouTube ID
    const youtubeId = extractYoutubeId(newTrack.url)
    if (!youtubeId) {
      alert('Некорректная ссылка на YouTube. Примеры:\nhttps://www.youtube.com/watch?v=VIDEO_ID\nhttps://youtu.be/VIDEO_ID')
      return
    }

    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title,
      artist: newTrack.artist || 'Неизвестен',
      youtubeId: youtubeId,
      addedBy: 'Вы',
      addedAt: new Date().toISOString()
    }

    setTracks([...tracks, track])
    setNewTrack({ title: '', artist: '', url: '' })
    setShowAddForm(false)

    // Автоматически начинаем играть первый трек
    if (!currentTrack) {
      setCurrentTrack(track)
    }
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
  }

  const removeTrack = (id: string) => {
    const updated = tracks.filter(t => t.id !== id)
    setTracks(updated)
    
    if (currentTrack?.id === id) {
      setCurrentTrack(null)
    }
    
    // Очищаем localStorage если треков не осталось
    if (updated.length === 0) {
      localStorage.removeItem(`roomTracks-${roomId}`)
    }
  }

  const handleAddComment = (trackId: string) => {
    if (!commentText.trim()) return

    const updatedTracks = tracks.map(track => {
      if (track.id === trackId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          text: commentText,
          author: 'Вы',
          createdAt: new Date().toISOString()
        }
        return {
          ...track,
          comments: [...(track.comments || []), newComment]
        }
      }
      return track
    })

    setTracks(updatedTracks)
    setCommentText('')
    setActiveCommentTrack(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Текущий трек */}
      {currentTrack && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🎵
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
                {currentTrack.title}
              </h3>
              <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.9rem' }}>
                {currentTrack.artist}
              </p>
            </div>
          </div>
          
          {/* YouTube плеер */}
          <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', 
            height: 0, 
            overflow: 'hidden',
            borderRadius: '12px'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Управление */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ➕ Добавить из YouTube
        </button>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Добавить из YouTube</h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Вставьте ссылку на YouTube видео. Примеры:<br/>
            https://www.youtube.com/watch?v=ABC123<br/>
            https://youtu.be/ABC123
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Название трека *"
              value={newTrack.title}
              onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                fontSize: '1rem'
              }}
            />
            <input
              type="text"
              placeholder="Исполнитель"
              value={newTrack.artist}
              onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                fontSize: '1rem'
              }}
            />
            <input
              type="text"
              placeholder="Ссылка на YouTube *"
              value={newTrack.url}
              onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                fontSize: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleAddTrack}
                disabled={!newTrack.title.trim() || !newTrack.url.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: newTrack.title.trim() && newTrack.url.trim()
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'rgba(107, 114, 128, 0.5)',
                  color: 'white',
                  cursor: newTrack.title.trim() && newTrack.url.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список треков */}
      <div>
        <h4 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
          📋 Плейлист ({tracks.length})
        </h4>
        {tracks.length === 0 ? (
          <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>🎵 Пока нет треков</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Нажмите "Добавить из YouTube" и вставьте ссылку на видео
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tracks.map((track, index) => (
              <div key={track.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: currentTrack?.id === track.id 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${currentTrack?.id === track.id ? 'rgba(239, 68, 68, 0.5)' : 'transparent'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => playTrack(track)}
                >
                  <span style={{ 
                    color: '#ef4444', 
                    fontWeight: 'bold',
                    minWidth: '24px'
                  }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', margin: '0 0 0.25rem 0', fontWeight: 500 }}>
                      {track.title}
                    </p>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.85rem' }}>
                      {track.artist} • добавлен {new Date(track.addedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {currentTrack?.id === track.id && (
                    <span style={{ color: '#ef4444' }}>▶</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveCommentTrack(activeCommentTrack === track.id ? null : track.id)
                    }}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    💬 {track.comments?.length || 0}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTrack(track.id)
                    }}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🗑
                  </button>
                </div>
                
                {/* Секция комментариев */}
                {activeCommentTrack === track.id && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h5 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                      💬 Комментарии ({track.comments?.length || 0})
                    </h5>
                    
                    {/* Список комментариев */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {track.comments?.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          Пока нет комментариев. Будьте первым!
                        </p>
                      ) : (
                        track.comments?.map((comment) => (
                          <div key={comment.id} style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            <p style={{ color: '#e2e8f0', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                              {comment.text}
                            </p>
                            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.75rem' }}>
                              {comment.author} • {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Форма добавления комментария */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Напишите комментарий..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '0.9rem'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddComment(track.id)
                        }}
                        disabled={!commentText.trim()}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: commentText.trim() 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'rgba(107, 114, 128, 0.5)',
                          color: 'white',
                          cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                          fontSize: '0.9rem'
                        }}
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
