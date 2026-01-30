import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'Music Room',
  description: 'Совместное прослушивание музыки',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <title>Music Room</title>
        <meta name="description" content="Совместное прослушивание музыки" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0f0f23',
        minHeight: '100vh',
        color: '#e2e8f0'
      }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}