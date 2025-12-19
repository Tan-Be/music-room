'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Создаём аудио контекст для генерации крутой музыки
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContext()

    // Джазовые аккорды для Lofi Hip-Hop
    const chords = [
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [220, 277.18, 329.63, 415.3], // Am7
      [246.94, 311.13, 369.99, 466.16], // Dm7
      [196, 246.94, 293.66, 369.99], // G7
    ]
    const bassNotes = [130.81, 110, 146.83, 98] // Басовые ноты для аккордов

    let soundNodes: any = null
    let intervals: NodeJS.Timeout[] = []

    // Создаём генератор крутой электронной музыки
    const createAmbientSound = () => {
      const now = audioContext.currentTime

      // Мягкий бас для Lofi
      const bass = audioContext.createOscillator()
      bass.type = 'sine'
      bass.frequency.setValueAtTime(130.81, now)

      const bassGain = audioContext.createGain()
      bassGain.gain.setValueAtTime(0.12, now)

      bass.connect(bassGain)
      bassGain.connect(audioContext.destination)
      bass.start(now)

      // Создаём винтажный эффект (битрейт)
      const vinylNoise = () => {
        const bufferSize = audioContext.sampleRate * 0.1
        const buffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate
        )
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.008
        }

        const noise = audioContext.createBufferSource()
        noise.buffer = buffer
        noise.loop = true

        const noiseGain = audioContext.createGain()
        noiseGain.gain.setValueAtTime(0.015, now)

        noise.connect(noiseGain)
        noiseGain.connect(audioContext.destination)
        noise.start(now)

        return noise
      }

      const vinyl = vinylNoise()

      // LFO для легкого wobble эффекта
      const lfo = audioContext.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(0.1, now)
      lfo.start(now)

      // Функция для создания джазового аккорда
      const playChord = (chordIndex: number) => {
        if (audioContext.state !== 'running') return

        const chord = chords[chordIndex]
        const startTime = audioContext.currentTime

        chord.forEach((freq, i) => {
          const osc = audioContext.createOscillator()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, startTime)

          const gain = audioContext.createGain()
          gain.gain.setValueAtTime(0, startTime)
          gain.gain.linearRampToValueAtTime(0.03, startTime + 0.3)
          gain.gain.linearRampToValueAtTime(0.02, startTime + 2)
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3)

          const filter = audioContext.createBiquadFilter()
          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(1200, startTime)

          osc.connect(filter)
          filter.connect(gain)
          gain.connect(audioContext.destination)

          osc.start(startTime)
          osc.stop(startTime + 3)
        })
      }

      // Функция для создания мягкого kick
      const playLofiKick = () => {
        if (audioContext.state !== 'running') return

        const startTime = audioContext.currentTime

        const osc = audioContext.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(120, startTime)
        osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.08)

        const gain = audioContext.createGain()
        gain.gain.setValueAtTime(0.2, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)

        osc.connect(gain)
        gain.connect(audioContext.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.25)
      }

      // Функция для создания снэра
      const playSnare = () => {
        if (audioContext.state !== 'running') return

        const bufferSize = audioContext.sampleRate * 0.15
        const buffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate
        )
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15
        }

        const noise = audioContext.createBufferSource()
        noise.buffer = buffer

        const filter = audioContext.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.setValueAtTime(1000, audioContext.currentTime)

        const gain = audioContext.createGain()
        gain.gain.setValueAtTime(0.08, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.15
        )

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(audioContext.destination)

        noise.start(audioContext.currentTime)
        noise.stop(audioContext.currentTime + 0.15)
      }

      // Функция для создания хай-хэта
      const playLofiHihat = () => {
        if (audioContext.state !== 'running') return

        const bufferSize = audioContext.sampleRate * 0.08
        const buffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate
        )
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08
        }

        const noise = audioContext.createBufferSource()
        noise.buffer = buffer

        const filter = audioContext.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.setValueAtTime(8000, audioContext.currentTime)

        const gain = audioContext.createGain()
        gain.gain.setValueAtTime(0.04, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.08
        )

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(audioContext.destination)

        noise.start(audioContext.currentTime)
        noise.stop(audioContext.currentTime + 0.08)
      }

      // Функция для создания шума ветра
      const playWindSound = () => {
        if (audioContext.state !== 'running') return

        const bufferSize = audioContext.sampleRate * 2
        const buffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate
        )
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.02
        }

        const noise = audioContext.createBufferSource()
        noise.buffer = buffer

        const filter = audioContext.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(800, audioContext.currentTime)

        const gain = audioContext.createGain()
        gain.gain.setValueAtTime(0, audioContext.currentTime)
        gain.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 0.5)
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(audioContext.destination)

        noise.start(audioContext.currentTime)
        noise.stop(audioContext.currentTime + 2)
      }

      // Переменная для отслеживания текущего аккорда
      let currentChord = 0

      // Функция для смены аккорда и баса
      const changeChord = () => {
        if (audioContext.state !== 'running') return

        currentChord = (currentChord + 1) % chords.length
        const newBass = bassNotes[currentChord]
        const now = audioContext.currentTime

        bass.frequency.exponentialRampToValueAtTime(newBass, now + 0.5)
        playChord(currentChord)
      }

      // Lofi ритм (85 BPM - медленнее и расслабленнее)
      let beatCount = 0

      const beatInterval = setInterval(() => {
        beatCount++

        // Kick на 1 и 3 долях
        if (beatCount % 4 === 0 || beatCount % 4 === 2) {
          playLofiKick()
        }

        // Snare на 2 и 4 долях
        if (beatCount % 4 === 1 || beatCount % 4 === 3) {
          playSnare()
        }

        // Hi-hat на каждой доле
        playLofiHihat()

        // Иногда дополнительный hi-hat между долями
        if (Math.random() > 0.6) {
          setTimeout(() => playLofiHihat(), 350)
        }
      }, 706) // 85 BPM

      // Меняем аккорд каждые 4 такта (примерно 11 секунд)
      const chordInterval = setInterval(() => {
        changeChord()
      }, 11300)

      // Играем первый аккорд сразу
      playChord(0)

      intervals.push(beatInterval, chordInterval)

      return { bass, vinyl, lfo, audioContext }
    }

    // Создаём объект для управления
    let isMutedState = false

    // Сохраняем ссылку на аудио контекст
    audioRef.current = {
      play: () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume()
        }
        if (!soundNodes) {
          soundNodes = createAmbientSound()
        }
        return Promise.resolve()
      },
      pause: () => {
        if (audioContext.state === 'running') {
          audioContext.suspend()
        }
      },
      get muted() {
        return isMutedState
      },
      set muted(value: boolean) {
        isMutedState = value
        if (soundNodes && audioContext.state === 'running') {
          audioContext.suspend()
        } else if (soundNodes && !value) {
          audioContext.resume()
        }
      },
    } as any

    return () => {
      // Очищаем все интервалы
      intervals.forEach(interval => clearInterval(interval))

      if (soundNodes) {
        soundNodes.bass.stop()
        soundNodes.vinyl.stop()
        soundNodes.lfo.stop()
      }
      audioContext.close()
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    setHasInteracted(true)

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(err => {
        console.error('Ошибка воспроизведения:', err)
      })
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      {/* Кнопка Play/Pause */}
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlay}
        className="bg-background/80 backdrop-blur-md border-2 border-primary/20 hover:border-primary hover:scale-110 transition-all shadow-lg"
        title={isPlaying ? 'Остановить музыку' : 'Включить музыку'}
      >
        {isPlaying ? (
          <div className="flex items-center justify-center">
            <div className="flex gap-1">
              <div
                className="w-1 h-4 bg-primary animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1 h-4 bg-primary animate-pulse"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1 h-4 bg-primary animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : (
          <svg
            className="h-5 w-5 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </Button>

      {/* Кнопка Mute/Unmute (показывается только когда музыка играет) */}
      {isPlaying && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-background/80 backdrop-blur-md border-2 border-primary/20 hover:border-primary hover:scale-110 transition-all shadow-lg"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Volume2 className="h-5 w-5 text-primary" />
          )}
        </Button>
      )}

      {/* Подсказка при первом посещении */}
      {!hasInteracted && (
        <div className="absolute bottom-full right-0 mb-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg animate-bounce">
          🎵 Нажми для музыки!
          <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary" />
        </div>
      )}
    </div>
  )
}
