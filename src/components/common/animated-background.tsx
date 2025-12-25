'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Настройка размеров
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Волны
    const waves = [
      { amplitude: 50, frequency: 0.02, phase: 0, speed: 0.01, color: 'rgba(139, 92, 246, 0.1)' },
      { amplitude: 30, frequency: 0.03, phase: Math.PI / 2, speed: 0.015, color: 'rgba(59, 130, 246, 0.08)' },
      { amplitude: 40, frequency: 0.025, phase: Math.PI, speed: 0.012, color: 'rgba(168, 85, 247, 0.06)' }
    ]

    // Музыкальные ноты
    const notes = ['♪', '♫', '♬', '♩', '♭', '♯']
    const floatingNotes: Array<{
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      note: string
      rotation: number
      rotationSpeed: number
    }> = []

    // Создание нот
    for (let i = 0; i < 15; i++) {
      floatingNotes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 15,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        note: notes[Math.floor(Math.random() * notes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      })
    }

    // Частицы
    const particles: Array<{
      x: number
      y: number
      size: number
      opacity: number
      speedX: number
      speedY: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Рисуем волны
      waves.forEach(wave => {
        ctx.beginPath()
        ctx.strokeStyle = wave.color
        ctx.lineWidth = 2
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 + wave.phase * 1.5) * wave.amplitude * 0.5
          
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.stroke()
        wave.phase += wave.speed
      })

      // Рисуем плавающие ноты
      floatingNotes.forEach(note => {
        ctx.save()
        ctx.translate(note.x, note.y)
        ctx.rotate(note.rotation)
        ctx.font = `${note.size}px serif`
        ctx.fillStyle = `rgba(139, 92, 246, ${note.opacity})`
        ctx.textAlign = 'center'
        ctx.fillText(note.note, 0, 0)
        ctx.restore()

        // Обновляем позицию
        note.y -= note.speed
        note.rotation += note.rotationSpeed
        
        // Сброс позиции
        if (note.y < -50) {
          note.y = canvas.height + 50
          note.x = Math.random() * canvas.width
        }
      })

      // Рисуем частицы
      particles.forEach(particle => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`
        ctx.fill()

        // Обновляем позицию
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Отражение от границ
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}
    />
  )
}