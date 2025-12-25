'use client'

const mockRooms = [
  {
    id: '1',
    name: 'Chill Vibes',
    description: 'Расслабляющая музыка для работы и отдыха',
    participants: 12,
  },
  {
    id: '2',
    name: 'Party Hits',
    description: 'Лучшие хиты для вечеринок',
    participants: 8,
  },
  {
    id: '3',
    name: 'Indie Discoveries',
    description: 'Новые инди-треки и артисты',
    participants: 5,
  },
]

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#8b5cf6' }}>
        Music Room
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#666' }}>
        Совместное прослушивание музыки
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {mockRooms.map(room => (
          <div
            key={room.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {room.name}
            </h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {room.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {room.participants} участников
              </span>
              <button
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Присоединиться
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <a
          href="/rooms"
          style={{
            display: 'block',
            padding: '1.5rem',
            border: '1px solid #8b5cf6',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#8b5cf6',
            backgroundColor: 'white',
            transition: 'all 0.2s',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>🎵 Комнаты</h3>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Все музыкальные комнаты
          </p>
        </a>

        <a
          href="/login"
          style={{
            display: 'block',
            padding: '1.5rem',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#3b82f6',
            backgroundColor: 'white',
            transition: 'all 0.2s',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>🔐 Войти</h3>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Вход в аккаунт
          </p>
        </a>
      </div>
    </div>
  )
}