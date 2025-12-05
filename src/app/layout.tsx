import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import '../styles/globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/auth-context'
import { MainLayout } from '@/components/layout/main-layout'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { PWAInstall } from '@/components/common/pwa-install'
import { NetworkStatus } from '@/components/common/network-status'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Music Room - Совместное прослушивание музыки',
  description:
    'Платформа для создания совместных плейлистов в реальном времени',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Music Room',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <MainLayout>{children}</MainLayout>
              <Toaster 
                position="top-right" 
                richColors 
                closeButton
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />
              <NetworkStatus />
              <PWAInstall />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
