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
import { NotificationManager } from '@/components/common/notification-manager'
import { NotificationPermissionBanner } from '@/components/common/notification-permission-banner'
import { PerformanceMonitor } from '@/components/common/performance-optimized'
import { generateMetadata, generateJsonLd } from '@/lib/seo'

const fontSans = FontSans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = generateMetadata()

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
  const jsonLd = generateJsonLd('webapp')

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//syxjqxfoycmttcmrasgq.supabase.co" />
        <link
          rel="preload"
          href="/icons/icon-192x192.png"
          as="image"
          type="image/png"
        />
      </head>
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
              <NotificationManager />
              <NotificationPermissionBanner />
              <PerformanceMonitor />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
