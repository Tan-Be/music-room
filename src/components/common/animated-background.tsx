'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Wave parameters
    let time = 0
    const waveSpeed = 0.015
    const waveAmplitude = 80
    const waveFrequency = 0.008

    // Musical notes with different symbols
    const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯']
    const notes = Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 16 + Math.random() * 28,
      speed: 0.3 + Math.random() * 0.8,
      opacity: 0.08 + Math.random() * 0.15,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
      hue: 270 + Math.random() * 30, // Purple hues
    }))

    // Particles for extra effect
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.5,
    }))

    // Animation loop
    const animate = () => {
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      )
      bgGradient.addColorStop(0, 'rgba(10, 10, 10, 0.8)')
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw multiple waves with glow effect
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        // Create smooth wave path
        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            canvas.height / 2 +
            Math.sin(x * waveFrequency + time + i * 1.5) * waveAmplitude +
            Math.sin(x * waveFrequency * 2 + time * 1.2 + i * 0.8) *
              (waveAmplitude / 3) +
            Math.sin(x * waveFrequency * 0.5 + time * 0.8) *
              (waveAmplitude / 4)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        // Gradient fill for wave with glow
        const waveGradient = ctx.createLinearGradient(
          0,
          canvas.height / 2 - waveAmplitude * 2,
          0,
          canvas.height
        )

        const alpha1 = 0.12 - i * 0.025
        const alpha2 = 0.08 - i * 0.015
        const alpha3 = 0.04 - i * 0.008

        waveGradient.addColorStop(0, `rgba(147, 51, 234, ${alpha1})`) // Purple
        waveGradient.addColorStop(0.4, `rgba(139, 92, 246, ${alpha2})`) // Light purple
        waveGradient.addColorStop(0.7, `rgba(168, 85, 247, ${alpha3})`) // Violet
        waveGradient.addColorStop(1, `rgba(124, 58, 237, ${alpha3 * 0.5})`) // Deep purple

        ctx.fillStyle = waveGradient
        ctx.fill()

        // Add glow effect on wave edge
        if (i === 0) {
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Draw particles
      particles.forEach(particle => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = '#9333ea'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Update particle position
        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
        }
      })

      // Draw musical notes with glow
      notes.forEach(note => {
        ctx.save()
        ctx.translate(note.x, note.y)
        ctx.rotate((note.rotation * Math.PI) / 180)

        // Glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = `hsla(${note.hue}, 80%, 60%, ${note.opacity * 0.8})`

        ctx.globalAlpha = note.opacity
        ctx.fillStyle = `hsl(${note.hue}, 70%, 60%)`
        ctx.font = `bold ${note.size}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(note.symbol, 0, 0)

        ctx.restore()

        // Update note position
        note.y -= note.speed
        note.rotation += note.rotationSpeed

        // Add slight horizontal drift
        note.x += Math.sin(time + note.y * 0.01) * 0.5

        // Reset note when it goes off screen
        if (note.y < -50) {
          note.y = canvas.height + 50
          note.x = Math.random() * canvas.width
          note.symbol =
            noteSymbols[Math.floor(Math.random() * noteSymbols.length)]
        }

        // Wrap horizontally
        if (note.x < -50) note.x = canvas.width + 50
        if (note.x > canvas.width + 50) note.x = -50
      })

      time += waveSpeed
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  )
}
