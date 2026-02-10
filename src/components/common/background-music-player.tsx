'use client'

import { useState, useRef, useEffect } from 'react'

export function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainNodesRef = useRef<GainNode[]>([])
  const masterGainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    // Очистка при размонтировании
    return () => {
      stopMusic()
    }
  }, [])

  const createAmbientMusic = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current

    // Создаем master gain для управления общей громкостью
    const masterGain = ctx.createGain()
    masterGain.gain.value = volume
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // Ambient нот в стиле C minor (соответствует космической/электронной музыке)
    const frequencies = [
      130.81, // C3
      155.56, // Eb3
      196.00, // G3
      233.08, // Bb3
      261.63, // C4
      311.13, // Eb4
      392.00, // G4
    ]

    oscillatorsRef.current = []
    gainNodesRef.current = []

    frequencies.forEach((freq, index) => {
      // Создаем осциллятор
      const oscillator = ctx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = freq

      // Создаем gain node для каждой ноты
      const gainNode = ctx.createGain()
      gainNode.gain.value = 0

      // Подключаем цепочку: oscillator -> gainNode -> masterGain
      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      // Запускаем осциллятор
      oscillator.start()

      // Добавляем случайное плавное нарастание/затухание
      const now = ctx.currentTime
      const delay = Math.random() * 2
      const duration = 3 + Math.random() * 4

      gainNode.gain.setValueAtTime(0, now + delay)
      gainNode.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.03, now + delay + duration)

      oscillatorsRef.current.push(oscillator)
      gainNodesRef.current.push(gainNode)

      // Создаем циклическое изменение громкости
      setInterval(() => {
        if (audioContextRef.current) {
          const ctx = audioContextRef.current
          const now = ctx.currentTime
          const currentVolume = gainNode.gain.value
          const targetVolume = 0.02 + Math.random() * 0.06
          const rampDuration = 2 + Math.random() * 3

          gainNode.gain.setValueAtTime(currentVolume, now)
          gainNode.gain.linearRampToValueAtTime(targetVolume, now + rampDuration)
        }
      }, (4000 + Math.random() * 3000))
    })

    // Добавляем низкочастотный drone для глубины
    const droneOsc = ctx.createOscillator()
    droneOsc.type = 'triangle'
    droneOsc.frequency.value = 65.41 // C2

    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.15

    droneOsc.connect(droneGain)
    droneGain.connect(masterGain)
    droneOsc.start()

    oscillatorsRef.current.push(droneOsc)
    gainNodesRef.current.push(droneGain)
  }

  const stopMusic = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop()
      } catch (e) {
        // Осциллятор уже остановлен
      }
    })
    oscillatorsRef.current = []
    gainNodesRef.current = []

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    masterGainRef.current = null
  }

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic()
      setIsPlaying(false)
    } else {
      createAmbientMusic()
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVolume
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'flex-end'
    }}>
      {isPlaying && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              width: '80px',
              accentColor: '#8b5cf6'
            }}
          />
        </div>
      )}

      <button
        onClick={toggleMusic}
        style={{
          background: isPlaying 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
            : 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          border: `2px solid ${isPlaying ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          boxShadow: isPlaying 
            ? '0 4px 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)'
            : '0 4px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
          e.currentTarget.style.boxShadow = isPlaying
            ? '0 6px 25px rgba(139, 92, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.3)'
            : '0 6px 20px rgba(139, 92, 246, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = isPlaying
            ? '0 4px 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)'
            : '0 4px 15px rgba(0, 0, 0, 0.3)'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>
          {isPlaying ? '⏸' : '▶'}
        </span>
        <span>{isPlaying ? 'Ambient Music' : 'Включить музыку'}</span>
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 4px 25px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4);
          }
        }
      `}</style>
    </div>
  )
}
