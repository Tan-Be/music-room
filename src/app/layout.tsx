import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music Room',
  description: 'Совместное прослушивание музыки',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
          <header style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                🎵 Music Room
              </h1>
            </div>
          </header>
          
          <main style={{ padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}