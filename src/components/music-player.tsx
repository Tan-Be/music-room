'use client'

import { useState, useRef, useEffect } from 'react'

interface Track {
  id: string
  title: string
  artist: string
  url: string
  addedBy: string
  addedAt: string
}

interface MusicPlayerProps {
  roomId: string
  isDemoMode: boolean
}

export default function MusicPlayer({ roomId, isDemoMode }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '' })
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  // Обработка воспроизведения
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Ошибка воспроизведения:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  const handleAddTrack = () => {
    if (!newTrack.title.trim()) return

    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title,
      artist: newTrack.artist || 'Неизвестен',
      url: newTrack.url,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Создаем URL для локального файла
    const url = URL.createObjectURL(file)
    
    const track: Track = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ''), // Убираем расширение
      artist: 'Локальный файл',
      url: url,
      addedBy: 'Вы',
      addedAt: new Date().toISOString()
    }

    setTracks([...tracks, track])
    
    if (!currentTrack) {
      setCurrentTrack(track)
    }
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const removeTrack = (id: string) => {
    const updated = tracks.filter(t => t.id !== id)
    setTracks(updated)
    
    if (currentTrack?.id === id) {
      setCurrentTrack(null)
      setIsPlaying(false)
    }
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
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
            <button
              onClick={togglePlay}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
          
          {/* Аудио плеер */}
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onEnded={() => {
              // Играем следующий трек
              const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
              const nextTrack = tracks[currentIndex + 1]
              if (nextTrack) {
                playTrack(nextTrack)
              } else {
                setIsPlaying(false)
              }
            }}
            style={{ width: '100%' }}
            controls
          />
        </div>
      )}

      {/* Управление */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
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
          ➕ Добавить трек
        </button>
        
        <label style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📁 Загрузить файл
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Добавить трек</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Название трека *"
              value={newTrack.title}
              onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
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
                border: '2px solid rgba(139, 92, 246, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                fontSize: '1rem'
              }}
            />
            <input
              type="text"
              placeholder="URL аудио файла (необязательно)"
              value={newTrack.url}
              onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
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
                disabled={!newTrack.title.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: newTrack.title.trim() 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                    : 'rgba(107, 114, 128, 0.5)',
                  color: 'white',
                  cursor: newTrack.title.trim() ? 'pointer' : 'not-allowed'
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
          <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>
            🎵 Пока нет треков. Добавьте первый!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: currentTrack?.id === track.id 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${currentTrack?.id === track.id ? 'rgba(139, 92, 246, 0.5)' : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => playTrack(track)}
              >
                <span style={{ 
                  color: '#8b5cf6', 
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
                {currentTrack?.id === track.id && isPlaying && (
                  <span style={{ color: '#8b5cf6' }}>▶</span>
                )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
