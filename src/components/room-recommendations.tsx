'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface RecommendedRoom {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

export function RoomRecommendations() {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendedRoom[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadRecommendations()
    }
  }, [session])

  const loadRecommendations = async () => {
    if (!session?.user) return
    
    try {
      setLoading(true)
      const userId = (session.user as any).id
      
      const response = await fetch(`/api/recommendations?userId=${userId}`)
      const data = await response.json()
      
      if (data.recommendations) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null
  if (loading) return null
  if (recommendations.length === 0) return null

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderRadius: '16px',
      border: '1px solid rgba(139, 92, 246, 0.3)'
    }}>
      <h3 style={{
        color: '#8b5cf6',
        fontSize: '1.2rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ✨ Рекомендации для вас
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {recommendations.slice(0, 4).map(room => (
          <div
            key={room.id}
            onClick={() => window.location.href = `/room/${room.id}`}
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              cursor: 'pointer',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <h4 style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>
              {room.name}
            </h4>
            <p style={{ 
              color: '#a1a1aa', 
              margin: 0, 
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {room.description || 'Нет описания'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
